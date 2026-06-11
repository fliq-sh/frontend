import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Warm "fliq.sh" type system — used inside the dashboard (.theme-warm) only.
// Marketing keeps Geist; these just declare the CSS variables on <body>.
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Fliq — Cron jobs & scheduled webhooks for developers",
    template: "%s — Fliq",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "cron job service",
    "scheduled webhooks",
    "HTTP job scheduler",
    "cron as a service",
    "EasyCron alternative",
    "cron-job.org alternative",
    "QStash alternative",
    "schedule AI agents",
    "task scheduler API",
  ],
  authors: [{ name: "Fliq" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Fliq — Reliable HTTP job scheduling for developers",
    description: SITE.ogDescription,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fliq — Reliable HTTP job scheduling for developers",
    description: SITE.ogDescription,
    creator: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Site-wide structured data: who we are, the site (with sitelinks search),
// and the product itself.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      sameAs: [SITE.github.org],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      publisher: { "@id": `${SITE.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE.name,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      description: SITE.description,
      url: SITE.url,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free during public beta — 100,000 executions/day",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#09090b] text-white`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
          <TooltipProvider>{children}</TooltipProvider>
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "00481914eb3b4916b95836be103ffd60"}'
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
