"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Zap,
  CalendarClock,
  Layers,
  Coins,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  useApi,
  createJobsApi,
  createSchedulesApi,
  createBuffersApi,
  createBillingApi,
  Job,
  Schedule,
  Buffer,
  CreditTransaction,
} from "@/lib/api";
import { useBalance } from "./BalanceContext";
import { usePoll } from "@/hooks/use-poll";
import {
  PageHeader,
  MetricCard,
  SectionCard,
  SectionLink,
  Sparkline,
  MiniBars,
  StatusPill,
  RelativeTime,
  RefreshControls,
  Empty,
} from "./ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { jobStatusTone, type Tone } from "@/components/patterns";
import {
  formatNumber,
  formatCompact,
  formatPercent,
  bucketByTime,
  countSince,
  startOfTodayLocal,
} from "@/lib/dashboard";

const HOUR = 60 * 60 * 1000;
const TX_SAMPLE = 250;

interface OverviewData {
  jobs: Job[];
  schedules: Schedule[];
  buffers: Buffer[];
  txns: CreditTransaction[];
  txnCapped: boolean;
  /** Wall-clock at fetch time — captured here (an event, not render) so the
   *  derived time windows stay pure/stable across re-renders. */
  now: number;
}

export default function OverviewDashboard() {
  const { apiFetch } = useApi();
  const { balance } = useBalance();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(true);

  const load = useCallback(async () => {
    const jobsApi = createJobsApi(apiFetch);
    const schedulesApi = createSchedulesApi(apiFetch);
    const buffersApi = createBuffersApi(apiFetch);
    const billingApi = createBillingApi(apiFetch);
    try {
      const [jobs, schedules, buffers, txns] = await Promise.all([
        jobsApi.list({ limit: 50 }).then((r) => r.jobs ?? []).catch(() => []),
        schedulesApi.list({ limit: 100 }).then((r) => r.schedules ?? []).catch(() => []),
        buffersApi.list({ limit: 100 }).then((r) => r.buffers ?? []).catch(() => []),
        billingApi.listTransactions({ limit: TX_SAMPLE }).then((r) => r.transactions ?? []).catch(() => []),
      ]);
      setData({ jobs, schedules, buffers, txns, txnCapped: txns.length >= TX_SAMPLE, now: Date.now() });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  usePoll(load, 30_000, auto);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <PageHeader
        title="Overview"
        description="Your scheduling activity at a glance."
        actions={
          <>
            <RefreshControls onRefresh={load} loading={loading} auto={auto} onToggleAuto={setAuto} />
            <Button asChild size="sm">
              <Link href="/app/jobs">
                <Plus className="h-3.5 w-3.5" />
                New job
              </Link>
            </Button>
          </>
        }
      />

      {loading && !data ? (
        <OverviewSkeleton />
      ) : data ? (
        <OverviewBody data={data} balanceCredits={balance?.balance ?? null} dailyLimit={balance?.daily_limit ?? null} plan={balance?.plan ?? null} />
      ) : null}
    </div>
  );
}

function OverviewBody({
  data,
  balanceCredits,
  dailyLimit,
  plan,
}: {
  data: OverviewData;
  balanceCredits: number | null;
  dailyLimit: number | null;
  plan: string | null;
}) {
  const { jobs, schedules, buffers, txns, txnCapped, now } = data;

  // Executions are derived from credit transactions (1 job_execution = 1 credit).
  const executions = txns.filter((t) => t.type === "job_execution");
  const startToday = startOfTodayLocal(now);
  const oldestTxTime = txns.length ? new Date(txns[txns.length - 1].created_at).getTime() : now;
  // Full coverage = we fetched the entire window (didn't hit the sample cap, or
  // the oldest sampled txn predates the window boundary).
  const coversToday = !txnCapped || oldestTxTime <= startToday;
  const covers24h = !txnCapped || oldestTxTime <= now - 24 * HOUR;

  const execToday = countSince(executions, (e) => e.created_at, startToday);
  const exec24h = countSince(executions, (e) => e.created_at, now - 24 * HOUR);
  const hourly = bucketByTime(executions, (e) => e.created_at, { buckets: 24, windowMs: 24 * HOUR, now });

  // Success rate over the recent jobs page (finished jobs only).
  const finished = jobs.filter((j) => j.status === "completed" || j.status === "failed");
  const succeeded = jobs.filter((j) => j.status === "completed").length;
  const successRate = finished.length ? succeeded / finished.length : NaN;
  const successTone: Tone = !finished.length
    ? "neutral"
    : successRate >= 0.95
      ? "success"
      : successRate >= 0.8
        ? "warning"
        : "danger";

  const activeSchedules = schedules.filter((s) => !s.paused).length;
  const activeBuffers = buffers.filter((b) => !b.paused).length;
  const pendingJobs = jobs.filter((j) => j.status === "pending").length;
  const runningJobs = jobs.filter((j) => j.status === "running").length;

  const quota = dailyLimit && dailyLimit > 0 ? execToday / dailyLimit : undefined;

  const recentJobs = jobs.slice(0, 6);
  const upcoming = schedules
    .filter((s) => !s.paused && s.next_run_at)
    .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime())
    .slice(0, 6);

  const isEmpty = jobs.length === 0 && schedules.length === 0 && buffers.length === 0;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* Metric row */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        <MetricCard
          icon={Coins}
          label="Credit balance"
          value={balanceCredits == null ? "—" : formatNumber(balanceCredits)}
          href="/app/billing"
          sub={plan ? `${plan === "paid" ? "Paid" : "Free"} plan · 1 credit / execution` : "1 credit / execution"}
        />
        <MetricCard
          icon={Activity}
          label="Executions today"
          value={`${formatNumber(execToday)}${coversToday ? "" : "+"}`}
          progress={quota}
          sub={
            dailyLimit
              ? `of ${formatCompact(dailyLimit)}/day free limit`
              : coversToday
                ? "since midnight"
                : "latest activity (sampled)"
          }
        />
        <MetricCard
          icon={Zap}
          label="Executions · 24h"
          value={`${formatNumber(exec24h)}${covers24h ? "" : "+"}`}
          chart={<Sparkline data={hourly} width={84} height={28} />}
          sub="hourly volume"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Success rate"
          tone={successTone}
          value={finished.length ? formatPercent(successRate) : "—"}
          sub={finished.length ? `last ${finished.length} finished jobs` : "no finished jobs yet"}
        />
      </div>

      {isEmpty ? (
        <SectionCard title="Get started">
          <Empty
            icon={Zap}
            title="Nothing scheduled yet"
            description="Schedule a one-off job, a recurring cron, or push items through a rate-limited buffer."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild size="sm">
                  <Link href="/app/jobs">Schedule a job</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-foreground/10">
                  <Link href="/app/schedules">Create a schedule</Link>
                </Button>
              </div>
            }
          />
        </SectionCard>
      ) : (
        <>
          {/* Execution volume chart + resource summary */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
            <SectionCard
              className="lg:col-span-2"
              title="Execution volume"
              description={covers24h ? "Last 24 hours, hourly" : "Latest execution activity, hourly"}
            >
              {exec24h === 0 ? (
                <Empty icon={Activity} title="No executions in this window" description="Runs will show up here as your jobs fire." />
              ) : (
                <MiniBars
                  height={120}
                  bars={hourly.map((v, i) => {
                    const slotStart = new Date(now - (24 - i) * HOUR);
                    return { value: v, label: `${format(slotStart, "HH:00")} · ${v} exec` };
                  })}
                />
              )}
            </SectionCard>

            <SectionCard title="Resources">
              <div className="flex flex-col divide-y divide-foreground/5">
                <ResourceRow icon={CalendarClock} label="Schedules" href="/app/schedules" primary={`${activeSchedules} active`} secondary={`${schedules.length - activeSchedules} paused`} />
                <ResourceRow icon={Layers} label="Buffers" href="/app/buffers" primary={`${activeBuffers} active`} secondary={`${buffers.length - activeBuffers} paused`} />
                <ResourceRow icon={Zap} label="Jobs in flight" href="/app/jobs" primary={`${runningJobs} running`} secondary={`${pendingJobs} pending`} />
              </div>
            </SectionCard>
          </div>

          {/* Recent jobs + upcoming runs */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
            <SectionCard title="Recent jobs" action={<SectionLink href="/app/jobs">View all →</SectionLink>} noPadding>
              {recentJobs.length === 0 ? (
                <Empty icon={Zap} title="No jobs yet" />
              ) : (
                <ul className="divide-y divide-foreground/5">
                  {recentJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href="/app/jobs"
                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-foreground/[0.03] sm:px-6"
                      >
                        <StatusPill tone={jobStatusTone(job.status)} label={job.status} pulse={job.status === "running"} />
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/60">{job.url}</span>
                        <RelativeTime date={job.created_at} className="shrink-0 text-xs text-foreground/35" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Upcoming runs" action={<SectionLink href="/app/schedules">Schedules →</SectionLink>} noPadding>
              {upcoming.length === 0 ? (
                <Empty icon={CalendarClock} title="No upcoming runs" description="Active schedules will list their next fire time here." />
              ) : (
                <ul className="divide-y divide-foreground/5">
                  {upcoming.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-foreground/30" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground/80">{s.name}</p>
                        <p className="truncate font-mono text-[11px] text-foreground/35">{s.cron_expr}</p>
                      </div>
                      <RelativeTime date={s.next_run_at} className="shrink-0 text-xs text-foreground/50" />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

function ResourceRow({
  icon: Icon,
  label,
  href,
  primary,
  secondary,
}: {
  icon: typeof Zap;
  label: string;
  href: string;
  primary: string;
  secondary: string;
}) {
  return (
    <Link href={href} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5">
        <Icon className="h-4 w-4 text-foreground/50" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        <p className="text-xs text-foreground/40">
          {primary} · {secondary}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-foreground/20 transition-colors group-hover:text-foreground/50" />
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
