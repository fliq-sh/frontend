"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useApi, createBuffersApi, Buffer, BufferItem } from "@/lib/api";
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
import { ChevronDown, ChevronRight, Layers, Settings } from "lucide-react";
import Link from "next/link";

// ── Create Buffer Dialog ─────────────────────────────────────────────────────

function NewBufferDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
  const api = createBuffersApi(apiFetch);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    url: "",
    method: "POST",
    rate_limit: 10,
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
      setForm({ name: "", url: "", method: "POST", rate_limit: 10, max_retries: 3, timeout_seconds: 30, webhook_url: "" });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create buffer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New Buffer</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10">
        <DialogHeader>
          <DialogTitle>Create Buffer</DialogTitle>
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
              placeholder="Stripe API buffer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Target URL</label>
            <input
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://api.stripe.com/v1/charges"
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
              <label className="text-xs text-white/60">Rate Limit (req/s)</label>
              <input
                type="number"
                min={1}
                max={1000}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={form.rate_limit}
                onChange={(e) => setForm({ ...form, rate_limit: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60">Timeout (s)</label>
              <input
                type="number"
                min={1}
                max={3600}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                value={form.timeout_seconds}
                onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })}
              />
            </div>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Buffer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Push Item Dialog ─────────────────────────────────────────────────────────

function PushItemDialog({ bufferId, onPushed }: { bufferId: string; onPushed: () => void }) {
  const { apiFetch } = useApi();
  const api = createBuffersApi(apiFetch);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) { setError(null); setBody(""); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.pushItem(bufferId, { body: body || undefined });
      setOpen(false);
      setBody("");
      onPushed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to push item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">Push Item</Button>
      </DialogTrigger>
      <DialogContent className="bg-[#09090b] border-white/10">
        <DialogHeader>
          <DialogTitle>Push Item to Buffer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/60">Request Body (optional)</label>
            <textarea
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono min-h-[120px] focus:outline-none focus:ring-1 focus:ring-white/20"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Pushing…" : "Push Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Item Status Badge ────────────────────────────────────────────────────────

function itemStatusVariant(status: string) {
  switch (status) {
    case "completed": return "default" as const;
    case "failed": return "destructive" as const;
    case "running": return "secondary" as const;
    default: return "outline" as const;
  }
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BuffersTable() {
  const { apiFetch } = useApi();
  const api = createBuffersApi(apiFetch);
  const [buffers, setBuffers] = useState<Buffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [itemsMap, setItemsMap] = useState<Record<string, BufferItem[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { buffers } = await api.list({ limit: 50 });
      setBuffers(buffers ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleExpand(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (!itemsMap[id]) {
        try {
          const { items } = await api.listItems(id, { limit: 10 });
          setItemsMap((prev) => ({ ...prev, [id]: items ?? [] }));
        } catch (err) {
          console.error(err);
        }
      }
    }
    setExpandedIds(next);
  }

  async function toggleStatus(b: Buffer) {
    if (b.paused) {
      await api.resume(b.id);
    } else {
      await api.pause(b.id);
    }
    await load();
  }

  async function handleDelete(id: string) {
    await api.delete(id);
    await load();
  }

  async function refreshItems(bufferId: string) {
    try {
      const { items } = await api.listItems(bufferId, { limit: 10 });
      setItemsMap((prev) => ({ ...prev, [bufferId]: items ?? [] }));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buffers</h2>
        <NewBufferDialog onCreated={load} />
      </div>

      <div className="rounded-lg border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 w-8" />
              <TableHead className="text-white/40">Name</TableHead>
              <TableHead className="text-white/40">URL</TableHead>
              <TableHead className="text-white/40">Method</TableHead>
              <TableHead className="text-white/40">Rate Limit</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40">Created</TableHead>
              <TableHead className="text-white/40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : buffers.length === 0
              ? (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell colSpan={8} className="p-0">
                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-8 m-4">
                        <div className="flex flex-col gap-6 max-w-xl">
                          <div>
                            <p className="text-xs text-indigo-400 uppercase tracking-widest mb-2">Get started</p>
                            <h3 className="text-xl font-semibold">Create your first rate-limited buffer</h3>
                            <p className="text-sm text-white/50 mt-2">
                              Buffers let you push HTTP requests and have them executed at a controlled rate. Perfect for third-party APIs with strict rate limits.
                            </p>
                          </div>
                          <div className="flex flex-col gap-5">
                            <div className="flex gap-4">
                              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">1</div>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Get an API token</p>
                                <p className="text-xs text-white/50">Head to Settings to create a token for authenticating your requests.</p>
                                <Link href="/app/settings">
                                  <Button size="sm" variant="outline" className="w-fit gap-1.5 border-white/10 hover:bg-white/5 mt-1">
                                    <Settings className="h-3.5 w-3.5" />
                                    Settings
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">2</div>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Create a buffer</p>
                                <p className="text-xs text-white/50">
                                  Use the <span className="text-white/70">New Buffer</span> button above. Set a target URL and rate limit (req/s).
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">3</div>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium">Push items &amp; monitor</p>
                                <p className="text-xs text-white/50">Push requests into the buffer. Fliq fires them at your configured rate with automatic 429 retry handling.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : buffers.map((b) => {
                  const isExpanded = expandedIds.has(b.id);
                  const items = itemsMap[b.id] ?? [];
                  return (
                    <>
                      <TableRow key={b.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => toggleExpand(b.id)}>
                        <TableCell className="w-8 pr-0">
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4 text-white/40" />
                            : <ChevronRight className="h-4 w-4 text-white/40" />}
                        </TableCell>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-white/60">{b.url}</TableCell>
                        <TableCell className="text-sm font-mono text-white/60">{b.method}</TableCell>
                        <TableCell className="text-sm">{b.rate_limit} req/s</TableCell>
                        <TableCell>
                          <Badge variant={b.paused ? "secondary" : "default"}>
                            {b.paused ? "paused" : "active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-white/60">
                          {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <PushItemDialog bufferId={b.id} onPushed={() => refreshItems(b.id)} />
                            <Button size="sm" variant="ghost" onClick={() => toggleStatus(b)}>
                              {b.paused ? "Resume" : "Pause"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDelete(b.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${b.id}-items`} className="border-white/10 hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4">
                              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Recent Items</p>
                              {items.length === 0 ? (
                                <p className="text-sm text-white/30">No items yet. Push an item to get started.</p>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-4 rounded-md border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm"
                                    >
                                      <Badge variant={itemStatusVariant(item.status)} className="text-xs">
                                        {item.status}
                                      </Badge>
                                      <span className="text-white/40 font-mono text-xs">{item.id.slice(0, 8)}…</span>
                                      {item.status_code && (
                                        <span className="text-white/50 text-xs">HTTP {item.status_code}</span>
                                      )}
                                      {item.last_error && (
                                        <span className="text-red-400/70 text-xs truncate max-w-[200px]">{item.last_error}</span>
                                      )}
                                      <span className="text-white/30 text-xs ml-auto">
                                        {item.retry_count > 0 && `retry ${item.retry_count}/${item.max_retries} · `}
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
