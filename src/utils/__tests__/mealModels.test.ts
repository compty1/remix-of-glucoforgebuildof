import { describe, it, expect } from 'vitest';
import { MEAL_PROFILES } from '../mealModels';

describe('mealModels', () => {
  it('exports MEAL_PROFILES with expected keys', () => {
    expect(MEAL_PROFILES).toBeDefined();
    expect(typeof MEAL_PROFILES).toBe('object');
    const keys = Object.keys(MEAL_PROFILES);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('each profile has required fields', () => {
    for (const [key, profile] of Object.entries(MEAL_PROFILES)) {
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('peakTimeMinutes');
      expect(profile).toHaveProperty('durationMinutes');
      expect(typeof (profile as any).peakTimeMinutes).toBe('number');
      expect(typeof (profile as any).durationMinutes).toBe('number');
    }
  });

  it('peak time is less than duration for all profiles', () => {
    for (const [, profile] of Object.entries(MEAL_PROFILES)) {
      const p = profile as any;
      expect(p.peakTimeMinutes).toBeLessThanOrEqual(p.durationMinutes);
    }
  });
});
