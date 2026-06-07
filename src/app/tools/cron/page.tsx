import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CronExplainer from "./CronExplainer";

const TITLE = "Cron Expression Generator & Explainer — Fliq";
const DESCRIPTION =
  "Free cron expression generator and explainer. Build or decode any 5-field cron schedule, get a plain-English description, and preview the next run times in UTC instantly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tools/cron" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Fliq Cron Expression Tool",
    description: DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: "https://fliq.sh/tools/cron",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://fliq.sh/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://fliq.sh/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Cron Expression Generator",
        item: "https://fliq.sh/tools/cron",
      },
    ],
  },
];

export default function CronToolPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="pt-14">
        {/* Hero */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-300 mb-6">
              Free developer tool
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Cron Expression Generator &amp; Explainer
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Build or decode any cron schedule. Type an expression to get a
              plain-English description and the next run times in UTC — no
              sign-up, no guesswork.
            </p>
          </div>

          <CronExplainer />
        </section>
      </main>

      <Footer />
    </div>
  );
}
