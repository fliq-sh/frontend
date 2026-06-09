import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE, type Tone } from "./tones";

/**
 * A metric tile: icon + uppercase label + large value, with a traffic-light
 * left accent. `tone="neutral"` is the monochrome default (e.g. totals);
 * success/warning/danger map onto job state. Pass an already-rendered node as
 * `value` so the caller controls loading skeletons.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 border-l-2 bg-white/5 px-4 py-3",
        t.borderL,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("h-3.5 w-3.5", t.icon)} />}
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
