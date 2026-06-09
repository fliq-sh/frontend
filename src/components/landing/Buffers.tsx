import Link from "next/link";
import { Button } from "@/components/ui/button";

// Pain-first marquee section for buffers (the GTM wedge). The headline hooks the
// pain — getting rate-limited by the APIs you call — and the term "buffer" is
// taught in the body, not the H2. See frontend/CONTEXT.md for the canonical
// definition (an ordered stream, NOT a queue).

const points = [
  {
    title: "Stay under the limit",
    body: "Set a rate — requests per second — and Fliq paces delivery to match. No more hammering Stripe, Shopify, or any partner API into a wall of 429s.",
  },
  {
    title: "In submission order",
    body: "A buffer delivers items in the order you pushed them, one at a time. A failed item retries in place — a later item never overtakes one that's still retrying.",
  },
  {
    title: "Nothing to run",
    body: "No Redis, no rate-limiter service, no token-bucket code to maintain. Push items and forget them — it's Postgres-native, like the rest of Fliq.",
  },
];

// Create a buffer, then push items onto it. Monochrome code — weight + opacity
// carry hierarchy, not colour.
const codeLines = [
  { c: "comment", v: "# 1. Create a buffer pointed at the API you call" },
  { c: "cmd", v: "curl -X POST https://api.fliq.sh/buffers \\" },
  { c: "arg", v: `  -d '{ "url": "https://api.stripe.com/v1/...",` },
  { c: "arg", v: `        "method": "POST", "rate_limit": 25 }'` },
  { c: "blank", v: "" },
  { c: "comment", v: "# 2. Push items — delivered in order, at your rate" },
  { c: "cmd", v: "curl -X POST https://api.fliq.sh/buffers/$ID/items \\" },
  { c: "arg", v: `  -d '{ "body": { "amount": 1999 } }'` },
];

const codeColor: Record<string, string> = {
  comment: "text-white/35",
  cmd: "text-white/90",
  arg: "text-white/60",
  blank: "text-white/0",
};

export default function Buffers() {
  return (
    <section className="section-breathe px-6 border-t border-white/10 relative overflow-hidden">
      {/* Soft monochrome glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 30% 35%, rgba(255,255,255,0.05) 0%, transparent 68%)",
        }}
      />
      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-2xl mb-14">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
            Outbound rate limiting
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Call rate-limited APIs without the 429s
          </h2>
          <p className="mt-4 text-lg text-white/60 leading-relaxed">
            When you fire thousands of requests at Stripe, Shopify, or any
            third-party API, you get throttled, retries pile up, and ordering
            falls apart. A Fliq <strong className="text-white/90">buffer</strong>{" "}
            is an ordered stream that delivers your requests to one endpoint at a
            rate you set — in order, with automatic retries, no Redis to run.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Value points — breathe */}
          <div className="space-y-8">
            {points.map((p) => (
              <div key={p.title}>
                <h3 className="text-base font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{p.body}</p>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild>
                <Link href="/sign-up">Start free →</Link>
              </Button>
              <Link
                href="/docs/buffers"
                className="text-sm text-white/70 hover:text-white underline underline-offset-4 transition-colors"
              >
                Read the buffer docs →
              </Link>
            </div>
          </div>

          {/* Code — tight on purpose */}
          <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="ml-3 text-[10px] text-white/25 tracking-widest uppercase font-mono">
                rate-limited delivery
              </span>
            </div>
            <div className="p-4 font-mono text-xs leading-6 overflow-x-auto whitespace-pre">
              {codeLines.map((line, i) => (
                <div key={i} className={codeColor[line.c] ?? "text-white/70"}>
                  {line.v === "" ? " " : line.v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
