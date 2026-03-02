"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useApi, createJobsApi, Job, JobStatus, CreateJobInput } from "@/lib/api";
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

const STATUS_VARIANT: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  running: "default",
  completed: "outline",
  failed: "destructive",
  cancelled: "secondary",
};

function NewJobDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const api = createJobsApi(apiFetch);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateJobInput>({
    url: "",
    http_method: "POST",
    scheduled_at: new Date(Date.now() + 60_000).toISOString().slice(0, 16),
    max_retries: 3,
    timeout_seconds: 30,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.create({
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      });
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
        <Button size="sm">New Job</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10">
        <DialogHeader>
          <DialogTitle>Schedule a Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
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
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
                value={form.http_method}
                onChange={(e) => setForm({ ...form, http_method: e.target.value })}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Scheduled At (local)</label>
              <input
                type="datetime-local"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Max Retries</label>
              <input
                type="number"
                min={0}
                max={10}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
                value={form.max_retries}
                onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Timeout (seconds)</label>
              <input
                type="number"
                min={1}
                max={3600}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
                value={form.timeout_seconds}
                onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Body (JSON, optional)</label>
            <textarea
              rows={3}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20"
              value={form.body ?? ""}
              onChange={(e) => setForm({ ...form, body: e.target.value || undefined })}
              placeholder='{"key": "value"}'
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Scheduling…" : "Schedule Job"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function JobsTable() {
  const { apiFetch } = useApi();
  const api = createJobsApi(apiFetch);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { jobs } = await api.list({ limit: 50 });
      setJobs(jobs ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(id: string) {
    await api.cancel(id);
    await load();
  }

  const counts = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "pending").length,
    running: jobs.filter((j) => j.status === "running").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["total", "pending", "running", "failed"] as const).map((k) => (
          <div key={k} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/40 uppercase tracking-wider">{k}</p>
            <p className="text-2xl font-bold mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : counts[k]}
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <NewJobDialog onCreated={load} />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40">ID</TableHead>
              <TableHead className="text-white/40">URL</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40">Scheduled</TableHead>
              <TableHead className="text-white/40">Created</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : jobs.length === 0
              ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center text-white/40 py-12">
                      No jobs yet. Schedule your first one →
                    </TableCell>
                  </TableRow>
                )
              : jobs.map((job) => (
                  <TableRow key={job.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-xs text-white/60">
                      {job.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {job.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[job.status]}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {formatDistanceToNow(new Date(job.scheduled_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-sm text-white/60">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      {(job.status === "pending" || job.status === "running") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleCancel(job.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
