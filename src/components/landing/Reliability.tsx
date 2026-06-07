import LiveStatus from "./LiveStatus";

const cards = [
  {
    title: "At-least-once delivery",
    description:
      "Workers claim each job with FOR UPDATE SKIP LOCKED, so two workers never run it at once. A crashed or failed run is retried — delivery is at-least-once, so send an idempotency key and your endpoint stays safe.",
  },
  {
    title: "Automatic crash recovery",
    description:
      "Running workers heartbeat every few seconds. A reaper detects a worker that died mid-job and reschedules the work — no stuck jobs, no manual intervention.",
  },
  {
    title: "Every attempt recorded",
    description:
      "Each fire and each retry is written to the database before and after it runs: status code, duration, response. Query the full history by API or in the dashboard.",
  },
];

export default function Reliability() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Reliability you can watch, not just read about
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            We won&apos;t quote you an SLA we can&apos;t prove yet. Here&apos;s
            the live status of the production API instead.
          </p>
        </div>

        {/* Live status panel */}
        <div className="mb-16 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
            <LiveStatus variant="inline" />
            <span className="text-white/20">·</span>
            <a
              href="/status"
              className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              Full status &amp; uptime →
            </a>
          </div>
        </div>

        {/* How reliability actually works */}
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
