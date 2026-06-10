# Fliq — Frontend

Next.js 16 marketing site + dashboard for Fliq — reliable HTTP job scheduling for developers.

> **Positioning (2026 redesign):** lead with developers who need cron + scheduled
> webhooks without running infra; the AI-agent/MCP story is the differentiator, not
> the headline. **Honesty rule:** no fabricated customer logos, SLAs, latency, or
> region counts. Claims trace back to `src/lib/site.ts` (`SITE`, `BETA`, `FACTS`).
> Reliability is shown via the **live status** widget, not invented numbers.

## Product overview

**Fliq** is a Postgres-native HTTP job scheduler. Customers POST a URL + fire time; Fliq executes it on time with automatic retries, crash recovery, and full execution history.

**Core value props:**
- One API call to schedule any HTTP action (one-time or cron)
- Pay per execution — each attempt (including retries) is one credit
- 30+ global edge regions, <10ms median dispatch latency, 99.9% SLA
- 1-year execution history on paid plans
- AI-native: MCP server lets agents schedule jobs via natural language

**Pricing model (pay-as-you-go):**
- Free: 5,000 executions/day, 7-day history, 10 schedules, 3 max retries
- Growth: $1/100k executions, 1-year history, unlimited schedules, 10 max retries
- Enterprise: custom, self-hosted, 99.99% SLA, SSO/SAML

