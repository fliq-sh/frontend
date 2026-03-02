"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import type { COBEOptions } from "cobe";

const HERO_GLOBE_CONFIG: COBEOptions = {
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
    { location: [40.7128, -74.006], size: 0.06 },    // New York
    { location: [41.8781, -87.6298], size: 0.05 },   // Chicago
    { location: [32.7767, -96.797], size: 0.05 },    // Dallas
    { location: [25.7617, -80.1918], size: 0.04 },   // Miami
    { location: [34.0522, -118.2437], size: 0.06 },  // Los Angeles
    { location: [47.6062, -122.3321], size: 0.05 },  // Seattle
    { location: [43.6532, -79.3832], size: 0.05 },   // Toronto
    { location: [-23.5505, -46.6333], size: 0.07 },  // São Paulo
    { location: [4.711, -74.0721], size: 0.04 },     // Bogotá
    { location: [-33.4489, -70.6693], size: 0.04 },  // Santiago
    // Europe
    { location: [51.5074, -0.1278], size: 0.07 },    // London
    { location: [50.1109, 8.6821], size: 0.07 },     // Frankfurt
    { location: [52.3676, 4.9041], size: 0.05 },     // Amsterdam
    { location: [48.8566, 2.3522], size: 0.06 },     // Paris
    { location: [40.4168, -3.7038], size: 0.05 },    // Madrid
    { location: [59.3293, 18.0686], size: 0.04 },    // Stockholm
    { location: [52.2297, 21.0122], size: 0.04 },    // Warsaw
    { location: [53.3498, -6.2603], size: 0.04 },    // Dublin
    // Middle East / Africa
    { location: [25.2048, 55.2708], size: 0.06 },    // Dubai
    { location: [32.0853, 34.7818], size: 0.04 },    // Tel Aviv
    { location: [30.0444, 31.2357], size: 0.05 },    // Cairo
    { location: [-26.2041, 28.0473], size: 0.05 },   // Johannesburg
    { location: [6.5244, 3.3792], size: 0.04 },      // Lagos
    // Asia-Pacific
    { location: [35.6762, 139.6503], size: 0.07 },   // Tokyo
    { location: [1.3521, 103.8198], size: 0.07 },    // Singapore
    { location: [-33.8688, 151.2093], size: 0.06 },  // Sydney
    { location: [37.5665, 126.978], size: 0.06 },    // Seoul
    { location: [19.076, 72.8777], size: 0.06 },     // Mumbai
    { location: [-6.2088, 106.8456], size: 0.05 },   // Jakarta
    { location: [22.3193, 114.1694], size: 0.06 },   // Hong Kong
    { location: [25.0478, 121.5319], size: 0.05 },   // Taipei
    { location: [34.6937, 135.5022], size: 0.05 },   // Osaka
    { location: [-36.8485, 174.7633], size: 0.04 },  // Auckland
  ],
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b] pointer-events-none z-10" />

      <div className="relative z-20 flex flex-col items-center gap-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          30+ global edge regions
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          The backbone your{" "}
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            AI agents
          </span>{" "}
          are missing
        </h1>

        <p className="text-lg text-white/60 max-w-xl">
          Schedule it, walk away. We fire on time, retry on failure, full
          visibility.
        </p>

        <div className="flex items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/app">Start Building →</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        <p className="text-xs text-white/30 tracking-widest uppercase">
          30+ regions &nbsp;·&nbsp; &lt;10ms median latency &nbsp;·&nbsp; 99.9% SLA
        </p>
      </div>

      {/* Globe */}
      <div className="relative z-10 mt-12 w-full max-w-2xl mx-auto">
        <Globe className="mx-auto" config={HERO_GLOBE_CONFIG} />
      </div>
    </section>
  );
}
