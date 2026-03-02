/**
 * Phase 14.1: Locale-aware number and date formatting utilities
 * Uses the browser's Intl API for proper locale formatting.
 */

const DEFAULT_LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

/** Format a number with locale-aware separators */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale?: string): string {
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, options).format(value);
}

/** Format currency with locale-aware symbols */
export function formatCurrency(value: number, currency = 'USD', locale?: string): string {
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(value);
}

/** Format a date with locale-aware patterns */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/** Format relative time (e.g., "2 days ago") */
export function formatRelativeTime(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale || DEFAULT_LOCALE, { numeric: 'auto' });

  if (diffDays > 30) return formatDate(d, undefined, locale);
  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return rtf.format(-diffSecs, 'second');
}

/** Format glucose value with unit */
export function formatGlucose(value: number, unit: 'mg/dL' | 'mmol/L' = 'mg/dL', locale?: string): string {
  if (unit === 'mmol/L') {
    return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, locale)} mmol/L`;
  }
  return `${formatNumber(value, { maximumFractionDigits: 0 }, locale)} mg/dL`;
}

/** Format percentage */
export function formatPercent(value: number, decimals = 1, locale?: string): string {
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}
