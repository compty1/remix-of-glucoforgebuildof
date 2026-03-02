/**
 * Phase 13.2: Double-submission prevention hook
 * Wraps an async handler to prevent concurrent invocations.
 */
import { useState, useCallback, useRef } from 'react';

export function useSubmitGuard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(false);

  const guard = useCallback(
    <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (lockRef.current) return Promise.resolve(undefined);
      lockRef.current = true;
      setIsSubmitting(true);
      return fn().finally(() => {
        lockRef.current = false;
        setIsSubmitting(false);
      });
    },
    []
  );

  return { isSubmitting, guard };
}
