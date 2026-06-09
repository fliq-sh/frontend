import Link from "next/link";

const oneTimeUseCases = [
  {
    emoji: "✉️",
    title: "Welcome email 60s after signup",
    description: "Don't flood the inbox on registration. Fire exactly 1 minute later.",
  },
  {
    emoji: "⏰",
    title: "Trial expiry warning 24h before",
    description: "Remind users before the deadline, not after they've already churned.",
  },
  {
    emoji: "🔗",
    title: "Webhook delivery to a partner API",
    description: "Trigger partner integrations at the exact moment an event occurs.",
  },
  {
    emoji: "💳",
    title: "Charge a card at contract start date",
    description: "Schedule the billing call months in advance — fire on the dot.",
  },
];

const cronUseCases = [
  {
    emoji: "📦",
    title: "Monthly subscription billing",
    description: "Like Netflix — charge every 30 days, per customer, automatically.",
  },
  {
    emoji: "🔄",
    title: "Hourly data sync from a third-party API",
    description: "Keep your data fresh without managing a background worker.",
  },
  {
    emoji: "📧",
    title: "Daily digest email to all active users",
    description: "Send at 8 AM in each user's timezone with a single cron expression.",
  },
  {
    emoji: "🏥",
    title: "Every-5-minute health check",
    description: "Ping external partners and alert if they go down.",
  },
];

// AI agents — formerly its own section, now a featured use case within "what
// people build" (buffers is the headline differentiator; agents is one strong
// use case among many).
const agentPoints = [
  {
    title: "Agents need to wake themselves up",
    body: "A script ends when it returns. An agent has to run again tomorrow at 9am, or every 15 minutes. Fliq is the durable timer that calls your agent back.",
  },
  {
    title: "Schedule in natural language",
    body: "Fliq ships an MCP server. Point Claude, Cursor, or your own agent at it and it can create, inspect, pause, and cancel jobs as tool calls — no glue code.",
  },
  {
    title: "Retries and history, so runs don't vanish",
    body: "Every agent invocation is an HTTP call with automatic retries and a recorded outcome. When a 3am run fails, you see the attempt — not silence.",
  },
];

export default function UseCases() {
  return (
    <section className="section-breathe px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            What people build with Fliq
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            One-time jobs or recurring schedules — the API is identical.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* One-time */}
          <div>
            <div className="mb-6">
              <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 uppercase tracking-widest">
                One-time executions
              </span>
              <p className="mt-3 text-white/60 text-sm">
                Something happens in your app → trigger one action at a precise moment
              </p>
            </div>
            <div className="space-y-3">
              {oneTimeUseCases.map((uc) => (
                <div
                  key={uc.title}
                  className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="text-2xl">{uc.emoji}</span>
                  <div>
                    <h4 className="font-medium text-sm">{uc.title}</h4>
                    <p className="text-xs text-white/50 mt-1">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cron */}
          <div>
            <div className="mb-6">
              <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 uppercase tracking-widest">
                Recurring / Cron
              </span>
              <p className="mt-3 text-white/60 text-sm">
                Set it once, run it forever — at any interval
              </p>
            </div>
            <div className="space-y-3">
              {cronUseCases.map((uc) => (
                <div
                  key={uc.title}
                  className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="text-2xl">{uc.emoji}</span>
                  <div>
                    <h4 className="font-medium text-sm">{uc.title}</h4>
                    <p className="text-xs text-white/50 mt-1">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured use case: AI agents */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="max-w-2xl mb-8">
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 uppercase tracking-widest">
              Featured · AI agents
            </span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">
              The execution layer your AI agents are missing
            </h3>
            <p className="mt-3 text-white/60 leading-relaxed">
              The same reliable scheduler backend teams use is exactly what
              autonomous agents need — a durable, observable way to run on a
              schedule and pick work back up.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agentPoints.map((p) => (
              <div key={p.title}>
                <h4 className="text-base font-semibold mb-2">{p.title}</h4>
                <p className="text-sm text-white/60 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/docs" className="text-sm text-white/70 hover:text-white underline underline-offset-4 transition-colors">
              Read the MCP &amp; agent docs →
            </Link>
          </div>
        </div>

        {/* Code teaser */}
        <div className="mt-12 rounded-xl border border-white/10 bg-black/40 p-6 font-mono text-sm">
          <p className="text-white/30 mb-3 text-xs">{"// Schedule a welcome email in one call"}</p>
          <p className="text-white font-semibold">POST</p>
          <p className="text-white/80">
            {`{ "url": "https://api.myapp.com/emails/welcome",`}
          </p>
          <p className="text-white/80">
            {`  "scheduled_at": "2026-03-02T10:00:00Z" }`}
          </p>
        </div>
      </div>
    </section>
  );
}
