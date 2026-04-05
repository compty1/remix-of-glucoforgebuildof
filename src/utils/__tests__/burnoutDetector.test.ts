import { describe, it, expect } from 'vitest';
import { calculateBurnoutScore, type BurnoutSignals } from '../burnoutDetector';

describe('calculateBurnoutScore', () => {
  it('returns low score for active user', () => {
    const signals: BurnoutSignals = {
      daysSinceLastLogin: 0,
      daysSinceLastUpload: 1,
      tirTrendDirection: 'improving',
      streakBroken: false,
      loginFrequencyDecline: false,
    };
    const result = calculateBurnoutScore(signals);
    expect(result.score).toBe(0);
    expect(result.level).toBe('low');
    expect(result.suppressGamification).toBe(false);
    expect(result.suggestedTone).toBe('achievement');
  });

  it('returns critical for fully disengaged user', () => {
    const signals: BurnoutSignals = {
      daysSinceLastLogin: 14,
      daysSinceLastUpload: 14,
      tirTrendDirection: 'worsening',
      streakBroken: true,
      loginFrequencyDecline: true,
    };
    const result = calculateBurnoutScore(signals);
    expect(result.score).toBe(100);
    expect(result.level).toBe('critical');
    expect(result.suppressGamification).toBe(true);
    expect(result.showMentalHealthResources).toBe(true);
    expect(result.suggestedTone).toBe('compassionate');
  });

  it('returns moderate for partially disengaged user', () => {
    const signals: BurnoutSignals = {
      daysSinceLastLogin: 7,
      daysSinceLastUpload: 7,
      tirTrendDirection: 'stable',
      streakBroken: true,
      loginFrequencyDecline: false,
    };
    const result = calculateBurnoutScore(signals);
    expect(result.score).toBe(45);
    expect(result.level).toBe('moderate');
    expect(result.suggestedTone).toBe('neutral');
  });

  it('caps score at 100', () => {
    const signals: BurnoutSignals = {
      daysSinceLastLogin: 30,
      daysSinceLastUpload: 30,
      tirTrendDirection: 'worsening',
      streakBroken: true,
      loginFrequencyDecline: true,
    };
    const result = calculateBurnoutScore(signals);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
