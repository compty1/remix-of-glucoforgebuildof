/**
 * Phase 15.4: Exercise Type Differentiation
 * Stratifies exercise by type (aerobic vs anaerobic) with distinct glucose impact models.
 */

export type ExerciseType = 'aerobic' | 'anaerobic' | 'mixed' | 'hiit' | 'resistance' | 'walking' | 'yoga';

export interface ExerciseImpact {
  type: ExerciseType;
  label: string;
  /** Expected glucose direction during exercise */
  duringExercise: 'decrease' | 'increase' | 'variable';
  /** Expected glucose direction 1-4 hours after */
  afterExercise: 'decrease' | 'increase' | 'stable';
  /** Risk level for exercise-induced hypoglycemia */
  hypoRisk: 'low' | 'moderate' | 'high';
  /** Delayed hypo risk (nocturnal) */
  delayedHypoRisk: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export const EXERCISE_IMPACTS: Record<ExerciseType, ExerciseImpact> = {
  aerobic: {
    type: 'aerobic',
    label: 'Aerobic (Running, Swimming, Cycling)',
    duringExercise: 'decrease',
    afterExercise: 'decrease',
    hypoRisk: 'high',
    delayedHypoRisk: 'high',
    recommendations: [
      'Consider reducing basal rate 30-60 min before exercise',
      'Have fast-acting carbs available',
      'Monitor for nocturnal hypoglycemia (glucose may drop 4-8 hours post-exercise)',
      'Start with 15-20g carbs if glucose is below 126 mg/dL before starting',
    ],
  },
  anaerobic: {
    type: 'anaerobic',
    label: 'Anaerobic (Sprinting, Heavy Lifting)',
    duringExercise: 'increase',
    afterExercise: 'decrease',
    hypoRisk: 'low',
    delayedHypoRisk: 'moderate',
    recommendations: [
      'Expect glucose rise during exercise from hepatic glucose release (adrenaline/cortisol)',
      'Avoid immediate correction bolus — glucose typically drops after exercise ends',
      'Monitor 2-4 hours post-exercise for delayed drop',
      'May need small correction 30 min after if glucose stays elevated',
    ],
  },
  mixed: {
    type: 'mixed',
    label: 'Mixed (Circuit Training, Sports)',
    duringExercise: 'variable',
    afterExercise: 'decrease',
    hypoRisk: 'moderate',
    delayedHypoRisk: 'moderate',
    recommendations: [
      'Glucose response is unpredictable — monitor frequently',
      'Consider a small carb snack (10-15g) at halftime or mid-workout',
      'Post-exercise drop is common, especially if aerobic component was dominant',
    ],
  },
  hiit: {
    type: 'hiit',
    label: 'HIIT (High-Intensity Interval Training)',
    duringExercise: 'increase',
    afterExercise: 'decrease',
    hypoRisk: 'low',
    delayedHypoRisk: 'high',
    recommendations: [
      'Similar to anaerobic — expect temporary glucose spike from stress hormones',
      'HIIT causes significant delayed glucose drop (2-6 hours post)',
      'Consider reducing overnight basal if exercising in the evening',
      'Stay hydrated — dehydration amplifies glucose variability',
    ],
  },
  resistance: {
    type: 'resistance',
    label: 'Resistance Training (Weights)',
    duringExercise: 'increase',
    afterExercise: 'decrease',
    hypoRisk: 'low',
    delayedHypoRisk: 'moderate',
    recommendations: [
      'Moderate glucose rise during lifting is normal (cortisol response)',
      'Improved insulin sensitivity persists for 24-48 hours post-session',
      'Long-term resistance training improves overall glucose management',
    ],
  },
  walking: {
    type: 'walking',
    label: 'Walking (Low-Intensity)',
    duringExercise: 'decrease',
    afterExercise: 'stable',
    hypoRisk: 'low',
    delayedHypoRisk: 'low',
    recommendations: [
      'Post-meal walks (10-15 min) can reduce glucose spikes by 20-30%',
      'Generally safe without insulin adjustment for walks under 45 min',
      'Most effective for glucose management when done within 30 min of eating',
    ],
  },
  yoga: {
    type: 'yoga',
    label: 'Yoga / Gentle Stretching',
    duringExercise: 'decrease',
    afterExercise: 'stable',
    hypoRisk: 'low',
    delayedHypoRisk: 'low',
    recommendations: [
      'Yoga improves insulin sensitivity through stress reduction',
      'Generally safe without insulin adjustments',
      'Hot yoga may cause more significant glucose drops — monitor closely',
    ],
  },
};

/**
 * Get exercise recommendation based on current glucose level.
 */
export function getPreExerciseGuidance(
  glucoseMgDl: number,
  exerciseType: ExerciseType
): { safe: boolean; action: string } {
  const impact = EXERCISE_IMPACTS[exerciseType];

  if (glucoseMgDl < 70) {
    return { safe: false, action: 'Treat hypoglycemia first. Eat 15-20g fast-acting carbs, wait 15 min, and recheck.' };
  }
  if (glucoseMgDl < 90 && impact.hypoRisk !== 'low') {
    return { safe: false, action: `Glucose is low for ${impact.label}. Eat 15-20g carbs before starting.` };
  }
  if (glucoseMgDl > 250) {
    return { safe: false, action: 'Check for ketones. If ketones are present, do not exercise. Correct glucose first.' };
  }
  if (glucoseMgDl > 300) {
    return { safe: false, action: 'Glucose too high for safe exercise. Correct with insulin and recheck in 1 hour.' };
  }

  return { safe: true, action: `Safe to exercise. ${impact.recommendations[0]}` };
}
