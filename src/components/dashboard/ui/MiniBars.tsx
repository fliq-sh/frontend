"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface MiniBar {
  value: number;
  /** Tooltip label for this bucket, e.g. "14:00 — 23 executions". */
  label?: string;
}

/**
 * Monochrome bar chart for bucketed counts (e.g. executions per hour). Pure
 * CSS bars, hover highlights a bar and shows its label. No chart dependency —
 * white-on-dark only (ADR 0001).
 */
export function MiniBars({
  bars,
  height = 56,
  className,
  barClass = "bg-foreground/25",
  activeBarClass = "bg-foreground/70",
}: {
  bars: MiniBar[];
  height?: number;
  className?: string;
  barClass?: string;
  activeBarClass?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {bars.map((b, i) => {
          const h = b.value === 0 ? 2 : Math.max(2, Math.round((b.value / max) * height));
          const active = hover === i;
          return (
            <div
              key={i}
              className="flex-1 min-w-0 flex items-end h-full"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-colors",
                  active ? activeBarClass : barClass,
                )}
                style={{ height: h }}
              />
            </div>
          );
        })}
      </div>
      {hover !== null && bars[hover]?.label && (
        <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded-md border border-foreground/10 theme-warm bg-popover text-foreground px-2 py-1 text-[11px] text-foreground/85 whitespace-nowrap shadow-lg">
          {bars[hover].label}
        </div>
      )}
    </div>
  );
}
