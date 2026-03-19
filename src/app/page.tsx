import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";

// Everything below the hero fold is lazy-loaded.
// This keeps the initial JS bundle small and prevents the page from
// freezing while the WebGL globe initialises.
const noop = () => null;
const Features      = dynamic(() => import("@/components/landing/Features"),      { loading: noop });
const UseCases      = dynamic(() => import("@/components/landing/UseCases"),      { loading: noop });
const Problem       = dynamic(() => import("@/components/landing/Problem"),       { loading: noop });
const HowItWorks    = dynamic(() => import("@/components/landing/HowItWorks"),    { loading: noop });
const Quickstart    = dynamic(() => import("@/components/landing/Quickstart"),    { loading: noop });
const Comparison    = dynamic(() => import("@/components/landing/Comparison"),    { loading: noop });
const Reliability   = dynamic(() => import("@/components/landing/Reliability"),   { loading: noop });
const PricingTeaser = dynamic(() => import("@/components/landing/PricingTeaser"), { loading: noop });
const Enterprise    = dynamic(() => import("@/components/landing/Enterprise"),    { loading: noop });
const FAQ           = dynamic(() => import("@/components/landing/FAQ"),           { loading: noop });

const socialLogos = ["OpenAI", "Cloudflare", "Disney", "Stripe", "Vercel"];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="flex-1 pt-14">
        {/* 1 ── Hero + Globe */}
        <Hero />

        {/* Social proof — stays above fold on tall viewports */}
        <section className="py-16 px-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-white/40 uppercase tracking-widest mb-8">
              Trusted by teams building at scale
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {socialLogos.map((name) => (
                <span
                  key={name}
                  className="text-white/20 font-semibold text-lg tracking-widest uppercase select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 2 ── Features (bento grid) */}
        <Features />

        {/* 3 ── What people build with Fliq */}
        <UseCases />

        {/* 4 ── Why Fliq? (problem / solution) */}
        <Problem />

        {/* 5 ── How it works */}
        <HowItWorks />

        {/* 6 ── From idea to scheduled in 30 seconds */}
        <Quickstart />

        {/* 7 ── Why not DIY? */}
        <Comparison />

        {/* 8 ── Reliability stats */}
        <Reliability />

        {/* 10 ── Pricing teaser */}
        <PricingTeaser />

        {/* 11 ── Enterprise CTA */}
        <Enterprise />

        {/* 12 ── FAQ */}
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
