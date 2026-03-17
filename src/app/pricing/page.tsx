import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const tiers = [
  {
    name: "Beta",
    price: "Free",
    priceNote: "during beta",
    highlight: true,
    cta: "Start for free",
    ctaHref: "/sign-up",
    badge: "Now open",
    features: [
      "100,000 credits / day",
      "Unlimited schedules",
      "7-day execution history",
      "3 max retries per job",
      "Community support",
    ],
  },
  {
    name: "Growth",
    price: "$1",
    priceNote: "per 100k executions",
    highlight: false,
    comingSoon: true,
    cta: "Coming soon",
    ctaHref: "#",
    features: [
      "Unlimited executions",
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
    comingSoon: true,
    cta: "Coming soon",
    ctaHref: "#",
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
    question: "What counts as a credit?",
    answer:
      "Every HTTP attempt — the original fire and each retry — uses one credit. If a job retries 3 times before succeeding, that's 4 credits used.",
  },
  {
    question: "Does the beta limit reset daily or monthly?",
    answer:
      "Daily at midnight UTC. You get 100,000 credits every day during the beta — more than enough for most workloads.",
  },
  {
    question: "What if I exceed the daily limit?",
    answer:
      "New job and schedule creation will be rejected until the next daily reset at midnight UTC. Pending executions will also fail until reset.",
  },
  {
    question: "Will pricing change after the beta?",
    answer:
      "We'll introduce paid plans (Growth and Enterprise) after the beta. Current beta users will get early-adopter benefits. We'll give plenty of notice before any changes.",
  },
  {
    question: "Can I self-host?",
    answer:
      "Yes — self-hosted deployment will be available with the Enterprise plan after beta. Same API, your infrastructure.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="pt-14">
        {/* Hero */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Free during beta
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-6">
              100,000 credits per day — no credit card required. Paid plans coming soon.
            </p>

            {/* Beta banner */}
            <div className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
              100k credits / day · free during beta · no strings attached
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

                {tier.comingSoon ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full opacity-50 cursor-not-allowed"
                    disabled
                  >
                    {tier.cta}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant={tier.highlight ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href={tier.ctaHref}>{tier.cta}</Link>
                  </Button>
                )}
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
                {["Beta (Free)", "Growth", "Enterprise"].map((name) => (
                  <div
                    key={name}
                    className="p-4 text-sm font-semibold text-center border-l border-white/10"
                  >
                    {name}
                    {(name === "Growth" || name === "Enterprise") && (
                      <span className="block text-xs font-normal text-white/30 mt-0.5">Coming soon</span>
                    )}
                  </div>
                ))}
              </div>

              {[
                {
                  label: "Credits / day",
                  values: ["100,000", "Unlimited", "Unlimited"],
                },
                {
                  label: "Retry billing",
                  values: [
                    "Each retry = 1 credit",
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
                  values: ["Unlimited", "Unlimited", "Unlimited"],
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
              Join the beta — 100,000 credits per day, completely free.
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
