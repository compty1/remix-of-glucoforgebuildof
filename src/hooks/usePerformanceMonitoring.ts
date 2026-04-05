import { useEffect } from 'react';

/** Gap 494/495: Core Web Vitals + Long Task monitoring */
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Long task observer (gap 495)
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
