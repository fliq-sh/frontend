"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BETA } from "@/lib/site";
import { explainCron, formatUtc, CRON_PRESETS } from "@/lib/cron";

export default function CronExplainer() {
  const [expr, setExpr] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);

  // Stable evaluation reference time — created once on mount so we never call
  // new Date() during render of the pure parser at module scope.
  const [now] = useState(() => new Date());

  const result = useMemo(
    () => explainCron(expr, { count: 5, from: now }),
    [expr, now],
  );

  function copy() {
    navigator.clipboard?.writeText(expr).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Input */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <label
          htmlFor="cron-input"
          className="block text-xs uppercase tracking-wider text-white/40 mb-2"
        >
          Cron expression
        </label>
        <div className="flex gap-2">
          <input
            id="cron-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="* * * * *"
            className={`flex-1 font-mono text-lg rounded-lg border bg-[#09090b] px-4 py-3 outline-none transition-colors ${
              result.valid
                ? "border-white/10 focus:border-white/25"
                : "border-red-500/40 focus:border-red-500/60"
            }`}
          />
          <Button variant="outline" onClick={copy} className="font-mono">
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* Field legend */}
        <div className="mt-3 grid grid-cols-5 gap-2 text-[10px] text-white/30 font-mono">
          <span>minute</span>
          <span>hour</span>
          <span>day (month)</span>
          <span>month</span>
          <span>day (week)</span>
        </div>

        {/* Result / error */}
        <div className="mt-5">
          {result.valid ? (
            <p className="text-lg sm:text-xl font-semibold text-green-400">
              {result.description}
            </p>
          ) : (
            <p className="text-sm font-medium text-red-400">{result.error}</p>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((p) => {
            const active = p.expr === expr.trim();
            return (
              <button
                key={p.expr}
                onClick={() => setExpr(p.expr)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white/80"
                }`}
              >
                <span className="font-medium">{p.label}</span>
                <span className="ml-2 font-mono text-xs text-white/30">
                  {p.expr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next runs */}
      {result.valid && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-4">
            Next 5 runs
          </p>
          <ul className="space-y-2">
            {result.nextRuns.map((d, i) => (
              <li
                key={d.toISOString()}
                className="flex items-center gap-3 font-mono text-sm"
              >
                <span className="text-white/30 w-5 text-right">{i + 1}.</span>
                <span className="text-white/80">{formatUtc(d)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Schedule this on Fliq
        </h2>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          Run any cron on Fliq — automatic retries, crash recovery, full
          history. {BETA.headline}.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Start for free →</Link>
        </Button>
      </div>
    </div>
  );
}
