"use client";

import { useRef, useCallback } from "react";
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
    // Americas
    { location: [40.7128, -74.006], size: 0.06 },
    { location: [41.8781, -87.6298], size: 0.05 },
    { location: [32.7767, -96.797], size: 0.05 },
    { location: [25.7617, -80.1918], size: 0.04 },
    { location: [34.0522, -118.2437], size: 0.06 },
    { location: [47.6062, -122.3321], size: 0.05 },
    { location: [43.6532, -79.3832], size: 0.05 },
    { location: [-23.5505, -46.6333], size: 0.07 },
    { location: [4.711, -74.0721], size: 0.04 },
    { location: [-33.4489, -70.6693], size: 0.04 },
    // Europe
    { location: [51.5074, -0.1278], size: 0.07 },
    { location: [50.1109, 8.6821], size: 0.07 },
    { location: [52.3676, 4.9041], size: 0.05 },
    { location: [48.8566, 2.3522], size: 0.06 },
    { location: [40.4168, -3.7038], size: 0.05 },
    { location: [59.3293, 18.0686], size: 0.04 },
    { location: [52.2297, 21.0122], size: 0.04 },
    { location: [53.3498, -6.2603], size: 0.04 },
    // Middle East / Africa
    { location: [25.2048, 55.2708], size: 0.06 },
    { location: [32.0853, 34.7818], size: 0.04 },
    { location: [30.0444, 31.2357], size: 0.05 },
    { location: [-26.2041, 28.0473], size: 0.05 },
    { location: [6.5244, 3.3792], size: 0.04 },
    // Asia-Pacific
    { location: [35.6762, 139.6503], size: 0.07 },
    { location: [1.3521, 103.8198], size: 0.07 },
    { location: [-33.8688, 151.2093], size: 0.06 },
    { location: [37.5665, 126.978], size: 0.06 },
    { location: [19.076, 72.8777], size: 0.06 },
    { location: [-6.2088, 106.8456], size: 0.05 },
    { location: [22.3193, 114.1694], size: 0.06 },
    { location: [25.0478, 121.5319], size: 0.05 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [-36.8485, 174.7633], size: 0.04 },
  ],
};

// ─── Arc connections between city pairs ─────────────────────────────────────

type LatLng = [number, number];

const ARC_CONNECTIONS: [LatLng, LatLng][] = [
  [[40.7128, -74.006], [51.5074, -0.1278]],     // NYC → London
  [[35.6762, 139.6503], [1.3521, 103.8198]],     // Tokyo → Singapore
  [[51.5074, -0.1278], [25.2048, 55.2708]],      // London → Dubai
  [[1.3521, 103.8198], [48.8566, 2.3522]],       // Singapore → Paris
  [[-23.5505, -46.6333], [40.7128, -74.006]],    // São Paulo → NYC
  [[25.2048, 55.2708], [35.6762, 139.6503]],     // Dubai → Tokyo
  [[34.0522, -118.2437], [40.7128, -74.006]],    // LA → NYC
  [[51.5074, -0.1278], [-33.8688, 151.2093]],    // London → Sydney
  [[40.7128, -74.006], [22.3193, 114.1694]],     // NYC → HK
  [[-33.8688, 151.2093], [1.3521, 103.8198]],    // Sydney → Singapore
];

const ARC_DURATION = 3800;  // ms for one packet to travel
const ARC_GAP = 600;        // ms gap between each arc's cycle
const GLOBE_THETA = 0.3;    // must match HERO_GLOBE_CONFIG.theta

// ─── Math helpers ────────────────────────────────────────────────────────────

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

/**
 * Projects (lat, lng) to 2D canvas coordinates given the globe's current phi.
 * Viewer is at +Z. Y is up (north). phi rotates around Y.
 */
function projectGlobe(
  lat: number,
  lng: number,
  phi: number,
  size: number,
): { x: number; y: number; visible: boolean } {
  const latR = toRad(lat);
  const lngR = toRad(lng);

  // Cartesian on unit sphere — lng=0 is at +Z (faces viewer at phi=0)
  const x0 = Math.cos(latR) * Math.sin(lngR);
  const y0 = Math.sin(latR);
  const z0 = Math.cos(latR) * Math.cos(lngR);

  // Apply globe phi rotation (around Y axis, using -phi convention)
  const cp = Math.cos(-phi);
  const sp = Math.sin(-phi);
  const x1 = x0 * cp + z0 * sp;
  const z1 = -x0 * sp + z0 * cp;

  // Apply theta tilt (around X axis)
  const ct = Math.cos(GLOBE_THETA);
  const st = Math.sin(GLOBE_THETA);
  const y2 = y0 * ct - z1 * st;
  const z2 = y0 * st + z1 * ct;

  // Orthographic projection — globe radius ≈ 47% of canvas size
  const r = size * 0.47;

  return {
    x: size / 2 + x1 * r,
    y: size / 2 - y2 * r,
    visible: z2 > 0.02,
  };
}

