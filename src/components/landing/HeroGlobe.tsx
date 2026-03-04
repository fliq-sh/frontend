"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Globe } from "@/components/ui/globe";
import type { COBEOptions } from "cobe";

// ─── Globe config ────────────────────────────────────────────────────────────

export const HERO_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.1, 0.1, 0.15],
  markerColor: [99 / 255, 102 / 255, 241 / 255],
  glowColor: [0.2, 0.2, 0.4],
  markers: [
    { location: [39.0438,  -77.4874], size: 0.06 },  // Ashburn VA
    { location: [50.1109,    8.6821], size: 0.06 },  // Frankfurt
    { location: [ 1.3521,  103.8198], size: 0.06 },  // Singapore
    { location: [40.7128,  -74.006 ], size: 0.05 },
    { location: [34.0522, -118.2437], size: 0.05 },
    { location: [-23.5505, -46.6333], size: 0.05 },
    { location: [51.5074,   -0.1278], size: 0.05 },
    { location: [48.8566,    2.3522], size: 0.04 },
    { location: [52.3676,    4.9041], size: 0.04 },
    { location: [25.2048,   55.2708], size: 0.05 },
    { location: [30.0444,   31.2357], size: 0.04 },
    { location: [35.6762,  139.6503], size: 0.05 },
    { location: [-33.8688, 151.2093], size: 0.05 },
    { location: [22.3193,  114.1694], size: 0.05 },
    { location: [19.076,    72.8777], size: 0.04 },
    { location: [37.5665,  126.978 ], size: 0.04 },
    { location: [-26.2041,  28.0473], size: 0.04 },
    { location: [43.6532,  -79.3832], size: 0.04 },
    { location: [47.6062, -122.3321], size: 0.04 },
  ],
};

// ─── Arc connections: Fliq servers → customer endpoints ──────────────────────

type LatLng = [number, number];
type Vec3   = [number, number, number];

// Fliq edge server locations (these get a larger marker on the globe)
const SERVER_LOCATIONS: LatLng[] = [
  [39.0438,  -77.4874],  // Ashburn, VA  (us-east)
  [50.1109,    8.6821],  // Frankfurt    (eu-central)
  [ 1.3521,  103.8198],  // Singapore    (ap-southeast)
];

// Each arc: [customer-endpoint, nearest-server] — packets fly TO Fliq servers
const ARC_CONNECTIONS: [LatLng, LatLng][] = [
  [[40.7128,  -74.006 ], SERVER_LOCATIONS[0]],  // NYC       → us-east
  [[34.0522, -118.2437], SERVER_LOCATIONS[0]],  // LA        → us-east
  [[-23.5505, -46.6333], SERVER_LOCATIONS[0]],  // São Paulo → us-east
  [[51.5074,   -0.1278], SERVER_LOCATIONS[1]],  // London    → eu
  [[25.2048,   55.2708], SERVER_LOCATIONS[1]],  // Dubai     → eu
  [[35.6762,  139.6503], SERVER_LOCATIONS[2]],  // Tokyo     → ap
  [[-33.8688, 151.2093], SERVER_LOCATIONS[2]],  // Sydney    → ap
  [[22.3193,  114.1694], SERVER_LOCATIONS[2]],  // Hong Kong → ap
];

const ARC_DURATION  = 3800;
const ARC_GAP       = 600;
const GLOBE_THETA   = 0.3;
const PATH_SEGS     = 40;   // pre-computed segments per arc (was 80 live slerps)
const TRAIL_STEPS   = 8;    // trail dots (was 14)
const TRAIL_LEN     = 0.09;

// Pre-compute theta trig once (theta never changes)
const COS_THETA = Math.cos(GLOBE_THETA);
const SIN_THETA = Math.sin(GLOBE_THETA);


// ─── Math helpers ────────────────────────────────────────────────────────────

function toRad(d: number) { return (d * Math.PI) / 180; }

