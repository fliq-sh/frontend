"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Debounced search box. Holds its own immediate text state for snappy typing
 * and reports the debounced value upward via `onChange`.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounceMs = 200,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}) {
  const [text, setText] = useState(value);

  // Keep local text in sync if the parent resets the value externally.
  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (text === value) return;
    const id = setTimeout(() => onChange(text), debounceMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, debounceMs]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-foreground/50" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-foreground/10 bg-foreground/5 py-1.5 pl-8 pr-7 text-sm text-foreground placeholder:text-foreground/50 focus:border-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/20"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onChange("");
          }}
          className="absolute right-2 text-foreground/50 hover:text-foreground/75"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
