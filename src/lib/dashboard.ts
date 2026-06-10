// Dashboard-only helpers: number/time formatting and the client-side
// aggregation we use to derive metrics from the existing list endpoints
// (there is no server-side stats endpoint — see core-api router). Everything
// here is pure so it stays SSR-safe and easy to test.

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

/**
 * Bucket timestamped items into a fixed number of equal time buckets ending
 * "now". Returns one count per bucket, oldest → newest, so it can feed a
 * sparkline / mini bar chart directly.
 */
export function bucketByTime<T>(
  items: T[],
  getDate: (item: T) => string | Date | null | undefined,
  opts: { buckets: number; windowMs: number; now: number },
): number[] {
  const { buckets, windowMs, now } = opts;
  const slot = windowMs / buckets;
  const start = now - windowMs;
  const out = new Array<number>(buckets).fill(0);
  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const t = raw instanceof Date ? raw.getTime() : new Date(raw).getTime();
    if (Number.isNaN(t) || t < start || t > now) continue;
    let idx = Math.floor((t - start) / slot);
    if (idx < 0) idx = 0;
    if (idx >= buckets) idx = buckets - 1;
    out[idx] += 1;
  }
  return out;
}

/** Count items whose timestamp is on/after `since` (ms epoch). */
export function countSince<T>(
  items: T[],
  getDate: (item: T) => string | Date | null | undefined,
  since: number,
): number {
  let n = 0;
  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const t = raw instanceof Date ? raw.getTime() : new Date(raw).getTime();
    if (!Number.isNaN(t) && t >= since) n += 1;
  }
  return n;
}

/** ms epoch of the start of today in the viewer's local timezone. */
export function startOfTodayLocal(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
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
