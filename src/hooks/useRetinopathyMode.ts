/**
 * Domain 4.3: Hook for retinopathy accessibility mode.
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'glucoforge_retinopathy_mode';

export function useRetinopathyMode() {
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isEnabled) {
      document.documentElement.classList.add('retinopathy-mode');
    } else {
      document.documentElement.classList.remove('retinopathy-mode');
    }
  }, [isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { isEnabled, toggle };
}
