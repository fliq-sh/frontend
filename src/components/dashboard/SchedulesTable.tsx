"use client";

import { useState, useEffect, useCallback } from "react";
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

function NewScheduleDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const api = createSchedulesApi(apiFetch);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateScheduleInput>({
    name: "",
    cron: "*/5 * * * *",
    url: "",
    http_method: "POST",
    max_retries: 3,
    timeout_seconds: 30,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.create(form);
      setOpen(false);
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Schedule</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
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
              value={form.cron}
              onChange={(e) => setForm({ ...form, cron: e.target.value })}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Method</label>
              <select
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={form.http_method}
                onChange={(e) => setForm({ ...form, http_method: e.target.value })}
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
                max={10}
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { schedules } = await api.list({ limit: 50 });
      setSchedules(schedules ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(s: Schedule) {
    if (s.status === "active") {
      await api.pause(s.id);
    } else {
      await api.resume(s.id);
    }
    await load();
  }

  async function handleDelete(id: string) {
    await api.delete(id);
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Schedules</h2>
        <NewScheduleDialog onCreated={load} />
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden">
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
              : schedules.length === 0
              ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={7} className="text-center text-white/40 py-12">
                      No schedules yet. Create your first recurring job →
                    </TableCell>
                  </TableRow>
                )
              : schedules.map((s) => (
                  <TableRow key={s.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs text-white/60">{s.cron}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">{s.url}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>
                        {s.status}
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
                          {s.status === "active" ? "Pause" : "Resume"}
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
    </div>
  );
}
