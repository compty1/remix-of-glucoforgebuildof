/**
 * Phase 6.21: Modal back button support.
 * Pushes a history entry when a modal opens; popping it closes the modal.
 * Prevents Android back button from navigating away.
 */
import { useEffect, useCallback, useRef } from 'react';

export function useModalBackButton(
  isOpen: boolean,
  onClose: () => void
) {
  const stateRef = useRef({ pushed: false });

  const handlePopState = useCallback(() => {
    if (stateRef.current.pushed) {
      stateRef.current.pushed = false;
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !stateRef.current.pushed) {
      // Push a dummy history entry
      window.history.pushState({ modal: true }, '');
      stateRef.current.pushed = true;
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up: if modal closes programmatically (not via back button),
      // remove the dummy entry
      if (stateRef.current.pushed) {
        stateRef.current.pushed = false;
        // Only go back if we actually pushed
        try {
          if (window.history.state?.modal) {
            window.history.back();
          }
        } catch {
          // Navigation guard
        }
      }
    };
  }, [isOpen, handlePopState]);
}
