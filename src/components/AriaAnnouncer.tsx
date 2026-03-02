/**
 * Phase 14.6: Aria-live region announcer for dynamic content updates
 * Provides a global announcer for screen readers.
 */
import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface AriaAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AriaAnnouncerContext = createContext<AriaAnnouncerContextType>({
  announce: () => {},
});

export function useAriaAnnounce() {
  return useContext(AriaAnnouncerContext);
}

export function AriaAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (priority === 'assertive') {
      setAssertiveMessage('');
      // Force re-render so screen reader picks up change
      requestAnimationFrame(() => setAssertiveMessage(message));
    } else {
      setPoliteMessage('');
      requestAnimationFrame(() => setPoliteMessage(message));
    }

    timeoutRef.current = setTimeout(() => {
      setPoliteMessage('');
      setAssertiveMessage('');
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <AriaAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Hidden live regions for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AriaAnnouncerContext.Provider>
  );
}
