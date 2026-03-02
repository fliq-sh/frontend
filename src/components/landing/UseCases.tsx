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

export default function UseCases() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
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
              <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400 uppercase tracking-widest">
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
              <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400 uppercase tracking-widest">
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

        {/* Code teaser */}
        <div className="mt-12 rounded-xl border border-white/10 bg-black/40 p-6 font-mono text-sm">
          <p className="text-white/30 mb-3 text-xs">// Schedule a welcome email in one call</p>
          <p className="text-indigo-400">POST</p>
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
