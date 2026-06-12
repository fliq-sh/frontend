"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Live-updating relative timestamp ("2 minutes ago") with the absolute time on
 * hover. Re-renders on an interval so "ago" stays honest without a full data
 * refetch. SSR-safe: renders the relative string on the server too.
 */
export function RelativeTime({
  date,
  className,
  addSuffix = true,
  emptyLabel = "—",
}: {
  date: string | Date | null | undefined;
  className?: string;
  addSuffix?: boolean;
  emptyLabel?: string;
}) {
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!date) return <span className={cn("text-foreground/50", className)}>{emptyLabel}</span>;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) {
    return <span className={cn("text-foreground/50", className)}>{emptyLabel}</span>;
  }

  return (
    <time
      dateTime={d.toISOString()}
      title={format(d, "PPpp")}
      className={cn("whitespace-nowrap tabular-nums", className)}
    >
      {formatDistanceToNow(d, { addSuffix })}
    </time>
  );
}
