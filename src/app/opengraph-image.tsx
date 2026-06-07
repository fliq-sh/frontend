import { ImageResponse } from "next/og";

export const alt = "Fliq — Reliable HTTP job scheduling for developers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social card for the whole site. Satori (ImageResponse) doesn't
// support SVG filters/gradients, so the F-mark is drawn with solid shapes —
// same approach as src/app/icon.tsx.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.25) 0%, transparent 60%)",
          padding: 72,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#0d0d12",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
            }}
          >
            <div style={{ position: "absolute", left: 14, top: 12, width: 8, height: 34, borderRadius: 2, background: "white" }} />
            <div style={{ position: "absolute", left: 14, top: 12, width: 28, height: 8, borderRadius: 2, background: "#6366f1" }} />
            <div style={{ position: "absolute", left: 14, top: 26, width: 20, height: 7, borderRadius: 2, background: "#818cf8" }} />
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            Fliq
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Cron jobs & scheduled webhooks, without the infrastructure
          </span>
          <span style={{ fontSize: 30, color: "rgba(255,255,255,0.6)", maxWidth: 900 }}>
            Schedule any HTTP request. Automatic retries, crash recovery, full
            execution history.
          </span>
        </div>

        {/* Bottom: beta pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid rgba(99,102,241,0.4)",
              background: "rgba(99,102,241,0.12)",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 24,
              color: "#c7d2fe",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#4ade80", display: "flex" }} />
            Free during public beta · 100k executions/day
          </div>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.4)" }}>fliq.sh</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
