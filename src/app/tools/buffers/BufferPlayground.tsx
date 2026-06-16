"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, TriangleAlert, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BETA } from "@/lib/site";
import {
  BUFFER_PRESETS,
  duration,
  formatDuration,
  normalizeScenario,
  simulateBufferedAt,
  simulateDirect,
  type BufferScenario,
  type LaneState,
} from "@/lib/buffers";

// How many dots to draw per lane. Each dot represents count/DOTS requests, so
// the field stays readable whether you fire 60 or 600.
const DOTS = 100;
// Wall-clock window the burst animates over, clamped so it's neither a blink
// nor a chore.
const MIN_WALL_MS = 1400;
const MAX_WALL_MS = 5000;

type DotKind = "ok" | "rejected" | "pending";

function dotsFor(state: LaneState, total: number): DotKind[] {
  const okDots = Math.round((state.ok / total) * DOTS);
  const rejDots = Math.round((state.rejected / total) * DOTS);
  return Array.from({ length: DOTS }, (_, i) => {
    if (i < okDots) return "ok";
    if (i < okDots + rejDots) return "rejected";
    return "pending";
  });
}

export default function BufferPlayground() {
  const [scenario, setScenario] = useState<BufferScenario>(
    BUFFER_PRESETS[0].scenario,
  );
  const [virtualT, setVirtualT] = useState(0);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const norm = useMemo(() => normalizeScenario(scenario), [scenario]);
  const totalDuration = useMemo(() => duration(norm), [norm]);

  const wallMs = useMemo(
    () =>
      Math.max(MIN_WALL_MS, Math.min(MAX_WALL_MS, totalDuration * 120)),
    [totalDuration],
  );

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const run = useCallback(() => {
    stop();
    setHasRun(true);
    setRunning(true);
    setVirtualT(0);
    startRef.current = performance.now();
    const tick = (nowMs: number) => {
      const elapsed = nowMs - startRef.current;
      const progress = Math.min(1, elapsed / wallMs);
      setVirtualT(progress * (totalDuration + 0.001));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stop, wallMs, totalDuration]);

  // Clean up any in-flight animation on unmount.
  useEffect(() => stop, [stop]);

  const direct = useMemo(() => simulateDirect(norm), [norm]);
  const buffered = useMemo(
    () =>
      hasRun
        ? simulateBufferedAt(norm, virtualT)
        : { sent: 0, ok: 0, rejected: 0, pending: norm.count, elapsed: 0, done: false },
    [norm, virtualT, hasRun],
  );
  // Direct lane resolves instantly; reveal it only once a burst has started.
  const directShown: LaneState = hasRun
    ? direct
    : { sent: 0, ok: 0, rejected: 0, pending: norm.count, elapsed: 0, done: false };

  function update(patch: Partial<BufferScenario>) {
    stop();
    setRunning(false);
    setHasRun(false);
    setVirtualT(0);
    setScenario((s) => normalizeScenario({ ...s, ...patch }));
  }

  const overPacing = norm.bufferRate > norm.targetLimit;

  return (
    <div className="max-w-5xl mx-auto w-full">
      {/* Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Requests to send"
            value={norm.count}
            min={1}
            max={2000}
            step={10}
            onChange={(v) => update({ count: v })}
          />
          <Field
            label="API rate limit (req/s)"
            value={norm.targetLimit}
            min={1}
            max={200}
            step={1}
            onChange={(v) => update({ targetLimit: v })}
          />
          <Field
            label="Fliq buffer rate (req/s)"
            value={norm.bufferRate}
            min={1}
            max={200}
            step={1}
            onChange={(v) => update({ bufferRate: v })}
            warn={overPacing}
          />
        </div>

        {overPacing && (
          <p className="mt-4 flex items-center gap-2 text-sm text-amber-400/90">
            <TriangleAlert className="size-4 shrink-0" />
            Your buffer is pacing <strong>faster</strong> than the API allows —
            you&apos;ll still hit 429s. Set the buffer rate at or below the API
            limit.
          </p>
        )}

        {/* Presets */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-white/40 mr-1">
            Try
          </span>
          {BUFFER_PRESETS.map((p) => {
            const active =
              p.scenario.count === norm.count &&
              p.scenario.targetLimit === norm.targetLimit &&
              p.scenario.bufferRate === norm.bufferRate;
            return (
              <button
                key={p.label}
                onClick={() => update(p.scenario)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                }`}
              >
                <span className="font-medium">{p.label}</span>
                <span className="ml-2 text-xs text-white/30">{p.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <Button size="lg" onClick={run} className="font-medium">
            <Play className="size-4" />
            {running ? "Running…" : hasRun ? "Run again" : "Blast the API"}
          </Button>
        </div>
      </div>

      {/* Lanes */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Lane
          tone="bad"
          icon={<Zap className="size-4" />}
          title="Direct — no buffer"
          subtitle="Fire all at once"
          state={directShown}
          total={norm.count}
          timeLabel={hasRun ? "instant" : "—"}
        />
        <Lane
          tone="good"
          icon={<ShieldCheck className="size-4" />}
          title="Through a Fliq buffer"
          subtitle={`Paced at ${norm.bufferRate}/s`}
          state={buffered}
          total={norm.count}
          timeLabel={
            hasRun
              ? formatDuration(buffered.done ? totalDuration : buffered.elapsed)
              : "—"
          }
        />
      </div>

      {/* Verdict */}
      {hasRun && (
        <Verdict
          lost={directShown.rejected}
          delivered={buffered.ok + buffered.pending}
          total={norm.count}
          time={formatDuration(totalDuration)}
          overPacing={overPacing}
        />
      )}

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Stop writing rate-limiter glue
        </h2>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          A Fliq buffer is a queue with a speed limit: POST as fast as you like,
          Fliq drains to your downstream API under its rate cap — no Redis, no
          429 storms. {BETA.headline}.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start for free →</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/buffers">Read the buffers docs</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
  warn,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  warn?: boolean;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between text-xs uppercase tracking-wider text-white/40 mb-2">
        <span>{label}</span>
        <span
          className={`font-mono text-sm ${warn ? "text-amber-400" : "text-white/80"}`}
        >
          {value}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-400 cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

function Lane({
  tone,
  icon,
  title,
  subtitle,
  state,
  total,
  timeLabel,
}: {
  tone: "good" | "bad";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  state: LaneState;
  total: number;
  timeLabel: string;
}) {
  const dots = useMemo(() => dotsFor(state, total), [state, total]);
  const okPct = (state.ok / total) * 100;
  const rejPct = (state.rejected / total) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`grid size-7 place-items-center rounded-lg ${
              tone === "good"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {icon}
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-xs text-white/50">
          <Clock className="size-3.5" />
          {timeLabel}
        </span>
      </div>

      {/* Dot field */}
      <div className="mt-4 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
        {dots.map((kind, i) => (
          <span
            key={i}
            className={`aspect-square rounded-[2px] transition-colors duration-300 ${
              kind === "ok"
                ? "bg-emerald-400"
                : kind === "rejected"
                  ? "bg-red-500"
                  : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Stacked bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10 flex">
        <div
          className="h-full bg-emerald-400 transition-all duration-300"
          style={{ width: `${okPct}%` }}
        />
        <div
          className="h-full bg-red-500 transition-all duration-300"
          style={{ width: `${rejPct}%` }}
        />
      </div>

      {/* Counters */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Counter label="Delivered" value={state.ok} className="text-emerald-400" />
        <Counter
          label="429 rejected"
          value={state.rejected}
          className="text-red-400"
        />
        <Counter
          label="Pending"
          value={state.pending}
          className="text-white/50"
        />
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <p className={`font-mono text-xl font-semibold tabular-nums ${className}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </p>
    </div>
  );
}

function Verdict({
  lost,
  delivered,
  total,
  time,
  overPacing,
}: {
  lost: number;
  delivered: number;
  total: number;
  time: string;
  overPacing: boolean;
}) {
  if (overPacing) {
    return (
      <p className="mt-6 text-center text-sm text-white/60">
        Pace the buffer at or below the API limit and every request lands —
        try lowering the buffer rate.
      </p>
    );
  }
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 text-center">
      <p className="text-sm sm:text-base text-white/80">
        Blasting directly,{" "}
        <strong className="text-red-400">{lost.toLocaleString()}</strong> of{" "}
        {total.toLocaleString()} requests bounced with a{" "}
        <span className="font-mono">429</span>. Through a buffer, all{" "}
        <strong className="text-emerald-400">
          {delivered.toLocaleString()}
        </strong>{" "}
        landed in <span className="font-mono">{time}</span> — zero rejected.
      </p>
    </div>
  );
}
