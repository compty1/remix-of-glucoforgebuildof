import { describe, it, expect } from 'vitest';
import { calculateIOBTimeline, type InsulinEvent } from '../iobCalculator';

describe('iobCalculator', () => {
  it('returns timeline for given timestamps', () => {
    const now = new Date();
    const events: InsulinEvent[] = [
      { timestamp: new Date(now.getTime() - 60 * 60 * 1000), units: 5 },
    ];
    const timestamps = [now];
    const result = calculateIOBTimeline(events, timestamps);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('totalIOB');
  });

  it('IOB decreases over time', () => {
    const now = new Date();
    const events: InsulinEvent[] = [
      { timestamp: new Date(now.getTime() - 30 * 60 * 1000), units: 10 },
    ];
    const timestamps = [
      new Date(now.getTime() - 20 * 60 * 1000),
      new Date(now.getTime() + 120 * 60 * 1000),
    ];
    const result = calculateIOBTimeline(events, timestamps);
    expect(result[0].totalIOB).toBeGreaterThanOrEqual(result[1].totalIOB);
  });

  it('returns zero IOB for empty events', () => {
    const now = new Date();
    const result = calculateIOBTimeline([], [now]);
    expect(result).toHaveLength(1);
    expect(result[0].totalIOB).toBe(0);
  });
});
