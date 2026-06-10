import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Bordered content card with an optional header (title + description + action)
 * and an optional footer. The standard container for dashboard panels
 * (settings cards, billing, overview lists) so they all share padding/borders.
 */
export function SectionCard({
  title,
  description,
  action,
  footer,
  noPadding,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  /** Drop body padding (for tables that manage their own). */
  noPadding?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-white/90">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(!noPadding && "p-4 sm:p-5", bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-white/10 px-4 py-3 sm:px-5">{footer}</footer>}
    </section>
  );
}

/** A small "see all →" link used in section headers. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-medium text-white/50 transition-colors hover:text-white">
      {children}
    </Link>
  );
}
