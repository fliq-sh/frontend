"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useApi, createJobsApi } from "@/lib/api";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

/** How far out the one-click test job is scheduled — long enough to watch it
 *  move pending → running → completed, short enough not to lose attention. */
const LEAD_MS = 12_000;

/**
 * "Fire a test job" — schedules a REAL job through the session (no API token,
 * no curl) against the public health endpoint, ~12s out. The point is
 * time-to-first-wow: the user watches the row go pending → running → completed
 * without leaving the dashboard. Calls `onScheduled(jobId)` so the caller can
 * auto-expand the new row.
 */
export function TestJobButton({
  onScheduled,
  variant = "default",
  className,
}: {
  onScheduled?: (jobId: string) => void;
  variant?: "default" | "outline";
  className?: string;
}) {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fire() {
    setLoading(true);
    setError(null);
    try {
      const res = await createJobsApi(apiFetch).create({
        url: `${SITE.apiUrl}${SITE.healthPath}`,
        method: "GET",
        scheduled_at: new Date(Date.now() + LEAD_MS).toISOString(),
        max_retries: 2,
        timeout_seconds: 30,
      });
      onScheduled?.(res.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't schedule the test job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        size="sm"
        variant={variant}
        className={className}
        disabled={loading}
        onClick={fire}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "Scheduling…" : "Fire a test job"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
