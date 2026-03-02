/**
 * Phase 15.3: Illness and Stress Day Tagging
 * Utilities for tagging and excluding sick/stress days from baseline calculations.
 */

export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe';

export interface DayTag {
  date: string; // YYYY-MM-DD
  isSickDay: boolean;
  stressLevel: StressLevel;
  notes?: string;
}

/**
 * Filter out tagged days from glucose data for clean baseline calculation.
 * Sick days and severe stress days are excluded from SD, CV, TIR baselines.
 */
export function filterBaselineData<T extends { timestamp: string | Date }>(
  readings: T[],
  taggedDays: DayTag[]
): T[] {
  const excludeDates = new Set(
    taggedDays
      .filter(d => d.isSickDay || d.stressLevel === 'severe')
      .map(d => d.date)
  );

  if (excludeDates.size === 0) return readings;

  return readings.filter(r => {
    const dateStr = typeof r.timestamp === 'string'
      ? r.timestamp.substring(0, 10)
      : r.timestamp.toISOString().substring(0, 10);
    return !excludeDates.has(dateStr);
  });
}

/**
 * Get summary of excluded days for user transparency.
 */
export function getExclusionSummary(taggedDays: DayTag[]): {
  sickDays: number;
  stressDays: number;
  totalExcluded: number;
  dateRange: string;
} {
  const sickDays = taggedDays.filter(d => d.isSickDay).length;
  const stressDays = taggedDays.filter(d => d.stressLevel === 'severe').length;
  const excluded = taggedDays.filter(d => d.isSickDay || d.stressLevel === 'severe');

  return {
    sickDays,
    stressDays,
    totalExcluded: excluded.length,
    dateRange: excluded.length > 0
      ? `${excluded[0].date} to ${excluded[excluded.length - 1].date}`
      : 'None',
  };
}
