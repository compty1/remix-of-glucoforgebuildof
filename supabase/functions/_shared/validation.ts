/**
 * Phase 2: Shared validation utilities for edge functions.
 * Covers: 2.9 (Filename sanitization), rate limiting context, input validation.
 */

/**
 * Sanitize a filename to prevent path traversal and injection.
 * Server-side version for edge functions.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_file';
  let safe = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '_');
  safe = safe.replace(/[\x00-\x1F\x7F]/g, '');
  safe = safe.replace(/[^a-zA-Z0-9._\-]/g, '_');
  safe = safe.replace(/^\.+/, '');
  if (safe.length > 255) {
    const ext = safe.substring(safe.lastIndexOf('.'));
    safe = safe.substring(0, 255 - ext.length) + ext;
  }
  return safe || 'unnamed_file';
}

/**
 * Validate that a string is a valid UUID v4.
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Sanitize user text input for storage.
 */
export function sanitizeTextInput(input: string, maxLength = 10000): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .substring(0, maxLength);
}

/**
 * Check for self-harm / crisis keywords in content.
 * Returns crisis flag for immediate intervention.
 */
export function checkCrisisContent(text: string): { isCrisis: boolean; keywords: string[] } {
  const crisisKeywords = [
    'kill myself', 'want to die', 'suicide', 'self-harm', 'end my life',
    'better off dead', 'no reason to live',
  ];
  const lower = text.toLowerCase();
  const matched = crisisKeywords.filter(kw => lower.includes(kw));
  return { isCrisis: matched.length > 0, keywords: matched };
}

/**
 * Validate and clamp a numeric value within a range.
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
