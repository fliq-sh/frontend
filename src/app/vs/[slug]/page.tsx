import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ComparisonTable from "@/components/blog/ComparisonTable";
import { SITE, BETA } from "@/lib/site";
import {
  getComparison,
  getAllComparisonSlugs,
} from "@/lib/comparisons";

export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);

  if (!c) {
    return {
      title: "Comparison not found — Fliq",
      description: "This comparison page does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/vs/${slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
    },
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  const rows: string[][] = c.matrix.map((m) => [
    m.dimension,
    m.fliq,
    m.competitor,
  ]);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Compare",
        item: `${SITE.url}/vs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Fliq vs ${c.competitor}`,
        item: `${SITE.url}/vs/${c.slug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />

      <main className="pt-14">
        {/* Hero */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/vs"
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              ← All comparisons
            </Link>
            <div className="mt-6 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              {c.competitorTagline}
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
              Fliq vs {c.competitor}
            </h1>
            <p className="mt-6 text-lg text-white/60 leading-relaxed">
              {c.intro}
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section className="pb-24 px-4 border-t border-white/10 pt-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Side by side
            </h2>
            <p className="text-white/60 mb-8">
              How Fliq and {c.competitor} compare across the dimensions that
              matter for scheduling HTTP jobs.
            </p>
            <ComparisonTable
              headers={["", "Fliq", c.competitor]}
              rows={rows}
            />
          </div>
        </section>

        {/* When each fits */}
        <section className="pb-24 px-4 border-t border-white/10 pt-24">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h2 className="text-xl font-bold tracking-tight mb-3">
                When {c.competitor} is the right call
              </h2>
              <p className="text-white/60 leading-relaxed">
                {c.whenCompetitor}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-8">
              <h2 className="text-xl font-bold tracking-tight mb-3 text-indigo-300">
                When Fliq fits better
              </h2>
              <p className="text-white/70 leading-relaxed">{c.whenFliq}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24 px-4 text-center border-t border-white/10 pt-24">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Try Fliq for your HTTP jobs
            </h2>
            <p className="text-white/60 mb-8">{BETA.blurb}</p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">Start free during beta →</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/vs">See all comparisons</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
