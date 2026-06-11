# The `/app` dashboard adopts the warm "fliq.sh" palette

Status: accepted

Supersedes [ADR 0001](0001-monochrome-dark-iridescent-brand.md) **for the
dashboard only**. The public marketing surface (landing, pricing, status, `/vs`,
tools, docs, blog, legal) stays dark + monochrome per ADR 0001 — unchanged.

## Decision

The signed-in dashboard (`src/app/app/**`, `src/components/dashboard/**`) now
renders in the **warm "fliq.sh" palette**: a cream background (`#FBF5EC`), dark
ink text (`#211710`), and a **burnt-orange brand accent** (`#E8590C`) for the
primary action, the active sidebar item, focus rings, and chart-1. Display
headings use **Bricolage Grotesque**, body is **Inter**, mono is **JetBrains
Mono** — matching the standalone landing at `fliq.sh` (the `fliq/landing` Astro
build). Traffic-light status semantics (green/amber/red) are retained unchanged
from ADR 0001 — they still encode job/execution/billing state.

This brings the dashboard into visual alignment with the rebuilt marketing
landing, which had already moved to the warm palette. The two were diverging:
warm marketing → monochrome-dark app was a jarring seam at sign-in.

## How it's implemented

- **One scoped class.** `.theme-warm` (in `globals.css`) overrides every shadcn
  design token (`--background`, `--foreground`, `--card`, `--primary`,
  `--border`, `--sidebar-*`, `--chart-*`, `--radius`, …) to the warm values. It
  is applied on the dashboard layout wrapper (`src/app/app/layout.tsx`). Nothing
  outside that subtree is affected, so marketing keeps the root `.dark` tokens.
- **One transform for hand-written classes.** Dashboard markup that previously
  hardcoded `text-white/N`, `bg-white/N`, `border-white/N` was rewritten to
  `text-foreground/N`, `bg-foreground/N`, `border-foreground/N`. Because
  `--foreground` is **white** under marketing's `.dark` and **dark ink** under
  `.theme-warm`, the *same* class renders correctly in both skins — one source,
  two themes. This is why `src/components/patterns/**` (shared by marketing and
  dashboard) could be converted without changing the marketing look.
- **Radix portals carry their own scope.** Dialogs, dropdowns, the mobile
  sidebar Sheet and floating tooltips render outside the wrapper subtree, so each
  portal content gets `theme-warm` on its own `className`.
- **Fonts** are declared once in the root layout via `next/font` (Bricolage,
  Inter, JetBrains Mono) and only *used* inside `.theme-warm` (which re-points
  `--font-geist-sans`/`--font-geist-mono` and sets the heading family).
- **Dark code terminal.** `ApiCodeBlock` stays a dark panel (`#1B120B`) on the
  cream canvas with an orange active-tab underline — mirroring the landing's
  terminal block, and keeping code legible.

## Why scope it instead of flipping the global theme

The frontend is one Next app serving both the marketing site and the dashboard
from a shared root layout and `globals.css`. A global palette flip would have
dragged the (intentionally dark) marketing pages with it. Token-overriding under
a single `.theme-warm` class keeps the blast radius to the dashboard, leaves
ADR 0001 intact for everything else, and is trivially reversible.

## Consequences

- The brand accent is no longer "white only" inside the dashboard — orange is now
  a legitimate accent there. The "colour lives only in the F-mark + status" rule
  from ADR 0001 continues to hold on the **marketing** surface.
- New dashboard UI should use semantic token utilities (`bg-card`,
  `text-muted-foreground`, `border-border`, `bg-primary`) or the `*-foreground/N`
  opacity pattern — never hardcode `*-white/N` or hex backgrounds — so it skins
  correctly under `.theme-warm`.
- If the marketing site later moves warm too, `.theme-warm` can be promoted to
  the root and this split retired.
