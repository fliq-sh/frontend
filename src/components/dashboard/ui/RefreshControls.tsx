"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Manual refresh button + an auto-refresh toggle. Tables poll while the toggle
 * is on (see usePoll); the spinning icon signals an in-flight fetch.
 */
export function RefreshControls({
  onRefresh,
  loading,
  auto,
  onToggleAuto,
}: {
  onRefresh: () => void;
  loading?: boolean;
  auto: boolean;
  onToggleAuto: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-foreground/10 text-foreground/70 hover:text-foreground"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh now"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
      <button
        type="button"
        onClick={() => onToggleAuto(!auto)}
        title={auto ? "Auto-refresh on" : "Auto-refresh off"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
          auto
            ? "border-green-500/30 bg-green-500/10 text-green-300"
            : "border-foreground/10 text-foreground/60 hover:text-foreground/80",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", auto ? "bg-green-400" : "bg-foreground/30")} />
        Live
      </button>
    </div>
  );
}
