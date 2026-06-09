import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact empty/zero state for a panel or table body (distinct from the larger
 * onboarding EmptyState in patterns/). Centered icon + message + optional action.
 */
export function Empty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      {Icon && (
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 text-white/40" />
        </div>
      )}
      <p className="text-sm font-medium text-white/70">{title}</p>
      {description && <p className="max-w-xs text-xs text-white/40">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** A label/value pair used in mobile card rows. */
export function KeyVal({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/35">{label}</span>
      <span className="min-w-0 truncate text-right text-white/70">{children}</span>
    </div>
  );
}
