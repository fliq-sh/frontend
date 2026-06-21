import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import BufferPlayground from "./BufferPlayground";

const TITLE = "Rate Limit Playground — Avoid 429s with a Buffer | Fliq";
const DESCRIPTION =
  "Interactive playground: blast a burst of requests at a rate-limited API and watch how many get 429'd, then pace the same burst through a buffer and land every request. See outbound rate limiting without Redis in action.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/buffers" },
  keywords: [
    "avoid 429",
    "rate limit playground",
    "outbound rate limiting",
    "distributed rate limiting without Redis",
    "API rate limit buffer",
    "throttle outgoing requests",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://fliq.sh/tools/buffers",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Fliq Rate Limit Playground",
    description: DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: "https://fliq.sh/tools/buffers",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://fliq.sh/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://fliq.sh/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Rate Limit Playground",
        item: "https://fliq.sh/tools/buffers",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a buffer / outbound rate limiter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A buffer is a queue with a speed limit. You enqueue requests as fast as you like and the buffer drains them to a downstream API at a fixed rate, so you never exceed that API's rate limit and never get 429'd.",
        },
      },
      {
        "@type": "Question",
        name: "Why do I get 429 Too Many Requests when calling an API?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When you fire requests faster than an API allows, the excess are rejected with HTTP 429. Pacing the calls under the limit — for example through a buffer — keeps every request within the cap so none are rejected.",
        },
      },
    ],
  },
];

export default function BufferToolPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="relative pt-14">
        {/* Pixel-grid motif — a faint lattice echoing the dot fields below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 55% at 50% 0%, #000 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 55% at 50% 0%, #000 0%, transparent 75%)",
          }}
        />

        <section className="relative px-4 pt-20 pb-24">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundImage:
                    "linear-gradient(115deg,#818cf8,#c084fc,#fcd34d)",
                }}
              />
              Free interactive tool
            </div>
            <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Send 500 requests.
              <br />
              Get{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(115deg,#5eead4 0%,#818cf8 30%,#c084fc 55%,#f0abfc 78%,#fcd34d 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                zero 429s
              </span>
              .
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/55">
              Blast a burst at a rate-limited API and watch the rejections pile
              up. Then send the same burst through a buffer — paced under the
              limit, every request lands. No Redis, no retry glue.
            </p>
          </div>

          <BufferPlayground />
        </section>
      </main>

      <Footer />
    </div>
  );
}
