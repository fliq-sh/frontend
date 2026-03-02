import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  "Deploy on your own metal or any cloud",
  "No data leaves your infrastructure",
  "Dedicated support & SLA (99.99%)",
  "SSO / SAML integration",
  "Custom data retention policies",
];

export default function Enterprise() {
  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                Enterprise
              </p>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Enterprise-grade reliability, on your terms.
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Run Fliq on your own Kubernetes cluster, your cloud account, or
                air-gapped on-prem. Same API, full control. Dedicated SLA, SSO,
                and audit logs included.
              </p>
              <Button size="lg" asChild>
                <Link href="mailto:enterprise@fliq.dev">Talk to us →</Link>
              </Button>
            </div>

            {/* Right */}
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex gap-3 items-start">
                  <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  <span className="text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
