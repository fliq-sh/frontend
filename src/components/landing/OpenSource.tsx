"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE, FACTS } from "@/lib/site";

const proof = [
  { label: "Postgres-native", detail: FACTS.postgresNative },
  { label: "At-least-once", detail: FACTS.delivery },
  { label: "Crash recovery", detail: FACTS.crashRecovery },
  { label: "Full history", detail: FACTS.history },
];

// Self-host / enterprise (merged in from the former Enterprise section).
const selfHost = [
  "Deploy on your own metal or any cloud",
  "No data leaves your infrastructure",
  "A dedicated support channel and SLA",
  "SSO / SAML integration",
  "Custom data retention policies",
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
    <section className="section-breathe px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Built in the open — honest proof */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Built in the open
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              No magic numbers. Just the actual system.
            </h2>
            <p className="mt-3 text-white/50 max-w-xl text-sm">
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

        {/* Self-hosted & enterprise — open source means you can run it yourself */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
                Self-hosted &amp; enterprise
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Run Fliq on your own infrastructure.
              </h3>
              <p className="text-white/60 leading-relaxed mb-8">
                Fliq is Postgres-native and open source — so the whole stack can
                run on your Kubernetes cluster, your cloud account, or
                air-gapped on-prem. Same API, full control. Self-hosted and
                enterprise plans land after the beta.
              </p>
              <Button size="lg" asChild>
                <Link href={`mailto:${SITE.enterpriseEmail}`}>Talk to us →</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {selfHost.map((feature) => (
                <div key={feature} className="flex gap-3 items-start">
                  <div className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  <span className="text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
