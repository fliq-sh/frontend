"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE, FACTS } from "@/lib/site";

const proof = [
  { label: "Postgres-native", detail: FACTS.postgresNative },
  { label: "Exactly-once", detail: FACTS.exactlyOnce },
  { label: "Crash recovery", detail: FACTS.crashRecovery },
  { label: "Full history", detail: FACTS.history },
];

// Live GitHub star count — honest (shows the real number) and hides itself if
// the API call fails. Never a fabricated figure.
function useStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let on = true;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => on && d && setStars(d.stargazers_count ?? null))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [repo]);
  return stars;
}

export default function OpenSource() {
  const stars = useStars(SITE.github.starsRepo);

  return (
    <section className="py-16 px-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Built in the open
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              No magic numbers. Just the actual system.
            </h2>
            <p className="mt-2 text-white/50 max-w-xl text-sm">
              Fliq is a young, beta product — so instead of inventing SLAs and
              customer logos, here&apos;s how it really works and where the code
              lives.
            </p>
          </div>
          <Link
            href={SITE.github.coreApi}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
            </svg>
            Star on GitHub
            {stars != null && (
              <span className="font-mono text-xs text-white/40">
                ★ {stars.toLocaleString()}
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {proof.map((p) => (
            <div
              key={p.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="text-sm font-semibold text-white mb-1.5">
                {p.label}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
