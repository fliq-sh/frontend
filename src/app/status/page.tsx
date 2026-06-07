import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import StatusClient from "./StatusClient";

export const metadata: Metadata = {
  title: "Status — live uptime of the Fliq API",
  description:
    "Real-time status and uptime of the Fliq job scheduling API, pinged live from your browser. Honest numbers — no fabricated SLA.",
  alternates: { canonical: "/status" },
  openGraph: {
    title: "Fliq status & live uptime",
    description:
      "Real-time status of the Fliq API, measured live. Honest numbers, no fabricated SLA.",
    url: "/status",
  },
};

export default function StatusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <main className="flex-1 pt-14">
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                System status
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                Is Fliq up right now?
              </h1>
              <p className="mt-3 text-white/60">
                Measured live, in your browser. This is the production API — not
                a status page we update by hand.
              </p>
            </div>
            <StatusClient />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
