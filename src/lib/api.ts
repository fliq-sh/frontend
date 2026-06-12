import { useAuth } from "@clerk/nextjs";

// In production set NEXT_PUBLIC_API_URL=https://api.fliq.sh (direct call, needs CORS).
// In local dev leave it unset → falls through to "/api" which Next.js proxies to the
// backend via the rewrite in next.config.ts (no CORS issue).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// ─── Core fetch ───────────────────────────────────────────────────────────────

// useApi returns an apiFetch function that automatically attaches
// the Clerk session JWT as a Bearer token on every request.
export function useApi() {
  const { getToken } = useAuth();

  async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  return { apiFetch };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface Job {
  id: string;
  user_id: string;
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: string | null;
  status: JobStatus;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  attempts: number;
  max_retries: number;
  timeout_seconds: number;
  idempotency_key: string | null;
  webhook_url?: string | null;
  webhook_headers?: Record<string, string> | null;
  /** Set when this job was created by replaying a failed one — the source job id. */
  replay_of?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobAttempt {
  id: string;
  job_id: string;
  attempt_num: number;
  worker_id: string;
  started_at: string;
  completed_at: string | null;
  status_code: number | null;
  error: string | null;
}

export interface Schedule {
  id: string;
  user_id: string;
  name: string;
  cron_expr: string;
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: string | null;
  paused: boolean;
  max_retries: number;
  timeout_seconds: number;
  next_run_at: string | null;
  last_run_at: string | null;
  webhook_url?: string | null;
  webhook_headers?: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface APIToken {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export interface CreateTokenResponse {
  id: string;
  name: string;
  prefix: string;
  token: string; // raw — shown once, never stored
  created_at: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface BillingBalance {
  balance: number;
  plan: "free" | "paid";
  daily_limit: number;
  credits_per_dollar: number;
}

export type CreditTxType = "job_execution" | "daily_grant" | "stripe_topup";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: CreditTxType;
  job_id: string | null;
  stripe_payment_intent_id: string | null;
  description: string | null;
  created_at: string;
}

export interface ListTransactionsParams {
  cursor?: string;
  limit?: number;
}

// ─── Jobs API ─────────────────────────────────────────────────────────────────

export interface ListJobsParams {
  cursor?: string;
  limit?: number;
  status?: JobStatus;
}

export interface CreateJobInput {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  scheduled_at: string;
  max_retries?: number;
  timeout_seconds?: number;
  idempotency_key?: string;
  backoff?: "exponential" | "linear";
  webhook_url?: string;
  webhook_headers?: Record<string, string>;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function createJobsApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    list(params: ListJobsParams = {}) {
      return apiFetch<{ jobs: Job[]; next_cursor: string | null }>(
        `/jobs${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
    get(id: string) {
      return apiFetch<Job>(`/jobs/${id}`);
    },
    create(input: CreateJobInput) {
      return apiFetch<{ id: string; created_at: string }>("/jobs", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    cancel(id: string) {
      return apiFetch<void>(`/jobs/${id}`, { method: "DELETE" });
    },
    listAttempts(id: string) {
      return apiFetch<JobAttempt[]>(`/jobs/${id}/attempts`);
    },
    // Re-run a permanently-failed job. Clones it into a fresh pending job
    // (passes the same credit gate as a create). 409 if the job isn't failed.
    replay(id: string) {
      return apiFetch<ReplayJobResponse>(`/jobs/${id}/replay`, { method: "POST" });
    },
  };
}

export interface ReplayJobResponse {
  id: string;
  status: JobStatus;
  replay_of?: string | null;
  scheduled_at: string;
  created_at: string;
}

// ─── Schedules API ────────────────────────────────────────────────────────────

export interface ListSchedulesParams {
  cursor?: string;
  limit?: number;
}

export interface CreateScheduleInput {
  name: string;
  cron_expr: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  max_retries?: number;
  timeout_seconds?: number;
  backoff?: "exponential" | "linear";
  webhook_url?: string;
  webhook_headers?: Record<string, string>;
}

export function createSchedulesApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    list(params: ListSchedulesParams = {}) {
      return apiFetch<{ schedules: Schedule[]; next_cursor: string | null }>(
        `/schedules${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
    get(id: string) {
      return apiFetch<Schedule>(`/schedules/${id}`);
    },
    create(input: CreateScheduleInput) {
      return apiFetch<Schedule>("/schedules", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    pause(id: string) {
      return apiFetch<void>(`/schedules/${id}/pause`, { method: "POST" });
    },
    resume(id: string) {
      return apiFetch<void>(`/schedules/${id}/resume`, { method: "POST" });
    },
    delete(id: string) {
      return apiFetch<void>(`/schedules/${id}`, { method: "DELETE" });
    },
    listJobs(id: string, params: ListJobsParams = {}) {
      return apiFetch<{ jobs: Job[]; next_cursor: string | null }>(
        `/schedules/${id}/jobs${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
  };
}

// ─── Buffers API ─────────────────────────────────────────────────────────────

export type BufferItemStatus = "pending" | "running" | "completed" | "failed";

export interface Buffer {
  id: string;
  name: string;
  url: string;
  method: string;
  timeout_seconds: number;
  rate_limit: number;
  max_retries: number;
  backoff: "exponential" | "linear";
  paused: boolean;
  webhook_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BufferItem {
  id: string;
  buffer_id: string;
  status: BufferItemStatus;
  status_code: number | null;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  /** Set when this item was created by replaying a failed one — the source item id. */
  replay_of?: string | null;
  created_at: string;
  completed_at: string | null;
}

/** Per-buffer item status breakdown — server-aggregated (not page-limited). */
export interface BufferStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
  /** completed / (completed + failed), in [0,1]; 0 when none have finished. */
  success_rate: number;
}

export interface ListBuffersParams {
  cursor?: string;
  limit?: number;
}

export interface ListBufferItemsParams {
  cursor?: string;
  limit?: number;
  status?: BufferItemStatus;
}

export interface CreateBufferInput {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  timeout_seconds?: number;
  rate_limit: number;
  max_retries?: number;
  backoff?: "exponential" | "linear";
  webhook_url?: string;
  webhook_headers?: Record<string, string>;
}

export interface PushBufferItemInput {
  body?: string;
  headers?: Record<string, string>;
}

export function createBuffersApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    list(params: ListBuffersParams = {}) {
      return apiFetch<{ buffers: Buffer[]; next_cursor: string | null }>(
        `/buffers${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
    get(id: string) {
      return apiFetch<Buffer>(`/buffers/${id}`);
    },
    create(input: CreateBufferInput) {
      return apiFetch<Buffer>("/buffers", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    pause(id: string) {
      return apiFetch<void>(`/buffers/${id}/pause`, { method: "POST" });
    },
    resume(id: string) {
      return apiFetch<void>(`/buffers/${id}/resume`, { method: "POST" });
    },
    delete(id: string) {
      return apiFetch<void>(`/buffers/${id}`, { method: "DELETE" });
    },
    pushItem(bufferId: string, input: PushBufferItemInput) {
      return apiFetch<BufferItem>(`/buffers/${bufferId}/items`, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    listItems(bufferId: string, params: ListBufferItemsParams = {}) {
      return apiFetch<{ items: BufferItem[]; next_cursor: string | null }>(
        `/buffers/${bufferId}/items${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
    getItem(bufferId: string, itemId: string) {
      return apiFetch<BufferItem>(`/buffers/${bufferId}/items/${itemId}`);
    },
    stats(bufferId: string) {
      return apiFetch<BufferStats>(`/buffers/${bufferId}/stats`);
    },
    // Re-run a permanently-failed item. Clones it onto the tail of the buffer so
    // it drains in order after the current queue. 409 if the item isn't failed.
    replayItem(bufferId: string, itemId: string) {
      return apiFetch<BufferItem>(`/buffers/${bufferId}/items/${itemId}/replay`, { method: "POST" });
    },
  };
}

// ─── API Tokens ───────────────────────────────────────────────────────────────

export function createTokensApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    list() {
      return apiFetch<APIToken[]>("/tokens");
    },
    create(name: string) {
      return apiFetch<CreateTokenResponse>("/tokens", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
    revoke(id: string) {
      return apiFetch<void>(`/tokens/${id}`, { method: "DELETE" });
    },
  };
}

// ─── Signing Secret API ───────────────────────────────────────────────────────

export interface SigningSecretResponse {
  secret: string;
  created_at: string;
}

export function createSigningApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    get() {
      return apiFetch<SigningSecretResponse>("/signing-secret");
    },
    rotate() {
      return apiFetch<SigningSecretResponse>("/signing-secret/rotate", { method: "POST" });
    },
  };
}

// ─── Billing API ──────────────────────────────────────────────────────────────

export function createBillingApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    getBalance() {
      return apiFetch<BillingBalance>("/billing/balance");
    },
    createCheckout(credits: number) {
      return apiFetch<{ url: string }>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ credits }),
      });
    },
    listTransactions(params: ListTransactionsParams = {}) {
      return apiFetch<{ transactions: CreditTransaction[]; next_cursor: string | null }>(
        `/billing/transactions${buildQuery(params as Record<string, string | number | undefined>)}`,
      );
    },
  };
}

// ─── Alert channels ────────────────────────────────────────────────────────
// Notified when one of your jobs or buffer items exhausts its retries (a
// permanent failure — your endpoint is down and Fliq has given up). `email` is
// not supported yet; the backend rejects anything but webhook/slack.

export type AlertChannelType = "webhook" | "slack";

export interface AlertChannel {
  id: string;
  type: AlertChannelType;
  target: string;
  name: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertChannelInput {
  type: AlertChannelType;
  target: string;
  name?: string;
}

export function createAlertsApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    list() {
      return apiFetch<{ channels: AlertChannel[] }>("/alerts");
    },
    create(input: CreateAlertChannelInput) {
      return apiFetch<AlertChannel>("/alerts", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    setEnabled(id: string, enabled: boolean) {
      return apiFetch<void>(`/alerts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });
    },
    delete(id: string) {
      return apiFetch<void>(`/alerts/${id}`, { method: "DELETE" });
    },
  };
}

// ─── Analytics ─────────────────────────────────────────────────────────────
// Read-only aggregates over data the engine already records. `days` defaults to
// 30 server-side and is clamped to [1, 365].

export interface JobStats {
  total_executions: number;
  succeeded: number;
  failed: number;
  /** succeeded / total_executions, in [0,1]. */
  success_rate: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  since_days: number;
}

export interface UsageBucket {
  date: string; // UTC day, "YYYY-MM-DD"
  job_executions: number;
  buffer_executions: number;
}

export interface UsageSummary {
  buckets: UsageBucket[];
  total_job_executions: number;
  total_buffer_executions: number;
  balance: number;
  plan: "free" | "paid";
  since_days: number;
}

export function createStatsApi(apiFetch: <T>(path: string, init?: RequestInit) => Promise<T>) {
  return {
    jobs(days?: number) {
      return apiFetch<JobStats>(`/stats/jobs${buildQuery({ days })}`);
    },
    usage(days?: number) {
      return apiFetch<UsageSummary>(`/stats/usage${buildQuery({ days })}`);
    },
  };
}
