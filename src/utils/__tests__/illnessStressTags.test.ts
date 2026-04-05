import { describe, it, expect } from 'vitest';
import { filterBaselineData, type DayTag, type StressLevel } from '../illnessStressTags';

describe('illnessStressTags', () => {
  it('exports StressLevel type and filterBaselineData', () => {
    expect(typeof filterBaselineData).toBe('function');
  });

  it('filters out sick days from readings', () => {
    const readings = [
      { timestamp: '2026-01-01T10:00:00Z', value: 120 },
      { timestamp: '2026-01-02T10:00:00Z', value: 180 },
      { timestamp: '2026-01-03T10:00:00Z', value: 100 },
    ];
    const tags: DayTag[] = [
      { date: '2026-01-02', isSickDay: true, stressLevel: 'none' },
    ];
    const result = filterBaselineData(readings, tags);
    expect(result).toHaveLength(2);
  });

  it('filters out severe stress days', () => {
    const readings = [
      { timestamp: '2026-01-01T10:00:00Z', value: 120 },
      { timestamp: '2026-01-02T10:00:00Z', value: 180 },
    ];
    const tags: DayTag[] = [
      { date: '2026-01-01', isSickDay: false, stressLevel: 'severe' },
    ];
    const result = filterBaselineData(readings, tags);
    expect(result).toHaveLength(1);
  });

  it('keeps mild/moderate stress days', () => {
    const readings = [
      { timestamp: '2026-01-01T10:00:00Z', value: 120 },
    ];
    const tags: DayTag[] = [
      { date: '2026-01-01', isSickDay: false, stressLevel: 'moderate' },
    ];
    const result = filterBaselineData(readings, tags);
    expect(result).toHaveLength(1);
  });

  it('returns all readings when no tags', () => {
    const readings = [
      { timestamp: '2026-01-01T10:00:00Z', value: 120 },
    ];
    const result = filterBaselineData(readings, []);
    expect(result).toHaveLength(1);
  });
});
