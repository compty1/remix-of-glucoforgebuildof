/**
 * Phase 20.1: Haptic Feedback Utilities
 * navigator.vibrate() with feature detection and reduced-motion respect.
 */

function supportsVibration(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trigger a short haptic pulse for confirmations.
 */
export function hapticSuccess(): void {
  if (!supportsVibration() || prefersReducedMotion()) return;
  navigator.vibrate(50);
}

/**
 * Trigger a double-pulse for warnings.
 */
export function hapticWarning(): void {
  if (!supportsVibration() || prefersReducedMotion()) return;
  navigator.vibrate([30, 50, 30]);
}

/**
 * Trigger a long pulse for errors / critical events.
 */
export function hapticError(): void {
  if (!supportsVibration() || prefersReducedMotion()) return;
  navigator.vibrate([100, 30, 100]);
}

/**
 * Trigger a gentle tap for UI interactions.
 */
export function hapticTap(): void {
  if (!supportsVibration() || prefersReducedMotion()) return;
  navigator.vibrate(10);
}
