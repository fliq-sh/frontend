"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { useApi, createJobsApi, Job, JobAttempt } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Execution extends JobAttempt {
  job_url: string;
}

export default function ExecutionsTable() {
  const { apiFetch } = useApi();
  const api = createJobsApi(apiFetch);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { jobs } = await api.list({ limit: 20 });
      const recentJobs = (jobs ?? []).slice(0, 10);

      const attemptSets = await Promise.allSettled(
        recentJobs.map(async (job: Job) => {
          const attempts = await api.listAttempts(job.id);
          return (attempts ?? []).map((a: JobAttempt) => ({ ...a, job_url: job.url }));
        }),
      );

      const all: Execution[] = attemptSets
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .sort(
          (a, b) =>
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
        );

      setExecutions(all.slice(0, 100));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Executions</h2>
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40">Job ID</TableHead>
              <TableHead className="text-white/40">URL</TableHead>
              <TableHead className="text-white/40">Attempt #</TableHead>
              <TableHead className="text-white/40">Worker</TableHead>
              <TableHead className="text-white/40">Started</TableHead>
              <TableHead className="text-white/40">Duration</TableHead>
              <TableHead className="text-white/40">HTTP</TableHead>
              <TableHead className="text-white/40">Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : executions.length === 0
              ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={8} className="text-center text-white/40 py-12">
                      No executions yet.
                    </TableCell>
                  </TableRow>
                )
              : executions.map((ex) => {
                  const duration = ex.completed_at
                    ? `${differenceInSeconds(new Date(ex.completed_at), new Date(ex.started_at))}s`
                    : ex.completed_at === null
                    ? "in progress"
                    : "—";

                  return (
                    <TableRow key={ex.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono text-xs text-white/60">
                        {ex.job_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm">
                        {ex.job_url}
                      </TableCell>
                      <TableCell className="text-sm">{ex.attempt_num}</TableCell>
                      <TableCell className="font-mono text-xs text-white/60 max-w-[80px] truncate">
                        {ex.worker_id}
                      </TableCell>
                      <TableCell className="text-sm text-white/60">
                        {formatDistanceToNow(new Date(ex.started_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-sm text-white/60">{duration}</TableCell>
                      <TableCell>
                        {ex.http_status !== null && (
                          <Badge
                            variant={
                              ex.http_status >= 200 && ex.http_status < 300
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {ex.http_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs text-red-400">
                        {ex.error ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
