import { cn } from "@/lib/utils";

/** Shared input styling so every dashboard form field looks identical. */
export const fieldClass =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/20 transition-colors disabled:opacity-50";

/** Label + optional hint wrapper around a single control. */
export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-white/60">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-white/35">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, "appearance-none", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClass, "font-mono resize-y", props.className)} />;
}

/**
 * Parse an optional JSON object string (used for the "Headers (JSON)" fields).
 * Returns undefined for empty input, throws a friendly error for invalid JSON
 * or a non-object value.
 */
export function parseJsonObject(input: string, fieldLabel = "JSON"): Record<string, string> | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error(`${fieldLabel} must be valid JSON.`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${fieldLabel} must be a JSON object.`);
  }
  return parsed as Record<string, string>;
}

/** Inline error banner used by every create dialog. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
      {message}
    </div>
  );
}
