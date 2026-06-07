import Link from "next/link";

const points = [
  {
    title: "Agents need to wake themselves up",
    body: "A script ends when it returns. An agent has to run again tomorrow at 9am, or every 15 minutes, or 48 hours after a trigger. Fliq is the durable timer that calls your agent back.",
  },
  {
    title: "Schedule in natural language",
    body: "Fliq ships an MCP server. Point Claude, Cursor, or your own agent at it and it can create, inspect, pause, and cancel scheduled jobs as tool calls — no glue code.",
  },
  {
    title: "Retries and history, so runs don't vanish",
    body: "Every agent invocation is an HTTP call with automatic retries and a recorded outcome. When a 3am run fails, you see the attempt, the status, and the response — not silence.",
  },
];

export default function Agents() {
  return (
    <section className="py-24 px-4 border-t border-white/10 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 25% 40%, rgba(139,92,246,0.10) 0%, transparent 68%)",
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-2xl mb-14">
          <p className="text-xs text-violet-300/70 uppercase tracking-widest mb-3">
            The edge for AI builders
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            The execution layer your AI agents are missing
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            The same reliable scheduler backend teams use is exactly what
            autonomous agents need — a durable, observable way to run on a
            schedule and pick work back up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="text-base font-semibold mb-3">{p.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/docs"
            className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            Read the MCP &amp; agent docs →
          </Link>
        </div>
      </div>
    </section>
  );
}
