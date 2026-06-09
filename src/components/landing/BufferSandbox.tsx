"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/patterns";

// An interactive, client-side-only simulation of a Fliq buffer: submit a burst,
// watch Fliq release it to one target at a metered rate, in submission order,
// with no 429s. Not wired to any API — illustrative data only, labelled a demo.
// The honest mapping: a buffer is a per-second token bucket that releases items
// one at a time, in order, retrying in place. See frontend/CONTEXT.md.

const BURST = 12;
const CAP = 24; // the tank holds at most this many — keeps the demo legible
const VISIBLE = 6;
const TARGET = "api.stripe.com";

export default function BufferSandbox() {
  const [rate, setRate] = useState(4); // items per second released
  const [buffer, setBuffer] = useState<number[]>([]); // ids, front = next out
  const [delivered, setDelivered] = useState(0);
  const [flash, setFlash] = useState(false);
  const [reduced, setReduced] = useState(false);

  const rateRef = useRef(rate);
  const lenRef = useRef(0);
  const lastRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const nextId = useRef(1);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { lenRef.current = buffer.length; }, [buffer]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const sync = () => setReduced(mq.matches);
    const raf = requestAnimationFrame(sync);
    mq.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
    };
  }, []);

  // Token-bucket release loop: drop the oldest item once every (1000 / rate) ms.
  useEffect(() => {
    const step = (now: number) => {
      const interval = 1000 / rateRef.current;
      if (lenRef.current > 0 && now - lastRef.current >= interval) {
        lastRef.current = now;
        setBuffer((prev) => prev.slice(1));
        setDelivered((d) => d + 1);
        setFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(false), reduced ? 0 : 280);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [reduced]);

  const sendBurst = useCallback(() => {
    setBuffer((prev) => {
      const room = Math.max(0, CAP - prev.length);
      const add = Math.min(BURST, room);
      const ids = Array.from({ length: add }, () => nextId.current++);
      return [...prev, ...ids];
    });
    lastRef.current = 0; // release the first item on the next tick
  }, []);

  const buffered = buffer.length;
  const visible = buffer.slice(0, VISIBLE);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.06)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-2 text-[11px] uppercase tracking-widest text-white/30 font-mono">
            buffer
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/30">
            interactive demo
          </span>
        </div>

        {/* buffer (left) → metered release → target (right) */}
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-6">
          {/* The tank */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2 min-h-[180px] flex flex-col gap-1">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                buffer
              </span>
              <span className="font-mono text-[10px] text-white/30">
                in order ↓
              </span>
            </div>
            {visible.map((id, i) => (
              <div
                key={id}
                className="flex items-center justify-between rounded border border-white/10 bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-white/70 tabular-nums"
              >
                <span className="text-white/40">#{i + 1}</span>
                <span className="text-white/45">{i === 0 ? "next out" : "item"}</span>
              </div>
            ))}
            {buffered > VISIBLE && (
              <div className="px-1 pt-0.5 font-mono text-[10px] text-white/30 tabular-nums">
                +{buffered - VISIBLE} more
              </div>
            )}
            {buffered === 0 && (
              <div className="flex-1 flex items-center justify-center font-mono text-[10px] text-white/25">
                empty — send a burst
              </div>
            )}
          </div>

          {/* Metered connector */}
          <div className="flex flex-col items-center gap-1 px-1 text-white/30">
            <span className="font-mono text-[10px] tabular-nums text-white/50">
              {rate}/s
            </span>
            <span className="text-lg leading-none">→</span>
          </div>

          {/* Target */}
          <div
            className={`w-28 rounded-lg border px-2 py-3 text-center transition-colors ${
              flash ? "border-green-400/40 bg-green-400/[0.06]" : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="font-mono text-[10px] text-white/40">your target API</div>
            <div className="mt-1 font-mono text-[11px] text-white/70 break-all">
              {TARGET}
            </div>
            <div className="mt-2 flex justify-center">
              <StatusBadge tone="success" label="200 OK" pulse={flash} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 px-4 py-3 border-t border-white/[0.07] sm:flex-row sm:items-center">
          <Button size="sm" onClick={sendBurst} className="shrink-0">
            Send burst ({BURST})
          </Button>
          <label className="flex flex-1 items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/35 shrink-0">
              rate
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              aria-label="Delivery rate in requests per second"
              className="flex-1 accent-white/80"
            />
            <span className="font-mono text-[11px] text-white/70 tabular-nums shrink-0 w-14 text-right">
              {rate} req/s
            </span>
          </label>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07] text-center">
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-white/80 tabular-nums">{buffered}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              in buffer
            </div>
          </div>
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-green-300 tabular-nums">{delivered}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              delivered
            </div>
          </div>
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-white/80 tabular-nums">0</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              429s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