/**
 * Spherical linear interpolation between two lat/lng points.
 * Returns a point on the great circle path at parameter t ∈ [0, 1].
 */
function slerpLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  const aLatR = toRad(a[0]);
  const aLngR = toRad(a[1]);
  const bLatR = toRad(b[0]);
  const bLngR = toRad(b[1]);

  const av: [number, number, number] = [
    Math.cos(aLatR) * Math.cos(aLngR),
    Math.sin(aLatR),
    Math.cos(aLatR) * Math.sin(aLngR),
  ];
  const bv: [number, number, number] = [
    Math.cos(bLatR) * Math.cos(bLngR),
    Math.sin(bLatR),
    Math.cos(bLatR) * Math.sin(bLngR),
  ];

  const dot = Math.max(-1, Math.min(1, av[0] * bv[0] + av[1] * bv[1] + av[2] * bv[2]));
  const omega = Math.acos(dot);

  if (omega < 0.001) return a;

  const s = 1 / Math.sin(omega);
  const s1 = Math.sin((1 - t) * omega) * s;
  const s2 = Math.sin(t * omega) * s;

  const rx = s1 * av[0] + s2 * bv[0];
  const ry = s1 * av[1] + s2 * bv[1];
  const rz = s1 * av[2] + s2 * bv[2];

  return [
    (Math.asin(Math.max(-1, Math.min(1, ry))) * 180) / Math.PI,
    (Math.atan2(rz, rx) * 180) / Math.PI,
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HeroGlobe() {
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const handleFrame = useCallback((phi: number, size: number) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync pixel dimensions to match COBE's retina canvas
    if (canvas.width !== size) {
      canvas.width = size;
      canvas.height = size;
    }

    ctx.clearRect(0, 0, size, size);

    const now = performance.now();
    const cycle = ARC_DURATION + ARC_GAP;

    ARC_CONNECTIONS.forEach(([from, to], idx) => {
      // Each arc is offset in time so they start staggered
      const t = ((now + idx * (cycle / ARC_CONNECTIONS.length) * 2.3) % cycle) / ARC_DURATION;
      if (t > 1) return; // in gap

      // Fade in/out over 8% of the arc's lifetime
      const fadeIn = Math.min(1, t / 0.08);
      const fadeOut = Math.min(1, (1 - t) / 0.08);
      const opacity = Math.min(fadeIn, fadeOut);

      const SEGS = 80;

      // ── Draw track (dashed great-circle line) ──
      ctx.beginPath();
      let penDown = false;
      let prevVisible = false;

      for (let i = 0; i <= SEGS; i++) {
        const pt = slerpLatLng(from, to, i / SEGS);
        const p = projectGlobe(pt[0], pt[1], phi, size);

        if (p.visible) {
          if (!penDown || !prevVisible) {
            ctx.moveTo(p.x, p.y);
            penDown = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        prevVisible = p.visible;
      }

      ctx.strokeStyle = `rgba(99,102,241,${0.28 * opacity})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Draw trailing packet ──
      const TRAIL_STEPS = 14;
      const TRAIL_LEN = 0.09; // as fraction of full arc

      for (let i = 0; i <= TRAIL_STEPS; i++) {
        const frac = i / TRAIL_STEPS;
        const pt = Math.max(0, t - TRAIL_LEN * (1 - frac));
        const [lat, lng] = slerpLatLng(from, to, pt);
        const p = projectGlobe(lat, lng, phi, size);

        if (!p.visible) continue;

        const isHead = i === TRAIL_STEPS;

        if (isHead) {
          // Glowing head — outer halo
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,92,246,${0.15 * opacity})`;
          ctx.fill();

          // Inner bright dot
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(167,139,250,${0.9 * opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,190,255,${opacity})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Trail — fades from head backward
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
    </div>
  );
}
