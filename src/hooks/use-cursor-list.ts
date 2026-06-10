"use client";

import { useCallback, useEffect, useState } from "react";

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Shared cursor-pagination state for the dashboard tables (Jobs / Schedules /
 * Buffers). Holds the loaded page, a back-stack of cursors for "Prev", and a
 * `reset`-on-deps so changing a filter starts over from page 1. Returns a
 * `reload` for manual + auto refresh that keeps the current page.
 *
 * `fetcher` should be memoised (useCallback) and listed in `deps` alongside any
 * filter state, so a filter change both re-binds the fetcher and resets to
 * page 1. The reset effect captures the latest `load`, so no ref juggling.
 */
export function useCursorList<T>(
  fetcher: (cursor: string | undefined) => Promise<CursorPage<T>>,
  deps: unknown[] = [],
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [prevCursors, setPrevCursors] = useState<(string | undefined)[]>([]);

  const load = useCallback(async (c: string | undefined) => {
    setLoading(true);
    try {
      const page = await fetcher(c);
      setItems(page.items);
      setNextCursor(page.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  // Reset to page 1 whenever a dependency (e.g. a status filter) changes. The
  // captured `load` is the latest render's, so it uses the new fetcher.
  useEffect(() => {
    setCursor(undefined);
    setPrevCursors([]);
    load(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => load(cursor), [load, cursor]);

  const goNext = useCallback(() => {
    if (!nextCursor) return;
    setPrevCursors((s) => [...s, cursor]);
    setCursor(nextCursor);
    load(nextCursor);
  }, [nextCursor, cursor, load]);

  const goPrev = useCallback(() => {
    setPrevCursors((s) => {
      if (s.length === 0) return s;
      const next = [...s];
      const target = next.pop();
      setCursor(target);
      load(target);
      return next;
    });
  }, [load]);

  return {
    items,
    loading,
    reload,
    nextCursor,
    hasNext: !!nextCursor,
    hasPrev: prevCursors.length > 0,
    page: prevCursors.length + 1,
    goNext,
    goPrev,
  };
}
