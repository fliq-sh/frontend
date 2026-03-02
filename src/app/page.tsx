import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import UseCases from "@/components/landing/UseCases";
import Quickstart from "@/components/landing/Quickstart";
import AIFeatures from "@/components/landing/AIFeatures";
import Features from "@/components/landing/Features";
import Comparison from "@/components/landing/Comparison";
import Reliability from "@/components/landing/Reliability";
import PricingTeaser from "@/components/landing/PricingTeaser";
import Enterprise from "@/components/landing/Enterprise";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const socialLogos = ["OpenAI", "Cloudflare", "Disney", "Stripe", "Vercel"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="pt-14">
        <Hero />

        {/* Social proof bar */}
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

        <Problem />
        <HowItWorks />
        <UseCases />
        <Quickstart />
        <AIFeatures />
        <Features />
        <Comparison />
        <Reliability />
        <PricingTeaser />
        <Enterprise />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
