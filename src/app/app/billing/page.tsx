"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Coins, Activity, TrendingDown, CalendarDays } from "lucide-react";
import {
  useApi,
  createBillingApi,
  BillingBalance,
  CreditTransaction,
  CreditTxType,
} from "@/lib/api";
import { useBalance } from "@/components/dashboard/BalanceContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageHeader,
  MetricCard,
  SectionCard,
  MiniBars,
  RelativeTime,
  Empty,
} from "@/components/dashboard/ui";
import {
  formatNumber,
  formatUsd,
  formatCompact,
  bucketByTime,
  countSince,
  startOfTodayLocal,
} from "@/lib/dashboard";

const DAY = 24 * 60 * 60 * 1000;
const TX_SAMPLE = 250;

const TX_LABEL: Record<CreditTxType, string> = {
  stripe_topup: "Top-up",
  daily_grant: "Daily grant",
  job_execution: "Execution",
};

// ─── Balance + usage summary ───────────────────────────────────────────────

function BalanceHero({ balance }: { balance: BillingBalance }) {
  const usd = balance.credits_per_dollar > 0 ? balance.balance / balance.credits_per_dollar : 0;
  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-foreground/60">
            <Coins className="h-3.5 w-3.5" /> Current balance
          </p>
          <p className="text-4xl font-bold tracking-tight tabular-nums">{formatNumber(balance.balance)}</p>
          <p className="mt-1 text-sm text-foreground/62">credits · ≈ {formatUsd(usd)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center rounded-full border border-foreground/15 bg-foreground/10 px-2.5 py-1 text-xs font-medium text-foreground/85">
            {balance.plan === "paid" ? "Paid plan" : "Free plan"}
          </span>
          <p className="text-xs text-foreground/58">{formatCompact(balance.daily_limit)} credits / day</p>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction history (responsive) ──────────────────────────────────────

function txTone(amount: number): string {
  return amount >= 0 ? "text-green-400" : "text-red-300";
}

function TransactionRow({ tx }: { tx: CreditTransaction }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className="inline-flex shrink-0 items-center rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground/70">
        {TX_LABEL[tx.type] ?? "Activity"}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground/68">{tx.description ?? "—"}</span>
      <span className={`shrink-0 font-mono text-sm font-medium tabular-nums ${txTone(tx.amount)}`}>
        {tx.amount >= 0 ? "+" : ""}
        {formatNumber(tx.amount)}
      </span>
      <RelativeTime date={tx.created_at} className="hidden shrink-0 text-xs text-foreground/58 sm:block sm:w-28 sm:text-right" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { apiFetch } = useApi();
  const { balance, loading: balanceLoading } = useBalance();

  const [txns, setTxns] = useState<CreditTransaction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [capped, setCapped] = useState(false);

  const loadInitial = useCallback(async () => {
    const api = createBillingApi(apiFetch);
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTransactions({ limit: TX_SAMPLE });
      const list = res.transactions ?? [];
      setTxns(list);
      setCursor(res.next_cursor);
      setCapped(list.length >= TX_SAMPLE);
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  async function loadMore() {
    if (!cursor) return;
    const api = createBillingApi(apiFetch);
    setLoadingMore(true);
    try {
      const res = await api.listTransactions({ cursor, limit: 50 });
      setTxns((prev) => [...prev, ...(res.transactions ?? [])]);
      setCursor(res.next_cursor);
    } catch {
      // keep existing list; user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  // Derived usage (executions = job_execution debits).
  const usage = useMemo(() => {
    if (now == null) return null;
    const exec = txns.filter((t) => t.type === "job_execution");
    const startToday = startOfTodayLocal(now);
    const oldest = txns.length ? new Date(txns[txns.length - 1].created_at).getTime() : now;
    const coversWindow = !capped || oldest <= now - 14 * DAY;
    const today = countSince(exec, (e) => e.created_at, startToday);
    const last7 = countSince(exec, (e) => e.created_at, now - 7 * DAY);
    const daily = bucketByTime(exec, (e) => e.created_at, { buckets: 14, windowMs: 14 * DAY, now });
    return { today, last7, daily, coversWindow };
  }, [txns, now, capped]);

  const dailyQuota = balance?.daily_limit && usage ? usage.today / balance.daily_limit : undefined;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader title="Billing" description="Credits, usage, and account activity. One credit = one execution attempt." />

      {balanceLoading && !balance ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : balance ? (
        <BalanceHero balance={balance} />
      ) : (
        <SectionCard><p className="text-sm text-foreground/60">Failed to load billing information.</p></SectionCard>
      )}

      {/* Usage metrics */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        <MetricCard
          icon={Activity}
          label="Executions today"
          value={loading || !usage ? "—" : `${formatNumber(usage.today)}`}
          progress={dailyQuota}
          sub={balance ? `of ${formatCompact(balance.daily_limit)}/day free limit` : undefined}
        />
        <MetricCard
          icon={TrendingDown}
          label="Last 7 days"
          value={loading || !usage ? "—" : `${formatNumber(usage.last7)}${usage.coversWindow ? "" : "+"}`}
          sub="executions"
        />
        <MetricCard
          icon={CalendarDays}
          label="Plan"
          value={balance ? (balance.plan === "paid" ? "Paid" : "Free") : "—"}
          sub={balance ? `${formatCompact(balance.credits_per_dollar)} credits / $1` : undefined}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Usage chart */}
      <SectionCard title="Usage" description={usage?.coversWindow ? "Executions per day, last 14 days" : "Recent execution activity, per day"}>
        {loading || !usage ? (
          <Skeleton className="h-28 w-full" />
        ) : usage.daily.every((v) => v === 0) ? (
          <Empty icon={Activity} title="No executions yet" description="Usage will chart here as your jobs run." />
        ) : (
          <MiniBars
            height={120}
            bars={usage.daily.map((v, i) => {
              const day = new Date(now! - (13 - i) * DAY);
              return { value: v, label: `${format(day, "MMM d")} · ${v} exec` };
            })}
          />
        )}
      </SectionCard>

      {/* Beta note (paid top-ups not yet enabled) */}
      <SectionCard title="Add credits">
        <p className="text-sm text-foreground/62">
          Paid top-ups are coming soon. During the beta you get{" "}
          <span className="text-foreground/80">{balance ? formatCompact(balance.daily_limit) : "100,000"} free credits per day</span> — no card required.
        </p>
      </SectionCard>

      {/* Transaction history */}
      <SectionCard
        title="Transaction history"
        description="All credit activity on your account."
        noPadding
        footer={
          cursor ? (
            <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore} className="text-foreground/70 hover:text-foreground">
              {loadingMore ? "Loading…" : "Load more"}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <div className="divide-y divide-foreground/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Empty icon={Coins} title="Couldn't load transactions" description={error} action={
            <Button size="sm" variant="outline" className="border-foreground/10" onClick={loadInitial}>Try again</Button>
          } />
        ) : txns.length === 0 ? (
          <Empty icon={Coins} title="No transactions yet" description="Daily grants and executions will appear here." />
        ) : (
          <div className="divide-y divide-foreground/5">
            {txns.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
