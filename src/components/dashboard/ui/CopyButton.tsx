"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Copy-to-clipboard control. Two shapes: an icon-only button (default) for
 * inline use next to mono values, or a labelled button (`label` set).
 */
export function CopyButton({
  value,
  label,
  className,
  size = "icon-xs",
  variant = "ghost",
}: {
  value: string;
  label?: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => null);
  }

  const Icon = copied ? Check : Copy;

  return (
    <Button
      type="button"
      size={label ? "sm" : size}
      variant={variant}
      onClick={handleCopy}
      className={cn("text-white/40 hover:text-white/80", className)}
      title="Copy"
      aria-label="Copy to clipboard"
    >
      <Icon className={cn(copied && "text-green-400")} />
      {label ? (copied ? "Copied" : label) : null}
    </Button>
  );
}
