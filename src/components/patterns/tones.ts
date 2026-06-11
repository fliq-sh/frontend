// Traffic-light semantics — the ONE place colour is allowed on the frontend
// besides the iridescent F-mark (see docs/adr/0001). Every status pill, dot,
// and stat tile resolves its colour here, so "green = good, amber = retrying,
// red = failed" stays consistent across marketing and dashboard.
//
// Class strings are written out in full (not interpolated) so Tailwind's
// compiler can see them.

export type Tone = "success" | "warning" | "danger" | "neutral";

export interface ToneTokens {
  /** Foreground text for the label. */
  text: string;
  /** Solid dot / fill. */
  dot: string;
  /** Icon colour. */
  icon: string;
}

export const TONE: Record<Tone, ToneTokens> = {
  success: { text: "text-green-300", dot: "bg-green-400", icon: "text-green-400" },
  warning: { text: "text-amber-300", dot: "bg-amber-400", icon: "text-amber-400" },
  danger:  { text: "text-red-300",   dot: "bg-red-400",    icon: "text-red-400"   },
  neutral: { text: "text-foreground/60",  dot: "bg-foreground/40",  icon: "text-foreground/60"  },
};

/** Map a Fliq job/execution status string onto a traffic-light tone. */
export function jobStatusTone(status: string): Tone {
  switch (status) {
    case "success":
    case "succeeded":
    case "completed":
      return "success";
    case "pending":
    case "scheduled":
    case "retrying":
    case "degraded":
      return "warning";
    case "failed":
    case "error":
    case "cancelled":
    case "canceled":
      return "danger";
    // running / active / unknown are in-flight or neutral states.
    default:
      return "neutral";
  }
}
