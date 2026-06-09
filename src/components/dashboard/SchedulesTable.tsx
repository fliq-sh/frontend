"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useApi, createSchedulesApi, Schedule, CreateScheduleInput } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Code2, CalendarClock, Settings, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ApiCodeBlock, SCHEDULE_SNIPPETS } from "./ApiCodeBlock";
import { EmptyState } from "@/components/patterns";

function NewScheduleDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const api = createSchedulesApi(apiFetch);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    cron_expr: "*/5 * * * *",
    url: "",
    method: "POST",
    max_retries: 3,
    timeout_seconds: 30,
    webhook_url: "",
  });

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { webhook_url, ...rest } = form;
      await api.create({
        ...rest,
        webhook_url: webhook_url || undefined,
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New Schedule</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Name</label>
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My daily sync"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Cron expression</label>
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20"
              required
              value={form.cron_expr}
              onChange={(e) => setForm({ ...form, cron_expr: e.target.value })}
              placeholder="0 9 * * *"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">URL</label>
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Webhook URL (optional)</label>
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              value={form.webhook_url}
              onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
              placeholder="https://example.com/webhook-callback"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Method</label>
              <select
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Max Retries</label>
              <input
                type="number"
                min={0}
                max={20}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={form.max_retries}
                onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SchedulesTable() {
  const { apiFetch } = useApi();
  const api = createSchedulesApi(apiFetch);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  // Pagination — derived from URL search params
  const cursor = searchParams.get("cursor") ?? undefined;
  const cursorStack = searchParams.get("prev")?.split(",").filter(Boolean) ?? [];
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  function setParams(params: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  const load = useCallback(async (activeCursor?: string) => {
    setLoading(true);
    try {
      const result = await api.list({ limit: 50, cursor: activeCursor });
      setSchedules(result.schedules ?? []);
      setNextCursor(result.next_cursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(cursor); }, [load, cursor]);

  function handleRefresh() {
    load(cursor);
  }

  function handleNext() {
    if (!nextCursor) return;
    const entry = cursor ?? "_";
    const prev = [...cursorStack, entry].join(",");
    setParams({ cursor: nextCursor, prev });
  }

  function handlePrev() {
    if (cursorStack.length === 0) return;
    const stack = [...cursorStack];
    const prev = stack.pop()!;
    setParams({
      cursor: prev === "_" ? undefined : prev,
      prev: stack.length > 0 ? stack.join(",") : undefined,
    });
  }

  async function toggleStatus(s: Schedule) {
    if (!s.paused) {
      await api.pause(s.id);
    } else {
      await api.resume(s.id);
    }
    await load(cursor);
  }

  async function handleDelete(id: string) {
    await api.delete(id);
    await load(cursor);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Schedules</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white/70"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white/70 gap-1.5"
            onClick={() => setShowCode((v) => !v)}
          >
            <Code2 className="h-3.5 w-3.5" />
            {showCode ? "Hide API" : "API"}
          </Button>
          <NewScheduleDialog onCreated={() => load(cursor)} />
        </div>
      </div>

      {/* API Code Examples */}
      {showCode && <ApiCodeBlock snippets={SCHEDULE_SNIPPETS} />}

      <div className="rounded-lg border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40">Name</TableHead>
              <TableHead className="text-white/40">Cron</TableHead>
              <TableHead className="text-white/40">URL</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40">Next Run</TableHead>
              <TableHead className="text-white/40">Last Run</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : schedules.length === 0 && cursorStack.length === 0
              ? (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <EmptyState
                        className="m-4"
                        title="Create your first recurring schedule"
                        steps={[
                          {
                            title: "Get an API token",
                            description: (
                              <>
                                Schedules run jobs on a cron expression. Define once, and Fliq fires your HTTP endpoint on time, every time.
                                <span className="block mt-2">Head to Settings to create a token for authenticating your requests.</span>
                              </>
                            ),
                            action: (
                              <Link href="/app/settings">
                                <Button size="sm" variant="outline" className="w-fit gap-1.5 border-white/10 hover:bg-white/5">
                                  <Settings className="h-3.5 w-3.5" />
                                  Settings
                                </Button>
                              </Link>
                            ),
                          },
                          {
                            title: "Create a schedule via API or dashboard",
                            description: (
                              <>
                                Use the <span className="text-white/70">New Schedule</span> button above, or POST to the schedules API.
                              </>
                            ),
                          },
                          {
                            title: "Monitor runs here",
                            description: "Active schedules appear in this table with next/last run times and status.",
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                )
              : schedules.map((s) => (
                  <TableRow key={s.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs text-white/60">{s.cron_expr}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">{s.url}</TableCell>
                    <TableCell>
                      <Badge variant={s.paused ? "secondary" : "default"}>
                        {s.paused ? "Paused" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {s.next_run_at
                        ? formatDistanceToNow(new Date(s.next_run_at), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {s.last_run_at
                        ? formatDistanceToNow(new Date(s.last_run_at), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(s)}
                        >
                          {s.paused ? "Resume" : "Pause"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(s.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(cursorStack.length > 0 || nextCursor) && (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white/70 gap-1.5"
            onClick={handlePrev}
            disabled={cursorStack.length === 0 || loading}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white/70 gap-1.5"
            onClick={handleNext}
            disabled={!nextCursor || loading}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
