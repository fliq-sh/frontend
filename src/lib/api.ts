import { useAuth } from "@clerk/nextjs";

// In production set NEXT_PUBLIC_API_URL=https://api.fliq.dev (direct call, needs CORS).
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

export type ScheduleStatus = "active" | "paused";

export interface Schedule {
  id: string;
  user_id: string;
  name: string;
  cron_expr: string;
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: string | null;
  status: ScheduleStatus;
  max_retries: number;
  timeout_seconds: number;
  next_run_at: string | null;
  last_run_at: string | null;
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