function latLngToVec3(lat: number, lng: number): Vec3 {
  const la = toRad(lat), lo = toRad(lng);
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function slerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2]));
  const omega = Math.acos(dot);
  if (omega < 0.001) return a;
  const s  = 1 / Math.sin(omega);
  const s1 = Math.sin((1 - t) * omega) * s;
  const s2 = Math.sin(t * omega) * s;
  return [s1*a[0]+s2*b[0], s1*a[1]+s2*b[1], s1*a[2]+s2*b[2]];
}

// Pre-compute all arc paths at module load — eliminates slerp from the frame loop
const ARC_PATHS: Vec3[][] = ARC_CONNECTIONS.map(([from, to]) => {
  const a = latLngToVec3(...from);
  const b = latLngToVec3(...to);
  return Array.from({ length: PATH_SEGS + 1 }, (_, i) => slerpVec3(a, b, i / PATH_SEGS));
});

/**
 * Sample a pre-computed path at t ∈ [0,1] via linear interpolation.
 * Much cheaper than slerp — just index math + lerp.
 */
function samplePath(path: Vec3[], t: number): Vec3 {
  const idx = t * PATH_SEGS;
  const i   = Math.min(Math.floor(idx), PATH_SEGS - 1);
  const f   = idx - i;
  const a   = path[i], b = path[i + 1];
  return [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
}

/**
 * Project a unit-sphere Vec3 to 2D canvas coords.
 * cp/sp (cos/sin of -phi) are lifted out of the inner loop by the caller.
 */
function projectVec3(
  v: Vec3, cp: number, sp: number, size: number,
): { x: number; y: number; visible: boolean } {
  const [x0, y0, z0] = v;
  const x1 =  x0 * cp + z0 * sp;
  const z1 = -x0 * sp + z0 * cp;
  const y2 =  y0 * COS_THETA - z1 * SIN_THETA;
  const z2 =  y0 * SIN_THETA + z1 * COS_THETA;
  const r  = size * 0.47;
  return { x: size/2 + x1*r, y: size/2 - y2*r, visible: z2 > 0.02 };
}

// ─── Floating job messages ────────────────────────────────────────────────────

const JOB_MESSAGES = [
  { text: "Book a trip to Kyrgyzstan 🇰🇬",       side: "left"  },
  { text: "Charge card after trial ends 💳",      side: "right" },
  { text: "Send weekly digest email 📧",          side: "left"  },
  { text: "Expire promo code at midnight ⏰",     side: "right" },
  { text: "Sync inventory every 15 min 🔄",       side: "left"  },
  { text: "Remind user 48h after signup 👋",      side: "right" },
  { text: "Archive old records on Sunday 🗂️",    side: "left"  },
  { text: "POST webhook on order shipped 📦",     side: "right" },
  { text: "Rotate API keys monthly 🔑",           side: "left"  },
  { text: "Generate monthly report 📊",           side: "right" },
];

const VISIBLE_AT_ONCE = 3;
const SHOW_DURATION = 2800;   // ms each bubble is fully visible
const CYCLE_INTERVAL = 1800;  // ms between new bubble appearances

interface Bubble {
  id: number;
  msg: (typeof JOB_MESSAGES)[number];
  phase: "enter" | "visible" | "exit";
}

function FloatingMessages() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextIdRef = useRef(0);
  const msgIdxRef = useRef(0);

  useEffect(() => {
    // Seed first bubble immediately then stagger the rest
    const spawn = () => {
      const msg = JOB_MESSAGES[msgIdxRef.current % JOB_MESSAGES.length];
      msgIdxRef.current++;
      const id = nextIdRef.current++;

      setBubbles(prev => {
        // Keep at most VISIBLE_AT_ONCE — drop oldest if needed
        const trimmed = prev.length >= VISIBLE_AT_ONCE ? prev.slice(1) : prev;
        return [...trimmed, { id, msg, phase: "enter" }];
      });

      // enter → visible
      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === id ? { ...b, phase: "visible" } : b));
      }, 50);

      // visible → exit
      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === id ? { ...b, phase: "exit" } : b));
      }, SHOW_DURATION);

      // remove after exit animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== id));
      }, SHOW_DURATION + 600);
    };

    spawn();
    const interval = setInterval(spawn, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((b, stackIdx) => {
        const isLeft = b.msg.side === "left";

        // Stack offset — newest at top, older ones pushed down
        const stackOffset = (bubbles.length - 1 - stackIdx) * 52;

        const baseStyle: React.CSSProperties = {
          position: "absolute",
          bottom: `calc(30% + ${stackOffset}px)`,
          transition: "bottom 0.4s ease",
          ...(isLeft
            ? { left: "2%"  }
            : { right: "2%" }),
        };

        const opacity =
          b.phase === "enter"   ? 0 :
          b.phase === "visible" ? 1 : 0;

        const translateY =
          b.phase === "enter"   ? "12px" :
          b.phase === "visible" ? "0px"  : "-8px";

        // iOS iMessage style: received = dark gray (left), sent = indigo (right)
        const bubbleBg   = isLeft ? "rgba(58,58,60,0.92)"   : "rgba(88,86,214,0.92)";
        const tailColor  = isLeft ? "rgba(58,58,60,0.92)"   : "rgba(88,86,214,0.92)";

        // CSS border-trick triangle tail pointing down-left or down-right
        const tailStyle: React.CSSProperties = isLeft
          ? {
              position: "absolute",
              bottom: -6,
              left: 10,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: `7px solid ${tailColor}`,
            }
          : {
              position: "absolute",
              bottom: -6,
              right: 10,
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `7px solid ${tailColor}`,
            };

        return (
          <div
            key={b.id}
            style={{
              ...baseStyle,
              opacity,
              transform: `translateY(${translateY})`,
              transition: "opacity 0.45s ease, transform 0.45s ease, bottom 0.4s ease",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 16px",
                borderRadius: isLeft ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
                background: bubbleBg,
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.92)",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
            >
              {b.msg.text}
              <div style={tailStyle} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroGlobe() {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const handleFrame = useCallback((phi: number, size: number) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== size) { canvas.width = size; canvas.height = size; }
    ctx.clearRect(0, 0, size, size);

    const now   = performance.now();
    const cycle = ARC_DURATION + ARC_GAP;

    // Compute phi trig ONCE per frame — reused for every point projection
    const cp = Math.cos(-phi);
    const sp = Math.sin(-phi);

    ARC_PATHS.forEach((path, idx) => {
      const t = ((now + idx * (cycle / ARC_PATHS.length) * 2.3) % cycle) / ARC_DURATION;
      if (t > 1) return;

      const fadeIn  = Math.min(1, t / 0.08);
      const fadeOut = Math.min(1, (1 - t) / 0.08);
      const opacity = Math.min(fadeIn, fadeOut);

      // ── Track (dashed great-circle line) — uses pre-computed path ──
      ctx.beginPath();
      let penDown = false, prevVisible = false;
      for (let i = 0; i <= PATH_SEGS; i++) {
        const p = projectVec3(path[i], cp, sp, size);
        if (p.visible) {
          if (!penDown || !prevVisible) { ctx.moveTo(p.x, p.y); penDown = true; }
          else ctx.lineTo(p.x, p.y);
        }
        prevVisible = p.visible;
      }
      ctx.strokeStyle = `rgba(99,102,241,${0.28 * opacity})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Trailing packet — samplePath replaces per-step slerp ──
      for (let i = 0; i <= TRAIL_STEPS; i++) {
        const frac = i / TRAIL_STEPS;
        const pt   = Math.max(0, t - TRAIL_LEN * (1 - frac));
        const p    = projectVec3(samplePath(path, pt), cp, sp, size);
        if (!p.visible) continue;

        if (i === TRAIL_STEPS) {
          // Head: outer halo + inner dot (no shadowBlur — too expensive)
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,92,246,${0.18 * opacity})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,190,255,${opacity})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,92,246,${frac * opacity * 0.45})`;
          ctx.fill();
        }
      }
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      <Globe
        config={HERO_GLOBE_CONFIG}
        onFrame={handleFrame}
        className="max-w-full"
      />
      {/* Overlay canvas — same retina dimensions as COBE canvas */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Floating job message bubbles */}
      <FloatingMessages />
    </div>
  );
}
