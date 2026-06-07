// FAQ content lives in a plain (non-client) module so server components can
// import it for FAQPage JSON-LD without pulling in a client reference.

export const faqs = [
  {
    question: "Is Fliq really free right now?",
    answer:
      "Yes. During the public beta Fliq is free — 100,000 executions per day, no credit card. Paid plans (pay-as-you-go and enterprise) come later, and beta users get early-adopter terms.",
  },
  {
    question: "How does billing work with retries?",
    answer:
      "Each execution attempt — including retries — is one unit. If a job fails and retries 3 times before succeeding, that's 4 attempts. During the beta you get 100,000 free per day, so even aggressive retry policies are fine.",
  },
  {
    question: "How fast do jobs fire?",
    answer:
      "Jobs fire at the time you schedule them. The scheduler polls continuously and claims due jobs immediately, so a busy moment or a restarted worker doesn't mean a missed run. We're not quoting a latency SLA we haven't measured yet — watch the live status page for real numbers.",
  },
  {
    question: "What happens if my endpoint is down?",
    answer:
      "Fliq retries with exponential backoff up to your configured limit. You see every attempt and its outcome — HTTP status code, response snippet, duration — in the dashboard and via the API.",
  },
  {
    question: "Can AI agents use it?",
    answer:
      "Yes. Fliq ships an MCP server, so agents (Claude, Cursor, your own) can create, inspect, and cancel scheduled jobs as tool calls — a durable way for an agent to run on a schedule and pick work back up.",
  },
  {
    question: "Do I need to change my codebase?",
    answer:
      "No. Fliq calls your existing HTTP endpoints. If it accepts a webhook today, it works with Fliq today — no SDK required, no agent to install. Authenticate calls however you already do.",
  },
  {
    question: "Is it open source?",
    answer:
      "The backend (Go) and this frontend are open source on GitHub. It's Postgres-native — no Redis or Kafka — so you'll be able to self-host the whole thing.",
  },
];
