import { cn } from "@/lib/utils";

/**
 * Page-level header for a dashboard route: title + optional description on the
 * left, actions (buttons/toggles) on the right. Wraps gracefully on mobile so
 * actions drop below the title instead of overflowing.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h2>
        {description && <p className="mt-2 text-[15px] text-foreground/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
