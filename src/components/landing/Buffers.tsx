import Link from "next/link";
import { Button } from "@/components/ui/button";
import BufferSandbox from "./BufferSandbox";

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

          {/* Interactive buffer sandbox — the section's visual centerpiece */}
          <BufferSandbox />
        </div>
      </div>
    </section>
  );
}
