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

      <main className="pt-14">
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70 mb-6">
              Free interactive tool
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Rate Limit Playground
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Blast a burst of requests at a rate-limited API and watch the 429s
              pile up. Then send the same burst through a buffer — paced under
              the limit, every request lands. No Redis, no retry glue.
            </p>
          </div>

          <BufferPlayground />
        </section>
      </main>

      <Footer />
    </div>
  );
}
