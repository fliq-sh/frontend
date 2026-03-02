import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "5,000 jobs/day",
    note: "No credit card",
  },
  {
    name: "Growth",
    price: "$2 / 100k jobs",
    note: "Retries included",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "On your infrastructure",
  },
];

export default function PricingTeaser() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-white/60 mb-12 max-w-xl mx-auto">
          Pay for the job, not the failures. Retries are always free.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 rounded-2xl border ${
                tier.highlight
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
              <p
                className={`text-2xl font-bold mb-1 ${
                  tier.highlight ? "text-indigo-300" : "text-white"
                }`}
              >
                {tier.price}
              </p>
              <p className="text-xs text-white/40">{tier.note}</p>
            </div>
          ))}
        </div>

        <Button size="lg" variant="outline" asChild>
          <Link href="/pricing">See full pricing →</Link>
        </Button>
      </div>
    </section>
  );
}
