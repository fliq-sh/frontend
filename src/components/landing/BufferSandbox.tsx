"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/patterns";

// An interactive, client-side-only simulation of a Fliq buffer: submit a burst,
// watch Fliq drip it out to one target at a metered rate, in submission order,
// with no 429s. Not wired to any API — illustrative data only, labelled a demo.
// The honest mapping: a buffer is a per-second token bucket that releases items
// one at a time, in order, retrying in place. See frontend/CONTEXT.md.

const BURST_SIZE = 20;
const TARGET = "api.stripe.com";

type Stage = "tank" | "flying" | "delivered";

interface Item {
  n: number; // submission-order number, 1-based
  stage: Stage;
  // Animation progress for the fly-out (0 → 1), used only while `flying`.
  fly: number;
  slot: number; // vertical slot in the tank (0 = bottom), for stacking
}

export default function BufferSandbox() {
  const [rate, setRate] = useState(4); // items per second released from the tank
  const [items, setItems] = useState<Item[]>([]);
  const [delivered, setDelivered] = useState(0);
  const [nextN, setNextN] = useState(1);
  const [reduced, setReduced] = useState(false);

  // Refs the rAF loop reads without re-subscribing.
  const rateRef = useRef(rate);
  const reducedRef = useRef(reduced);
  const lastReleaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  // Keep refs the rAF loop reads in sync, from effects (not during render).
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);

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

  // The single simulation loop: meters releases out of the tank and advances
  // fly-out animations. Runs continuously; idle when the tank is empty.
  useEffect(() => {
    const FLY_MS = 700;

    const step = (now: number) => {
      const last = lastFrameRef.current ?? now;
      const dt = now - last;
      lastFrameRef.current = now;

      setItems((prev) => {
        if (prev.length === 0) return prev;

        let changed = false;
        let next = prev;

        // Release the oldest in-tank item when a token is available. The token
        // bucket fires one item every (1000 / rate) ms — that's the metered,
        // in-submission-order release.
        const interval = 1000 / rateRef.current;
        const oldestTank = prev.find((it) => it.stage === "tank");
        if (oldestTank && now - lastReleaseRef.current >= interval) {
          lastReleaseRef.current = now;
          if (reducedRef.current) {
            next = next.filter((it) => it.n !== oldestTank.n);
            setDelivered((d) => d + 1);
          } else {
            next = next.map((it) =>
              it.n === oldestTank.n ? { ...it, stage: "flying", fly: 0 } : it,
            );
          }
          changed = true;
        }

        // Advance any flying items; retire them on arrival.
        if (!reducedRef.current) {
          const arrived: number[] = [];
          next = next.map((it) => {
            if (it.stage !== "flying") return it;
            const fly = it.fly + dt / FLY_MS;
            if (fly >= 1) {
              arrived.push(it.n);
              return it;
            }
            changed = true;
            return { ...it, fly };
          });
          if (arrived.length) {
            next = next.filter((it) => !arrived.includes(it.n));
            setDelivered((d) => d + arrived.length);
            changed = true;
          }
        }

        return changed ? next : prev;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, []);

  const sendBurst = useCallback(() => {
    setItems((prev) => {
      const tankCount = prev.filter((it) => it.stage === "tank").length;
      const fresh: Item[] = Array.from({ length: BURST_SIZE }, (_, i) => ({
        n: nextN + i,
        stage: "tank" as const,
        fly: 0,
        slot: tankCount + i,
      }));
      return [...prev, ...fresh];
    });
    setNextN((n) => n + BURST_SIZE);
    // Let the first release fire immediately on the next tick.
    lastReleaseRef.current = 0;
  }, [nextN]);

  const tank = items.filter((it) => it.stage === "tank");
  const flying = items.filter((it) => it.stage === "flying");
  const buffered = tank.length;
  // Cap how many chips we render in the tank for performance/legibility; the
  // counter is always exact.
  const VISIBLE = 8;
  const visibleTank = tank.slice(0, VISIBLE);

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

        {/* Stage: inbound burst → tank → metered fly-out → target */}
        <div className="relative px-4 py-5">
          <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
            {/* Tank column */}
            <div className="relative">
              {/* Inbound 429 ghost annotation */}
              <div className="mb-2 h-4 text-center">
                <span
                  className="font-mono text-[10px] text-red-400/40 transition-opacity"
                  style={{ opacity: buffered > 0 ? 1 : 0.35 }}
                >
                  ↑ without Fliq, these would 429
                </span>
              </div>

              {/* The holding tank */}
              <div className="relative h-44 rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
                <span className="absolute top-2 left-2 font-mono text-[10px] uppercase tracking-widest text-white/25">
                  buffer
                </span>

                {/* Stacked items — newest on top, oldest (next to release) at the
                    bottom, so the release order reads bottom-up. */}
                <div className="absolute inset-x-0 bottom-0 p-2 flex flex-col-reverse gap-1">
                  {visibleTank.map((it) => (
                    <div
                      key={it.n}
                      className="flex items-center justify-between rounded border border-white/10 bg-white/[0.06] px-2 py-1 font-mono text-[11px] text-white/70 tabular-nums animate-row-in"
                    >
                      <span className="text-white/40">#{it.n}</span>
                      <span className="text-white/55">item</span>
                    </div>
                  ))}
                  {buffered > VISIBLE && (
                    <div className="text-center font-mono text-[10px] text-white/30 tabular-nums">
                      +{buffered - VISIBLE} more buffered
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Target column */}
            <div className="flex flex-col justify-end pb-1 w-28">
              <div className="mb-2 h-4" />
              <div className="relative h-44 flex items-center">
                {/* Flying items travel along this lane toward the target. */}
                <div className="absolute inset-0 pointer-events-none">
                  {flying.map((it) => (
                    <div
                      key={it.n}
                      className="absolute left-0 top-1/2 rounded border border-green-400/30 bg-green-400/10 px-1.5 py-0.5 font-mono text-[10px] text-green-300 tabular-nums"
                      style={{
                        transform: `translate(${it.fly * 96}px, -50%)`,
                        opacity: 1 - it.fly,
                      }}
                    >
                      #{it.n}
                    </div>
                  ))}
                </div>
                <div className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2 py-3 text-center">
                  <div className="font-mono text-[10px] text-white/40">
                    your target API
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-white/70 break-all">
                    {TARGET}
                  </div>
                  <div className="mt-2 flex justify-center">
                    <StatusBadge
                      tone="success"
                      label="200 OK"
                      pulse={flying.length > 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 px-4 py-3 border-t border-white/[0.07] sm:flex-row sm:items-center">
          <Button size="sm" onClick={sendBurst} className="shrink-0">
            Send burst ({BURST_SIZE})
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

        {/* Live counters */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07] text-center">
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-white/80 tabular-nums">
              {buffered}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              buffered
            </div>
          </div>
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-green-300 tabular-nums">
              {delivered}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              delivered
            </div>
          </div>
          <div className="px-3 py-2.5">
            <div className="font-mono text-base text-white/80 tabular-nums">
              0
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/35">
              429s{" "}
              <span className="text-red-400/40 line-through">
                {delivered + buffered}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
