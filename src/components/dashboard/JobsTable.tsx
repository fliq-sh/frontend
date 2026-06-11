"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Settings,
  Zap,
} from "lucide-react";
import {
  useApi,
  createJobsApi,
  Job,
  JobStatus,
} from "@/lib/api";
import { useCursorList } from "@/hooks/use-cursor-list";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiCodeBlock, JOB_SNIPPETS } from "./ApiCodeBlock";
import { AttemptsPanel } from "./AttemptsPanel";
import { EmptyState } from "@/components/patterns";
import { jobStatusTone } from "@/components/patterns";
import {
  PageHeader,
  SectionCard,
  StatusPill,
  MethodChip,
  FilterTabs,
  type FilterTab,
  SearchInput,
  Pagination,
  RefreshControls,
  ConfirmButton,
  RelativeTime,
  Empty,
  Field,
  TextInput,
  Select,
  Textarea,
  FormError,
  parseJsonObject,
} from "./ui";

const STATUS_TABS: FilterTab<JobStatus | "all">[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", tone: "warning" },
  { value: "running", label: "Running", tone: "neutral" },
  { value: "completed", label: "Completed", tone: "success" },
  { value: "failed", label: "Failed", tone: "danger" },
  { value: "cancelled", label: "Cancelled", tone: "danger" },
];

// ─── Create dialog ─────────────────────────────────────────────────────────

function NewJobDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    url: "",
    method: "POST",
    scheduled_at: new Date(Date.now() + 60_000).toISOString().slice(0, 16),
    max_retries: 3,
    timeout_seconds: 30,
    headers: "",
    body: "",
    webhook_url: "",
  });

  function reset() {
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = parseJsonObject(form.headers, "Headers");
      const api = createJobsApi(apiFetch);
      await api.create({
        url: form.url,
        method: form.method,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        max_retries: form.max_retries,
        timeout_seconds: form.timeout_seconds,
        headers,
        body: form.body || undefined,
        webhook_url: form.webhook_url || undefined,
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">Schedule job</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-foreground/10 theme-warm bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle>Schedule a job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <FormError message={error} />
          <Field label="Target URL">
            <TextInput
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method">
              <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Run at" hint="Your local time">
              <TextInput
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max retries">
              <TextInput
                type="number"
                min={0}
                max={20}
                value={form.max_retries}
                onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })}
              />
            </Field>
            <Field label="Timeout" hint="seconds">
              <TextInput
                type="number"
                min={1}
                max={3600}
                value={form.timeout_seconds}
                onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Headers" hint="Optional JSON object">
            <Textarea
              rows={2}
              value={form.headers}
              onChange={(e) => setForm({ ...form, headers: e.target.value })}
              placeholder='{"Authorization": "Bearer …"}'
            />
          </Field>
          <Field label="Body" hint="Optional">
            <Textarea
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder='{"key": "value"}'
            />
          </Field>
          <Field label="Webhook URL" hint="Optional — notified on completion">
            <TextInput
              value={form.webhook_url}
              onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
              placeholder="https://example.com/callback"
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Scheduling…" : "Schedule job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GettingStarted() {
  return (
    <EmptyState
      title="Schedule your first job in 3 steps"
      steps={[
        {
          title: "Create an API token",
          description: "Your token authenticates requests from your code, cron, or Postman.",
          action: (
            <Link href="/app/settings">
              <Button size="sm" variant="outline" className="w-fit gap-1.5 border-foreground/10 hover:bg-foreground/5">
                <Settings className="h-3.5 w-3.5" />
                Settings → API Tokens
              </Button>
            </Link>
          ),
        },
        {
          title: "Schedule a job from your code",
          description: "POST a URL + fire time — Fliq handles delivery, retries, and history.",
          action: <ApiCodeBlock snippets={JOB_SNIPPETS} />,
        },
        {
          title: "Watch it run",
          description: (
            <>
              Jobs appear here with live status, attempt history, and error details. Prefer the UI?
              Hit <span className="text-foreground/70">Schedule job</span> above.
            </>
          ),
        },
      ]}
    />
  );
}

// ─── Shared row bits ───────────────────────────────────────────────────────

