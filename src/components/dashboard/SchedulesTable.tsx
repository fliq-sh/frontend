"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  CalendarClock,
  Settings,
  Pause,
  Play,
} from "lucide-react";
import {
  useApi,
  createSchedulesApi,
  Schedule,
  Job,
} from "@/lib/api";
import { explainCron, CRON_PRESETS, formatUtc } from "@/lib/cron";
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
import { ApiCodeBlock, SCHEDULE_SNIPPETS } from "./ApiCodeBlock";
import { EmptyState, jobStatusTone } from "@/components/patterns";
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

type Filter = "all" | "active" | "paused";
const FILTER_TABS: FilterTab<Filter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", tone: "success" },
  { value: "paused", label: "Paused", tone: "warning" },
];

// ─── Cron preview ──────────────────────────────────────────────────────────

function CronPreview({ expr }: { expr: string }) {
  const result = useMemo(() => explainCron(expr, { count: 3 }), [expr]);
  if (!result.valid) {
    return <p className="text-xs text-red-400">{result.error}</p>;
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-foreground/10 bg-foreground/[0.03] px-3 py-2">
      <p className="text-xs text-foreground/70">{result.description}</p>
      <p className="text-[11px] text-foreground/35">
        Next: {result.nextRuns.map((d) => formatUtc(d)).join(" · ")} UTC
      </p>
    </div>
  );
}

function humanizeCron(expr: string): string | null {
  const r = explainCron(expr, { count: 1 });
  return r.valid ? r.description : null;
}

// ─── Create dialog ─────────────────────────────────────────────────────────

function NewScheduleDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    cron_expr: "0 9 * * *",
    url: "",
    method: "POST",
    max_retries: 3,
    timeout_seconds: 30,
    headers: "",
    webhook_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = parseJsonObject(form.headers, "Headers");
      const api = createSchedulesApi(apiFetch);
      await api.create({
        name: form.name,
        cron_expr: form.cron_expr,
        url: form.url,
        method: form.method,
        max_retries: form.max_retries,
        timeout_seconds: form.timeout_seconds,
        headers,
        webhook_url: form.webhook_url || undefined,
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
      <DialogTrigger asChild>
        <Button size="sm">New schedule</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-foreground/10 theme-warm bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle>Create schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <FormError message={error} />
          <Field label="Name">
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Daily sync"
            />
          </Field>
          <Field label="Cron expression" hint="UTC. Standard 5-field syntax.">
            <TextInput
              required
              className="font-mono"
              value={form.cron_expr}
              onChange={(e) => setForm({ ...form, cron_expr: e.target.value })}
              placeholder="0 9 * * *"
            />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {CRON_PRESETS.slice(0, 5).map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setForm({ ...form, cron_expr: p.expr })}
                className="rounded-md border border-foreground/10 bg-foreground/5 px-2 py-1 text-[11px] text-foreground/60 transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>
          <CronPreview expr={form.cron_expr} />
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
            <Field label="Max retries">
              <TextInput
                type="number"
                min={0}
                max={20}
                value={form.max_retries}
                onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })}
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
          <Field label="Webhook URL" hint="Optional">
            <TextInput
              value={form.webhook_url}
              onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
              placeholder="https://example.com/callback"
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GettingStarted() {
  return (
    <EmptyState
      title="Create your first recurring schedule"
      steps={[
        {
          title: "Get an API token",
          description: "Schedules fire your HTTP endpoint on a cron expression — define once, run forever.",
          action: (
            <Link href="/app/settings">
              <Button size="sm" variant="outline" className="w-fit gap-1.5 border-foreground/10 hover:bg-foreground/5">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
            </Link>
          ),
        },
        {
          title: "Create a schedule",
          description: (
            <>Use <span className="text-foreground/70">New schedule</span> above, or POST to the schedules API.</>
          ),
          action: <ApiCodeBlock snippets={SCHEDULE_SNIPPETS} />,
        },
        {
          title: "Watch the runs",
          description: "Active schedules show their next and last fire times. Expand a row to see recent runs.",
        },
      ]}
    />
  );
}

// ─── Recent runs (expand) ──────────────────────────────────────────────────

