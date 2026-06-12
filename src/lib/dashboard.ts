// Dashboard-only helpers: number/time formatting and a couple of small status
// mappers. Overview/Billing metrics now come from the server-side /stats
// endpoints (see createStatsApi in lib/api.ts), so the old client-side
// time-bucketing aggregation lives in core-api instead. Everything here is pure
// so it stays SSR-safe and easy to test.

import type { Tone } from "@/components/patterns";

const numberFmt = new Intl.NumberFormat("en-US");

/** Thousands-separated integer, e.g. 12,403. */
export function formatNumber(n: number): string {
  return numberFmt.format(Math.round(n));
}

/** Compact, e.g. 1.2k / 3.4M. Good for tight metric tiles. */
export function formatCompact(n: number): string {
  if (Math.abs(n) < 1000) return String(Math.round(n));
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Percentage with sensible precision, e.g. 99.4% / 100% / 0%. */
export function formatPercent(fraction: number): string {
  if (!Number.isFinite(fraction)) return "—";
  const pct = fraction * 100;
  const digits = pct > 0 && pct < 10 ? 1 : 0;
  return `${pct.toFixed(digits)}%`;
}

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(n: number): string {
  return usdFmt.format(n);
}

/** Map an HTTP status code to a traffic-light tone. */
export function httpStatusTone(code: number | null | undefined): Tone {
  if (!code) return "neutral";
  if (code >= 200 && code < 300) return "success";
  if (code >= 300 && code < 400) return "warning";
  return "danger";
}

/** Friendly label for a buffer/job item status. */
export const ITEM_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};
