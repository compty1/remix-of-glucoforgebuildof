import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * Global keyboard shortcuts for power-user navigation.
 * Uses Ctrl+key (Cmd+key on macOS).
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    { key: '/', ctrl: false, action: () => {
      const el = document.querySelector<HTMLInputElement>('[data-search-input]');
      if (el) { el.focus(); el.select(); }
    }, description: 'Focus search' },
    { key: 'h', ctrl: true, action: () => navigate('/'), description: 'Go Home' },
    { key: 'd', ctrl: true, shift: true, action: () => navigate('/devices'), description: 'Go to Devices' },
    { key: 'r', ctrl: true, shift: true, action: () => navigate('/research-hub'), description: 'Go to Research' },
    { key: 'n', ctrl: true, shift: true, action: () => navigate('/news'), description: 'Go to News' },
    { key: 'm', ctrl: true, shift: true, action: () => navigate('/medicines'), description: 'Go to Medicines' },
  ];

  const handler = useCallback((e: KeyboardEvent) => {
    // Don't trigger in inputs/textareas unless it's the "/" shortcut
    const tag = (e.target as HTMLElement)?.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

    for (const s of shortcuts) {
      const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
      const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();

      if (keyMatch && ctrlMatch && shiftMatch) {
        if (isInput && s.key !== '/') continue;
        if (s.key === '/' && isInput) continue;
        e.preventDefault();
        s.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);

  return shortcuts;
}
