import { useEffect } from 'react';

/**
 * Long Task monitoring.
 * Bug 272: Updated comment to reflect actual scope (long tasks only, not CWV).
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              console.warn(`[Perf] Long task detected: ${entry.duration.toFixed(0)}ms`, entry.name);
            }
          }
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        return () => longTaskObserver.disconnect();
      } catch {
        // longtask not supported in all browsers
      }
    }
  }, []);
}
