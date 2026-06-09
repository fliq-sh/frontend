"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge, StatusDot, type Tone } from "@/components/patterns";
import { cn } from "@/lib/utils";

// An interactive, client-side-only simulation of an HTTP scheduled job: pick a
// URL + schedule, optionally force a failure, then watch it count down, fire,
// retry, and drop a permanent execution-history row. NOT wired to any API —
// labelled a demo, deterministic-ish, SSR-safe, and reduced-motion aware.

type Schedule = "once" | "cron";

const ONCE_DELAY = 3; // seconds
const CRON_INTERVAL = 2; // seconds
const DEFAULT_URL = "https://api.myapp.com/welcome";
const HISTORY_CAP = 6;

type Phase =
  | "idle"
  | "counting"
  | "firing"
  | "failed"
  | "backoff"
  | "retrying"
  | "done";

interface Attempt {
  id: number;
  time: string;
  attempt: number;
  status: number;
  durationMs: number;
  tone: Tone;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "idle",
  counting: "scheduled",
  firing: "calling…",
  failed: "503",
  backoff: "backoff…",
  retrying: "retrying…",
  done: "200 OK",
};

function phaseTone(phase: Phase): Tone {
  switch (phase) {
    case "done":
      return "success";
    case "failed":
      return "danger";
    case "backoff":
    case "retrying":
      return "warning";
    case "firing":
    case "counting":
      return "neutral";
    default:
      return "neutral";
  }
}

function nowStamp(): string {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm UTC
}

// Illustrative-but-plausible durations so rows don't all look identical.
function jitter(base: number, spread: number): number {
  return Math.round(base + (Math.random() - 0.5) * 2 * spread);
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mql.matches);
    const raf = requestAnimationFrame(sync);
    mql.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      mql.removeEventListener("change", sync);
    };
  }, []);
  return reduced;
}

