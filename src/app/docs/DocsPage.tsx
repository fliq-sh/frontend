// Shared layout wrapper for doc page content.
// Keeps heading/prose styles consistent without a full MDX pipeline.

import Link from "next/link";

export function DocH1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold tracking-tight text-white mb-3">{children}</h1>;
}

export function DocLead({ children }: { children: React.ReactNode }) {
  return <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-2xl">{children}</p>;
}

export function DocH2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white mt-12 mb-4">{children}</h2>;
}

export function DocH3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-white/90 mt-6 mb-2">{children}</h3>;
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-white/60 text-sm leading-relaxed mb-4">{children}</p>;
}

export function DocUL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5 mb-4 text-sm text-white/60">{children}</ul>;
}

export function DocLI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export function DocCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-indigo-300 text-xs font-mono">
      {children}
    </code>
  );
}

export function DocPre({ label, children }: { label?: string; children: string }) {
  return (
    <div className="my-5 rounded-xl border border-white/10 overflow-hidden">
      {label && (
        <div className="px-4 py-2 border-b border-white/10 bg-white/[0.03] text-[10px] text-white/30 uppercase tracking-widest font-mono">
          {label}
        </div>
      )}
      <pre className="p-4 text-xs text-white/70 font-mono leading-relaxed overflow-x-auto bg-black/40 whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

export function DocCallout({ type = "info", children }: { type?: "info" | "warning"; children: React.ReactNode }) {
  const styles = {
    info:    "border-indigo-500/30 bg-indigo-500/[0.07] text-indigo-300",
    warning: "border-amber-500/30 bg-amber-500/[0.07] text-amber-300",
  };
  return (
    <div className={`my-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </div>
  );
}

export function DocNextPrev({
  prev, next,
}: {
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
}) {
  return (
    <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between text-sm">
      {prev ? (
        <Link href={prev.href} className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
          <span>←</span> {prev.label}
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5">
          {next.label} <span>→</span>
        </Link>
      ) : <span />}
    </div>
  );
}
