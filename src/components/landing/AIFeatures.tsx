const features = [
  {
    title: "MCP Server",
    description:
      "Your AI agent can schedule jobs, list upcoming runs, pause/resume schedules, and search by name or ID — all through natural language via the Model Context Protocol.",
    icon: "🤖",
  },
  {
    title: "Agentic workflows",
    description:
      "Agents fire Fliq jobs as side-effects of decisions. The agent moves on; Fliq guarantees delivery. No polling, no babysitting.",
    icon: "⚙️",
  },
  {
    title: "Programmable retries",
    description:
      'Tell Fliq "retry up to 5 times with exponential backoff." Your agent never needs to think about failure recovery.',
    icon: "🔁",
  },
];

export default function AIFeatures() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-[#09090b] p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400 uppercase tracking-widest mb-4">
              AI-Native
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              Built for AI agents, not just humans
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">
              The scheduling infrastructure your agents need to act reliably in
              the real world.
            </p>
          </div>

          {/* Feature columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
