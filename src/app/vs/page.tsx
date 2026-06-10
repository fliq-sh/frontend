import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { COMPARISONS } from "@/lib/comparisons";

export const metadata: Metadata = {
  title: "Fliq vs alternatives — cron & HTTP scheduler comparisons",
  description:
    "Honest, side-by-side comparisons of Fliq against cron-job.org, EasyCron, QStash, Trigger.dev, Inngest, Hookdeck, Google Cloud Scheduler, Cronhub, and GitHub Actions.",
  alternates: { canonical: "/vs" },
  openGraph: {
    title: "Fliq vs alternatives — cron & HTTP scheduler comparisons",
    description:
      "Honest, side-by-side comparisons of Fliq against the most popular cron and HTTP scheduling services.",
    url: "/vs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fliq vs alternatives — cron & HTTP scheduler comparisons",
    description:
      "Honest, side-by-side comparisons of Fliq against the most popular cron and HTTP scheduling services.",
  },
};

export default function ComparisonsIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />

      <main className="pt-14">
        {/* Hero */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Fliq vs the alternatives
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Honest, side-by-side comparisons. We lead with where each tool
              genuinely fits — and where Fliq does.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPARISONS.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-white/25 hover:bg-white/[0.05]"
              >
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-white/70 transition-colors">
                  Fliq vs {c.competitor}
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  {c.competitorTagline}
                </p>
                <span className="mt-4 inline-block text-sm text-white/70">
                  Compare →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
