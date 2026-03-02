const rows = [
  {
    label: "Setup time",
    diy: "Days to weeks",
    fliq: "5 minutes",
  },
  {
    label: "Retry logic",
    diy: "Write it yourself",
    fliq: "Built-in, configurable",
  },
  {
    label: "Crash recovery",
    diy: "Build a heartbeat system",
    fliq: "Automatic reaper",
  },
  {
    label: "Execution history",
    diy: "Build your own log table",
    fliq: "1-year history, queryable",
  },
  {
    label: "Global low latency",
    diy: "Deploy workers everywhere",
    fliq: "30+ edge regions",
  },
  {
    label: "Ops burden",
    diy: "High — you own infra",
    fliq: "Zero",
  },
];

export default function Comparison() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Why not DIY?</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            Rolling your own job scheduler is a solved problem. Fliq is the
            answer.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
            <div className="p-4 text-sm text-white/40" />
            <div className="p-4 text-sm font-medium text-white/60 text-center border-l border-white/10">
              DIY (cron + Redis + worker)
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
      </div>
    </section>
  );
}
