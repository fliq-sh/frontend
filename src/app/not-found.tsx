"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ATTEMPTS = [
  { num: 1, delay: 0,    ms: 118  },
  { num: 2, delay: 1400, ms: 231  },
  { num: 3, delay: 3200, ms: 89   },
];

export default function NotFound() {
  const pathname = usePathname();
  const [visibleAttempts, setVisibleAttempts] = useState(0);
  const [done, setDone] = useState(false);

  // Replay the "retry log" on mount so it feels live
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    ATTEMPTS.forEach((a, i) => {
      timers.push(setTimeout(() => setVisibleAttempts(i + 1), a.delay));
    });
    timers.push(setTimeout(() => setDone(true), 3200 + 600));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center px-4">

      {/* Status badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        HTTP 404 — Not Found
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3 tabular-nums">
        404
      </h1>
      <p className="text-white/50 text-base mb-10 text-center max-w-sm">
        This page was scheduled but never arrived.
        <br />
        We tried 3 times.
      </p>

      {/* Execution log card */}
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden mb-8">

        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/30">job_404_notfound</span>
          </div>
          <div className="flex items-center gap-1.5">
            {done
              ? <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              : <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            }
            <span className={`text-xs font-mono ${done ? "text-red-400" : "text-amber-400"}`}>
              {done ? "FAILED" : "RETRYING"}
            </span>
          </div>
        </div>

        {/* Job metadata */}
        <div className="px-4 py-3 border-b border-white/10 grid grid-cols-2 gap-2 font-mono text-xs">
          <div>
            <p className="text-white/30 mb-0.5">URL</p>
            <p className="text-indigo-300 truncate">GET {pathname}</p>
          </div>
          <div>
            <p className="text-white/30 mb-0.5">Max retries</p>
            <p className="text-white/70">3</p>
          </div>
        </div>

        {/* Attempt log */}
        <div className="px-4 py-3 space-y-2 font-mono text-xs min-h-[100px]">
          {ATTEMPTS.slice(0, visibleAttempts).map((a) => (
            <div key={a.num} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-white/20">#{a.num}</span>
                <span className="text-white/50">GET {pathname}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-white/30">{a.ms}ms</span>
                <span className="text-red-400">404</span>
              </div>
            </div>
          ))}

          {/* Typing indicator while waiting for next attempt */}
          {!done && visibleAttempts < ATTEMPTS.length && (
            <div className="flex items-center gap-1.5 text-white/20">
              <span className="animate-pulse">retrying</span>
              <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "0.6s" }}>.</span>
            </div>
          )}
        </div>

        {/* Final error */}
        {done && (
          <div className="px-4 py-3 border-t border-red-500/10 bg-red-500/[0.04]">
            <p className="font-mono text-xs text-red-400/70">
              ✕ max_retries exhausted — no further attempts will be made
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">← Back to home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs">Read the docs</Link>
        </Button>
      </div>

      <p className="mt-10 text-xs text-white/20 font-mono">
        fliq.dev · execution history retained for 7 days
      </p>
    </div>
  );
}
