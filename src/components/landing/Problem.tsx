const problems = [
  "You built a great product. Now every action needs to happen at exactly the right moment.",
  "Managing Kafka, Redis queues, cron jobs, and retry logic takes a team. And it still breaks.",
  "When a job silently fails at 3 AM, your users feel it first.",
];

const solutions = [
  "One API call to schedule any HTTP action",
  "Automatic retries with backoff — zero config",
  "Full execution history, every attempt, forever",
];

export default function Problem() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Why Fliq?</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Problem side */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6">
              The problem
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

          {/* Solution side */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8">
            <p className="text-xs text-indigo-400/60 uppercase tracking-widest mb-6">
              The solution
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
      </div>
    </section>
  );
}
