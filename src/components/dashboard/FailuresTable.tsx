"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Zap,
  Layers,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  useApi,
  createJobsApi,
  createBuffersApi,
  Job,
  Buffer,
  BufferItem,
} from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PageHeader,
  SectionCard,
  StatusPill,
  MethodChip,
  RefreshControls,
  RelativeTime,
  Empty,
} from "./ui";
import { httpStatusTone, formatNumber } from "@/lib/dashboard";

// A unified failure — either a permanently-failed one-off job or a failed
// buffer item. Both expose the same display shape so the merged list is simple.
interface Failure {
  kind: "job" | "buffer";
  /** Stable key (the resource id). */
  id: string;
  /** For buffer items, the parent buffer id. */
  bufferId?: string;
  /** What the row links to + a short context label. */
  href: string;
  context: string; // e.g. the URL or "Buffer · <name>"
  method?: string;
  statusCode: number | null;
  lastError: string | null;
  attempts: number; // attempts made
  maxAttempts: number; // total allowed
  /** Set when this failure was already replayed — the source id. */
  replayOf: string | null;
  createdAt: string;
  failedAt: string; // sort key, newest first
}

// ─── Data loading ────────────────────────────────────────────────────────────

async function loadFailures(
  apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>,
): Promise<Failure[]> {
  const jobsApi = createJobsApi(apiFetch);
  const buffersApi = createBuffersApi(apiFetch);

  const [failedJobs, buffers] = await Promise.all([
    jobsApi.list({ status: "failed", limit: 100 }).then((r) => r.jobs ?? []).catch(() => []),
    buffersApi.list({ limit: 100 }).then((r) => r.buffers ?? []).catch(() => []),
  ]);

  // For each failed job, pull its last attempt to surface status code + error.
  const jobFailures = await Promise.all(
    failedJobs.map(async (job): Promise<Failure> => {
      let statusCode: number | null = null;
      let lastError: string | null = null;
      try {
        const attempts = await jobsApi.listAttempts(job.id);
        const last = (attempts ?? []).reduce<typeof attempts[number] | null>(
          (acc, a) => (acc && acc.attempt_num >= a.attempt_num ? acc : a),
          null,
        );
        statusCode = last?.status_code ?? null;
        lastError = last?.error ?? null;
      } catch {
        // best-effort — the row still renders without the last attempt detail
      }
      return jobToFailure(job, statusCode, lastError);
    }),
  );

  // Failed buffer items, per buffer.
  const bufferFailures = (
    await Promise.all(
      buffers.map((buffer) =>
        buffersApi
          .listItems(buffer.id, { status: "failed", limit: 100 })
          .then((r) => (r.items ?? []).map((it) => itemToFailure(it, buffer)))
          .catch(() => [] as Failure[]),
      ),
    )
  ).flat();

  return [...jobFailures, ...bufferFailures].sort(
    (a, b) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime(),
  );
}

function jobToFailure(job: Job, statusCode: number | null, lastError: string | null): Failure {
  return {
    kind: "job",
    id: job.id,
    href: "/app/jobs",
    context: job.url,
    method: job.method,
    statusCode,
    lastError,
    attempts: job.attempts,
    maxAttempts: job.max_retries + 1,
    replayOf: job.replay_of ?? null,
    createdAt: job.created_at,
    failedAt: job.completed_at ?? job.updated_at ?? job.created_at,
  };
}

function itemToFailure(item: BufferItem, buffer: Buffer): Failure {
  return {
    kind: "buffer",
    id: item.id,
    bufferId: buffer.id,
    href: "/app/buffers",
    context: `${buffer.name} · ${buffer.url}`,
    method: buffer.method,
    statusCode: item.status_code,
    lastError: item.last_error,
    attempts: item.retry_count + 1,
    maxAttempts: item.max_retries + 1,
    replayOf: item.replay_of ?? null,
    createdAt: item.created_at,
    failedAt: item.completed_at ?? item.created_at,
  };
}

// ─── Bulk replay dialog ──────────────────────────────────────────────────────

function BulkReplayDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  count: number;
  onConfirm: () => Promise<void>;
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setWorking(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Some replays failed");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!working) { onOpenChange(v); if (!v) setError(null); } }}>
      <DialogContent className="theme-warm bg-popover text-foreground border-foreground/10 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Replay {count} failure{count === 1 ? "" : "s"}?</DialogTitle>
          <DialogDescription className="text-foreground/68">
            Each is re-scheduled as a fresh execution and passes the credit gate — about{" "}
            <span className="font-medium text-foreground/85">{formatNumber(count)} credit{count === 1 ? "" : "s"}</span>{" "}
            (1 per execution, plus any retries). Already-replayed items are skipped.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="border-foreground/10" onClick={() => onOpenChange(false)} disabled={working}>
            Cancel
          </Button>
          <Button onClick={run} disabled={working}>
            {working ? "Replaying…" : `Replay ${count}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Replayed badge ──────────────────────────────────────────────────────────

function ReplayedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-300">
      <CheckCircle2 className="h-3 w-3" />
      Replayed
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function FailuresTable() {
  const { apiFetch } = useApi();
  const [failures, setFailures] = useState<Failure[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replaying, setReplaying] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadFailures(apiFetch);
      setFailures(next);
      // Drop selections that no longer exist (e.g. replayed & cleared).
      setSelected((prev) => {
        const ids = new Set(next.map((f) => f.id));
        return new Set([...prev].filter((id) => ids.has(id)));
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  usePoll(load, 20_000, auto);

  // Only un-replayed failures are eligible for replay (avoid double-replay).
  const replayable = useMemo(
    () => (failures ?? []).filter((f) => !f.replayOf),
    [failures],
  );

  const selectedReplayable = useMemo(
    () => replayable.filter((f) => selected.has(f.id)),
    [replayable, selected],
  );

  // The bulk action targets the selection, or all replayable when nothing is picked.
  const bulkTargets = selectedReplayable.length > 0 ? selectedReplayable : replayable;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === replayable.length && replayable.length > 0
        ? new Set()
        : new Set(replayable.map((f) => f.id)),
    );
  }

  async function replayOne(f: Failure) {
    setReplaying((prev) => new Set(prev).add(f.id));
    try {
      if (f.kind === "job") await createJobsApi(apiFetch).replay(f.id);
      else if (f.bufferId) await createBuffersApi(apiFetch).replayItem(f.bufferId, f.id);
      await load();
    } finally {
      setReplaying((prev) => {
        const next = new Set(prev);
        next.delete(f.id);
        return next;
      });
    }
  }

  async function replayBulk() {
    const jobsApi = createJobsApi(apiFetch);
    const buffersApi = createBuffersApi(apiFetch);
    const errors: string[] = [];
    for (const f of bulkTargets) {
      try {
        if (f.kind === "job") await jobsApi.replay(f.id);
        else if (f.bufferId) await buffersApi.replayItem(f.bufferId, f.id);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "replay failed");
      }
    }
    setSelected(new Set());
    await load();
    if (errors.length) throw new Error(`${errors.length} replay${errors.length === 1 ? "" : "s"} failed`);
  }

  const isEmpty = !loading && failures !== null && failures.length === 0;
  const allSelected = replayable.length > 0 && selected.size === replayable.length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Failures"
        description="Everything that exhausted its retries — failed jobs and buffer items in one place. Fix your endpoint, then replay."
        actions={
          <>
            <RefreshControls onRefresh={load} loading={loading} auto={auto} onToggleAuto={setAuto} />
            <Button
              size="sm"
              disabled={bulkTargets.length === 0}
              onClick={() => setBulkOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {selectedReplayable.length > 0 ? `Replay selected (${selectedReplayable.length})` : `Replay all (${replayable.length})`}
            </Button>
          </>
        }
      />

      <BulkReplayDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        count={bulkTargets.length}
        onConfirm={replayBulk}
      />

      {loading && failures === null ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isEmpty ? (
        <SectionCard noPadding>
          <Empty
            icon={CheckCircle2}
            title="Nothing has permanently failed"
            description="When a job or buffer item gives up after exhausting its retries, it lands here so you can replay it."
          />
        </SectionCard>
      ) : (
        <>
          <p className="text-xs text-foreground/58">
            {failures!.length} failure{failures!.length === 1 ? "" : "s"} · {replayable.length} replayable
          </p>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-foreground/10 hover:bg-transparent">
                  <TableHead className="w-10 pl-4">
                    <input
                      type="checkbox"
                      aria-label="Select all replayable failures"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                  </TableHead>
                  <TableHead className="text-foreground/60">Resource</TableHead>
                  <TableHead className="text-foreground/60">Last result</TableHead>
                  <TableHead className="text-foreground/60">Error</TableHead>
                  <TableHead className="text-foreground/60">Attempts</TableHead>
                  <TableHead className="text-foreground/60">Failed</TableHead>
                  <TableHead className="text-right text-foreground/60">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failures!.map((f) => (
                  <TableRow key={`${f.kind}-${f.id}`} className="border-foreground/10 hover:bg-foreground/[0.03]">
                    <TableCell className="pl-4">
                      <input
                        type="checkbox"
                        aria-label="Select failure"
                        disabled={!!f.replayOf}
                        checked={selected.has(f.id)}
                        onChange={() => toggleSelect(f.id)}
                        className="h-3.5 w-3.5 accent-primary disabled:opacity-30"
                      />
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="flex items-center gap-2">
                        {f.kind === "job" ? (
                          <Zap className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
                        ) : (
                          <Layers className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
                        )}
                        {f.method && <MethodChip method={f.method} />}
                        <span className="truncate text-sm text-foreground/85" title={f.context}>{f.context}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {f.statusCode != null ? (
                        <StatusPill tone={httpStatusTone(f.statusCode)} label={`HTTP ${f.statusCode}`} />
                      ) : (
                        <StatusPill tone="danger" label="no response" />
                      )}
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <span className="block truncate text-xs text-red-400/80" title={f.lastError ?? undefined}>
                        {f.lastError ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-foreground/70">
                      {f.attempts}/{f.maxAttempts}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      <RelativeTime date={f.failedAt} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {f.replayOf ? (
                          <ReplayedBadge />
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={replaying.has(f.id)}
                            className="gap-1.5 text-foreground/75 hover:text-foreground"
                            onClick={() => replayOne(f)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {replaying.has(f.id) ? "Replaying…" : "Replay"}
                          </Button>
                        )}
                        <Link
                          href={f.href}
                          className="inline-flex items-center text-foreground/45 transition-colors hover:text-foreground"
                          title={f.kind === "job" ? "View in Jobs" : "View in Buffers"}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {failures!.map((f) => (
              <div key={`${f.kind}-${f.id}`} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    aria-label="Select failure"
                    disabled={!!f.replayOf}
                    checked={selected.has(f.id)}
                    onChange={() => toggleSelect(f.id)}
                    className="mt-1 h-3.5 w-3.5 accent-primary disabled:opacity-30"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {f.statusCode != null ? (
                        <StatusPill tone={httpStatusTone(f.statusCode)} label={`HTTP ${f.statusCode}`} />
                      ) : (
                        <StatusPill tone="danger" label="no response" />
                      )}
                      {f.method && <MethodChip method={f.method} />}
                      <span className="text-[11px] uppercase tracking-wider text-foreground/45">{f.kind}</span>
                    </div>
                    <p className="truncate font-mono text-xs text-foreground/80" title={f.context}>{f.context}</p>
                    {f.lastError && <p className="mt-1 line-clamp-2 text-[11px] text-red-400/80">{f.lastError}</p>}
                    <p className="mt-1 text-[11px] text-foreground/58">
                      {f.attempts}/{f.maxAttempts} attempts · failed <RelativeTime date={f.failedAt} />
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {f.replayOf ? (
                        <ReplayedBadge />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={replaying.has(f.id)}
                          className="gap-1.5 text-foreground/75 hover:text-foreground"
                          onClick={() => replayOne(f)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {replaying.has(f.id) ? "Replaying…" : "Replay"}
                        </Button>
                      )}
                      <Link href={f.href} className="inline-flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground">
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
