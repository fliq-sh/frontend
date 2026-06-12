"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInMilliseconds } from "date-fns";
import { Eye } from "lucide-react";
import { useApi, createJobsApi, Job, JobAttempt } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill, RelativeTime } from "./ui";
import { httpStatusTone } from "@/lib/dashboard";

function formatDuration(a: JobAttempt): string {
  if (!a.completed_at) return "running";
  const ms = differenceInMilliseconds(new Date(a.completed_at), new Date(a.started_at));
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * The attempt history for a single job. Used in both the desktop expanded row
 * and the mobile job card, so it stays layout-agnostic (a vertical list, not a
 * table). Fetches lazily on mount (i.e. when the parent expands it).
 */
export function AttemptsPanel({ job }: { job: Job }) {
  const { apiFetch } = useApi();
  const [attempts, setAttempts] = useState<JobAttempt[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = createJobsApi(apiFetch);
    api
      .listAttempts(job.id)
      .then((data) => setAttempts(data ?? []))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id]);

  return (
    <div className="flex flex-col gap-2 bg-foreground/[0.015] px-4 py-3 sm:px-5">
      {job.webhook_url && (
        <p className="text-xs text-foreground/40">
          <span className="font-medium uppercase tracking-wider text-foreground/30">Webhook</span>{" "}
          <span className="font-mono text-foreground/55">{job.webhook_url}</span>
        </p>
      )}

      {loading ? (
        <Skeleton className="h-5 w-48" />
      ) : !attempts || attempts.length === 0 ? (
        <p className="py-1 text-xs text-foreground/35">No attempts yet — this job hasn&apos;t run.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {attempts.map((a) => {
            const tone = httpStatusTone(a.status_code);
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-foreground/5 bg-foreground/[0.02] px-3 py-2 text-xs"
              >
                <span className="font-mono text-foreground/50">#{a.attempt_num}</span>
                {a.status_code ? (
                  <StatusPill tone={tone} label={`HTTP ${a.status_code}`} />
                ) : (
                  <StatusPill tone="neutral" label="no response" />
                )}
                <span className="text-foreground/45">{formatDuration(a)}</span>
                <RelativeTime date={a.started_at} className="text-foreground/35" />
                {a.error && (
                  <span className="min-w-0 flex-1 truncate text-red-400/80" title={a.error}>
                    {a.error}
                  </span>
                )}
                <Link
                  href={`/app/jobs/${job.id}/attempts/${a.id}`}
                  className="ml-auto inline-flex items-center gap-1 text-foreground/40 transition-colors hover:text-foreground"
                  title="View attempt details"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Details</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
