"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cursor-style prev/next pagination shared by every table. Renders nothing when
 * there's only a single page (no prev history and no next cursor).
 */
export function Pagination({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  disabled,
  page,
}: {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  disabled?: boolean;
  /** 1-based page number for the "Page N" indicator. */
  page?: number;
}) {
  if (!hasPrev && !hasNext) return null;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-foreground/50">{page ? `Page ${page}` : ""}</span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-foreground/10 text-foreground/75 hover:text-foreground disabled:opacity-40"
          onClick={onPrev}
          disabled={!hasPrev || disabled}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-foreground/10 text-foreground/75 hover:text-foreground disabled:opacity-40"
          onClick={onNext}
          disabled={!hasNext || disabled}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