Each execution attempt — including retries — counts as one billable unit.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui v3 (Radix UI primitives) |
| Auth | Clerk v6 (`@clerk/nextjs`) |
| Hero visual | Animated "live scheduler" feed — pure React + CSS, `src/components/landing/SchedulerVisual.tsx` (COBE globe removed in the 2026 redesign) |
| Animation | Motion 12 (`motion/react`) |
| Icons | Lucide React |
| Date util | date-fns v4 |
| API client | custom fetch wrapper in `src/lib/api.ts` |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Clerk + TooltipProvider)
│   ├── page.tsx                # Landing page — wires all landing sections
│   ├── globals.css             # Tailwind + CSS custom properties
│   ├── pricing/page.tsx        # Full pricing page (/pricing)
│   ├── sign-in/[[...sign-in]]/ # Clerk-hosted sign-in
│   ├── sign-up/[[...sign-up]]/ # Clerk-hosted sign-up
│   └── app/                    # Protected dashboard (requires Clerk session)
│       ├── layout.tsx          # Sidebar + header + BalanceProvider; centered max-w-6xl main
│       ├── page.tsx            # Overview home (metrics, usage chart, recent/upcoming)
│       ├── jobs/page.tsx       # Jobs table (was the old /app root)
│       ├── jobs/[jobId]/attempts/[attemptId]/page.tsx  # single attempt detail
│       ├── schedules/page.tsx
│       ├── buffers/page.tsx
│       ├── billing/page.tsx    # balance + usage charts + transaction history
│       └── settings/page.tsx   # API tokens, signing secret, Clerk account
├── components/
│   ├── landing/                # One file per landing section (see below)
│   ├── dashboard/              # Dashboard feature components (tables, overview, header, sidebar)
│   │   └── ui/                 # Dashboard UI kit (see below) — shared across /app routes
│   ├── patterns/               # Fliq design-system composites (see below)
│   └── ui/                     # shadcn/ui primitives ONLY (regenerable)
├── hooks/
│   ├── use-mobile.ts
│   ├── use-poll.ts             # interval polling, pauses on hidden tab (auto-refresh)
│   └── use-cursor-list.ts      # shared cursor pagination for the dashboard tables
├── lib/
│   ├── api.ts                  # API client (fetch wrapper, JWT from Clerk)
│   ├── dashboard.ts            # number/time formatting + client-side metric aggregation
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
└── proxy.ts
```

### Dashboard UI kit (`src/components/dashboard/ui/`)

Composites layered on the shadcn primitives + `patterns/` tokens, shared by every
`/app` route so the tables/pages stay consistent. There is **no server-side stats
endpoint** (see core-api router) — Overview/Billing metrics are derived client-side
from the existing list endpoints (`bucketByTime`/`countSince` in `lib/dashboard.ts`)
and **labelled honestly** when the sample is capped. Pieces: `PageHeader`,
`MetricCard` (value + progress quota bar + inline chart slot), `SectionCard`,
`Sparkline`/`MiniBars` (dependency-free monochrome SVG charts — no chart lib),
`StatusPill`/`MethodChip`, `FilterTabs`, `SearchInput`, `Pagination`,
`RefreshControls` (Live toggle → `usePoll`), `ConfirmButton` (destructive
Delete/Cancel now require confirmation), `RelativeTime`, `CopyButton`, `Empty`,
and `Form` field helpers (`Field`/`TextInput`/`Select`/`Textarea`/`parseJsonObject`).
Tables render a `<Table>` on `md+` and a stacked card list on mobile (no horizontal
scroll). Monochrome + traffic-light only, per ADR 0001.

### Landing sections (top → bottom in `page.tsx`)

Order matches `page.tsx` (10 sections after the 2026 monochrome restyle, which
consolidated the former 13 — see `docs/adr/0001`). Merged-away components
(`Features`, `Agents`, `Comparison`, `Enterprise`) were folded in as noted.

| Component | Description |
|---|---|
| `Navbar.tsx` | Fixed header; Docs/Pricing/Compare + Resources dropdown + `LiveStatus` pill |
| `Hero.tsx` | Devs-first headline + CTA + beta badge + inline `LiveStatus` + `SchedulerVisual` |
| `Problem.tsx` | The cron trap (3 pains vs 3 solutions) **+ DIY-vs-Fliq table** (former `Comparison`) + `/vs` link |
| `HowItWorks.tsx` | 3 steps (Schedule → Fire & retry → Inspect) **+ interactive `JobSandbox`** ("See it run") **+ capability bento** (former `Features`) |
| `Quickstart.tsx` | 4-tab code snippet (HTTP / Node.js / Python / curl) |
| `Buffers.tsx` | **Buffers section (the GTM wedge).** Pain-first H2 ("Call rate-limited APIs without the 429s"); teaches "buffer" in body; right column is the interactive `BufferSandbox`. Links `/docs/buffers` |
| `UseCases.tsx` | One-time vs recurring/cron **+ featured AI-agent block** (former `Agents`) |
| `Reliability.tsx` | Live status panel + 3 honest reliability mechanisms (no fabricated stats) |
| `OpenSource.tsx` | Honest proof (open-source + live GitHub stars + real facts) **+ self-host/enterprise block** (former `Enterprise`) |
| `PricingTeaser.tsx` | 3-tier cards (Beta free) + CTA to `/pricing` |
| `FAQ.tsx` | Accordion (data in `faq-data.ts`); emits FAQPage JSON-LD via `page.tsx` |
| `Footer.tsx` | Product / Compare / Resources columns + `LiveStatus` + legal |

---

## Hero visual + live uptime

The hero no longer uses a globe (it implied a CDN/edge footprint Fliq doesn't have,
and reinforced fabricated "30+ regions" copy). Instead:

- **`SchedulerVisual.tsx`** — an illustrative, deterministic "live execution feed"
  (jobs fire → retry → succeed) in pure React + CSS. Labelled *demo* so it's never
  mistaken for real metrics. SSR-safe and `prefers-reduced-motion` aware.
- **Live uptime** (real, not illustrative):
  - `src/lib/public-api.ts` — auth-free `probeHealth()` (pings the public `/health`
    on core-api) + `fetchUptimeSummary()` (external monitor via our route).
  - `src/hooks/use-uptime.ts` — polls every ~20s, pauses on hidden tab.
  - `src/components/landing/LiveStatus.tsx` — navbar pill + inline variants
    (green = operational, amber = degraded, red = down).
  - `src/app/status/page.tsx` — full `/status` page.
  - `src/app/api/uptime/route.ts` — server proxy to **BetterStack** (token stays
    server-side). **Graceful degradation:** with no `BETTERSTACK_UPTIME_TOKEN` /
    `BETTERSTACK_MONITOR_ID`, live status still works and the historical % is
    hidden — we never show a number we can't back up. Requires core-api's public
    `GET /health` (separate PR).

## SEO & growth surfaces (2026 redesign)

- **Metadata:** `metadataBase` + default OG/Twitter/robots + site-wide JSON-LD
  (Organization, WebSite w/ SearchAction, SoftwareApplication) in `layout.tsx`.
  Per-page `metadata` on `/`, `/pricing`, `/status`, `/vs/*`, `/tools/cron`.
  `robots.ts`, dynamic `opengraph-image.tsx` (+ `twitter-image.tsx`), FAQPage
  JSON-LD on `/` (from `faq-data.ts`), Product JSON-LD on `/pricing`.
- **Comparison pages:** `src/app/vs/[slug]/page.tsx` + `src/lib/comparisons.ts`
  (cron-job.org, EasyCron, QStash, Trigger.dev, Inngest, GCP Scheduler, Cronhub,
  GitHub Actions). `getAllComparisonSlugs()` feeds `sitemap.ts`. Be **honest/fair**.
- **Free tool (link magnet):** `src/app/tools/cron/` + `src/lib/cron.ts` — a
  dependency-free cron expression explainer (next run times + description).
- **Beta offer** (`src/lib/site.ts` `BETA`) is surfaced on the hero and throughout —
  it already existed on `/pricing`; the redesign just promotes it.

---

## Auth (Clerk)

- `<ClerkProvider>` wraps the root layout
- `SignedIn` / `SignedOut` components gate UI in `Navbar.tsx`
- `UserButton` for signed-in avatar/menu
- Dashboard routes under `src/app/app/` require a Clerk session (middleware handles redirect)
- JWT from Clerk session is attached to API calls in `src/lib/api.ts`

---

## Styling conventions

- Dark background: `bg-[#09090b]` (zinc-950 equivalent)
- Opacity variants for hierarchy: `text-white/60` (body), `text-white/40` (captions), `text-white/20` (disabled/logos)
- Subtle surfaces: `bg-white/5`, `bg-white/[0.03]`
- Borders: `border-white/10`
- **Monochrome — no colour accent.** Applies to the **whole frontend** (marketing
  *and* dashboard, docs, blog, etc.). White at opacities carries all hierarchy;
  the primary/active accent is white (white CTA button, white active sidebar
  item). Do **not** use `indigo-*`/`violet-*` or any hue accent anywhere. Colour
  lives in exactly two places (see
  `docs/adr/0001-monochrome-dark-iridescent-brand.md`):
  1. the **iridescent F-mark** (`FliqIcon`) — the one brand accent; don't add more.
  2. **traffic-light status** below.
- **Traffic-light semantics** (mirrors job state): green = operational/success
  (`text-green-400`), amber = retry/degraded (`text-amber-400`), red =
  failure/down (`text-red-400`). Used by `LiveStatus` and `SchedulerVisual`.
- **Airiness is two registers** (utilities in `globals.css`): `.section-breathe`
  for narrative sections, `.section-tight` for technical/dense ones (code,
  tables, status). Pick by section type — don't space everything uniformly.
- All new landing sections get `border-t border-white/10` top border, a
  `section-breathe`/`section-tight` register, and `px-6` (container `max-w-7xl mx-auto`)
- Mono (`font-mono`) for cron expressions, timestamps, latencies, code — the developer texture

### Design-system composites (`src/components/patterns/`)

Opinionated building blocks layered on the shadcn primitives in `ui/`. Reuse
these instead of re-rolling — they keep marketing and dashboard consistent:

- `SectionHeader` — eyebrow + H2 + subhead (center/left).
- `StatusBadge` / `StatusDot` — the traffic-light pill/dot. Tones resolve from
  `tones.ts` (`TONE`, `Tone`, `jobStatusTone(status)`) — the **single source** of
  green/amber/red. Map job state via `jobStatusTone`, don't hardcode hues.
- `StatCard` — metric tile with a traffic-light left accent (`tone="neutral"` is
  the monochrome default).
- `EmptyState` — the "Get started in N steps" onboarding card (used by empty
  Jobs/Schedules/Buffers tables).

Keep `ui/` for shadcn-generated primitives only (so the CLI can regenerate them);
hand-written composites go in `patterns/`.

### Interactive sandboxes (landing)

`JobSandbox` (in `HowItWorks`) and `BufferSandbox` (in `Buffers`) are
**client-side simulations** that let visitors play with scheduling / outbound
rate-limiting. They are **NOT wired to the API** — per the honesty rule each
shows an "interactive demo" label and illustrative data only. Both are
`prefers-reduced-motion` aware and clean up their timers. See ADR 0001.

---

## Key engineering lessons learned

### Tailwind `left-1/3 right-1/3` gotcha
`left-1/3` + `right-1/3` on an absolutely-positioned element means it spans the **middle 33%** of the container — not between thirds. When trying to draw a connector line between 3 grid cards, this caused the line to render only over the middle card. Fix: remove the absolute line; numbered steps communicate sequence visually.

### Don't export data from `"use client"` modules for server use
FAQ content lives in `faq-data.ts` (a plain module), imported by both the client
`FAQ.tsx` and the server `page.tsx` (for FAQPage JSON-LD). Importing a non-component
value from a `"use client"` module into a server component yields a client-reference
proxy, not the value — `faqs.map` throws at build's page-data step. Keep shared data
in a non-client module.

### Client components for interactivity
Any component using `useState`, `useEffect`, or browser APIs needs `"use client"` at the top. Landing sections that are purely static should remain Server Components. Currently client: `Hero` is a Server Component but renders client children (`SchedulerVisual`, `LiveStatus`); `Navbar`, `FAQ`, `Quickstart`, `OpenSource`, `StatusClient`, `CronExplainer` are client.

### `react-hooks/set-state-in-effect`
Calling `setState` synchronously in a `useEffect` body is a lint error (cascading
renders). For the hero clock, kick the first update via `requestAnimationFrame`
(async) instead of calling the setter directly in the effect.

---

## Local dev

```bash
# repo checkout (this box): ~/workspace/playground/fliq/frontend
npm run dev        # localhost:3000
npm run build      # production build check (always run before pushing)
```

Env vars needed (Clerk):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

A local `npm run build` needs the Clerk publishable key set or the dashboard pages
fail to prerender. Clerk's example key works: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k`.

Optional (live uptime %): `BETTERSTACK_UPTIME_TOKEN`, `BETTERSTACK_MONITOR_ID`.

Backend API base URL configured in `src/lib/api.ts` / `src/lib/public-api.ts` —
points to Go `cmd/server` (`localhost:8080` locally, `https://api.fliq.sh` in prod).

## Remote

```
git remote: https://github.com/fliq-sh/frontend.git
branch: main
```
