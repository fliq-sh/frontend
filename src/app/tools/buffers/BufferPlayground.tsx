"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, TriangleAlert, Play } from "lucide-react";
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

// The one sanctioned brand gradient — the iridescent F-mark spectrum (ADR 0001).
// It's the visual signature of "the Fliq way": the buffered lane fills with it.
const IRIDESCENT =
  "linear-gradient(115deg,#5eead4 0%,#818cf8 30%,#c084fc 55%,#f0abfc 78%,#fcd34d 100%)";

// How many tiles to draw per lane. Each tile stands for count/DOTS requests, so
// the field stays legible whether you fire 60 or 600.
const DOTS = 120;
const COLS = 24;
const ROWS = DOTS / COLS;
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

function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: IRIDESCENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
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
    () => Math.max(MIN_WALL_MS, Math.min(MAX_WALL_MS, totalDuration * 120)),
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
      const progress = Math.min(1, (nowMs - startRef.current) / wallMs);
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

  useEffect(() => stop, [stop]);

  const idle: LaneState = {
    sent: 0,
    ok: 0,
    rejected: 0,
    pending: norm.count,
    elapsed: 0,
    done: false,
  };
  const direct = useMemo(() => simulateDirect(norm), [norm]);
  const buffered = useMemo(
    () => (hasRun ? simulateBufferedAt(norm, virtualT) : idle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [norm, virtualT, hasRun],
  );
  const directShown = hasRun ? direct : idle;

  function update(patch: Partial<BufferScenario>) {
    stop();
    setRunning(false);
    setHasRun(false);
    setVirtualT(0);
    setScenario((s) => normalizeScenario({ ...s, ...patch }));
  }

  const overPacing = norm.bufferRate > norm.targetLimit;

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Requests"
            sub="in the burst"
            value={norm.count}
            min={1}
            max={2000}
            step={10}
            onChange={(v) => update({ count: v })}
          />
          <Field
            label="API limit"
            sub="requests / sec"
            value={norm.targetLimit}
            min={1}
            max={200}
            step={1}
            onChange={(v) => update({ targetLimit: v })}
          />
          <Field
            label="Buffer pace"
            sub="requests / sec"
            value={norm.bufferRate}
            min={1}
            max={200}
            step={1}
            onChange={(v) => update({ bufferRate: v })}
            warn={overPacing}
          />
        </div>

        {overPacing && (
          <p className="mt-5 flex items-center gap-2 text-sm text-amber-400/90">
            <TriangleAlert className="size-4 shrink-0" />
            The buffer is pacing <strong>faster</strong> than the API allows —
            you&apos;ll still hit 429s. Keep the pace at or below the API limit.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] uppercase tracking-widest text-white/35">
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
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-white/40 bg-white/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white/80"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            onClick={run}
            className="shrink-0 font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_-12px_rgba(192,132,252,0.5)]"
          >
            <Play className="size-4 fill-current" />
            {running ? "Running…" : hasRun ? "Run again" : "Blast the API"}
          </Button>
        </div>
      </div>

      {/* ── Lanes ────────────────────────────────────────────────── */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Lane
          variant="mono"
          icon={<Zap className="size-4" />}
          title="Direct"
          subtitle="Fire all at once"
          headline={`${directShown.rejected.toLocaleString()} dropped`}
          headlineClass="text-red-400"
          state={directShown}
          total={norm.count}
          timeLabel={hasRun ? "instant" : "—"}
        />
        <Lane
          variant="iridescent"
          icon={<ShieldCheck className="size-4" />}
          title="Through a buffer"
          subtitle={`Paced at ${norm.bufferRate}/s`}
          headline={
            <GradientText>
              {(buffered.ok + buffered.rejected).toLocaleString()} delivered
            </GradientText>
          }
          state={buffered}
          total={norm.count}
          timeLabel={
            hasRun
              ? formatDuration(buffered.done ? totalDuration : buffered.elapsed)
              : "—"
          }
        />
      </div>

      {/* ── Verdict ──────────────────────────────────────────────── */}
      {hasRun && (
        <Verdict
          lost={directShown.rejected}
          delivered={norm.count - (overPacing ? buffered.rejected : 0)}
          total={norm.count}
          time={formatDuration(totalDuration)}
          overPacing={overPacing}
        />
      )}

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: IRIDESCENT }}
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stop writing rate-limiter glue
          </h2>
          <p className="mx-auto mt-3 mb-7 max-w-md text-white/60">
            A Fliq buffer is a queue with a speed limit: POST as fast as you
            like, Fliq drains to your downstream API under its cap — no Redis,
            no 429 storms. {BETA.headline}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start for free →</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs/buffers">Read the docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  sub,
  value,
  min,
  max,
  step,
  onChange,
  warn,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-[11px] uppercase tracking-wider text-white/35">
            {sub}
          </p>
        </div>
        <span
          className={`font-mono text-2xl font-semibold tabular-nums ${
            warn ? "text-amber-400" : "text-white"
          }`}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full cursor-pointer accent-[#a78bfa]"
        aria-label={`${label} (${sub})`}
      />
    </div>
  );
}

