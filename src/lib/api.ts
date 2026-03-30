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
  };
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
  created_at: string;
  completed_at: string | null;
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
