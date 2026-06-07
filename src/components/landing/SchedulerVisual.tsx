"use client";

import { useEffect, useState } from "react";

// An illustrative "live execution feed" — what Fliq actually does: jobs fire on
// schedule, retry on failure, and land in history. Pure React + CSS (no WebGL),
// deterministic so it's SSR-safe and honest (labelled a demo, not real metrics).

type Phase = "scheduled" | "running" | "retrying" | "success";

interface Job {
  label: string;
  method: "POST" | "GET";
  path: string;
  cron: string;
  base: number; // seconds between fires (staggers the rows)
  fireIn: number;
  phase: Phase;
  ticks: number;
  runs: number;
}

const INITIAL: Job[] = [
  { label: "Monthly billing", method: "POST", path: "/v1/billing/charge", cron: "0 0 1 * *", base: 6, fireIn: 2, phase: "scheduled", ticks: 0, runs: 0 },
  { label: "Daily digest", method: "POST", path: "/v1/emails/digest", cron: "0 8 * * *", base: 5, fireIn: 4, phase: "scheduled", ticks: 0, runs: 1 },
  { label: "Partner healthcheck", method: "GET", path: "/health/partner", cron: "*/5 * * * *", base: 4, fireIn: 1, phase: "scheduled", ticks: 0, runs: 2 },
  { label: "Inventory sync", method: "POST", path: "/v1/webhooks/sync", cron: "0 * * * *", base: 7, fireIn: 6, phase: "scheduled", ticks: 0, runs: 0 },
];

function advance(job: Job): Job {
  switch (job.phase) {
    case "scheduled": {
      const fireIn = job.fireIn - 1;
      if (fireIn <= 0) return { ...job, phase: "running", ticks: 0 };
      return { ...job, fireIn };
    }
    case "running": {
      if (job.ticks >= 1) {
        // Every 3rd run shows a retry, then succeeds — true to the product.
        const retry = job.runs % 3 === 2;
        return { ...job, phase: retry ? "retrying" : "success", ticks: 0 };
      }
      return { ...job, ticks: job.ticks + 1 };
    }
    case "retrying": {
      if (job.ticks >= 1) return { ...job, phase: "success", ticks: 0 };
      return { ...job, ticks: job.ticks + 1 };
    }
    case "success": {
      if (job.ticks >= 1)
        return { ...job, phase: "scheduled", fireIn: job.base, ticks: 0, runs: job.runs + 1 };
      return { ...job, ticks: job.ticks + 1 };
    }
  }
}

const PHASE_META: Record<Phase, { label: string; dot: string; text: string }> = {
  scheduled: { label: "scheduled", dot: "bg-indigo-400", text: "text-indigo-300" },
  running: { label: "running", dot: "bg-sky-400", text: "text-sky-300" },
  retrying: { label: "retry", dot: "bg-amber-400", text: "text-amber-300" },
  success: { label: "200 OK", dot: "bg-green-400", text: "text-green-300" },
};

function Clock() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      new Date().toISOString().slice(11, 19); // HH:MM:SS in UTC
    // Kick the first update on the next frame (async) rather than synchronously
    // in the effect body, then tick every second.
    const raf = requestAnimationFrame(() => setT(fmt()));
    const id = setInterval(() => setT(fmt()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);
  return (
    <span className="font-mono text-[11px] text-white/40 tabular-nums">
      {t ?? "--:--:--"} UTC
    </span>
  );
}

export default function SchedulerVisual() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL);

  useEffect(() => {
    const id = setInterval(() => setJobs((prev) => prev.map(advance)), 1000);
    return () => clearInterval(id);
  }, []);

  const executed = jobs.reduce((n, j) => n + j.runs, 0);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.10)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-2 text-[11px] uppercase tracking-widest text-white/30 font-mono">
            scheduler
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/30">
            demo
          </span>
          <Clock />
        </div>

        {/* Timeline track with scanning highlight */}
        <div className="relative h-1 bg-white/[0.04] overflow-hidden">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-timeline-scan" />
        </div>

        {/* Job rows */}
        <div className="divide-y divide-white/[0.06]">
          {jobs.map((job) => {
            const m = PHASE_META[job.phase];
            const active = job.phase === "running" || job.phase === "retrying";
            return (
              <div
                key={job.label}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    job.method === "POST"
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {job.method}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-white/70 truncate">
                    {job.path}
                  </div>
                  <div className="font-mono text-[10px] text-white/30 truncate">
                    {job.cron} · {job.label}
                  </div>
                </div>

                {/* Status / countdown */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.phase === "scheduled" ? (
                    <span className="font-mono text-[11px] text-white/40 tabular-nums">
                      in {job.fireIn}s
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${m.text}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        {active && (
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${m.dot}`}
                          />
                        )}
                        <span
                          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${m.dot}`}
                        />
                      </span>
                      {m.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer summary */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.07] text-[11px] text-white/35 font-mono">
          <span>{jobs.length} schedules active</span>
          <span className="tabular-nums">{executed} executions · 0 lost</span>
        </div>
      </div>
    </div>
  );
}
