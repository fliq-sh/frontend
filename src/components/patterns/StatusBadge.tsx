import { cn } from "@/lib/utils";
import { TONE, type Tone } from "./tones";

/**
 * A traffic-light status dot. `pulse` adds a ping halo for in-flight states.
 */
export function StatusDot({
  tone = "neutral",
  pulse = false,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <span className={cn("relative flex h-1.5 w-1.5", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
            t.dot,
          )}
        />
      )}
      <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", t.dot)} />
    </span>
  );
}

/**
 * Dot + label status pill. The single source of traffic-light status across
 * marketing (LiveStatus, SchedulerVisual) and dashboard (job rows, attempts,
 * billing). Colour comes only from the tone tokens — see ./tones.
 */
export function StatusBadge({
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
  const t = TONE[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px]",
        t.text,
        className,
      )}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {label}
    </span>
  );
}
