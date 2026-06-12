import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE, type Tone } from "@/components/patterns";

/**
 * The headline metric tile used across the dashboard (Overview + per-section
 * stat rows). Richer than patterns/StatCard: supports a sub-line, a progress
 * bar (for quota/usage), an inline chart slot, and an optional link target.
 * Monochrome by default; `tone` adds a traffic-light left accent + icon hue.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
  progress,
  chart,
  href,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  /** 0–1 fraction; renders a quota/usage bar under the value. */
  progress?: number;
  /** Inline chart node (e.g. a Sparkline) rendered on the right. */
  chart?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const t = TONE[tone];
  const body = (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors sm:p-6",
        href && "hover:border-foreground/25 cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={cn("h-4 w-4 shrink-0", t.icon)} />}
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/60">{label}</p>
        </div>
        {chart && <div className="shrink-0 opacity-80">{chart}</div>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="text-3xl font-bold leading-none tracking-tight tabular-nums">{value}</p>
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className={cn("h-full rounded-full", progressTone(progress, tone))}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}

      {sub && <p className="mt-3 text-xs text-foreground/62">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function progressTone(fraction: number, tone: Tone): string {
  if (tone !== "neutral") return TONE[tone].dot;
  // Neutral quota bar: stays white until near the cap, then warns/alarms.
  if (fraction >= 0.9) return "bg-red-400";
  if (fraction >= 0.75) return "bg-amber-400";
  return "bg-foreground/70";
}
