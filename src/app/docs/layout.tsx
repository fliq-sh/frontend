import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import DocsSidebar from "./DocsSidebar";

export const metadata = {
  title: { template: "%s — Fliq Docs", default: "Fliq Docs" },
  description: "Documentation for Fliq — Serverless HTTP Scheduling.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 flex gap-0">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-12 md:pl-12">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
