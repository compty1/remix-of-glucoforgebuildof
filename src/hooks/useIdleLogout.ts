import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Fix 8.1: Auto-logout after 30 minutes of inactivity for medical data security.
 * Listens for mouse, keyboard, touch, and scroll events to reset the timer.
 */
export function useIdleLogout(timeoutMs = 30 * 60 * 1000) {
  const { user, signOut } = useAuthStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!user) return;

    timerRef.current = setTimeout(() => {
      signOut();
      // Toast is shown via session expiry handler in App.tsx
    }, timeoutMs);
  }, [user, signOut, timeoutMs]);

  useEffect(() => {
    if (!user) return;

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // Start timer on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);
}
