import Link from "next/link";
import FliqIcon from "@/components/ui/FliqIcon";
import LiveStatus from "./LiveStatus";
import { SITE } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Status", href: "/status" },
      { label: "Dashboard", href: "/app" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "All comparisons", href: "/vs" },
      { label: "Fliq vs EasyCron", href: "/vs/easycron" },
      { label: "Fliq vs QStash", href: "/vs/qstash" },
      { label: "Fliq vs cron-job.org", href: "/vs/cron-job-org" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Cron expression tool", href: "/tools/cron" },
      { label: "GitHub", href: SITE.github.org, external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              <FliqIcon size={24} />
              <span className="font-semibold">Fliq</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Reliable HTTP job scheduling for developers. Cron and webhooks
              without running infrastructure.
            </p>
            <LiveStatus variant="pill" />
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={"external" in link && link.external ? "_blank" : undefined}
                        rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Fliq. All rights reserved.
          </p>
          <nav className="flex items-center gap-6 text-xs text-white/50">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href={`mailto:${SITE.email}`}
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
