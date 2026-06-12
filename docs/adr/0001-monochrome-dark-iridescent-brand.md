# The frontend is dark + monochrome, with iridescence confined to the F-mark

Status: accepted (marketing site) — superseded for the `/app` dashboard by [ADR 0002](0002-warm-dashboard-theme.md)

## Decision

The **entire fliq.sh frontend** — marketing site *and* the `/app` dashboard, plus
docs, blog, pricing, comparison, and legal pages — uses a **dark** background
with a **strictly monochrome** white-on-dark palette: white (at varying
opacities) carries all visual hierarchy, and the primary/active/interactive
accent is white (e.g. the primary CTA and the active sidebar item are white, not
a hue). Colour appears in exactly two places: the **iridescent F-mark**
(`FliqIcon` — the one brand accent) and **traffic-light status semantics**
(green/amber/red) that encode job/execution/billing state. No indigo/violet
accent anywhere, no scattered rainbow or glassmorphism.

*(Originally scoped to the marketing site; widened to the whole frontend in the
2026-06 design-system unification, which removed the residual `indigo-*` the
dashboard and secondary pages still carried and pulled shared composites into
`src/components/patterns/`.)*

## Why this is surprising (and why it's deliberate)

The redesign was kicked off by pointing at a light, teal, consumer reference
site (sweepo.net) and asking to "make it look like that." A future reader
comparing the two will reasonably wonder why fliq ended up *dark* and
*monochrome* instead. The answer: we borrowed the reference's **finish**
(generous whitespace, calm, confident) — not its hue or its light background.
"Airy" and "dark" are independent axes; we kept fliq's existing dark identity
(it reads as premium developer-infrastructure) and achieved the spaciousness
through a spacing scale, not a colour flip.

The earlier accent was Tailwind's default `indigo-500` — the single most common
devtool colour, which read as generic / "vibe-coded." Monochrome white-on-dark
is the deliberate antidote. Rainbow/iridescent gradients were explicitly
rejected as a *general* finish (they are the current signature of AI-generated
landing pages); iridescence survives only as **one** contained brand moment on
the F-mark, where its rarity makes it read as intentional.

## Considered and rejected

- **Go light like the reference.** Rejected: an identity change (touches every
  section, gradient, OG image, brand perception) and arguably wrong for a
  developer-infrastructure buyer.
- **Pick a different colour accent.** Rejected: the accent *is* the logo; a new
  hue drags the F-mark, favicon, and OG images with it — a mini-rebrand, not a
  restyle.
- **Iridescent/rainbow finishes "here and there."** Rejected: reads as the AI-slop
  aesthetic it was meant to escape. Confined to the F-mark instead.

## Consequences

- Airiness is **two registers**, not global: `.section-breathe` for narrative
  sections, `.section-tight` for technical ones (code, tables, status) where
  whitespace weakens the content.
- The dark token set is global: `<html class="dark">` makes the shadcn `primary`
  (now pure white) the accent everywhere. The token layer itself is monochrome —
  `--sidebar-primary` and `--chart-*` were de-coloured (they shipped as the
  rainbow shadcn defaults) so nothing leaks a hue through a component default.
- Traffic-light status is centralised in `src/components/patterns/tones.ts` and
  surfaced via `StatusBadge`/`StatusDot`/`StatCard` — the single source of
  green/amber/red across marketing (`LiveStatus`, `SchedulerVisual`) and the
  dashboard (job rows, attempts, stat tiles, billing).
- Two **interactive sandboxes** teach the product on the landing — `JobSandbox`
  (scheduling) and `BufferSandbox` (outbound rate limiting). They are
  **client-side simulations, not wired to the API**; per the repo honesty rule
  each carries an "interactive demo" label and uses illustrative data, so they're
  never mistaken for live metrics.
- Do not reintroduce `indigo-*`/`violet-*` or add new colour anywhere in the
  frontend without revisiting this ADR.
