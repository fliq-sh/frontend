const steps = [
  {
    number: "01",
    title: "Schedule",
    description:
      "Send one API call (or use the dashboard). Set the URL, method, and fire time. One-time or recurring — your choice.",
  },
  {
    number: "02",
    title: "We Execute",
    description:
      "Fliq fires your endpoint on time, globally, with automatic retries on failure. No workers to manage, no queues to babysit.",
  },
  {
    number: "03",
    title: "Full Visibility",
    description:
      "Every attempt logged: status code, duration, error. Search and filter up to 1 year back. Know exactly what happened and when.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            From zero to scheduled in under 5 minutes.
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
