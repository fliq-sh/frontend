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
  Timer,
  AlertTriangle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  useApi,
  createJobsApi,
  createSchedulesApi,
  createBuffersApi,
  createStatsApi,
  Job,
  Schedule,
  Buffer,
  JobStats,
  UsageSummary,
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
import { TestJobButton } from "./TestJobButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { jobStatusTone, type Tone } from "@/components/patterns";
import { formatNumber, formatCompact, formatPercent } from "@/lib/dashboard";

const STATS_DAYS = 14;

interface OverviewData {
  jobs: Job[];
  schedules: Schedule[];
  buffers: Buffer[];
  jobStats: JobStats | null;
  usage: UsageSummary | null;
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
    const statsApi = createStatsApi(apiFetch);
    try {
      const [jobs, schedules, buffers, jobStats, usage] = await Promise.all([
        jobsApi.list({ limit: 50 }).then((r) => r.jobs ?? []).catch(() => []),
        schedulesApi.list({ limit: 100 }).then((r) => r.schedules ?? []).catch(() => []),
        buffersApi.list({ limit: 100 }).then((r) => r.buffers ?? []).catch(() => []),
        statsApi.jobs(STATS_DAYS).catch(() => null),
        statsApi.usage(STATS_DAYS).catch(() => null),
      ]);
      setData({ jobs, schedules, buffers, jobStats, usage });
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
        <OverviewBody
          data={data}
          balanceCredits={balance?.balance ?? null}
          dailyLimit={balance?.daily_limit ?? null}
          plan={balance?.plan ?? null}
          onReload={load}
        />
      ) : null}
    </div>
  );
}

function OverviewBody({
  data,
  balanceCredits,
  dailyLimit,
  plan,
  onReload,
}: {
  data: OverviewData;
  balanceCredits: number | null;
  dailyLimit: number | null;
  plan: string | null;
  onReload: () => void;
}) {
  const { jobs, schedules, buffers, jobStats, usage } = data;

  // Daily execution volume (job + buffer) straight from the server, oldest → newest.
  const buckets = usage?.buckets ?? [];
  const daily = buckets.map((b) => b.job_executions + b.buffer_executions);
  // The last bucket is today (UTC). Server windows always end "today".
  const execToday = daily.length ? daily[daily.length - 1] : 0;
  const execWindow = (usage?.total_job_executions ?? 0) + (usage?.total_buffer_executions ?? 0);

  // Success rate + p95 from /stats/jobs (real window, not a last-N proxy).
  const successRate = jobStats && jobStats.total_executions > 0 ? jobStats.success_rate : NaN;
  const successTone: Tone = !jobStats || jobStats.total_executions === 0
    ? "neutral"
    : successRate >= 0.95
      ? "success"
      : successRate >= 0.8
        ? "warning"
        : "danger";
  const failedInWindow = jobStats?.failed ?? 0;

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
          value={formatNumber(execToday)}
          progress={quota}
          sub={dailyLimit ? `of ${formatCompact(dailyLimit)}/day free limit` : "executions (UTC day)"}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Success rate"
          tone={successTone}
          value={jobStats && jobStats.total_executions > 0 ? formatPercent(successRate) : "—"}
          sub={jobStats && jobStats.total_executions > 0
            ? `${formatCompact(jobStats.total_executions)} executions · ${jobStats.since_days}d`
            : "no executions yet"}
        />
        <MetricCard
          icon={Timer}
          label="p95 duration"
          value={jobStats && jobStats.total_executions > 0 ? `${formatNumber(jobStats.p95_duration_ms)}ms` : "—"}
          sub={jobStats && jobStats.total_executions > 0
            ? `avg ${formatNumber(jobStats.avg_duration_ms)}ms · ${jobStats.since_days}d`
            : "response time"}
        />
      </div>

      {isEmpty ? (
        <SectionCard title="Get started">
          <Empty
            icon={Zap}
            title="Nothing scheduled yet"
            description="Fire a real test job in one click and watch it run end-to-end — no token, no curl. Or schedule your own."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <TestJobButton onScheduled={onReload} />
                <Button asChild size="sm" variant="outline" className="border-foreground/10">
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
          {failedInWindow > 0 && (
            <Link
              href="/app/failures"
              className="group flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-5 py-3.5 transition-colors hover:bg-red-500/[0.1]"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="min-w-0 flex-1 text-sm text-foreground/85">
                <span className="font-medium text-foreground">{formatNumber(failedInWindow)}</span> permanent
                {" "}failure{failedInWindow === 1 ? "" : "s"} in the last {jobStats?.since_days ?? STATS_DAYS} days.
                {" "}Review and replay them.
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-red-400/70 transition-colors group-hover:text-red-400" />
            </Link>
          )}

          {/* Execution volume chart + resource summary */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
            <SectionCard
              className="lg:col-span-2"
              title="Execution volume"
              description={`Last ${usage?.since_days ?? STATS_DAYS} days, per day`}
              action={daily.length ? <Sparkline data={daily} width={96} height={24} /> : undefined}
            >
              {execWindow === 0 ? (
                <Empty icon={Activity} title="No executions in this window" description="Runs will show up here as your jobs fire." />
              ) : (
                <MiniBars
                  height={120}
                  bars={buckets.map((b) => ({
                    value: b.job_executions + b.buffer_executions,
                    label: `${format(new Date(`${b.date}T00:00:00Z`), "MMM d")} · ${b.job_executions + b.buffer_executions} exec`,
                  }))}
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
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/75">{job.url}</span>
                        <RelativeTime date={job.created_at} className="shrink-0 text-xs text-foreground/58" />
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
                      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-foreground/50" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground/85">{s.name}</p>
                        <p className="truncate font-mono text-[11px] text-foreground/58">{s.cron_expr}</p>
                      </div>
                      <RelativeTime date={s.next_run_at} className="shrink-0 text-xs text-foreground/68" />
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
        <Icon className="h-4 w-4 text-foreground/68" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground/85">{label}</p>
        <p className="text-xs text-foreground/60">
          {primary} · {secondary}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-foreground/45 transition-colors group-hover:text-foreground/68" />
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
