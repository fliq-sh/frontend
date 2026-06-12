import { cn } from "@/lib/utils";
import { TONE, type Tone } from "@/components/patterns";

const SURFACE: Record<Tone, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
  neutral: "border-foreground/15 bg-foreground/5 text-foreground/70",
};

/**
 * Filled status pill (dot + label) for table rows. Colour resolves from the
 * shared traffic-light tones — the only place hue is allowed besides the
 * F-mark (ADR 0001). For a borderless dot+label use `StatusBadge` from patterns.
 */
export function StatusPill({
  tone = "neutral",
  label,
  pulse = false,
  className,
}: {
  tone?: Tone;
  label: string;
  pulse?: boolean;
  className?: string;
}) {
  const dot = TONE[tone].dot;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        SURFACE[tone],
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", dot)} />}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot)} />
      </span>
      {label}
    </span>
  );
}

/** Mono HTTP-method chip, e.g. POST. Monochrome (method isn't a status). */
export function MethodChip({ method, className }: { method: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-foreground/15 bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wide text-foreground/70",
        className,
      )}
    >
      {method.toUpperCase()}
    </span>
  );
}
