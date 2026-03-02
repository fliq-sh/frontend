import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    priceNote: "forever",
    highlight: false,
    cta: "Start for free",
    ctaHref: "/sign-up",
    features: [
      "5,000 job units / day",
      "10 active schedules",
      "7-day execution history",
      "3 max retries per job",
      "Community support",
      "No SLA",
    ],
  },
  {
    name: "Growth",
    price: "$2",
    priceNote: "per 100k job units",
    highlight: true,
    cta: "Start building",
    ctaHref: "/sign-up",
    badge: "Most popular",
    features: [
      "Unlimited job units",
      "Unlimited schedules",
      "1-year execution history",
      "10 max retries per job",
      "Email support",
      "99.9% SLA",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "tailored to you",
    highlight: false,
    cta: "Talk to us",
    ctaHref: "mailto:enterprise@fliq.dev",
    features: [
      "Unlimited everything",
      "Deploy on your own infra",
      "Custom data retention",
      "Custom max retries",
      "Dedicated SLA (99.99%)",
      "SSO / SAML + audit logs",
    ],
  },
];

const pricingFaqs = [
  {
    question: "What is a job unit?",
    answer:
      "One job execution, regardless of how many retries it takes to succeed. You pay for the job, not the failures.",
  },
  {
    question: "Does the free tier reset daily or monthly?",
    answer:
      "Daily at midnight UTC. You get 5,000 job units every day — more predictable than a monthly cap for small apps.",
  },
  {
    question: "What if I exceed the free tier?",
    answer:
      "Jobs queue until the next day's reset, or upgrade to Growth for instant throughput with no daily cap.",
  },
  {
    question: "Can I self-host?",
    answer:
      "Yes. The Enterprise plan includes on-prem and private cloud deployment. Same API, your infrastructure.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="pt-14">
        {/* Hero */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-6">
              Pay for the job, not the failures. Retries are always included.
            </p>

            {/* Key differentiator banner */}
            <div className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
              Retries are free. Pay for the job, not the failures.
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-indigo-500/50 bg-indigo-950/20"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-medium text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-1">{tier.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.price !== "Custom" && (
                      <span className="text-white/40 text-sm">
                        {tier.priceNote}
                      </span>
                    )}
                  </div>
                  {tier.price === "Custom" && (
                    <span className="text-white/40 text-sm">{tier.priceNote}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 items-start text-sm">
                      <span className="mt-0.5 text-green-400 flex-shrink-0">✓</span>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={tier.highlight ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href={tier.ctaHref}>{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="pb-24 px-4 border-t border-white/10 pt-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-12 text-center">
              Compare plans
            </h2>

            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 bg-white/5 border-b border-white/10">
                <div className="p-4 text-sm text-white/40" />
                {["Free", "Growth", "Enterprise"].map((name) => (
                  <div
                    key={name}
                    className="p-4 text-sm font-semibold text-center border-l border-white/10"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {[
                {
                  label: "Job units / day",
                  values: ["5,000", "Unlimited", "Unlimited"],
                },
                {
                  label: "What's a job unit",
                  values: [
                    "1 execution (retries free)",
                    "same",
                    "same",
                  ],
                },
                {
                  label: "Execution history",
                  values: ["7 days", "1 year", "1 year+"],
                },
                {
                  label: "Active schedules",
                  values: ["10", "Unlimited", "Unlimited"],
                },
                {
                  label: "Max retries / job",
                  values: ["3", "10", "Custom"],
                },
                {
                  label: "SLA",
                  values: ["—", "99.9%", "99.99%"],
                },
                {
                  label: "Support",
                  values: ["Community", "Email", "Dedicated"],
                },
                {
                  label: "Self-hosted deploy",
                  values: ["✕", "✕", "✓"],
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 border-b border-white/10 last:border-0 ${
                    i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                  }`}
                >
                  <div className="p-4 text-sm text-white/60">{row.label}</div>
                  {row.values.map((val, j) => (
                    <div
                      key={j}
                      className="p-4 text-sm text-center border-l border-white/10 text-white/70"
                    >
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-24 px-4 border-t border-white/10 pt-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-12 text-center">
              Pricing FAQ
            </h2>

            <div className="space-y-4">
              {pricingFaqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-white/10 p-6"
                >
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Ready to stop babysitting cron jobs?
            </h2>
            <p className="text-white/60 mb-8">
              Start free. No credit card required. 5,000 job units every day.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">Start for free →</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="mailto:enterprise@fliq.dev">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
