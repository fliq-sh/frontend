"use client";

import { useUptime } from "@/hooks/use-uptime";
import type { HealthState } from "@/lib/public-api";
import { SITE } from "@/lib/site";

const STATE_META: Record<
  HealthState | "loading",
  { label: string; blurb: string; dot: string; text: string; panel: string }
> = {
  operational: {
    label: "All systems operational",
    blurb: "The Fliq API is responding normally.",
    dot: "bg-green-400",
    text: "text-green-300",
    panel: "border-green-500/30 bg-green-500/[0.07]",
  },
  degraded: {
    label: "Degraded performance",
    blurb: "The API is up but responding slowly.",
    dot: "bg-amber-400",
    text: "text-amber-300",
    panel: "border-amber-500/30 bg-amber-500/[0.07]",
  },
  down: {
    label: "Service disruption",
    blurb: "We can't reach the API from your browser right now.",
    dot: "bg-red-400",
    text: "text-red-300",
    panel: "border-red-500/30 bg-red-500/[0.07]",
  },
  loading: {
    label: "Checking status…",
    blurb: "Pinging the production API.",
    dot: "bg-white/40",
    text: "text-white/50",
    panel: "border-white/10 bg-white/[0.03]",
  },
};

export default function StatusClient() {
  const { probe, summary, loading } = useUptime({
    intervalMs: 15_000,
    withHistory: true,
  });
  const state: HealthState | "loading" = loading || !probe ? "loading" : probe.state;
  const m = STATE_META[state];

  return (
    <div className="space-y-6">
      {/* Headline status panel */}
      <div className={`rounded-2xl border p-6 ${m.panel}`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {state !== "loading" && state !== "down" && (
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${m.dot}`} />
            )}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${m.dot}`} />
          </span>
          <h2 className={`text-xl font-semibold ${m.text}`}>{m.label}</h2>
        </div>
        <p className="mt-2 text-sm text-white/60">{m.blurb}</p>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric
          label="Live response time"
          value={
            probe?.latencyMs != null ? `${probe.latencyMs} ms` : "—"
          }
          hint="round-trip from your browser"
        />
        <Metric
          label="90-day uptime"
          value={
            summary?.availability != null
              ? `${summary.availability.toFixed(3)}%`
              : "—"
          }
          hint={
            summary?.source === "betterstack"
              ? "via external monitor"
              : "monitor not configured yet"
          }
        />
        <Metric
          label="API version"
          value={probe?.version ?? "—"}
          hint={SITE.apiUrl.replace("https://", "")}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm text-white/60 leading-relaxed">
          This page pings{" "}
          <code className="font-mono text-xs text-indigo-300">
            {SITE.apiUrl}
            {SITE.healthPath}
          </code>{" "}
          directly from your browser every 15 seconds — so what you see is the
          real, current state of the production API. Historical uptime is
          tracked by an independent external monitor;{" "}
          {summary?.source === "betterstack"
            ? "its 90-day number is shown above."
            : "once it's connected, its 90-day number will appear above. We don't show a number we can't back up."}
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-white/40">{hint}</p>
    </div>
  );
}
