import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";
import OpenSource from "@/components/landing/OpenSource";
import { faqs } from "@/components/landing/faq-data";
import { SITE } from "@/lib/site";

// Everything below the hero fold is lazy-loaded to keep the initial JS small.
const noop = () => null;
const Problem       = dynamic(() => import("@/components/landing/Problem"),       { loading: noop });
const HowItWorks    = dynamic(() => import("@/components/landing/HowItWorks"),    { loading: noop });
const Features      = dynamic(() => import("@/components/landing/Features"),      { loading: noop });
const Quickstart    = dynamic(() => import("@/components/landing/Quickstart"),    { loading: noop });
const UseCases      = dynamic(() => import("@/components/landing/UseCases"),      { loading: noop });
const Agents        = dynamic(() => import("@/components/landing/Agents"),        { loading: noop });
const Comparison    = dynamic(() => import("@/components/landing/Comparison"),    { loading: noop });
const Reliability   = dynamic(() => import("@/components/landing/Reliability"),   { loading: noop });
const PricingTeaser = dynamic(() => import("@/components/landing/PricingTeaser"), { loading: noop });
const Enterprise    = dynamic(() => import("@/components/landing/Enterprise"),    { loading: noop });
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
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 pt-14">
        {/* 1 ── Hero (devs-first) + live scheduler visual */}
        <Hero />

        {/* 2 ── Honest proof: open source + how it really works (replaces fake logos) */}
        <OpenSource />

        {/* 3 ── The cron trap */}
        <Problem />

        {/* 4 ── How it works */}
        <HowItWorks />

        {/* 5 ── Features */}
        <Features />

        {/* 6 ── Quickstart code */}
        <Quickstart />

        {/* 7 ── What people build */}
        <UseCases />

        {/* 8 ── The AI-agent edge (differentiator) */}
        <Agents />

        {/* 9 ── Why not DIY cron */}
        <Comparison />

        {/* 10 ── Reliability you can watch (live status) */}
        <Reliability />

        {/* 11 ── Beta-free pricing */}
        <PricingTeaser />

        {/* 12 ── Self-hosted / enterprise */}
        <Enterprise />

        {/* 13 ── FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
