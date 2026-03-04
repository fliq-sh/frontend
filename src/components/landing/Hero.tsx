"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Load HeroGlobe client-only — COBE needs WebGL which doesn't exist on the server.
// This also defers heavy WebGL init until after the page is interactive.
const HeroGlobe = dynamic(() => import("./HeroGlobe"), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-full bg-indigo-950/20" />,
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Grid lines — fade out at bottom via gradient overlay below */}
      <div className="absolute inset-0 bg-grid-lines pointer-events-none z-0" />

      {/* Animated indigo/violet glow behind globe */}
      <div
        className="absolute pointer-events-none z-0 animate-glow-breathe"
        style={{
          bottom: "-5%",
          left: "50%",
          transform: "translateX(-53%)",
          width: "860px",
          height: "480px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 48% 60%, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.10) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Background gradient — fades grid + glow into page bg at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b] pointer-events-none z-10" />

      <div className="relative z-20 flex flex-col items-center gap-6 max-w-3xl mx-auto pt-20 sm:pt-24">
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
          Schedule it, walk away.{" "}
          <span className="text-white/80">On time, on retry, on record.</span>
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

      {/* Globe + arc overlay */}
      <div className="relative z-10 mt-6 w-full max-w-[920px] mx-auto aspect-[1/1]">
        <HeroGlobe />
      </div>
    </section>
  );
}
