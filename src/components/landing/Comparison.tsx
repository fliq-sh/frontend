import Link from "next/link";

const rows = [
  {
    label: "Setup",
    diy: "Cron box + queue + worker + retry code",
    fliq: "One POST request",
  },
  {
    label: "Retry logic",
    diy: "Write and tune it yourself",
    fliq: "Built-in, configurable backoff",
  },
  {
    label: "Crash recovery",
    diy: "Build a heartbeat + recovery system",
    fliq: "Automatic reaper, included",
  },
  {
    label: "Execution history",
    diy: "Build your own log table",
    fliq: "Every attempt, queryable",
  },
  {
    label: "When the box dies",
    diy: "Jobs silently stop firing",
    fliq: "Stateless API + recovered jobs",
  },
  {
    label: "Ops burden",
    diy: "High — you own the infra",
    fliq: "Zero — it's a hosted API",
  },
];

export default function Comparison() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Stop running cron on a box that can die
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            A single-server crontab has no retries, no history, and no recovery.
            Fliq is that machinery, hosted.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
            <div className="p-4 text-sm text-white/40" />
            <div className="p-4 text-sm font-medium text-white/60 text-center border-l border-white/10">
              DIY cron + worker
            </div>
            <div className="p-4 text-sm font-semibold text-indigo-400 text-center border-l border-white/10">
              Fliq
            </div>
          </div>

          {/* Data rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 border-b border-white/10 last:border-0 ${
                i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
              }`}
            >
              <div className="p-4 text-sm text-white/60 font-medium">
                {row.label}
              </div>
              <div className="p-4 text-sm text-white/40 text-center border-l border-white/10">
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
          <Link
            href="/vs"
            className="text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            See Fliq vs EasyCron, QStash, cron-job.org &amp; more →
          </Link>
        </p>
      </div>
    </section>
  );
}
