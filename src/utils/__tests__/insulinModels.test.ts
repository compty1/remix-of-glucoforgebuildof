import { describe, it, expect } from 'vitest';
import { calculateIOBTimeline } from '../iobCalculator';

describe('iobCalculator', () => {
  it('returns a timeline array', () => {
    const result = calculateIOBTimeline([
      { time: Date.now() - 60 * 60 * 1000, units: 5 },
    ]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('IOB decreases over time', () => {
    const now = Date.now();
    const result = calculateIOBTimeline([
      { time: now - 30 * 60 * 1000, units: 10 },
    ]);
    if (result.length >= 2) {
      expect(result[0].iob).toBeGreaterThanOrEqual(result[result.length - 1].iob);
    }
  });

  it('returns empty for no doses', () => {
    const result = calculateIOBTimeline([]);
    expect(result).toEqual([]);
  });
});
