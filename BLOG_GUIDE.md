# Fliq Blog — Author Guide

## Creating a new post

1. Create a new `.mdx` file in `/content/blog/`
2. Name it with a URL-friendly slug: `my-post-title.mdx`
3. Add frontmatter (see schema below)
4. Write content using MDX (Markdown + React components)
5. Commit and deploy — SSG handles the rest

## Frontmatter schema

Every `.mdx` file must start with YAML frontmatter:

```yaml
---
title: "Your Post Title"                    # Required — shows in <title>, OG tags, cards
description: "A compelling 1-2 sentence..."  # Required — meta description, card preview
date: "2026-03-25"                           # Required — ISO date string (YYYY-MM-DD)
author: "Erlan"                              # Required — author name
tags: ["serverless", "tutorial"]             # Required — array of lowercase tag slugs
image: "/blog/og/my-post.png"               # Optional — OG image (1200x630 recommended)
readingTime: 8                               # Optional — minutes (auto-calculated if omitted)
featured: true                               # Optional — shows as large card on /blog
---
```

## Available MDX components

These are available in every `.mdx` file without imports:

### `<Callout>`

Info, warning, or tip boxes.

```mdx
<Callout type="info" title="Optional title">
  Your content here. Supports **markdown** inside.
</Callout>

<Callout type="warning">No title variant.</Callout>

<Callout type="tip" title="Pro tip">Helpful advice here.</Callout>
```

Types: `info` (indigo), `warning` (amber), `tip` (green)

### `<Step>`

Numbered tutorial steps.

```mdx
<Step number={1} title="Install the SDK">
  Content for this step, including code blocks.
</Step>

<Step number={2} title="Configure your token">
  More content here.
</Step>
```

### `<ComparisonTable>`

Feature comparison tables.

```mdx
<ComparisonTable
  headers={["Feature", "Fliq", "DIY", "AWS"]}
  rows={[
    ["Setup time", "5 min", "Days", "Hours"],
    ["Cost (100k jobs)", "$1", "$20+", "$10+"],
  ]}
/>
```

### `<CTA>`

Inline call-to-action banner.

```mdx
<CTA text="Try Fliq free — 5,000 executions/day" href="https://fliq.sh/sign-up" />
```

Supports internal (`/pricing`) and external (`https://...`) links.

## Code blocks

Standard markdown fenced code blocks with language labels and copy buttons:

````mdx
```typescript
const x = 1;
```

```bash
npm install @fliq/sdk
```
````

## SEO checklist for each post

- [ ] **Title**: Under 60 characters, includes target keyword
- [ ] **Description**: 120-160 characters, compelling, includes keyword
- [ ] **Date**: Accurate publish date
- [ ] **Tags**: 2-5 relevant tags (reuse existing tags when possible)
- [ ] **Headings**: Use h2 (`##`) and h3 (`###`) — h1 is the title
- [ ] **Internal links**: Link to at least 1 other blog post and 1 docs page
- [ ] **External links**: Link to relevant external resources
- [ ] **Code examples**: Include at least one working Fliq code example
- [ ] **CTA**: Include one `<CTA>` component (subtle, not pushy)
- [ ] **Image**: OG image at `/public/blog/og/your-slug.png` (1200x630)

## Image guidelines

- OG images: 1200x630px, PNG or JPG
- Place in `/public/blog/og/`
- In-post images: use standard markdown `![alt](url)`
- All images are lazy-loaded automatically
- Prefer SVGs for diagrams

## Tags convention

Use lowercase, hyphenated slugs. Reuse these existing tags when applicable:

- `cloudflare-workers` — CF Workers content
- `serverless` — general serverless topics
- `cron` — cron/scheduling specific
- `tutorial` — step-by-step guides
- `nextjs` — Next.js related
- `stripe` — Stripe/payments
- `saas` — SaaS-specific content
- `engineering` — engineering culture/decisions
- `architecture` — system design

## Writing guidelines

- **Tone**: Technical but approachable. Like talking to a senior dev friend.
- **Use "you" and "we"**: Direct and personal.
- **Show real code**: Every tutorial should have working, copy-pasteable examples.
- **Be opinionated but fair**: It's OK to say "X is better than Y for this use case."
- **No corporate speak**: Skip "leverage", "synergy", "robust solution."
- **Target length**: 2,000-3,000 words for tutorials, 1,500-2,500 for thought pieces.

## Directory structure

```
content/blog/
  └── my-post-slug.mdx          # Your post file

src/components/blog/             # Blog components (don't modify unless adding features)
  ├── PostCard.tsx
  ├── TableOfContents.tsx
  ├── CodeBlock.tsx
  ├── Callout.tsx
  ├── Step.tsx
  ├── ComparisonTable.tsx
  ├── CTA.tsx
  ├── AuthorCard.tsx
  ├── Newsletter.tsx
  ├── ShareButtons.tsx
  └── MDXComponents.tsx

src/app/blog/
  ├── page.tsx                   # Blog index
  ├── [slug]/page.tsx            # Post page
  └── tag/[tag]/page.tsx         # Tag filter
```
