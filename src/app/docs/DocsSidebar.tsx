"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    section: "Overview",
    links: [{ label: "What is Fliq?", href: "/docs" }],
  },
  {
    section: "Getting Started",
    links: [{ label: "Quickstart", href: "/docs/getting-started" }],
  },
  {
    section: "Concepts",
    links: [
      { label: "Jobs & Schedules", href: "/docs/jobs-and-schedules" },
      { label: "Retries & Billing", href: "/docs/retries" },
      { label: "Buffers", href: "/docs/buffers" },
      { label: "Webhook Signing", href: "/docs/signing" },
    ],
  },
  {
    section: "Reference",
    links: [{ label: "API Reference", href: "/docs/api-reference" }],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 flex-shrink-0 py-12 pr-8 border-r border-white/10 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="space-y-6">
        {nav.map((group) => (
          <div key={group.section}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2">
              {group.section}
            </p>
            <ul className="space-y-1">
              {group.links.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block text-sm px-2 py-1 rounded-md transition-colors ${
                        active
                          ? "text-white bg-white/8 font-medium"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
