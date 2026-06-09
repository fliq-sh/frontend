import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { SITE, BETA } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using Fliq during the public beta.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-6">Terms</h1>
            <p className="text-white/60 leading-relaxed mb-4">
              Fliq is in public beta. This is a plain-language summary, not a
              final legal agreement — full terms land before general
              availability.
            </p>
            <div className="space-y-5 text-sm text-white/70 leading-relaxed">
              <p>
                <strong className="text-white">Beta service.</strong> Fliq is
                provided as-is during the beta. We aim for high reliability (see
                the{" "}
                <a className="text-white hover:text-white/70 underline underline-offset-4" href="/status">
                  live status page
                </a>
                ) but don&apos;t offer a contractual SLA yet — don&apos;t rely on
                it as your only safeguard for irreversible actions.
              </p>
              <p>
                <strong className="text-white">Free during beta.</strong>{" "}
                {BETA.executionsPerDayLabel}, no credit card. We&apos;ll give
                clear notice before introducing paid plans, and beta users get
                early-adopter terms.
              </p>
              <p>
                <strong className="text-white">Acceptable use.</strong> Don&apos;t
                use Fliq to attack, spam, or overload endpoints you don&apos;t
                control, or for anything illegal. We may suspend abusive
                accounts.
              </p>
              <p>
                <strong className="text-white">Questions?</strong> Email{" "}
                <a
                  className="text-white hover:text-white/70 underline underline-offset-4"
                  href={`mailto:${SITE.email}`}
                >
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
