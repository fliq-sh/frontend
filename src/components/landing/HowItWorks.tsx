const steps = [
  {
    number: "01",
    title: "Schedule",
    description:
      "POST a target URL, method, body, and a fire time — a one-off ISO timestamp or a cron expression. One call, or use the dashboard.",
  },
  {
    number: "02",
    title: "Fire & retry",
    description:
      "Fliq calls your endpoint on time. If it fails, it retries with backoff up to your limit. A reaper reschedules anything a crashed worker dropped.",
  },
  {
    number: "03",
    title: "Inspect",
    description:
      "Every attempt is recorded — status code, duration, response. Query the full history by API or browse it in the dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 border-t border-white/10 relative overflow-hidden">
      {/* Grid background fading at top + bottom */}
      <div className="absolute inset-0 bg-grid-lines pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #09090b 0%, transparent 12%, transparent 88%, #09090b 100%)",
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            From one request to a recorded execution — no infrastructure in
            between.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
              <span className="text-4xl font-bold text-indigo-500/30 tabular-nums">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
