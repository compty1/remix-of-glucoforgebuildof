import { useEffect } from 'react';

/**
 * Long Task monitoring.
 * Only logs tasks > 200ms to reduce console spam (Bug 779).
 * Gated behind PerformanceObserver support check (Bug 752).
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 200) {
            console.warn(`[Perf] Long task: ${entry.duration.toFixed(0)}ms`);
          }
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
      return () => longTaskObserver.disconnect();
    } catch {
      // longtask not supported
    }
  }, []);
}
