import Link from "next/link";
import { Button } from "@/components/ui/button";
import LiveStatus from "./LiveStatus";
import SchedulerVisual from "./SchedulerVisual";
import { BETA } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-32 sm:pb-32">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-grid-lines pointer-events-none z-0" />
      {/* Soft white glow — monochrome, no colour */}
      <div
        className="absolute pointer-events-none z-0 animate-glow-breathe"
        style={{
          top: "-12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "960px",
          height: "540px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 45%, transparent 72%)",
          filter: "blur(12px)",
        }}
      />
      {/* Fade grid into bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b] pointer-events-none z-10" />

      <div className="relative z-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-12 items-center">
        {/* ── Copy ── */}
        <div className="flex flex-col items-start gap-7 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {BETA.headline} — {BETA.executionsPerDayLabel}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Schedule any HTTP request.
            <br />
            Fliq runs it <span className="italic">on time</span>.
          </h1>

          <p className="text-lg text-white/55 leading-relaxed">
            Cron jobs and scheduled webhooks without running infrastructure.
            Automatic retries, crash recovery, and a full per-execution history —
            in one API call. Built for backend teams and the AI agents they ship.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start free →</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <LiveStatus variant="inline" />
            <span className="text-xs text-white/30">
              {BETA.pill}
            </span>
          </div>
        </div>

        {/* ── Live scheduler visual ── */}
        <div className="w-full">
          <SchedulerVisual />
        </div>
      </div>
    </section>
  );
}
