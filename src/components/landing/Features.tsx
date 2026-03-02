import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "⚡",
    title: "One API Call",
    description:
      "POST a URL + fire time. Done. No queue to configure, no worker to deploy.",
  },
  {
    icon: "🔄",
    title: "Smart Retries",
    description:
      "Exponential backoff, configurable max attempts. Failed jobs retry automatically — zero config required.",
  },
  {
    icon: "🔭",
    title: "Full Observability",
    description:
      "Every attempt logged: HTTP status, duration, error, worker ID. Search and filter up to 1 year back.",
  },
  {
    icon: "🕐",
    title: "Sub-second Execution",
    description:
      "Median dispatch latency under 10ms globally. Your jobs fire when you say they fire.",
  },
  {
    icon: "🔒",
    title: "Durable by Design",
    description:
      "Jobs and their full execution history retained for 1 year. Encrypted at rest, TLS 1.2+ in transit.",
  },
  {
    icon: "📅",
    title: "Cron + One-time",
    description:
      "Any schedule: once, hourly, daily, monthly — standard cron syntax or ISO 8601 timestamps.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to schedule at scale
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            Built for reliability from day one. No queues to manage, no
            infrastructure to maintain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors"
            >
              <CardHeader>
                <div className="text-3xl mb-2">{f.icon}</div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/60">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
