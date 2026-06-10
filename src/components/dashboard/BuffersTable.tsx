"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Layers,
  Settings,
  Pause,
  Play,
  Gauge,
} from "lucide-react";
import {
  useApi,
  createBuffersApi,
  Buffer,
  BufferItem,
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
import { ApiCodeBlock, BUFFER_SNIPPETS } from "./ApiCodeBlock";
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
import { httpStatusTone } from "@/lib/dashboard";

type Filter = "all" | "active" | "paused";
const FILTER_TABS: FilterTab<Filter>[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", tone: "success" },
  { value: "paused", label: "Paused", tone: "warning" },
];

const ITEM_STATES: { key: BufferItem["status"]; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "running", label: "Running" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

// ─── Create dialog ─────────────────────────────────────────────────────────

function NewBufferDialog({ onCreated }: { onCreated: () => void }) {
  const { apiFetch } = useApi();
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
    headers: "",
    webhook_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const headers = parseJsonObject(form.headers, "Headers");
      const api = createBuffersApi(apiFetch);
      await api.create({
        name: form.name,
        url: form.url,
        method: form.method,
        rate_limit: form.rate_limit,
        max_retries: form.max_retries,
        timeout_seconds: form.timeout_seconds,
        headers,
        webhook_url: form.webhook_url || undefined,
      });
      setOpen(false);
      setForm({ name: "", url: "", method: "POST", rate_limit: 10, max_retries: 3, timeout_seconds: 30, headers: "", webhook_url: "" });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create buffer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
      <DialogTrigger asChild>
        <Button size="sm">New buffer</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#09090b]">
        <DialogHeader>
          <DialogTitle>Create buffer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <FormError message={error} />
          <Field label="Name">
            <TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Stripe API" />
          </Field>
          <Field label="Target URL">
            <TextInput required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://api.stripe.com/v1/charges" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method">
              <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Rate limit" hint="requests / second">
              <TextInput type="number" min={1} max={1000} value={form.rate_limit} onChange={(e) => setForm({ ...form, rate_limit: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max retries">
              <TextInput type="number" min={0} max={20} value={form.max_retries} onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })} />
            </Field>
            <Field label="Timeout" hint="seconds">
              <TextInput type="number" min={1} max={3600} value={form.timeout_seconds} onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Headers" hint="Optional JSON object — sent on every release">
            <Textarea rows={2} value={form.headers} onChange={(e) => setForm({ ...form, headers: e.target.value })} placeholder='{"Authorization": "Bearer …"}' />
          </Field>
          <Field label="Webhook URL" hint="Optional">
            <TextInput value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} placeholder="https://example.com/callback" />
          </Field>
          <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create buffer"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PushItemDialog({ bufferId, onPushed }: { bufferId: string; onPushed: () => void }) {
  const { apiFetch } = useApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const parsedHeaders = parseJsonObject(headers, "Headers");
      const api = createBuffersApi(apiFetch);
      await api.pushItem(bufferId, { body: body || undefined, headers: parsedHeaders });
      setOpen(false);
      setBody("");
      setHeaders("");
      onPushed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to push item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); } }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">Push item</Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#09090b]">
        <DialogHeader>
          <DialogTitle>Push item to buffer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
          <FormError message={error} />
          <Field label="Request body" hint="Optional — sent to the target URL">
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' />
          </Field>
          <Field label="Headers" hint="Optional JSON object">
            <Textarea rows={2} value={headers} onChange={(e) => setHeaders(e.target.value)} placeholder='{"Idempotency-Key": "…"}' />
          </Field>
          <Button type="submit" disabled={loading}>{loading ? "Pushing…" : "Push item"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GettingStarted() {
  return (
    <EmptyState
      title="Create your first rate-limited buffer"
      steps={[
        {
          title: "Get an API token",
          description: "Buffers accept a firehose of requests and release them at a controlled rate — ideal for third-party APIs with strict limits.",
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
          title: "Create a buffer",
          description: (<>Set a target URL and a rate limit (req/s) via <span className="text-white/70">New buffer</span> or the API.</>),
          action: <ApiCodeBlock snippets={BUFFER_SNIPPETS} />,
        },
        {
          title: "Push items & watch them drain",
          description: "Push requests in; Fliq fires them at your rate with automatic 429 retry handling. Expand a buffer to see item status.",
        },
      ]}
    />
  );
}

// ─── Items panel (expand) ──────────────────────────────────────────────────

function BufferItems({ bufferId, reloadKey }: { bufferId: string; reloadKey: number }) {
  const { apiFetch } = useApi();
  const [items, setItems] = useState<BufferItem[] | null>(null);

  useEffect(() => {
    const api = createBuffersApi(apiFetch);
    setItems(null);
    api
      .listItems(bufferId, { limit: 20 })
      .then((r) => setItems(r.items ?? []))
      .catch(() => setItems([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bufferId, reloadKey]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, running: 0, completed: 0, failed: 0 };
    for (const it of items ?? []) c[it.status] = (c[it.status] ?? 0) + 1;
    return c;
  }, [items]);

  return (
    <div className="bg-white/[0.015] px-4 py-3 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {ITEM_STATES.map(({ key, label }) => (
          <StatusPill key={key} tone={jobStatusTone(key)} label={`${counts[key] ?? 0} ${label.toLowerCase()}`} />
        ))}
      </div>
      {items === null ? (
        <Skeleton className="h-5 w-48" />
      ) : items.length === 0 ? (
        <p className="text-xs text-white/35">No items yet — push one to get started.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((it) => (
            <li key={it.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
              <StatusPill tone={jobStatusTone(it.status)} label={it.status} pulse={it.status === "running"} />
              <span className="font-mono text-white/40">{it.id.slice(0, 8)}…</span>
              {it.status_code != null && <StatusPill tone={httpStatusTone(it.status_code)} label={`HTTP ${it.status_code}`} />}
              {it.retry_count > 0 && <span className="text-white/40">retry {it.retry_count}/{it.max_retries}</span>}
              {it.last_error && <span className="min-w-0 flex-1 truncate text-red-400/80" title={it.last_error}>{it.last_error}</span>}
              <RelativeTime date={it.created_at} className="ml-auto text-white/35" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Row actions ───────────────────────────────────────────────────────────

function BufferActions({ b, onChanged, onPushed }: { b: Buffer; onChanged: () => void; onPushed: () => void }) {
  const { apiFetch } = useApi();
  const api = createBuffersApi(apiFetch);
  return (
    <div className="flex items-center justify-end gap-1">
      <PushItemDialog bufferId={b.id} onPushed={onPushed} />
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-white/60 hover:text-white"
        onClick={async () => {
          if (b.paused) await api.resume(b.id);
          else await api.pause(b.id);
          onChanged();
        }}
      >
        {b.paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        {b.paused ? "Resume" : "Pause"}
      </Button>
      <ConfirmButton
        title={`Delete "${b.name}"?`}
        description="Queued items are dropped and the buffer stops releasing. This can't be undone."
        confirmLabel="Delete buffer"
        onConfirm={async () => { await api.delete(b.id); onChanged(); }}
        trigger={<Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">Delete</Button>}
      />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function BuffersTable() {
  const { apiFetch } = useApi();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [auto, setAuto] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reloadKeys, setReloadKeys] = useState<Record<string, number>>({});

  const fetcher = useCallback(async (cursor: string | undefined) => {
    const api = createBuffersApi(apiFetch);
    const res = await api.list({ limit: 25, cursor });
    return { items: res.buffers ?? [], nextCursor: res.next_cursor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useCursorList<Buffer>(fetcher, []);
  usePoll(list.reload, 15_000, auto);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.items.filter((b) => {
      if (filter === "active" && b.paused) return false;
      if (filter === "paused" && !b.paused) return false;
      if (q && !(b.name.toLowerCase().includes(q) || b.url.toLowerCase().includes(q))) return false;
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
  function bumpItems(id: string) {
    setReloadKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  const showGettingStarted = !list.loading && list.items.length === 0 && !list.hasPrev;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Buffers"
        description="Push a firehose of requests; Fliq releases them at a fixed rate with 429 retries."
        actions={
          <>
            <RefreshControls onRefresh={list.reload} loading={list.loading} auto={auto} onToggleAuto={setAuto} />
            <Button size="sm" variant="outline" className="gap-1.5 border-white/10 text-white/60 hover:text-white" onClick={() => setShowCode((v) => !v)}>
              <Code2 className="h-3.5 w-3.5" />
              API
            </Button>
            <NewBufferDialog onCreated={list.reload} />
          </>
        }
      />

      {showCode && <ApiCodeBlock snippets={BUFFER_SNIPPETS} />}

      {showGettingStarted ? (
        <GettingStarted />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs tabs={FILTER_TABS} value={filter} onChange={setFilter} className="sm:max-w-fit" />
            <SearchInput value={search} onChange={setSearch} placeholder="Filter by name or URL…" className="sm:w-64" />
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-8" />
                  <TableHead className="text-white/40">Name</TableHead>
                  <TableHead className="text-white/40">Endpoint</TableHead>
                  <TableHead className="text-white/40">Rate</TableHead>
                  <TableHead className="text-white/40">Status</TableHead>
                  <TableHead className="text-white/40">Created</TableHead>
                  <TableHead className="text-right text-white/40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-white/10">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <Empty icon={Layers} title="No buffers match" description="Adjust the filter or clear the search." />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => {
                    const isOpen = expanded.has(b.id);
                    return (
                      <>
                        <TableRow key={b.id} className="cursor-pointer border-white/10 hover:bg-white/[0.03]" onClick={() => toggle(b.id)}>
                          <TableCell className="pl-3 pr-0 text-white/30">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </TableCell>
                          <TableCell className="font-medium text-white/85">{b.name}</TableCell>
                          <TableCell className="max-w-[260px]">
                            <div className="flex items-center gap-2">
                              <MethodChip method={b.method} />
                              <span className="truncate text-sm text-white/70" title={b.url}>{b.url}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-white/70">
                            <span className="inline-flex items-center gap-1">
                              <Gauge className="h-3.5 w-3.5 text-white/30" />
                              {b.rate_limit}/s
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusPill tone={b.paused ? "warning" : "success"} label={b.paused ? "Paused" : "Active"} pulse={!b.paused} />
                          </TableCell>
                          <TableCell className="text-sm text-white/55"><RelativeTime date={b.created_at} /></TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <BufferActions b={b} onChanged={list.reload} onPushed={() => bumpItems(b.id)} />
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow key={`${b.id}-x`} className="border-white/10 hover:bg-transparent">
                            <TableCell colSpan={7} className="p-0"><BufferItems bufferId={b.id} reloadKey={reloadKeys[b.id] ?? 0} /></TableCell>
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
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
            ) : filtered.length === 0 ? (
              <SectionCard noPadding><Empty icon={Layers} title="No buffers match" /></SectionCard>
            ) : (
              filtered.map((b) => {
                const isOpen = expanded.has(b.id);
                return (
                  <div key={b.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                    <button className="flex w-full items-start gap-3 p-3 text-left" onClick={() => toggle(b.id)}>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="truncate font-medium text-white/85">{b.name}</span>
                          <StatusPill tone={b.paused ? "warning" : "success"} label={b.paused ? "Paused" : "Active"} />
                        </div>
                        <p className="truncate font-mono text-xs text-white/60">{b.method} {b.url}</p>
                        <p className="mt-1 text-[11px] text-white/40">{b.rate_limit} req/s</p>
                      </div>
                      {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-white/30" /> : <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10">
                        <BufferItems bufferId={b.id} reloadKey={reloadKeys[b.id] ?? 0} />
                        <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <BufferActions b={b} onChanged={list.reload} onPushed={() => bumpItems(b.id)} />
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
