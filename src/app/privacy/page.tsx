import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Fliq handles your data during the public beta.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto prose-invert">
            <h1 className="text-4xl font-bold tracking-tight mb-6">Privacy</h1>
            <p className="text-white/60 leading-relaxed mb-4">
              Fliq is in public beta. This page is a plain-language summary, not
              a final legal document — a full policy lands before general
              availability.
            </p>
            <div className="space-y-5 text-sm text-white/70 leading-relaxed">
              <p>
                <strong className="text-white">What we store.</strong> Your
                account (via Clerk), the jobs and schedules you create, and the
                execution history for those jobs (target URL, status codes,
                durations, response snippets). We don&apos;t sell your data.
              </p>
              <p>
                <strong className="text-white">Job payloads.</strong> Fliq calls
                the endpoints you configure with the bodies and headers you
                provide. Don&apos;t put secrets you wouldn&apos;t want stored in
                a request body — use your own auth on your endpoints.
              </p>
              <p>
                <strong className="text-white">Subprocessors.</strong> Clerk
                (auth) and Stripe (billing, when paid plans launch). Infrastructure
                runs on Hetzner with backups to object storage.
              </p>
              <p>
                <strong className="text-white">Deletion.</strong> Email{" "}
                <a
                  className="text-indigo-300 hover:text-indigo-200"
                  href={`mailto:${SITE.email}`}
                >
                  {SITE.email}
                </a>{" "}
                to delete your account and data.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
