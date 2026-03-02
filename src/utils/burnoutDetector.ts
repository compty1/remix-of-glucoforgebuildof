/**
 * Domain 4.1: Burnout-Aware Notification Engine
 * Detects diabetes management burnout from usage patterns.
 */

export interface BurnoutSignals {
  daysSinceLastLogin: number;
  daysSinceLastUpload: number;
  tirTrendDirection: 'improving' | 'stable' | 'worsening' | 'unknown';
  streakBroken: boolean;
  loginFrequencyDecline: boolean; // true if logins decreased >50% vs prior 2 weeks
}

export interface BurnoutScore {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'critical';
  suppressGamification: boolean;
  showMentalHealthResources: boolean;
  suggestedTone: 'achievement' | 'neutral' | 'compassionate';
}

/**
 * Calculate burnout risk score from usage signals.
 */
export function calculateBurnoutScore(signals: BurnoutSignals): BurnoutScore {
  let score = 0;

  // Days since last login (0-30 points)
  if (signals.daysSinceLastLogin >= 14) score += 30;
  else if (signals.daysSinceLastLogin >= 7) score += 20;
  else if (signals.daysSinceLastLogin >= 3) score += 10;

  // Days since last upload (0-25 points)
  if (signals.daysSinceLastUpload >= 14) score += 25;
  else if (signals.daysSinceLastUpload >= 7) score += 15;
  else if (signals.daysSinceLastUpload >= 3) score += 5;

  // Worsening TIR trend (0-20 points)
  if (signals.tirTrendDirection === 'worsening') score += 20;

  // Broken streak (0-10 points)
  if (signals.streakBroken) score += 10;

  // Login frequency decline (0-15 points)
  if (signals.loginFrequencyDecline) score += 15;

  score = Math.min(100, score);

  const level: BurnoutScore['level'] =
    score >= 80 ? 'critical' :
    score >= 60 ? 'high' :
    score >= 35 ? 'moderate' : 'low';

  return {
    score,
    level,
    suppressGamification: score >= 60,
    showMentalHealthResources: score >= 60,
    suggestedTone: score >= 60 ? 'compassionate' : score >= 35 ? 'neutral' : 'achievement',
  };
}

/** Mental health resources for burnout states. */
export const BURNOUT_RESOURCES = {
  diabetesBurnout: {
    title: 'Diabetes Burnout Support',
    description: 'Managing diabetes is hard. Taking a break from tracking is OK.',
    links: [
      { label: 'JDRF Mental Health', url: 'https://www.jdrf.org/t1d-resources/living-with-t1d/mental-health/' },
      { label: 'Beyond Type 1', url: 'https://beyondtype1.org/mental-health/' },
    ],
  },
  crisis: {
    title: 'Crisis Support',
    phone: '988',
    text: 'Text HOME to 741741',
    url: 'https://988lifeline.org',
  },
} as const;
