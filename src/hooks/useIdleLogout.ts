import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Auto-logout after inactivity with a 60-second warning dialog.
 * Gaps 8.1, 1060: idle logout + timeout warning before logout.
 */
export function useIdleLogout(timeoutMs = 30 * 60 * 1000) {
  const { user, signOut } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const WARNING_DURATION = 60_000; // 60 seconds warning before logout

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    warningTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setSecondsLeft(60);
    if (!user) return;

    // Show warning 60s before logout
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(60);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - WARNING_DURATION);

    // Actual logout
    timerRef.current = setTimeout(() => {
      setShowWarning(false);
      signOut();
    }, timeoutMs);
  }, [user, signOut, timeoutMs, clearTimers]);

  const stayActive = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimers();
    };
  }, [user, resetTimer, clearTimers]);

  return { showWarning, secondsLeft, stayActive };
}
