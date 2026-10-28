import { useEffect, useRef } from "react";

interface SWRRevalidateOptions {
  enabled?: boolean;
  minIntervalMs?: number;
}

/**
 * Stale-while-revalidate hook (Detail 6).
 * Automatically triggers background revalidation when the browser window/tab
 * regains focus or network connection returns.
 */
export function useSWRRevalidate(
  onRevalidate: () => void | Promise<void>,
  options: SWRRevalidateOptions = {},
) {
  const { enabled = true, minIntervalMs = 10000 } = options;
  const lastRevalidateRef = useRef<number>(Date.now());
  const callbackRef = useRef(onRevalidate);

  callbackRef.current = onRevalidate;

  useEffect(() => {
    if (!enabled) return;

    const triggerRevalidate = () => {
      const now = Date.now();
      if (now - lastRevalidateRef.current >= minIntervalMs) {
        lastRevalidateRef.current = now;
        try {
          void callbackRef.current();
        } catch (err) {
          console.debug("[SWR] Background revalidation caught:", err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerRevalidate();
      }
    };

    window.addEventListener("focus", triggerRevalidate);
    window.addEventListener("online", triggerRevalidate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", triggerRevalidate);
      window.removeEventListener("online", triggerRevalidate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, minIntervalMs]);
}

export default useSWRRevalidate;