function ScheduleRuns({ scheduleId }: { scheduleId: string }) {
  const { apiFetch } = useApi();
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    const api = createSchedulesApi(apiFetch);
    api
      .listJobs(scheduleId, { limit: 5 })
      .then((r) => setJobs(r.jobs ?? []))
      .catch(() => setJobs([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  return (
    <div className="bg-foreground/[0.015] px-4 py-3 sm:px-5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-foreground/30">Recent runs</p>
      {jobs === null ? (
        <Skeleton className="h-5 w-40" />
      ) : jobs.length === 0 ? (
        <p className="text-xs text-foreground/35">No runs yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center gap-3 text-xs">
              <StatusPill tone={jobStatusTone(j.status)} label={j.status} />
              <RelativeTime date={j.scheduled_at} className="text-foreground/40" />
              <Link href={`/app/jobs`} className="ml-auto text-foreground/35 hover:text-foreground">view</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Row actions ───────────────────────────────────────────────────────────

function ScheduleActions({ s, onChanged }: { s: Schedule; onChanged: () => void }) {
  const { apiFetch } = useApi();
  const api = createSchedulesApi(apiFetch);
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-foreground/60 hover:text-foreground"
        onClick={async () => {
          if (s.paused) await api.resume(s.id);
          else await api.pause(s.id);
          onChanged();
        }}
      >
        {s.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        {s.paused ? "Resume" : "Pause"}
      </Button>
      <ConfirmButton
        title={`Delete "${s.name}"?`}
        description="The schedule stops firing immediately. Past runs are kept. This can't be undone."
        confirmLabel="Delete schedule"
        onConfirm={async () => {
          await api.delete(s.id);
          onChanged();
        }}
        trigger={
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">Delete</Button>
        }
      />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function SchedulesTable() {
  const { apiFetch } = useApi();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [auto, setAuto] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetcher = useCallback(async (cursor: string | undefined) => {
    const api = createSchedulesApi(apiFetch);
    const res = await api.list({ limit: 25, cursor });
    return { items: res.schedules ?? [], nextCursor: res.next_cursor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useCursorList<Schedule>(fetcher, []);
  usePoll(list.reload, 15_000, auto);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.items.filter((s) => {
      if (filter === "active" && s.paused) return false;
      if (filter === "paused" && !s.paused) return false;
      if (q && !(s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q) || s.cron_expr.includes(q)))
        return false;
      return true;
    });
  }, [list.items, filter, search]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const showGettingStarted = !list.loading && list.items.length === 0 && !list.hasPrev;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Schedules"
        description="Recurring jobs on a cron expression — fired on time, every time."
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
            <NewScheduleDialog onCreated={list.reload} />
          </>
        }
      />

      {showCode && <ApiCodeBlock snippets={SCHEDULE_SNIPPETS} />}

      {showGettingStarted ? (
        <GettingStarted />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs tabs={FILTER_TABS} value={filter} onChange={setFilter} className="sm:max-w-fit" />
            <SearchInput value={search} onChange={setSearch} placeholder="Filter by name, URL, cron…" className="sm:w-64" />
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-foreground/10 md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-foreground/10 hover:bg-transparent">
                  <TableHead className="w-8" />
                  <TableHead className="text-foreground/40">Name</TableHead>
                  <TableHead className="text-foreground/40">Schedule</TableHead>
                  <TableHead className="text-foreground/40">Endpoint</TableHead>
                  <TableHead className="text-foreground/40">Status</TableHead>
                  <TableHead className="text-foreground/40">Next run</TableHead>
                  <TableHead className="text-right text-foreground/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-foreground/10">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow className="border-foreground/10 hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <Empty icon={CalendarClock} title="No schedules match" description="Adjust the filter or clear the search." />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => {
                    const isOpen = expanded.has(s.id);
                    const human = humanizeCron(s.cron_expr);
                    return (
                      <>
                        <TableRow key={s.id} className="cursor-pointer border-foreground/10 hover:bg-foreground/[0.03]" onClick={() => toggle(s.id)}>
                          <TableCell className="pl-3 pr-0 text-foreground/30">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </TableCell>
                          <TableCell className="font-medium text-foreground/85">{s.name}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="font-mono text-xs text-foreground/70">{s.cron_expr}</p>
                            {human && <p className="truncate text-[11px] text-foreground/35">{human}</p>}
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            <div className="flex items-center gap-2">
                              <MethodChip method={s.method} />
                              <span className="truncate text-sm text-foreground/70" title={s.url}>{s.url}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusPill tone={s.paused ? "warning" : "success"} label={s.paused ? "Paused" : "Active"} pulse={!s.paused} />
                          </TableCell>
                          <TableCell className="text-sm text-foreground/55">
                            {s.paused ? <span className="text-foreground/30">—</span> : <RelativeTime date={s.next_run_at} />}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <ScheduleActions s={s} onChanged={list.reload} />
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow key={`${s.id}-x`} className="border-foreground/10 hover:bg-transparent">
                            <TableCell colSpan={7} className="p-0"><ScheduleRuns scheduleId={s.id} /></TableCell>
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
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
            ) : filtered.length === 0 ? (
              <SectionCard noPadding>
                <Empty icon={CalendarClock} title="No schedules match" />
              </SectionCard>
            ) : (
              filtered.map((s) => {
                const isOpen = expanded.has(s.id);
                const human = humanizeCron(s.cron_expr);
                return (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
                    <button className="flex w-full items-start gap-3 p-3 text-left" onClick={() => toggle(s.id)}>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="truncate font-medium text-foreground/85">{s.name}</span>
                          <StatusPill tone={s.paused ? "warning" : "success"} label={s.paused ? "Paused" : "Active"} />
                        </div>
                        <p className="font-mono text-xs text-foreground/60">{s.cron_expr}</p>
                        {human && <p className="text-[11px] text-foreground/35">{human}</p>}
                        <p className="mt-1 truncate text-[11px] text-foreground/40">
                          {s.method} {s.url}
                        </p>
                        {!s.paused && (
                          <p className="mt-1 text-[11px] text-foreground/40">Next <RelativeTime date={s.next_run_at} /></p>
                        )}
                      </div>
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-foreground/30" /> : <ChevronRight className="h-4 w-4 shrink-0 text-foreground/30" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-foreground/10">
                        <ScheduleRuns scheduleId={s.id} />
                        <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <ScheduleActions s={s} onChanged={list.reload} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Pagination onPrev={list.goPrev} onNext={list.goNext} hasPrev={list.hasPrev} hasNext={list.hasNext} disabled={list.loading} page={list.page} />
        </>
      )}
    </div>
  );
}
