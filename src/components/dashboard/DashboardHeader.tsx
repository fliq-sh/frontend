"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBalance } from "./BalanceContext";
import { formatCompact } from "@/lib/dashboard";

// Static labels for the top-level dashboard routes.
const SECTION_LABELS: Record<string, string> = {
  app: "Overview",
  jobs: "Jobs",
  schedules: "Schedules",
  buffers: "Buffers",
  billing: "Billing",
  settings: "Settings",
  attempts: "Attempt",
};

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(pathname: string): Crumb[] {
  // pathname like /app/jobs/<id>/attempts/<attemptId>
  const segs = pathname.split("/").filter(Boolean); // ["app", "jobs", ...]
  if (segs.length <= 1) return [{ label: "Overview" }];

  const crumbs: Crumb[] = [{ label: "Overview", href: "/app" }];
  let href = "/app";
  for (let i = 1; i < segs.length; i++) {
    const seg = segs[i];
    href += `/${seg}`;
    const known = SECTION_LABELS[seg];
    if (known) {
      crumbs.push({ label: known, href });
    } else {
      // dynamic id segment — show a short, mono-looking token, no link
      crumbs.push({ label: seg.length > 10 ? `${seg.slice(0, 8)}…` : seg });
    }
  }
  // Last crumb shouldn't be a link.
  if (crumbs.length) crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  return crumbs;
}

function BalancePill() {
  const { balance, loading } = useBalance();
  return (
    <Link
      href="/app/billing"
      className="inline-flex items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground/5 px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-foreground/20 hover:text-foreground"
      title="Credit balance"
    >
      <Coins className="h-3.5 w-3.5 text-foreground/40" />
      {loading || !balance ? (
        <span className="h-3 w-10 animate-pulse rounded bg-foreground/10" />
      ) : (
        <>
          <span className="tabular-nums">{formatCompact(balance.balance)}</span>
          <span className="hidden text-foreground/40 sm:inline">credits</span>
        </>
      )}
    </Link>
  );
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-foreground/10 bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <div className="h-5 w-px bg-foreground/10" />
      <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <span className="text-foreground/20">/</span>}
              {c.href && !last ? (
                <Link href={c.href} className="truncate text-foreground/45 transition-colors hover:text-foreground/80">
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-foreground/90">{c.label}</span>
              )}
            </span>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <BalancePill />
      </div>
    </header>
  );
}
