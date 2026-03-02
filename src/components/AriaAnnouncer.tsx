/**
 * Phase 14.6 + Wave 6.1: Aria-live region announcer with queueing
 * Prevents screen reader stutter from simultaneous announcements.
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

interface QueuedAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
}

const ANNOUNCE_DEBOUNCE_MS = 500;

export function AriaAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const queueRef = useRef<QueuedAnnouncement[]>([]);
  const processingRef = useRef(false);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;

    const item = queueRef.current.shift()!;

    if (item.priority === 'assertive') {
      setAssertiveMessage('');
      requestAnimationFrame(() => setAssertiveMessage(item.message));
    } else {
      setPoliteMessage('');
      requestAnimationFrame(() => setPoliteMessage(item.message));
    }

    // Clear after 5s and process next after debounce
    if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    clearTimeoutRef.current = setTimeout(() => {
      setPoliteMessage('');
      setAssertiveMessage('');
      processingRef.current = false;
      // Process next item in queue after debounce
      setTimeout(() => processQueue(), ANNOUNCE_DEBOUNCE_MS);
    }, 3000);
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Deduplicate: don't queue the same message twice in a row
    const last = queueRef.current[queueRef.current.length - 1];
    if (last?.message === message && last?.priority === priority) return;

    queueRef.current.push({ message, priority });
    processQueue();
  }, [processQueue]);

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
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
