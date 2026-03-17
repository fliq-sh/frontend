"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  useApi,
  createBillingApi,
  BillingBalance,
  CreditTransaction,
  CreditTxType,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRESETS = [1, 5, 25, 100] as const;

function formatCredits(n: number) {
  return new Intl.NumberFormat().format(n);
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function txTypeBadge(type: CreditTxType) {
  switch (type) {
    case "stripe_topup":
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Top-up
        </span>
      );
    case "daily_grant":
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          Daily grant
        </span>
      );
    case "job_execution":
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-white/5 text-white/50 border border-white/10">
          Execution
        </span>
      );
  }
}

// ─── Balance card ─────────────────────────────────────────────────────────────

function BalanceCard({ balance }: { balance: BillingBalance }) {
  const usdEquivalent = balance.credits_per_dollar > 0
    ? balance.balance / balance.credits_per_dollar
    : 0;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/40 mb-1">Current balance</p>
          <p className="text-4xl font-semibold tracking-tight">
            {formatCredits(balance.balance)}
          </p>
          <p className="text-sm text-white/40 mt-1">credits</p>
          <p className="text-sm text-white/60 mt-2">
            ≈ {formatUsd(usdEquivalent)} equivalent
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {balance.plan === "paid" ? (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Paid
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/10 text-white/60 border border-white/10">
              Free
            </span>
          )}
          <p className="text-xs text-white/30">
            {formatCredits(balance.daily_limit)} / day limit
          </p>
        </div>
      </div>
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 animate-pulse">
      <div className="h-4 w-28 rounded bg-white/10 mb-3" />
      <div className="h-10 w-48 rounded bg-white/10 mb-2" />
      <div className="h-4 w-16 rounded bg-white/10 mb-3" />
      <div className="h-4 w-32 rounded bg-white/10" />
    </div>
  );
}

// ─── Top-up section ───────────────────────────────────────────────────────────

function TopUpSection({ creditsPerDollar }: { creditsPerDollar: number }) {
  const { apiFetch } = useApi();
  const api = createBillingApi(apiFetch);

  const [selected, setSelected] = useState<number | null>(5);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dollarAmount = custom !== "" ? parseFloat(custom) : selected ?? 0;
  const creditPreview =
    dollarAmount > 0 ? Math.round(dollarAmount * creditsPerDollar) : 0;

  async function handleCheckout() {
    if (dollarAmount < 0.5) {
      setError("Minimum top-up amount is $0.50.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credits = Math.round(dollarAmount * creditsPerDollar);
      const { url } = await api.createCheckout(credits);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-5">
      <div>
        <h3 className="font-medium">Add credits</h3>
        <p className="text-sm text-white/40 mt-0.5">
          {formatCredits(creditsPerDollar)} credits per dollar. One credit = one job execution.
        </p>
      </div>

      {/* Preset amounts */}
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((amount) => {
          const isSelected = custom === "" && selected === amount;
          return (
            <button
              key={amount}
              onClick={() => {
                setSelected(amount);
                setCustom("");
                setError(null);
              }}
              className={cn(
                "rounded-lg border px-3 py-3 text-center transition-colors",
                isSelected
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
              )}
            >
              <p className={cn("text-base font-semibold", isSelected ? "text-white" : "text-white/80")}>
                ${amount}
              </p>
              <p className={cn("text-xs mt-0.5", isSelected ? "text-indigo-300" : "text-white/40")}>
                {formatCredits(amount * creditsPerDollar)} credits
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom amount */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-white/50">Custom amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">$</span>
          <input
            type="number"
            min="0.50"
            step="0.01"
            placeholder="0.00"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(null);
              setError(null);
            }}
            className="w-full rounded-md border border-white/10 bg-white/5 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder:text-white/20"
          />
        </div>
        {dollarAmount > 0 && (
          <p className="text-xs text-white/40">
            = {formatCredits(creditPreview)} credits
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        onClick={handleCheckout}
        disabled={loading || dollarAmount < 0.5}
        className="w-full"
      >
        {loading ? "Redirecting to checkout…" : "Continue to Checkout"}
      </Button>
    </div>
  );
}

function TopUpSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 animate-pulse">
      <div className="h-5 w-32 rounded bg-white/10 mb-2" />
      <div className="h-4 w-64 rounded bg-white/10 mb-5" />
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="h-10 w-full rounded bg-white/10" />
    </div>
  );
}

// ─── Transaction history ──────────────────────────────────────────────────────

function TransactionHistory() {
  const { apiFetch } = useApi();
  const api = createBillingApi(apiFetch);

  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTransactions({ limit: 20 });
      setTransactions(res.transactions ?? []);
      setNextCursor(res.next_cursor);
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

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await api.listTransactions({ cursor: nextCursor, limit: 20 });
      setTransactions((prev) => [...prev, ...(res.transactions ?? [])]);
      setNextCursor(res.next_cursor);
    } catch {
      // silently fail — user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="font-medium">Transaction history</h3>
        <p className="text-sm text-white/40 mt-0.5">All credit activity on your account.</p>
      </div>

      {loading ? (
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 animate-pulse">
              <div className="h-5 w-20 rounded-full bg-white/10" />
              <div className="flex-1 h-4 w-32 rounded bg-white/10" />
              <div className="h-4 w-16 rounded bg-white/10" />
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            className="text-xs text-white/40 hover:text-white/60 mt-2 underline underline-offset-2"
            onClick={loadInitial}
          >
            Try again
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-white/30">No transactions yet.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/40 font-medium pl-6">Type</TableHead>
                <TableHead className="text-white/40 font-medium">Description</TableHead>
                <TableHead className="text-white/40 font-medium text-right">Amount</TableHead>
                <TableHead className="text-white/40 font-medium text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="pl-6">{txTypeBadge(tx.type)}</TableCell>
                  <TableCell className="text-sm text-white/50 max-w-[200px] truncate">
                    {tx.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "text-sm font-mono font-medium",
                        tx.amount >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCredits(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 text-sm text-white/40 whitespace-nowrap">
                    {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {nextCursor && (
            <div className="px-6 py-4 border-t border-white/5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-white/50 hover:text-white/80"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { apiFetch } = useApi();
  const api = createBillingApi(apiFetch);

  const [balance, setBalance] = useState<BillingBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    api
      .getBalance()
      .then(setBalance)
      .catch(() => null)
      .finally(() => setLoadingBalance(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h2 className="text-lg font-semibold">Billing</h2>

      {loadingBalance ? (
        <>
          <BalanceSkeleton />
        </>
      ) : balance ? (
        <>
          <BalanceCard balance={balance} />
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-medium">Add credits</h3>
            <p className="text-sm text-white/40 mt-1">
              Paid top-ups are coming soon. During the beta you get 100,000 free credits per day — no credit card required.
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/40">Failed to load billing information.</p>
        </div>
      )}

      <TransactionHistory />
    </div>
  );
}
