import Link from "next/link";

const problems = [
  "Your app needs things to happen later — a reminder, a charge, a webhook, a sync. So you reach for cron on a server.",
  "But that crontab has no retries, no history, and no idea a run failed. When the box restarts, the jobs just stop.",
  "So you bolt on a queue, a worker, a heartbeat, a dead-letter table… and now you maintain a scheduler instead of your product.",
];

const solutions = [
  "One API call schedules any HTTP request — once or on a cron",
  "Automatic retries with backoff — every attempt recorded",
  "Crash recovery built in — no run silently disappears",
];

// DIY cron + worker vs Fliq — the proof under the narrative.
const rows = [
  { label: "Setup", diy: "Cron box + queue + worker + retry code", fliq: "One POST request" },
  { label: "Retry logic", diy: "Write and tune it yourself", fliq: "Built-in, configurable backoff" },
  { label: "Crash recovery", diy: "Build a heartbeat + recovery system", fliq: "Automatic reaper, included" },
  { label: "Execution history", diy: "Build your own log table", fliq: "Every attempt, queryable" },
  { label: "When the box dies", diy: "Jobs silently stop firing", fliq: "Stateless API + recovered jobs" },
  { label: "Ops burden", diy: "High — you own the infra", fliq: "Zero — it's a hosted API" },
];

export default function Problem() {
  return (
    <section className="section-breathe px-6 border-t border-white/10 relative overflow-hidden">
      {/* Soft monochrome glow behind the solution card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 75% 40%, rgba(255,255,255,0.05) 0%, transparent 68%)",
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Scheduling is a solved problem. You shouldn&apos;t re-solve it.
          </h2>
        </div>

        {/* The trap vs Fliq — narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              The trap
            </p>
            <div className="space-y-6">
              {problems.map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-8">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-6">
              With Fliq
            </p>
            <p className="text-2xl font-bold tracking-tight mb-8">
              One API. Any schedule. Zero ops.
            </p>
            <div className="space-y-4">
              {solutions.map((text, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  <p className="text-white/80">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DIY vs Fliq — the proof. Dense on purpose. */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 bg-white/5 border-b border-white/10">
              <div className="hidden sm:block p-4 text-sm text-white/40" />
              <div className="p-4 text-sm font-medium text-white/60 text-center sm:border-l border-white/10">
                DIY cron + worker
              </div>
              <div className="p-4 text-sm font-semibold text-white text-center border-l border-white/10">
                Fliq
              </div>
            </div>

            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-2 sm:grid-cols-3 border-b border-white/10 last:border-0 ${
                  i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                }`}
              >
                <div className="col-span-2 sm:col-span-1 p-4 pb-1 sm:pb-4 text-sm text-white/60 font-medium">{row.label}</div>
                <div className="p-4 text-sm text-white/40 text-center sm:border-l border-white/10">
                  {row.diy}
                </div>
                <div className="p-4 text-sm text-white font-medium text-center border-l border-white/10">
                  {row.fliq}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Comparing a specific tool?{" "}
            <Link href="/vs" className="text-white/70 hover:text-white underline underline-offset-4 transition-colors">
              See Fliq vs EasyCron, QStash, cron-job.org &amp; more →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
