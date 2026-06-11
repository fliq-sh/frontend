"use client";

import { cn } from "@/lib/utils";
import { TONE, type Tone } from "@/components/patterns";

export interface FilterTab<T extends string> {
  value: T;
  label: string;
  count?: number;
  tone?: Tone;
}

/**
 * Segmented status filter. Horizontally scrollable on mobile so it never
 * overflows. Each tab can show a count and a traffic-light dot.
 */
export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 overflow-x-auto rounded-lg border border-foreground/10 bg-foreground/[0.03] p-1 no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active ? "bg-foreground/10 text-foreground" : "text-foreground/45 hover:text-foreground/70",
            )}
          >
            {tab.tone && tab.tone !== "neutral" && (
              <span className={cn("h-1.5 w-1.5 rounded-full", TONE[tab.tone].dot)} />
            )}
            {tab.label}
            {typeof tab.count === "number" && (
              <span className={cn("tabular-nums", active ? "text-foreground/60" : "text-foreground/30")}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
