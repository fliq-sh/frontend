// Low-balance runway logic for the dashboard warning banner. This is the UI
// half of core-api#48 — the scheduler already fires a `credit_low` alert through
// the user's channels when a deduction crosses the threshold (see core-api
// internal/scheduler/alert.go); here we surface the same "you're about to run
// dry" warning in-app, derived from the data the dashboard already loads.
//
// Everything here is pure so it stays SSR-safe and unit-testable.

import type { UsageSummary } from "@/lib/api";

/** Runway below this many days triggers the "low" (amber) warning. */
export const LOW_RUNWAY_DAYS = 3;
/** Runway below this many days is "critical" (red). A zero/negative balance is
 *  always critical regardless of burn. */
export const CRITICAL_RUNWAY_DAYS = 1;

export type BalanceSeverity = "ok" | "low" | "critical";

export interface LowBalanceState {
  severity: BalanceSeverity;
  /** Estimated days of runway at the recent burn rate. `null` when there is no
   *  recent burn (runway is effectively infinite and can't be estimated). */
  runwayDays: number | null;
  /** Average credits/day burned over the window the estimate is based on. */
  dailyBurn: number;
}

/**
 * Average credits/day burned over the usage window. Billing is per execution
 * attempt at one credit each, so burn = total executions / window days. Guards
 * against a zero/absent window so it never divides by zero.
 */
export function dailyBurnFromUsage(usage: UsageSummary | null | undefined): number {
  if (!usage) return 0;
  const days = usage.since_days > 0 ? usage.since_days : 1;
  const total = (usage.total_job_executions ?? 0) + (usage.total_buffer_executions ?? 0);
  if (total <= 0) return 0;
  return total / days;
}

/**
 * Classify a balance into a runway-based severity. Mirrors the scheduler's
 * intent ("warn before they run dry") rather than its exact credit threshold,
 * since the dashboard reasons in runway days the user can act on.
 */
export function lowBalanceState(
  balance: number | null | undefined,
  dailyBurn: number,
): LowBalanceState {
  const bal = balance ?? 0;
  // Out of (or in the red on) credits is always critical — work is being dropped
  // right now, independent of historical burn.
  if (bal <= 0) return { severity: "critical", runwayDays: 0, dailyBurn };
  // No recent activity → nothing is burning, so there's no urgency and no
  // meaningful runway estimate.
  if (dailyBurn <= 0) return { severity: "ok", runwayDays: null, dailyBurn };

  const runwayDays = bal / dailyBurn;
  if (runwayDays < CRITICAL_RUNWAY_DAYS) return { severity: "critical", runwayDays, dailyBurn };
  if (runwayDays < LOW_RUNWAY_DAYS) return { severity: "low", runwayDays, dailyBurn };
  return { severity: "ok", runwayDays, dailyBurn };
}

/** Human "~N days/hours left" phrase for the banner. `null` runway → "". */
export function runwayLabel(runwayDays: number | null): string {
  if (runwayDays === null) return "";
  if (runwayDays <= 0) return "0 left";
  if (runwayDays < 1) {
    const hours = Math.max(1, Math.round(runwayDays * 24));
    return `~${hours} hour${hours === 1 ? "" : "s"} left`;
  }
  const days = Math.round(runwayDays);
  return `~${days} day${days === 1 ? "" : "s"} left`;
}
