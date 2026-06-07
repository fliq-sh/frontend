"use client";

import Link from "next/link";
import { useUptime } from "@/hooks/use-uptime";
import type { HealthState } from "@/lib/public-api";

const META: Record<
  HealthState | "loading",
  { label: string; dot: string; text: string; ring: string }
> = {
  operational: {
    label: "All systems operational",
    dot: "bg-green-400",
    text: "text-green-300",
    ring: "border-green-500/30 bg-green-500/10",
  },
  degraded: {
    label: "Degraded performance",
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "border-amber-500/30 bg-amber-500/10",
  },
  down: {
    label: "Service disruption",
    dot: "bg-red-400",
    text: "text-red-300",
    ring: "border-red-500/30 bg-red-500/10",
  },
  loading: {
    label: "Checking status",
    dot: "bg-white/40",
    text: "text-white/50",
    ring: "border-white/10 bg-white/5",
  },
};

function Dot({ state }: { state: HealthState | "loading" }) {
  const m = META[state];
  return (
    <span className="relative flex h-2 w-2">
      {state !== "loading" && state !== "down" && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${m.dot}`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${m.dot}`} />
    </span>
  );
}

/**
 * Live status indicator backed by the public /health endpoint.
 *
 * - `pill`   — compact navbar pill, links to /status, shows latency on hover
 * - `inline` — dot + short label, for the hero
 */
export default function LiveStatus({
  variant = "pill",
}: {
  variant?: "pill" | "inline";
}) {
  const { probe, loading } = useUptime({ intervalMs: 20_000 });
  const state: HealthState | "loading" = loading || !probe ? "loading" : probe.state;
  const m = META[state];

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <Dot state={state} />
        <span className={m.text}>{m.label}</span>
        {probe?.latencyMs != null && state !== "down" && (
          <span className="font-mono text-xs text-white/40">
            {probe.latencyMs}ms
          </span>
        )}
      </span>
    );
  }

  return (
    <Link
      href="/status"
      title={
        probe?.latencyMs != null
          ? `${m.label} · ${probe.latencyMs}ms`
          : m.label
      }
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors hover:brightness-125 ${m.ring}`}
    >
      {/* Constant label + colored dot — the pill never changes width as the
          state changes, so it can't reflow the navbar. State is read from the
          dot/text color (full label is in the title and on /status). */}
      <Dot state={state} />
      <span className={`font-medium ${m.text}`}>Status</span>
    </Link>
  );
}