function Lane({
  variant,
  icon,
  title,
  subtitle,
  headline,
  headlineClass,
  state,
  total,
  timeLabel,
}: {
  variant: "iridescent" | "mono";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  headline: React.ReactNode;
  headlineClass?: string;
  state: LaneState;
  total: number;
  timeLabel: string;
}) {
  const dots = useMemo(() => dotsFor(state, total), [state, total]);
  const iri = variant === "iridescent";

  return (
    <div
      className={`rounded-3xl border p-6 ${
        iri ? "border-white/15 bg-white/[0.03]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid size-8 place-items-center rounded-xl ${
              iri ? "text-white" : "bg-white/5 text-white/70"
            }`}
            style={iri ? { backgroundImage: IRIDESCENT } : undefined}
          >
            {icon}
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-white/40">{timeLabel}</span>
      </div>

      {/* Headline metric */}
      <p
        className={`mt-5 text-3xl font-bold tracking-tight tabular-nums ${headlineClass ?? ""}`}
      >
        {headline}
      </p>

      {/* Pixel field — each delivered tile lights up with its slice of the
          spectrum, so the buffered lane fills as one continuous iridescent
          surface (the brand mark, pixelated). */}
      <div className="relative mt-5 overflow-hidden rounded-xl bg-[#0a0a0c] p-1">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {dots.map((kind, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const lit =
              kind === "ok" && iri
                ? {
                    backgroundImage: IRIDESCENT,
                    backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                    backgroundPosition: `${(col / (COLS - 1)) * 100}% ${
                      (row / (ROWS - 1)) * 100
                    }%`,
                  }
                : undefined;
            return (
              <span
                key={i}
                style={lit}
                className={`aspect-square rounded-[2px] transition-colors duration-300 ${
                  kind === "rejected"
                    ? "bg-red-500"
                    : kind === "ok"
                      ? iri
                        ? ""
                        : "bg-white/85"
                      : "bg-white/[0.05]"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Counters */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Counter
          label="Delivered"
          value={state.ok}
          variant={iri ? "iridescent" : "mono"}
        />
        <Counter label="429" value={state.rejected} variant="bad" />
        <Counter label="Pending" value={state.pending} variant="muted" />
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "iridescent" | "mono" | "bad" | "muted";
}) {
  const cls =
    variant === "bad"
      ? "text-red-400"
      : variant === "muted"
        ? "text-white/40"
        : "text-white";
  return (
    <div>
      {variant === "iridescent" ? (
        <GradientText className="font-mono text-2xl font-semibold tabular-nums">
          {value}
        </GradientText>
      ) : (
        <p className={`font-mono text-2xl font-semibold tabular-nums ${cls}`}>
          {value}
        </p>
      )}
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">
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
      <p className="mt-6 text-center text-sm text-white/55">
        Pace the buffer at or below the API limit and every request lands — try
        lowering the buffer rate.
      </p>
    );
  }
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 p-6 text-center">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: IRIDESCENT }}
      />
      <p className="text-base sm:text-lg leading-relaxed text-white/80">
        Blasting directly,{" "}
        <strong className="text-red-400">{lost.toLocaleString()}</strong> of{" "}
        {total.toLocaleString()} requests bounced with a{" "}
        <span className="font-mono">429</span>. Through a buffer, all{" "}
        <GradientText className="font-bold">
          {delivered.toLocaleString()}
        </GradientText>{" "}
        landed in <span className="font-mono">{time}</span> — zero rejected.
      </p>
    </div>
  );
}
