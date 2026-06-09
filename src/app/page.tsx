import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";
import { faqs } from "@/components/landing/faq-data";
import { SITE } from "@/lib/site";

// Everything below the hero fold is lazy-loaded to keep the initial JS small.
const noop = () => null;
const Problem       = dynamic(() => import("@/components/landing/Problem"),       { loading: noop });
const HowItWorks    = dynamic(() => import("@/components/landing/HowItWorks"),    { loading: noop });
const Quickstart    = dynamic(() => import("@/components/landing/Quickstart"),    { loading: noop });
const Buffers       = dynamic(() => import("@/components/landing/Buffers"),       { loading: noop });
const UseCases      = dynamic(() => import("@/components/landing/UseCases"),      { loading: noop });
const Reliability   = dynamic(() => import("@/components/landing/Reliability"),   { loading: noop });
const PricingTeaser = dynamic(() => import("@/components/landing/PricingTeaser"), { loading: noop });
const OpenSource    = dynamic(() => import("@/components/landing/OpenSource"),    { loading: noop });
const FAQ           = dynamic(() => import("@/components/landing/FAQ"),           { loading: noop });

export const metadata: Metadata = {
  title: "Fliq — Cron jobs & scheduled webhooks, without the infrastructure",
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Fliq — Reliable HTTP job scheduling for developers",
    description: SITE.ogDescription,
    url: "/",
  },
};

// FAQPage structured data — eligible for rich results in search.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function LandingPage() {
  return (
    <div className="dark flex flex-col min-h-screen bg-[#09090b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 pt-14">
        {/* 1 ── Hero (devs-first) + live scheduler visual */}
        <Hero />

        {/* 2 ── The cron trap (problem + DIY-vs-Fliq proof) */}
        <Problem />

        {/* 3 ── How it works (steps + capability bento) */}
        <HowItWorks />

        {/* 4 ── Quickstart code */}
        <Quickstart />

        {/* 5 ── Buffers: call rate-limited APIs without the 429s (the wedge) */}
        <Buffers />

        {/* 6 ── What people build (use cases + featured AI-agent block) */}
        <UseCases />

        {/* 7 ── Reliability you can watch (live status) */}
        <Reliability />

        {/* 8 ── Open source & self-host */}
        <OpenSource />

        {/* 9 ── Beta-free pricing */}
        <PricingTeaser />

        {/* 10 ── FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
