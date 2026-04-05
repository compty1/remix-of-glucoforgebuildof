import { describe, it, expect } from 'vitest';
import { ILLNESS_STRESS_TAGS, getStressTag, type StressLevel } from '../illnessStressTags';

describe('illnessStressTags', () => {
  it('exports ILLNESS_STRESS_TAGS', () => {
    expect(ILLNESS_STRESS_TAGS).toBeDefined();
    expect(Array.isArray(ILLNESS_STRESS_TAGS) || typeof ILLNESS_STRESS_TAGS === 'object').toBe(true);
  });

  it('getStressTag returns a value for valid levels', () => {
    const levels: StressLevel[] = ['none', 'mild', 'moderate', 'severe'];
    for (const level of levels) {
      const result = getStressTag(level);
      expect(result).toBeDefined();
    }
  });
});
