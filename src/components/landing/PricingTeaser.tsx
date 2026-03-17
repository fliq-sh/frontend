import Link from "next/link";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Beta",
    price: "Free",
    note: "100k credits / day · no credit card required",
    highlight: true,
  },
  {
    name: "Growth",
    price: "$1 / 100k",
    note: "Coming soon",
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Coming soon",
    comingSoon: true,
  },
];

export default function PricingTeaser() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Glowing top separator */}
      <div className="absolute top-0 inset-x-0 separator-glow" />
      {/* Glowing bottom separator */}
      <div className="absolute bottom-0 inset-x-0 separator-glow" />

      {/* Indigo radial glow — the visual peak of the page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 100% at 50% 50%, rgba(99,102,241,0.13) 0%, rgba(67,56,202,0.07) 45%, transparent 72%)",
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-lines pointer-events-none opacity-60" />
      {/* Fade grid at edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #09090b 0%, transparent 15%, transparent 85%, #09090b 100%)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Free during beta
        </h2>
        <p className="text-white/60 mb-12 max-w-xl mx-auto">
          100,000 credits per day. No credit card required. Paid plans coming soon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 rounded-2xl border ${
                tier.highlight
                  ? "border-indigo-400/50 bg-indigo-500/[0.12] shadow-[0_0_40px_rgba(99,102,241,0.18)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
              <p
                className={`text-2xl font-bold mb-1 ${
                  tier.highlight ? "text-indigo-300" : tier.comingSoon ? "text-white/40" : "text-white"
                }`}
              >
                {tier.price}
              </p>
              <p className={`text-xs ${tier.comingSoon ? "text-white/30" : "text-white/40"}`}>{tier.note}</p>
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
