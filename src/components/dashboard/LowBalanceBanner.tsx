"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useApi, createStatsApi, type UsageSummary } from "@/lib/api";
import { useBalance } from "./BalanceContext";
import { dailyBurnFromUsage, lowBalanceState, runwayLabel } from "@/lib/lowBalance";
import { formatNumber } from "@/lib/dashboard";

// Trailing window used to estimate the burn rate behind the runway warning.
const USAGE_WINDOW_DAYS = 7;
// Per-session dismissal. We store the dismissed severity so that if the balance
// worsens (low → critical) the stronger warning still shows; dismissing
// "critical" stays dismissed for the session.
const DISMISS_KEY = "fliq.lowBalanceDismissed";

/**
 * Dashboard-wide warning shown when the credit balance is close to running out.
 * The in-app counterpart to the `credit_low` alert the scheduler already fans
 * out to webhook/slack/email channels (core-api#48). Renders nothing while the
 * balance is healthy, and self-fetches recent usage to estimate runway.
 */
export default function LowBalanceBanner() {
  const { apiFetch } = useApi();
  const { balance } = useBalance();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    const statsApi = createStatsApi(apiFetch);
    statsApi
      .usage(USAGE_WINDOW_DAYS)
      .then(setUsage)
      .catch(() => setUsage(null));
    // apiFetch is stable for the session; load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY));
    } catch {
      // sessionStorage can throw in private-mode/SSR edge cases — just don't
      // remember the dismissal then.
    }
  }, []);

  const state = useMemo(
    () => lowBalanceState(balance?.balance, dailyBurnFromUsage(usage)),
    [balance, usage],
  );

  if (state.severity === "ok") return null;
  if (dismissed === state.severity) return null;

  const critical = state.severity === "critical";
  const tone = critical
    ? { border: "border-red-500/30", bg: "bg-red-500/10", icon: "text-red-400" }
    : { border: "border-amber-500/30", bg: "bg-amber-500/10", icon: "text-amber-400" };

  const runway = runwayLabel(state.runwayDays);
  const headline = critical
    ? balance && balance.balance > 0
      ? "Your credit balance is about to run out"
      : "You're out of credits"
    : "Your credit balance is running low";
  const detail =
    balance && balance.balance <= 0
      ? "New job and buffer executions are being dropped until you top up."
      : `${formatNumber(balance?.balance ?? 0)} credits left${runway ? ` · ${runway}` : ""} at your recent usage. Top up to avoid dropped executions.`;

  const onDismiss = () => {
    setDismissed(state.severity);
    try {
      sessionStorage.setItem(DISMISS_KEY, state.severity);
    } catch {
      // ignore — dismissal just won't persist across reloads
    }
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 border-b ${tone.border} ${tone.bg} px-4 py-3 sm:px-8 lg:px-10`}
    >
      <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${tone.icon}`} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-foreground/90">{headline}</p>
        <p className="text-foreground/65">{detail}</p>
      </div>
      <Link
        href="/app/billing"
        className="shrink-0 rounded-md border border-foreground/15 bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground/85 transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        Top up
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-foreground/45 transition-colors hover:text-foreground/80"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
