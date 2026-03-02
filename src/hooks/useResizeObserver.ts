/**
 * Phase 6.24: ResizeObserver with debounce.
 * Prevents excessive re-renders from rapid resize events.
 */
import { useState, useEffect, useRef, RefObject } from 'react';

interface Size {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T | null>,
  debounceMs = 150
): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width: Math.round(width), height: Math.round(height) });
        }
      }, debounceMs);
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [ref, debounceMs]);

  return size;
}
