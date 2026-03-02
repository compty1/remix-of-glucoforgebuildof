/**
 * Phase 5.8 / 7.28: Query cache clear on logout.
 * Also Phase 6.29: Broken avatar fallback utility.
 * Also Phase 6.30: Non-breaking space normalization.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Clear all React Query caches on user logout.
 * Prevents stale user data from leaking between sessions.
 */
export function clearQueryCacheOnLogout(queryClient: QueryClient) {
  queryClient.clear();
}

/**
 * Phase 6.29: Generate fallback avatar URL from display name.
 */
export function getAvatarFallback(displayName?: string | null): string {
  if (!displayName) return '?';
  return displayName
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Phase 6.30: Normalize non-breaking spaces and other whitespace characters
 * to regular spaces for consistent display.
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u00A0/g, ' ')  // Non-breaking space
    .replace(/\u200B/g, '')    // Zero-width space
    .replace(/\u200C/g, '')    // Zero-width non-joiner
    .replace(/\u200D/g, '')    // Zero-width joiner
    .replace(/\uFEFF/g, '')    // BOM
    .replace(/\s{2,}/g, ' ')   // Collapse multiple spaces
    .trim();
}

/**
 * Phase 6.25: Data quality empathetic framing.
 * Returns encouraging language for data quality scores instead of cold numbers.
 */
export function getDataQualityMessage(score: number): { label: string; color: string; message: string } {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600', message: 'Great job keeping your sensor on! Your data tells a clear story.' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-600', message: 'Solid data coverage. A few gaps won\'t affect the big picture.' };
  if (score >= 50) return { label: 'Fair', color: 'text-yellow-600', message: 'We can still spot patterns, but more wear time would help.' };
  return { label: 'Limited', color: 'text-orange-600', message: 'Some insights may be limited. Every reading still counts!' };
}