function JobActions({ job, onChanged }: { job: Job; onChanged: () => void }) {
  const { apiFetch } = useApi();
  const cancellable = job.status === "pending" || job.status === "running";
  if (!cancellable) return null;
  return (
    <ConfirmButton
      title="Cancel this job?"
      description="It won't run (or, if running, won't retry). This can't be undone."
      confirmLabel="Cancel job"
      onConfirm={async () => {
        await createJobsApi(apiFetch).cancel(job.id);
        onChanged();
      }}
      trigger={
        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
          Cancel
        </Button>
      }
    />
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function JobsTable() {
  const { apiFetch } = useApi();
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [auto, setAuto] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetcher = useCallback(
    async (cursor: string | undefined) => {
      const api = createJobsApi(apiFetch);
      const res = await api.list({ limit: 25, cursor, status: status === "all" ? undefined : status });
      return { items: res.jobs ?? [], nextCursor: res.next_cursor };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status],
  );

  const list = useCursorList<Job>(fetcher, [status]);
  usePoll(list.reload, 10_000, auto);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list.items;
    return list.items.filter((j) => j.url.toLowerCase().includes(q) || j.id.toLowerCase().includes(q));
  }, [list.items, search]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const showGettingStarted = !list.loading && list.items.length === 0 && status === "all" && !list.hasPrev;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Jobs"
        description="One-off HTTP jobs — scheduled, executed, and retried with full history."
        actions={
          <>
            <RefreshControls onRefresh={list.reload} loading={list.loading} auto={auto} onToggleAuto={setAuto} />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-foreground/10 text-foreground/60 hover:text-foreground"
              onClick={() => setShowCode((v) => !v)}
            >
              <Code2 className="h-3.5 w-3.5" />
              API
            </Button>
            <NewJobDialog onCreated={list.reload} />
          </>
        }
      />

      {showCode && <ApiCodeBlock snippets={JOB_SNIPPETS} />}

      {showGettingStarted ? (
        <GettingStarted />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs tabs={STATUS_TABS} value={status} onChange={setStatus} className="sm:max-w-fit" />
            <SearchInput value={search} onChange={setSearch} placeholder="Filter by URL or ID…" className="sm:w-64" />
          </div>

          <p className="text-xs text-foreground/35">
            {list.loading ? "Loading…" : `${filtered.length} job${filtered.length === 1 ? "" : "s"} on this page`}
            {search && " (filtered)"}
          </p>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-foreground/10 hover:bg-transparent">
                  <TableHead className="w-8" />
                  <TableHead className="text-foreground/40">Status</TableHead>
                  <TableHead className="text-foreground/40">Endpoint</TableHead>
                  <TableHead className="text-foreground/40">Scheduled</TableHead>
                  <TableHead className="text-foreground/40">Created</TableHead>
                  <TableHead className="text-foreground/40">Attempts</TableHead>
                  <TableHead className="text-right text-foreground/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-foreground/10">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow className="border-foreground/10 hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <Empty icon={Zap} title="No jobs match" description="Try a different status or clear the search." />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((job) => {
                    const isOpen = expanded.has(job.id);
                    return (
                      <>
                        <TableRow
                          key={job.id}
                          className="cursor-pointer border-foreground/10 hover:bg-foreground/[0.03]"
                          onClick={() => toggle(job.id)}
                        >
                          <TableCell className="pl-3 pr-0 text-foreground/30">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </TableCell>
                          <TableCell>
                            <StatusPill tone={jobStatusTone(job.status)} label={job.status} pulse={job.status === "running"} />
                          </TableCell>
                          <TableCell className="max-w-[280px]">
                            <div className="flex items-center gap-2">
                              <MethodChip method={job.method} />
                              <span className="truncate text-sm text-foreground/80" title={job.url}>{job.url}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground/55">
                            <RelativeTime date={job.scheduled_at} />
                          </TableCell>
                          <TableCell className="text-sm text-foreground/55">
                            <RelativeTime date={job.created_at} />
                          </TableCell>
                          <TableCell className="text-sm tabular-nums text-foreground/55">
                            {job.attempts}/{job.max_retries + 1}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <JobActions job={job} onChanged={list.reload} />
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow key={`${job.id}-x`} className="border-foreground/10 hover:bg-transparent">
                            <TableCell colSpan={7} className="p-0">
                              <AttemptsPanel job={job} />
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {list.loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : filtered.length === 0 ? (
              <SectionCard noPadding>
                <Empty icon={Zap} title="No jobs match" description="Try a different status or clear the search." />
              </SectionCard>
            ) : (
              filtered.map((job) => {
                const isOpen = expanded.has(job.id);
                return (
                  <div key={job.id} className="overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                    <button className="flex w-full items-start gap-3 p-3 text-left" onClick={() => toggle(job.id)}>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                          <StatusPill tone={jobStatusTone(job.status)} label={job.status} pulse={job.status === "running"} />
                          <MethodChip method={job.method} />
                        </div>
                        <p className="truncate font-mono text-xs text-foreground/70">{job.url}</p>
                        <p className="mt-1 text-[11px] text-foreground/35">
                          Runs <RelativeTime date={job.scheduled_at} /> · {job.attempts}/{job.max_retries + 1} attempts
                        </p>
                      </div>
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-foreground/30" /> : <ChevronRight className="h-4 w-4 shrink-0 text-foreground/30" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-foreground/10">
                        <AttemptsPanel job={job} />
                        <div className="flex justify-end px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <JobActions job={job} onChanged={list.reload} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            onPrev={list.goPrev}
            onNext={list.goNext}
            hasPrev={list.hasPrev}
            hasNext={list.hasNext}
            disabled={list.loading}
            page={list.page}
          />
        </>
      )}
    </div>
  );
}
