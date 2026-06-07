// Single source of truth for site-wide constants. Keep this honest — every
// claim on the marketing site should trace back to something true here.

export const SITE = {
  name: "Fliq",
  url: "https://fliq.sh",
  apiUrl: "https://api.fliq.sh",
  // Public, unauthenticated liveness endpoint (added in core-api). The uptime
  // widget polls this; an external monitor (BetterStack) tracks history.
  healthPath: "/health",
  tagline: "Reliable HTTP job scheduling for developers",
  description:
    "Schedule any HTTP request — once or on a cron — and Fliq runs it on time with automatic retries, crash recovery, and a full per-execution history. Postgres-native, no queue to manage.",
  // Short, share-optimized description for social cards.
  ogDescription:
    "Cron jobs and scheduled webhooks without running infra. Automatic retries, crash recovery, full execution history. Free during public beta.",
  twitter: "@fliq_sh",
  email: "hello@fliq.sh",
  enterpriseEmail: "enterprise@fliq.sh",
  github: {
    org: "https://github.com/fliq-sh",
    coreApi: "https://github.com/fliq-sh/core-api",
    frontend: "https://github.com/fliq-sh/frontend",
    // owner/repo used for the live star count fetch
    starsRepo: "fliq-sh/core-api",
  },
} as const;

// Beta offer — surfaced prominently across the site. Mirrors /pricing exactly.
export const BETA = {
  free: true,
  executionsPerDay: 100_000,
  executionsPerDayLabel: "100,000 executions/day",
  headline: "Free during public beta",
  blurb: "100,000 executions a day. No credit card. Paid plans come later.",
  pill: "Free during public beta · 100k executions/day · no card",
} as const;

// Honest, verifiable product facts — used wherever we'd otherwise be tempted to
// invent a number. These describe how core-api actually works.
export const FACTS = {
  postgresNative: "Postgres-native — no Redis, no Kafka, no queue to operate.",
  exactlyOnce:
    "Each job is claimed by exactly one worker via FOR UPDATE SKIP LOCKED — no duplicate fires.",
  crashRecovery:
    "Workers heartbeat while running; a reaper detects crashed workers and reschedules their jobs automatically.",
  retries:
    "Failed attempts retry with configurable backoff. Every attempt is recorded — status, duration, response.",
  history:
    "Full per-execution history: every fire, every retry, every response code, queryable via API and dashboard.",
  openSource: "Backend and frontend are open source on GitHub.",
  mcp: "An MCP server lets AI agents schedule and manage jobs in natural language.",
} as const;
