// Auth-free API helpers for public widgets (uptime, status page).
// The authenticated client in src/lib/api.ts requires a Clerk session and
// cannot be used here — the marketing site has no logged-in user.

// Same base-URL resolution as src/lib/api.ts: in prod set
// NEXT_PUBLIC_API_URL=https://api.fliq.sh (CORS allows https://fliq.sh);
// in local dev it falls through to "/api", proxied to the backend by
// next.config.ts (so /api/health → backend /health).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type HealthState = "operational" | "degraded" | "down";

export interface HealthProbe {
  state: HealthState;
  latencyMs: number | null;
  checkedAt: number; // epoch ms
  version?: string;
}

// Above this round-trip we call the API "degraded" rather than fully healthy.
const DEGRADED_MS = 1200;

/**
 * Ping the public /health endpoint once and classify the result.
 * Never throws — a network failure resolves to a "down" probe.
 */
export async function probeHealth(timeoutMs = 5000): Promise<HealthProbe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    const latencyMs = Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        start,
    );

    if (!res.ok) {
      return { state: "down", latencyMs, checkedAt: Date.now() };
    }

    let version: string | undefined;
    try {
      const body = (await res.json()) as { version?: string };
      version = body?.version;
    } catch {
      // health body is best-effort; a 200 is enough to be "up".
    }

    return {
      state: latencyMs > DEGRADED_MS ? "degraded" : "operational",
      latencyMs,
      checkedAt: Date.now(),
      version,
    };
  } catch {
    return { state: "down", latencyMs: null, checkedAt: Date.now() };
  } finally {
    clearTimeout(timer);
  }
}

export interface UptimeSummary {
  // Rolling availability percentage from the external monitor, or null when
  // no monitor is configured (we never invent this number).
  availability: number | null;
  // Per-day up/down/degraded summary for the status page calendar, newest last.
  days: Array<{ date: string; state: HealthState }>;
  source: "betterstack" | "none";
}

/**
 * Fetch the historical uptime summary from our own /api/uptime route, which
 * proxies the external monitor server-side (keeping the token secret).
 * Resolves to an empty summary if the monitor isn't configured.
 */
export async function fetchUptimeSummary(): Promise<UptimeSummary> {
  try {
    const res = await fetch("/api/uptime", { cache: "no-store" });
    if (!res.ok) return { availability: null, days: [], source: "none" };
    return (await res.json()) as UptimeSummary;
  } catch {
    return { availability: null, days: [], source: "none" };
  }
}
