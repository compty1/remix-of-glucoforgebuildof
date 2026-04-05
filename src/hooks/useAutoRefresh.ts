import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoRefreshOptions {
  /** Polling interval in milliseconds. Default: 5 minutes. */
  intervalMs?: number;
  /** Whether polling is enabled. Default: true. */
  enabled?: boolean;
  /** Pause when the tab is hidden. Default: true. */
  pauseOnHidden?: boolean;
}

/**
 * Auto-refresh hook that polls a callback at a given interval.
 * Pauses when the browser tab is hidden to save resources.
 * Returns controls to manually refresh or toggle polling.
 */
export function useAutoRefresh(
  callback: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const {
    intervalMs = 5 * 60 * 1000,
    enabled = true,
    pauseOnHidden = true,
  } = options;

  const callbackRef = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Keep callback ref fresh
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const doRefresh = useCallback(async () => {
    await callbackRef.current();
    setLastRefreshedAt(new Date());
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(doRefresh, intervalMs);
  }, [doRefresh, intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Toggle polling
  const togglePolling = useCallback(() => {
    setIsPolling(prev => !prev);
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    doRefresh();
    // Reset the interval after manual refresh
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }, [doRefresh, isPolling, stopPolling, startPolling]);

  // Start/stop based on isPolling state
  useEffect(() => {
    if (isPolling && enabled) {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [isPolling, enabled, startPolling, stopPolling]);

  // Pause on visibility change
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else if (isPolling && enabled) {
        // Refresh immediately when tab becomes visible again
        doRefresh();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pauseOnHidden, isPolling, enabled, doRefresh, startPolling, stopPolling]);

  return {
    isPolling,
    togglePolling,
    refresh,
    lastRefreshedAt,
  };
}
