import { useEffect, useRef } from "react";

/**
 * Run `callback` on an interval while `enabled`. Pauses automatically when the
 * tab is hidden (so we don't hammer the API in background tabs) and fires once
 * immediately when the tab becomes visible again. The latest callback is always
 * used without resetting the timer, so passing an inline closure is fine.
 */
export function usePoll(
  callback: () => void,
  intervalMs: number,
  enabled = true,
) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => saved.current(), intervalMs);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        saved.current();
        start();
      }
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);
}
