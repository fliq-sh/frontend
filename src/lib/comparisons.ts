// Programmatic SEO comparison data for /vs/[slug] pages.
//
// Honesty rule (same spirit as src/lib/site.ts): every cell here must be
// defensibly true. We lead with where Fliq genuinely fits and we describe each
// competitor fairly — no invented disparagement. When a competitor is the
// better tool, we say so in `whenCompetitor`.

export type MatrixRow = {
  dimension: string;
  fliq: string;
  competitor: string;
};

export type Comparison = {
  slug: string;
  competitor: string;
  competitorTagline: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  whenCompetitor: string;
  whenFliq: string;
  matrix: MatrixRow[];
};

// Fliq cells are constant across most rows — its capabilities don't change per
// competitor. Only the competitor column and the "Scheduling model" / "Best for"
// framing vary. We still write each matrix out in full for clarity.

export const COMPARISONS: Comparison[] = [
  {
    slug: "cron-job-org",
    competitor: "cron-job.org",
    competitorTagline: "Free community cron pinger",
    metaTitle: "Fliq vs cron-job.org — which scheduler should you use?",
    metaDescription:
      "Fliq vs cron-job.org: compare free cron pings against a Postgres-native HTTP scheduler with real retries, crash recovery, and full execution history.",
    intro:
      "cron-job.org is a beloved free service that pings a URL on a schedule — perfect for hobby keep-alives and simple checks. Fliq is a Postgres-native scheduler built for production HTTP jobs: configurable retries, crash recovery, and a full per-attempt history. If a missed or failed call actually matters, the difference shows.",
    whenCompetitor:
      "You want a free, no-account-needed way to hit a URL every few minutes — uptime pings, cache warmers, hobby keep-alives. cron-job.org has done this reliably for years and costs nothing.",
    whenFliq:
      "The call matters: a failed webhook should retry with backoff, a worker crash shouldn't silently drop the job, and you need to see exactly what happened on every attempt. Fliq adds retries, a crash reaper, and queryable history — plus an MCP server so AI agents can schedule jobs.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, any HTTP request",
        competitor: "Cron-style URL pings",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Basic re-try, limited",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "None",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Recent runs only",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Yes (GET/POST URL)",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "No",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Free",
      },
      {
        dimension: "Best for",
        fliq: "Production HTTP jobs that must not be dropped",
        competitor: "Hobby pings & keep-alives",
      },
    ],
  },
  {
    slug: "easycron",
    competitor: "EasyCron",
    competitorTagline: "The oldest commercial cron service",
    metaTitle: "Fliq vs EasyCron — which scheduler should you use?",
    metaDescription:
      "Fliq vs EasyCron: compare a long-running commercial cron URL service against a Postgres-native HTTP scheduler with crash recovery, MCP, and open source.",
    intro:
      "EasyCron is a mature, commercial web-cron service that has reliably called URLs on a schedule for over a decade. Fliq covers the same core job — schedule any HTTP request — but is Postgres-native, open source, and adds a crash-recovery reaper plus an MCP server for AI agents. Both are solid; the right pick depends on whether you value a proven incumbent or an open, agent-friendly platform.",
    whenCompetitor:
      "You want a battle-tested, established service with a long track record and a familiar web-cron UI, and you don't need open source or self-hosting.",
    whenFliq:
      "You want the scheduler to be open source and self-hostable, want a crash reaper that reschedules dropped jobs, and want AI agents to manage schedules via MCP — all on a Postgres-native stack with per-attempt history.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, any HTTP request",
        competitor: "Cron-style URL calls",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Configurable retries",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Managed service handles it",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Execution logs",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Yes",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "No",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Paid tiers by job count",
      },
      {
        dimension: "Best for",
        fliq: "Open, agent-friendly HTTP scheduling",
        competitor: "Proven managed web-cron",
      },
    ],
  },
  {
    slug: "qstash",
    competitor: "Upstash QStash",
    competitorTagline: "Serverless message queue + schedules at the edge",
    metaTitle: "Fliq vs Upstash QStash — which scheduler should you use?",
    metaDescription:
      "Fliq vs QStash: compare Upstash's edge-native HTTP messaging and schedules against Fliq's Postgres-native scheduler with crash recovery and open source.",
    intro:
      "QStash is an excellent serverless HTTP messaging and scheduling layer — it delivers messages and cron schedules to your endpoints with retries and signing, all edge-native and pairs naturally with Upstash Redis. Fliq targets the scheduling slice specifically: cron and one-off HTTP jobs, Postgres-native, open source, with a crash-recovery reaper and an MCP server. If you're already in the Upstash ecosystem, QStash is a natural fit; if you want an open, self-hostable scheduler, Fliq fits.",
    whenCompetitor:
      "You want edge-native delivery, message queuing as well as scheduling, request signing, and tight integration with Upstash Redis and serverless platforms. QStash is mature and well-built for that.",
    whenFliq:
      "You want a focused, open-source scheduler you can self-host and inspect, with a Postgres-native model, a crash reaper, full per-attempt history, and AI-agent control via MCP — without adopting an edge/Redis ecosystem.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off HTTP jobs",
        competitor: "Schedules + message queue (edge)",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Automatic retries",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Managed, at-least-once delivery",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Message logs & events",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Yes",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "No (managed)",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Per-message, free tier",
      },
      {
        dimension: "Best for",
        fliq: "Open, self-hostable HTTP scheduling",
        competitor: "Edge messaging + scheduling",
      },
    ],
  },
  {
    slug: "trigger-dev",
    competitor: "Trigger.dev",
    competitorTagline: "Durable background jobs in your codebase",
    metaTitle: "Fliq vs Trigger.dev — which scheduler should you use?",
    metaDescription:
      "Fliq vs Trigger.dev: durable workflows that run your code vs a Postgres-native scheduler that calls any HTTP endpoint with retries and crash recovery.",
    intro:
      "Trigger.dev is a powerful platform for durable background jobs and long-running workflows written as code in your own repo — with steps, waits, and full TypeScript ergonomics. Fliq solves a narrower, different problem: it schedules and fires HTTP requests to any URL, regardless of language or framework. They're complementary more than head-to-head — pick based on whether you want to author workflow code or just trigger existing endpoints.",
    whenCompetitor:
      "Your jobs are multi-step workflows with logic, waits, retries between steps, and fan-out, and you want to write them as durable functions in TypeScript inside your codebase. Trigger.dev is built for exactly that.",
    whenFliq:
      "You just need to call existing HTTP endpoints on a schedule — any language, any framework — without writing or deploying workflow code. Fliq schedules the request, retries on failure, recovers from crashes, and records every attempt, with MCP for AI agents.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, calls any URL",
        competitor: "Durable functions (your code)",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Per-step retries in code",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Durable execution / checkpoints",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Run & step traces",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Via your task code",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No native MCP scheduler",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "Yes (open source)",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "Yes",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Usage-based, free tier",
      },
      {
        dimension: "Best for",
        fliq: "Scheduling HTTP calls, any stack",
        competitor: "Code-defined durable workflows",
      },
    ],
  },
  {
    slug: "inngest",
    competitor: "Inngest",
    competitorTagline: "Event-driven durable functions",
    metaTitle: "Fliq vs Inngest — which scheduler should you use?",
    metaDescription:
      "Fliq vs Inngest: event-driven durable functions you write in code vs a Postgres-native HTTP scheduler that fires any URL with retries and crash recovery.",
    intro:
      "Inngest is an event-driven platform for durable functions — you write steps in code, trigger them from events, and Inngest handles retries, concurrency, and flow control. Fliq is a focused HTTP scheduler: it fires cron and one-off requests at any URL, no workflow code required. The choice comes down to whether you're building event-driven function logic or simply scheduling HTTP calls.",
    whenCompetitor:
      "You're building event-driven workflows — fan-out, concurrency limits, debouncing, multi-step functions — and want to define them as code triggered by events. Inngest is purpose-built for that model.",
    whenFliq:
      "You don't want an event/function framework — you just need to schedule HTTP requests to existing endpoints, with retries, crash recovery, and per-attempt history, controllable by AI agents via MCP, on a simple Postgres-native stack.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, calls any URL",
        competitor: "Event-driven durable functions",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Built-in step retries",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Durable execution / replay",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Function run history",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Via your function code",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "AgentKit (different scope)",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "Yes (open source core)",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "Yes (core)",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Usage-based, free tier",
      },
      {
        dimension: "Best for",
        fliq: "Scheduling HTTP calls, any stack",
        competitor: "Event-driven function workflows",
      },
    ],
  },
  {
    slug: "google-cloud-scheduler",
    competitor: "Google Cloud Scheduler",
    competitorTagline: "GCP's managed cron service",
    metaTitle: "Fliq vs Google Cloud Scheduler — which scheduler should you use?",
    metaDescription:
      "Fliq vs Google Cloud Scheduler: GCP-managed cron tied to your project vs an open, Postgres-native HTTP scheduler with crash recovery, history, and MCP.",
    intro:
      "Google Cloud Scheduler is a solid, fully managed cron service inside GCP — it can hit HTTP targets, Pub/Sub, or App Engine on a schedule with strong reliability. Fliq covers the same HTTP-on-a-schedule use case but is platform-neutral and open source, with a crash-recovery reaper, per-attempt history, and an MCP server. If you're all-in on GCP, Cloud Scheduler is convenient; if you'd rather not couple scheduling to one cloud, Fliq fits.",
    whenCompetitor:
      "You're already on Google Cloud, want native IAM/OIDC auth to your services, Pub/Sub targets, and a scheduler managed inside the same project. Cloud Scheduler is reliable and well-integrated for that.",
    whenFliq:
      "You want a cloud-neutral, open-source scheduler that calls any HTTP endpoint without building GCP-specific targets, with a crash reaper, queryable per-attempt history, and AI-agent control via MCP.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, any HTTP request",
        competitor: "Cron → HTTP / Pub/Sub targets",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Configurable retry policy",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Managed by GCP",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Via Cloud Logging",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Yes (HTTP targets)",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "No (GCP-managed)",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Per-job/month, free tier",
      },
      {
        dimension: "Best for",
        fliq: "Cloud-neutral HTTP scheduling",
        competitor: "Scheduling inside GCP",
      },
    ],
  },
  {
    slug: "cronhub",
    competitor: "Cronhub",
    competitorTagline: "Cron scheduling with monitoring",
    metaTitle: "Fliq vs Cronhub — which scheduler should you use?",
    metaDescription:
      "Fliq vs Cronhub: cron scheduling plus job monitoring vs a Postgres-native HTTP scheduler with crash recovery, per-attempt history, open source, and MCP.",
    intro:
      "Cronhub combines scheduling URLs with cron-job monitoring — health pings and alerts when a scheduled job goes missing. Fliq focuses on running the jobs themselves: a Postgres-native scheduler that fires any HTTP request with configurable retries, a crash reaper, and full per-attempt history, plus an MCP server. If monitoring existing cron is your priority, Cronhub shines; if you want the scheduler itself to be robust and open, Fliq fits.",
    whenCompetitor:
      "You primarily want to monitor cron jobs — get alerted when a scheduled task fails to check in — alongside basic scheduling. Cronhub's monitoring/alerting focus is its strength.",
    whenFliq:
      "You want the scheduler itself to be the robust part: managed retries with backoff, a reaper that recovers crashed jobs, queryable history of every attempt, open source and self-hostable, with AI-agent control via MCP.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, any HTTP request",
        competitor: "Cron scheduling + monitoring",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Limited",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "Alerts on missed runs",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Run history & monitoring",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Yes",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "No",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Paid tiers, free trial",
      },
      {
        dimension: "Best for",
        fliq: "Robust HTTP scheduling + history",
        competitor: "Cron monitoring & alerting",
      },
    ],
  },
  {
    slug: "github-actions-cron",
    competitor: "GitHub Actions",
    competitorTagline: "Scheduled workflows in your repo",
    metaTitle: "Fliq vs GitHub Actions (cron) — which scheduler should you use?",
    metaDescription:
      "Fliq vs GitHub Actions scheduled workflows: free-ish CI cron with timing drift vs a Postgres-native HTTP scheduler with precise fires, retries, and history.",
    intro:
      "GitHub Actions can run scheduled workflows with cron syntax — great when the work lives in CI and you already pay for Actions minutes. But scheduled runs are best-effort: GitHub queues them and they can be delayed by minutes under load, and per-event one-off scheduling isn't its model. Fliq is a dedicated HTTP scheduler with precise fires, configurable retries, crash recovery, and per-attempt history. Use Actions for CI-adjacent chores; use Fliq when timing and reliability matter.",
    whenCompetitor:
      "The scheduled work is part of your CI — building, testing, syncing repos — and runs every so often where a few minutes of drift is fine. GitHub Actions cron is convenient and included with your repo.",
    whenFliq:
      "You need precise fire times, true one-off scheduling per event, configurable retries with backoff, crash recovery, and a queryable history of every attempt — for arbitrary HTTP endpoints, controllable by AI agents via MCP.",
    matrix: [
      {
        dimension: "Scheduling model",
        fliq: "Cron + one-off, precise fires",
        competitor: "Cron workflows (best-effort)",
      },
      {
        dimension: "Automatic retries",
        fliq: "Configurable backoff, per-job",
        competitor: "Re-run job manually / on failure",
      },
      {
        dimension: "Crash recovery",
        fliq: "Reaper reschedules crashed jobs",
        competitor: "None for missed schedules",
      },
      {
        dimension: "Execution history",
        fliq: "Full per-attempt history",
        competitor: "Workflow run logs",
      },
      {
        dimension: "Calls any HTTP endpoint",
        fliq: "Yes — any URL, method, headers, body",
        competitor: "Via a curl/step you write",
      },
      {
        dimension: "AI agents (MCP)",
        fliq: "MCP server included",
        competitor: "No",
      },
      {
        dimension: "Self-host",
        fliq: "Yes (open source)",
        competitor: "Self-hosted runners only",
      },
      {
        dimension: "Open source",
        fliq: "Yes",
        competitor: "No (Actions platform)",
      },
      {
        dimension: "Pricing model",
        fliq: "Free in beta, then $1/100k",
        competitor: "Included CI minutes",
      },
      {
        dimension: "Best for",
        fliq: "Precise, reliable HTTP scheduling",
        competitor: "CI-adjacent scheduled chores",
      },
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}
