# Fliq — Frontend

Next.js 16 marketing site + dashboard for Fliq — Serverless HTTP Scheduling.

## Product overview

**Fliq** is a serverless HTTP scheduling platform. Customers POST a URL + fire time; Fliq executes it on time, globally, with automatic retries and full execution history.

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
| Globe | COBE 0.6.5 (WebGL, via `src/components/ui/globe.tsx`) |
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
│       ├── layout.tsx
│       ├── page.tsx            # Jobs dashboard
│       ├── schedules/page.tsx
│       ├── executions/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── landing/                # One file per landing section (see below)
│   ├── dashboard/              # Dashboard-specific components
│   └── ui/                     # shadcn/ui primitives + globe.tsx
├── hooks/use-mobile.ts
├── lib/
│   ├── api.ts                  # API client (fetch wrapper, JWT from Clerk)
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
└── proxy.ts
```

### Landing sections (top → bottom in `page.tsx`)

| Component | Description |
|---|---|
| `Navbar.tsx` | Fixed header; Pricing → `/pricing`, Docs → `#features` |
| `Hero.tsx` | Globe + headline + CTA + stat line |
| Social proof | Inline in `page.tsx` — OpenAI, Cloudflare, Disney, Stripe, Vercel |
| `Problem.tsx` | Split layout: 3 pain points (left) vs 3 solutions (right) |
| `HowItWorks.tsx` | 3-step numbered cards (Schedule → Execute → Visibility) |
| `UseCases.tsx` | Two-column: one-time jobs (left) vs recurring/cron (right) |
| `Quickstart.tsx` | 4-tab code snippet (HTTP / Node.js / Python / curl) |
| `AIFeatures.tsx` | MCP Server, Agentic workflows, Programmable retries |
| `Features.tsx` | 6-card grid of core capabilities |
| `Comparison.tsx` | DIY vs Fliq table (6 dimensions) |
| `Reliability.tsx` | 4 big stats + 3 explanation cards |
| `PricingTeaser.tsx` | 3-tier cards + CTA to `/pricing` |
| `Enterprise.tsx` | On-prem/self-hosted CTA, mailto:enterprise@fliq.dev |
| `FAQ.tsx` | Accordion, 6 questions, client-side open/close |
| `Footer.tsx` | Links to /pricing, Docs, Privacy, Terms |

---

## Globe (`src/components/ui/globe.tsx`)

COBE renders a WebGL canvas. The component accepts a `config?: COBEOptions` prop.

**Hero globe config** is defined in `Hero.tsx` as `HERO_GLOBE_CONFIG`:
- `dark: 1` — dark globe
- `baseColor: [0.1, 0.1, 0.15]` — dark blue-gray
- `markerColor: [99/255, 102/255, 241/255]` — indigo
- `glowColor: [0.2, 0.2, 0.4]` — subtle indigo glow
- `mapBrightness: 6` — visible landmass
- 34 markers across Americas, Europe, Middle East/Africa, Asia-Pacific

**COBE does not natively support arcs.** Arcs would require drawing on an overlay 2D canvas mapped to the globe's rotation — non-trivial. Stick to markers only.

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
- Indigo accent: `text-indigo-400`, `border-indigo-500/30`, `bg-indigo-500/10`
- Green for positive/checkmarks: `text-green-400`, `bg-green-500/10`
- Red for problems/X marks: `text-red-400`, `bg-red-500/10`
- All new landing sections get `border-t border-white/10` top border and `py-24 px-4` padding

---

## Key engineering lessons learned

### Tailwind `left-1/3 right-1/3` gotcha
`left-1/3` + `right-1/3` on an absolutely-positioned element means it spans the **middle 33%** of the container — not between thirds. When trying to draw a connector line between 3 grid cards, this caused the line to render only over the middle card. Fix: remove the absolute line; numbered steps communicate sequence visually.

### COBE globe dark theme
Default config uses `dark: 0` (light globe). For dark-themed pages, set `dark: 1`, `mapBrightness: 6` (boosts landmass visibility), and `baseColor` to a dark blue-gray. Without `mapBrightness: 6` the landmass is invisible against the dark ocean.

### `config` prop on Globe
The default `GLOBE_CONFIG` is defined inside `globe.tsx`. Pass a custom config via `<Globe config={MY_CONFIG} />` to override markers, colors, etc. The `onRender` callback in the passed config is ignored — the component overrides it internally to handle rotation and resize.

### Client components for interactivity
Any component using `useState`, `useEffect`, or browser APIs needs `"use client"` at the top. Landing sections that are purely static (no interactivity) should remain Server Components (no directive). Currently client: `Hero.tsx`, `Quickstart.tsx`, `FAQ.tsx`.

---

## Local dev

```bash
cd /Users/erlan/personal/frontend
npm run dev        # localhost:3000
npm run build      # production build check (always run before pushing)
```

Env vars needed (Clerk):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

Backend API base URL configured in `src/lib/api.ts` — points to Go `cmd/server` (`localhost:8080` locally).

## Remote

```
git remote: https://github.com/dist-job-scheduler/frontend.git
branch: main
```
