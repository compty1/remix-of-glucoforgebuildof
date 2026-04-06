/**
 * Phase 18.5: Offline-First Data Access
 * Bug 271: Fixed stale closure by using refs for state tracking.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface OfflineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
}

export function useOfflineStatus(): OfflineStatusReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOfflineRef.current || !navigator.onLine) {
        setWasOffline(true);
      }
      wasOfflineRef.current = false;
      setIsOnline(true);
      setLastOnlineAt(new Date());
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline, lastOnlineAt };
}
