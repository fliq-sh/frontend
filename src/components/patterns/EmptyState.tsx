import { cn } from "@/lib/utils";

export interface EmptyStateStep {
  title: string;
  description: React.ReactNode;
  /** Optional action/extra below the description (button, code block, …). */
  action?: React.ReactNode;
}

/**
 * The "Get started in N steps" onboarding card shown by an empty dashboard
 * table (Jobs / Schedules / Buffers). Monochrome — the numbered markers are
 * white, not an accent hue (see docs/adr/0001). Replaces the three near-
 * identical hand-rolled copies that used indigo.
 */
export function EmptyState({
  eyebrow = "Get started",
  title,
  steps,
  className,
}: {
  eyebrow?: string;
  title: string;
  steps: EmptyStateStep[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-foreground/10 bg-foreground/[0.03] p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">
            {eyebrow}
          </p>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>

        <div className="flex flex-col gap-7">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-bold text-foreground">
                {i + 1}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-foreground/50">{step.description}</p>
                {step.action && <div className="mt-1">{step.action}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
