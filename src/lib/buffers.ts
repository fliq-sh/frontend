// Dependency-free simulation of "blast N requests at a rate-limited API",
// comparing a naive direct blast against pacing the calls through a Fliq buffer.
//
// The upstream API is modelled as a token bucket: capacity `targetLimit`,
// refilling `targetLimit` tokens per second, starting full. A request that
// arrives when the bucket is empty is rejected with HTTP 429.
//
//  - Direct lane:   the client fires all N requests at t = 0 with no pacing.
//                   The first `targetLimit` drain the bucket and succeed; the
//                   rest hit an empty bucket and are rejected. A naive client
//                   does not retry, so those requests are simply lost.
//  - Buffered lane: Fliq releases items at `bufferRate` req/s. As long as
//                   `bufferRate <= targetLimit` the bucket is never exhausted,
//                   so every request succeeds — it just takes N / bufferRate
//                   seconds to drain.
//
// IMPORTANT: pure + deterministic. Never calls `new Date()` or Math.random(),
// so it is safe to evaluate during render and trivial to reason about.

export type BufferScenario = {
  /** total requests fired in the burst */
  count: number;
  /** upstream rate limit in requests/second (token-bucket capacity + refill) */
  targetLimit: number;
  /** rate at which Fliq releases buffered items, requests/second */
  bufferRate: number;
};

export type LaneState = {
  /** how many requests have left the client so far */
  sent: number;
  /** delivered with a 2xx */
  ok: number;
  /** rejected with a 429 */
  rejected: number;
  /** still waiting in the buffer (buffered lane only) */
  pending: number;
  /** elapsed virtual seconds for this lane */
  elapsed: number;
  /** whether the lane has drained */
  done: boolean;
};

export type BufferPreset = {
  label: string;
  hint: string;
  scenario: BufferScenario;
};

export const BUFFER_PRESETS: BufferPreset[] = [
  {
    label: "Webhook fan-out",
    hint: "200 calls · 10/s API",
    scenario: { count: 200, targetLimit: 10, bufferRate: 10 },
  },
  {
    label: "Payments API",
    hint: "500 calls · 25/s API",
    scenario: { count: 500, targetLimit: 25, bufferRate: 25 },
  },
  {
    label: "Strict 1/s API",
    hint: "60 calls · 1/s API",
    scenario: { count: 60, targetLimit: 1, bufferRate: 1 },
  },
  {
    label: "Stay under 80%",
    hint: "300 calls · 50/s API, pace at 40",
    scenario: { count: 300, targetLimit: 50, bufferRate: 40 },
  },
];

/** Clamp a scenario to sane, finite bounds so the UI can never wedge. */
export function normalizeScenario(s: BufferScenario): BufferScenario {
  const count = clampInt(s.count, 1, 2000);
  const targetLimit = clampInt(s.targetLimit, 1, 1000);
  // Pacing above the upstream limit defeats the buffer; allow it (so users can
  // see it fail) but keep it finite.
  const bufferRate = clampInt(s.bufferRate, 1, 1000);
  return { count, targetLimit, bufferRate };
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Direct blast outcome. Instant: the burst empties the bucket at t = 0.
 *  - delivered = min(count, targetLimit)
 *  - rejected  = the rest (lost, since a naive blast does not retry)
 */
export function simulateDirect(scenario: BufferScenario): LaneState {
  const { count, targetLimit } = normalizeScenario(scenario);
  const ok = Math.min(count, targetLimit);
  const rejected = count - ok;
  return { sent: count, ok, rejected, pending: 0, elapsed: 0, done: true };
}

/**
 * Buffered outcome at a given virtual time `t` (seconds). Requests are released
 * one every 1 / bufferRate seconds; each released request succeeds while the
 * pace stays within the upstream limit, otherwise the overflow within a 1s
 * window is rejected (so over-pacing is visibly punished).
 */
export function simulateBufferedAt(
  scenario: BufferScenario,
  t: number,
): LaneState {
  const { count, targetLimit, bufferRate } = normalizeScenario(scenario);
  const released = Math.max(0, Math.min(count, Math.floor(t * bufferRate)));

  // Fraction of released requests that exceed the upstream limit. When pacing
  // is at or below the limit this is zero — the buffer's whole point.
  const overflowPerSecond = Math.max(0, bufferRate - targetLimit);
  const rejected =
    bufferRate > 0
      ? Math.round(released * (overflowPerSecond / bufferRate))
      : 0;
  const ok = released - rejected;

  const total = duration(scenario);
  const done = released >= count;
  return {
    sent: released,
    ok,
    rejected,
    pending: count - released,
    elapsed: done ? total : Math.max(0, t),
    done,
  };
}

/** Total virtual seconds for the buffered lane to drain. */
export function duration(scenario: BufferScenario): number {
  const { count, bufferRate } = normalizeScenario(scenario);
  return count / bufferRate;
}

/** Final buffered outcome (t = duration). */
export function simulateBuffered(scenario: BufferScenario): LaneState {
  return simulateBufferedAt(scenario, duration(scenario) + 1);
}

/** Human "3.2s" / "1m 04s" style label for a number of seconds. */
export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.max(0, seconds).toFixed(1)}s`;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
