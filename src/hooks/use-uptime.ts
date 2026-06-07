"use client";

import { useEffect, useRef, useState } from "react";
import {
  probeHealth,
  fetchUptimeSummary,
  type HealthProbe,
  type UptimeSummary,
} from "@/lib/public-api";

interface UseUptimeOptions {
  // Poll interval in ms (default 20s). Set 0 for a single probe.
  intervalMs?: number;
  // Also pull the historical availability summary (status page only).
  withHistory?: boolean;
}

interface UptimeResult {
  probe: HealthProbe | null;
  summary: UptimeSummary | null;
  loading: boolean;
}

/**
 * Polls the public /health endpoint for live status + latency and (optionally)
 * the external-monitor availability summary. Pauses while the tab is hidden so
 * we don't keep the scale-to-zero API warm for nothing.
 */
export function useUptime({
  intervalMs = 20_000,
  withHistory = false,
}: UseUptimeOptions = {}): UptimeResult {
  const [probe, setProbe] = useState<HealthProbe | null>(null);
  const [summary, setSummary] = useState<UptimeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const next = await probeHealth();
      if (!cancelled) {
        setProbe(next);
        setLoading(false);
      }
    };

    tick();

    if (intervalMs > 0) {
      const start = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(tick, intervalMs);
      };
      const stop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          tick();
          start();
        } else {
          stop();
        }
      };
      start();
      document.addEventListener("visibilitychange", onVisibility);

      // capture for cleanup
      const cleanupVisibility = () =>
        document.removeEventListener("visibilitychange", onVisibility);

      if (withHistory) {
        fetchUptimeSummary().then((s) => !cancelled && setSummary(s));
      }

      return () => {
        cancelled = true;
        stop();
        cleanupVisibility();
      };
    }

    if (withHistory) {
      fetchUptimeSummary().then((s) => !cancelled && setSummary(s));
    }

    return () => {
      cancelled = true;
    };
  }, [intervalMs, withHistory]);

  return { probe, summary, loading };
}
