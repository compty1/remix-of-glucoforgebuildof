/**
 * Wave 1.1: Timezone-Safe Date Grouping
 * Prevents UTC conversion errors when grouping readings by local day.
 * A 9 PM PST reading should NOT become the next day due to UTC shift.
 */

/**
 * Get YYYY-MM-DD string in the user's local timezone (or a specified timezone).
 * This replaces all uses of `new Date().toISOString().split('T')[0]` for clinical data.
 */
export function toLocalDateString(date: Date, timezone?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    // en-CA locale outputs YYYY-MM-DD natively
    return formatter.format(date);
  } catch {
    // Fallback: use local date methods (still local, not UTC)
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 * Drop-in replacement for `new Date().toISOString().split('T')[0]`.
 */
export function todayLocalString(timezone?: string): string {
  return toLocalDateString(new Date(), timezone);
}

/**
 * Get yesterday's date as YYYY-MM-DD in local timezone.
 */
export function yesterdayLocalString(timezone?: string): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalDateString(d, timezone);
}

/**
 * Group an array of timestamped records by local calendar day.
 * Returns a Map of YYYY-MM-DD → items.
 */
export function groupByLocalDay<T extends { timestamp: Date | string }>(
  items: T[],
  timezone?: string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const date = typeof item.timestamp === 'string' ? new Date(item.timestamp) : item.timestamp;
    const key = toLocalDateString(date, timezone);
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}
