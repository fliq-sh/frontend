const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<10ms", label: "Median global latency" },
  { value: "1 year", label: "Execution history retained" },
  { value: "30+", label: "Global edge regions" },
];

const cards = [
  {
    title: "Reliability",
    description:
      "We guarantee each job executes exactly once. Crashed workers are detected automatically and jobs are rescheduled without any action from you. Built to handle 1M+ jobs per second.",
  },
  {
    title: "Observability",
    description:
      "Per-job attempt logs, HTTP response codes, durations, and errors exposed in the dashboard and API. Prometheus metrics for your own monitoring stack.",
  },
  {
    title: "Durability",
    description:
      "Every job and every execution attempt is stored for up to 1 year. Search, filter, replay. Full audit trail, always available.",
  },
];

export default function Reliability() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for production from day one
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            The numbers your SRE team will ask for — already exceeded.
          </p>
        </div>

        {/* Big stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Explanation cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
