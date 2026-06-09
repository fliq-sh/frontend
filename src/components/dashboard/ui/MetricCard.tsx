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
        "group relative flex h-full flex-col rounded-xl border border-white/10 border-l-2 bg-white/[0.03] p-4 transition-colors",
        t.borderL,
        href && "hover:bg-white/[0.06] cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", t.icon)} />}
          <p className="truncate text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
        </div>
        {chart && <div className="shrink-0 opacity-80">{chart}</div>}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold leading-none tracking-tight tabular-nums">{value}</p>
      </div>

      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={cn("h-full rounded-full", progressTone(progress, tone))}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}

      {sub && <p className="mt-2 text-xs text-white/40">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function progressTone(fraction: number, tone: Tone): string {
  if (tone !== "neutral") return TONE[tone].dot;
  // Neutral quota bar: stays white until near the cap, then warns/alarms.
  if (fraction >= 0.9) return "bg-red-400";
  if (fraction >= 0.75) return "bg-amber-400";
  return "bg-white/70";
}