export default function JobSandbox() {
  const reduced = useReducedMotion();

  const [url, setUrl] = useState(DEFAULT_URL);
  const [schedule, setSchedule] = useState<Schedule>("once");
  const [shouldFail, setShouldFail] = useState(false);
  const [running, setRunning] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(ONCE_DELAY);
  const [history, setHistory] = useState<Attempt[]>([]);

  // Every timer/interval/raf we create, so re-run + unmount can clear them all.
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const seq = useRef(0);
  // Latest runCycle, so the cron loop can re-arm itself without the callback
  // referencing its own (not-yet-declared) identifier.
  const runCycleRef = useRef<((seconds: number, isCron: boolean) => void) | null>(null);
  // Live mirrors of config the running cycle reads, so an in-flight cron loop
  // picks up "make it fail" toggles without being torn down. Synced from
  // effects (not during render).
  const failRef = useRef(shouldFail);
  const reducedRef = useRef(reduced);
  useEffect(() => { failRef.current = shouldFail; }, [shouldFail]);
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (interval.current !== null) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const record = useCallback((attempt: number, status: number, tone: Tone) => {
    const row: Attempt = {
      id: seq.current++,
      time: nowStamp(),
      attempt,
      status,
      durationMs:
        tone === "danger" ? jitter(95, 30) : jitter(160, 50),
      tone,
    };
    setHistory((prev) => [row, ...prev].slice(0, HISTORY_CAP));
  }, []);

  // One full fire cycle: fire → (maybe fail → backoff → retry) → done.
  const fire = useCallback(
    (onComplete: () => void) => {
      const fast = reducedRef.current;
      const willFail = failRef.current;

      setPhase("firing");
      const fireDur = fast ? 120 : 700;

      after(fireDur, () => {
        if (willFail) {
          setPhase("failed");
          record(1, 503, "danger");
          after(fast ? 200 : 900, () => {
            setPhase("backoff");
            after(fast ? 150 : 800, () => {
              setPhase("retrying");
              after(fast ? 120 : 700, () => {
                setPhase("done");
                record(2, 200, "success");
                onComplete();
              });
            });
          });
        } else {
          setPhase("done");
          record(1, 200, "success");
          onComplete();
        }
      });
    },
    [after, record],
  );

  const stop = useCallback(() => {
    clearTimers();
    setRunning(false);
    setPhase("idle");
    setCountdown(schedule === "once" ? ONCE_DELAY : CRON_INTERVAL);
  }, [clearTimers, schedule]);

  // A countdown then a fire; for cron, loop on the interval.
  const runCycle = useCallback(
    (seconds: number, isCron: boolean) => {
      const fast = reducedRef.current;
      setPhase("counting");
      setCountdown(seconds);

      const startFire = () => {
        fire(() => {
          if (isCron) {
            // Brief breath on the "done" state, then re-arm the countdown.
            after(fast ? 250 : 1000, () => runCycleRef.current?.(seconds, true));
          } else {
            after(fast ? 0 : 1200, () => setRunning(false));
          }
        });
      };

      if (fast) {
        setCountdown(0);
        after(150, startFire);
        return;
      }

      let remaining = seconds;
      interval.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (interval.current !== null) {
            clearInterval(interval.current);
            interval.current = null;
          }
          setCountdown(0);
          startFire();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    },
    [after, fire],
  );
  useEffect(() => { runCycleRef.current = runCycle; }, [runCycle]);

  const start = useCallback(() => {
    clearTimers();
    setHistory([]);
    setRunning(true);
    const isCron = schedule === "cron";
    runCycle(isCron ? CRON_INTERVAL : ONCE_DELAY, isCron);
  }, [clearTimers, runCycle, schedule]);

  useEffect(() => clearTimers, [clearTimers]);

  const tone = phaseTone(phase);
  const active = phase === "firing" || phase === "retrying" || phase === "backoff";

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.06)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-2 text-[11px] uppercase tracking-widest text-white/30 font-mono">
            sandbox
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/30">
            interactive demo
          </span>
        </div>

        {/* Controls */}
        <div className="px-4 py-4 space-y-4 border-b border-white/[0.07]">
          <div className="space-y-1.5">
            <label
              htmlFor="sandbox-url"
              className="block text-[10px] uppercase tracking-widest text-white/30 font-mono"
            >
              target url
            </label>
            <input
              id="sandbox-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-white/80 outline-none transition-colors placeholder:text-white/25 focus:border-white/25 focus:bg-white/[0.05]"
              placeholder={DEFAULT_URL}
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-widest text-white/30 font-mono">
                schedule
              </span>
              <div
                role="radiogroup"
                aria-label="Schedule type"
                className="inline-flex rounded-md border border-white/10 bg-white/[0.03] p-0.5"
              >
                {(
                  [
                    { id: "once" as const, label: "Once in 3s" },
                    { id: "cron" as const, label: "Every 2s (cron)" },
                  ]
                ).map((opt) => {
                  const selected = schedule === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={running}
                      onClick={() => setSchedule(opt.id)}
                      className={cn(
                        "rounded px-3 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        selected
                          ? "bg-white/15 text-white"
                          : "text-white/50 hover:text-white/80",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2 py-1.5">
              <input
                type="checkbox"
                checked={shouldFail}
                onChange={(e) => setShouldFail(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "relative h-5 w-9 rounded-full border transition-colors",
                  shouldFail
                    ? "border-red-500/40 bg-red-500/20"
                    : "border-white/15 bg-white/[0.06]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full transition-transform",
                    shouldFail
                      ? "translate-x-4 bg-red-400"
                      : "translate-x-0 bg-white/50",
                  )}
                />
              </span>
              <span className="font-mono text-xs text-white/60">
                make it fail
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={running ? stop : start}
              aria-label={running ? "Stop the scheduled job" : "Schedule the job"}
            >
              {running ? "Stop" : "Schedule"}
            </Button>
            {history.length > 0 && !running && (
              <Button
                size="sm"
                variant="ghost"
                onClick={start}
                className="text-white/60 hover:text-white"
              >
                Re-run
              </Button>
            )}
          </div>
        </div>

        {/* Timeline track with scanning highlight while a cycle is live */}
        <div className="relative h-1 bg-white/[0.04] overflow-hidden">
          {running && (
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-timeline-scan" />
          )}
        </div>

        {/* The live job line */}
        <div className="flex items-center gap-3 px-4 py-3 text-sm border-b border-white/[0.07]">
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/15 text-white/70">
            POST
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs text-white/70 truncate">{url}</div>
            <div className="font-mono text-[10px] text-white/30 truncate">
              {schedule === "once"
                ? "one-off · fires once"
                : "*/2 * * * * · repeats every 2s"}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {phase === "counting" ? (
              <span className="font-mono text-[11px] text-white/50 tabular-nums">
                fires in {countdown}s
              </span>
            ) : phase === "idle" ? (
              <span className="font-mono text-[11px] text-white/30">
                not scheduled
              </span>
            ) : (
              <StatusBadge
                tone={tone}
                label={PHASE_LABEL[phase]}
                pulse={active}
              />
            )}
          </div>
        </div>

        {/* Execution history */}
        <div className="px-4 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
              execution history
            </span>
            <span className="font-mono text-[10px] text-white/25 tabular-nums">
              {history.length} attempt{history.length === 1 ? "" : "s"}
            </span>
          </div>

          {history.length === 0 ? (
            <p className="py-3 font-mono text-[11px] text-white/25">
              No executions yet — schedule the job to fire one.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {history.map((row) => (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-center gap-3 py-2 font-mono text-[11px] tabular-nums",
                    !reduced && "animate-row-in",
                  )}
                >
                  <span className="text-white/40">{row.time}</span>
                  <span className="text-white/40">attempt {row.attempt}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5">
                    <StatusDot tone={row.tone} />
                    <span
                      className={cn(
                        row.tone === "danger"
                          ? "text-red-300"
                          : "text-green-300",
                      )}
                    >
                      {row.status}
                    </span>
                  </span>
                  <span className="w-12 text-right text-white/40">
                    {row.durationMs}ms
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[10px] text-white/25">
        Illustrative only — no request leaves your browser.
      </p>
    </div>
  );
}
