import { cn } from "@/lib/utils";

/**
 * The eyebrow + H2 + subhead block repeated atop every landing section (and
 * reusable for dashboard page intros). `align="center"` is the narrative
 * default; `align="left"` suits dense/technical sections (e.g. Buffers).
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  subtitleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  subtitleClassName?: string;
}) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "text-center" : "max-w-2xl", className)}>
      {eyebrow && (
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-foreground/60 leading-relaxed",
            centered && "max-w-xl mx-auto",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
