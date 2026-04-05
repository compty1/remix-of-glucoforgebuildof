/**
 * Sanitize user input for use in PostgREST .ilike() and .or() filter strings.
 * Escapes characters that have special meaning in PostgREST filter syntax.
 * 
 * Bugs addressed: 30-37, 88-89, 226-227
 */
export function sanitizeForIlike(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')    // Escape percent signs
    .replace(/_/g, '\\_')    // Escape underscores
    .replace(/'/g, "''")     // Escape single quotes
    .replace(/\)/g, '')      // Remove closing parens (PostgREST filter syntax)
    .replace(/\(/g, '')      // Remove opening parens
    .replace(/,/g, '')       // Remove commas (PostgREST OR separator)
    .replace(/\./g, '')      // Remove dots (PostgREST operator separator)
    .trim();
}

/**
 * Sanitize a search term and wrap it for ilike usage: %term%
 */
export function sanitizeSearchWrap(raw: string): string {
  return `%${sanitizeForIlike(raw)}%`;
}
