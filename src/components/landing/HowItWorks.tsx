// "How it works" — the three-step narrative followed by the capability bento.
// (Merged from the former HowItWorks + Features sections.)

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

const codeLines = [
  { indent: 0, tokens: [{ t: "kw", v: "POST" }, { t: "plain", v: " " }, { t: "str", v: "https://api.fliq.sh/jobs" }] },
  { indent: 0, tokens: [{ t: "key", v: "Content-Type" }, { t: "plain", v: ": " }, { t: "str", v: "application/json" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ t: "brace", v: "{" }] },
  { indent: 1, tokens: [{ t: "key", v: '"url"' }, { t: "plain", v: ":  " }, { t: "str", v: '"https://yourapi.com/send-invoice"' }, { t: "plain", v: "," }] },
  { indent: 1, tokens: [{ t: "key", v: '"scheduled_at"' }, { t: "plain", v: ": " }, { t: "str", v: '"2026-03-05T09:00:00Z"' }, { t: "plain", v: "," }] },
  { indent: 1, tokens: [{ t: "key", v: '"max_retries"' }, { t: "plain", v: ": " }, { t: "num", v: "3" }] },
  { indent: 0, tokens: [{ t: "brace", v: "}" }] },
];

type Token = { t: string; v: string };

// Monochrome code: weight + opacity carry the hierarchy, not colour.
function CodeToken({ token }: { token: Token }) {
  const colors: Record<string, string> = {
    kw:    "text-white font-semibold",
    str:   "text-white/80",
    key:   "text-white/90",
    num:   "text-white/80",
    brace: "text-white/40",
    plain: "text-white/55",
  };
  return <span className={colors[token.t] ?? "text-white/70"}>{token.v}</span>;
}

const iconClass = "w-5 h-5 text-white/70";

const smallCards = [
  {
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "Smart Retries",
    description: "Exponential backoff, configurable max attempts. Failed jobs retry automatically — every attempt is recorded.",
  },
  {
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "Full Observability",
    description: "Every attempt logged: HTTP status, duration, error, worker. Search and filter your execution history.",
  },
  {
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Fires on schedule",
    description: "Jobs fire at the time you set — the scheduler polls continuously, so a missed tick never means a missed job.",
  },
  {
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m0 5.625c0 2.278 3.694 4.125 8.25 4.125s8.25-1.847 8.25-4.125" />
      </svg>
    ),
    title: "Durable by Design",
    description: "Jobs and their execution history live in Postgres — the single source of truth. TLS 1.2+ in transit.",
  },
  {
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: "Cron + One-time",
    description: "Any schedule: once, hourly, daily, monthly — standard cron syntax or ISO 8601 timestamps.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-tight px-6 border-t border-white/10 relative overflow-hidden">
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
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How it works</h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            From one request to a recorded execution — no infrastructure in
            between.
          </p>
        </div>

        {/* Three steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
              <span className="text-4xl font-bold text-white/15 tabular-nums">
                {step.number}
              </span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Capabilities bento */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold tracking-tight">
              Everything a scheduler should do — and nothing to run
            </h3>
            <p className="mt-3 text-white/60 max-w-xl mx-auto">
              No queue to manage, no worker to deploy, no retry code to maintain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(160px,auto)]">
            {/* Large card: one API call */}
            <div className="md:col-span-2 md:row-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between group hover:border-white/20 hover:bg-white/[0.05] transition-colors overflow-hidden relative">
              <div
                className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
              />

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/70 mb-4">
                  <span className="h-1 w-1 rounded-full bg-white/70" />
                  One API Call
                </div>
                <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                  POST a URL and a fire time. That&apos;s it — no queue to configure, no worker to deploy, no infrastructure to babysit.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-white/8 bg-black/40 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="ml-3 text-[10px] text-white/25 tracking-widest uppercase font-mono">schedule a job</span>
                </div>
                <div className="p-4 font-mono text-xs leading-6 overflow-x-auto">
                  {codeLines.map((line, i) => (
                    <div key={i} style={{ paddingLeft: `${line.indent * 16}px` }}>
                      {line.tokens.length === 0
                        ? <span>&nbsp;</span>
                        : line.tokens.map((tok, j) => <CodeToken key={j} token={tok} />)
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {smallCards.map((card, i) => (
              <div
                key={card.title}
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-3 group hover:border-white/20 hover:bg-white/[0.05] transition-colors ${
                  i >= 2 ? "md:col-span-1" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{card.title}</h4>
                  <p className="text-xs text-white/50 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
