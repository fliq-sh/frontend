import { NextResponse } from "next/server";
import type { UptimeSummary, HealthState } from "@/lib/public-api";

// Server-side proxy to the external uptime monitor (BetterStack). Keeps the
// API token off the client. If no token is configured the route returns an
// empty summary and the UI shows live status only — we never fabricate a
// historical uptime number.
//
// Configure in the frontend deploy env:
//   BETTERSTACK_UPTIME_TOKEN   — BetterStack Uptime API token (read)
//   BETTERSTACK_MONITOR_ID     — the monitor watching https://api.fliq.sh/health

const EMPTY: UptimeSummary = { availability: null, days: [], source: "none" };

// Cache the upstream response for 5 minutes — uptime history moves slowly and
// we don't want every visitor hitting BetterStack.
export const revalidate = 300;

export async function GET() {
  const token = process.env.BETTERSTACK_UPTIME_TOKEN;
  const monitorId = process.env.BETTERSTACK_MONITOR_ID;

  if (!token || !monitorId) {
    return NextResponse.json(EMPTY);
  }

  try {
    const res = await fetch(
      `https://uptime.betterstack.com/api/v2/monitors/${monitorId}/sla?from=${dateNDaysAgo(90)}&to=${today()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate },
      },
    );
    if (!res.ok) return NextResponse.json(EMPTY);

    const json = (await res.json()) as {
      data?: { attributes?: { availability?: number } };
    };
    const availability = json?.data?.attributes?.availability ?? null;

    // BetterStack's SLA endpoint gives an aggregate; per-day detail would come
    // from a separate endpoint. We surface the headline number and leave the
    // calendar empty until per-day data is wired — honest about what we have.
    const summary: UptimeSummary = {
      availability:
        typeof availability === "number"
          ? Math.round(availability * 1000) / 1000
          : null,
      days: [] as Array<{ date: string; state: HealthState }>,
      source: "betterstack",
    };
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(EMPTY);
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
