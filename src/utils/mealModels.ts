/**
 * Phase 15.2: Macronutrient Gastric Emptying / "Pizza Effect" Logic
 * Models delayed glucose rise from high-fat/high-protein meals.
 */

export type MealComposition = 'standard' | 'high-fat' | 'high-protein' | 'mixed' | 'high-fiber' | 'liquid';

export interface MealProfile {
  label: string;
  composition: MealComposition;
  /** Expected glucose rise window start (minutes post-meal) */
  riseStart: number;
  /** Expected glucose rise window end (minutes post-meal) */
  riseEnd: number;
  /** Multiplier on spike duration vs standard */
  durationMultiplier: number;
  /** Whether a dual-wave/extended bolus may be beneficial */
  suggestDualWave: boolean;
  description: string;
}

export const MEAL_PROFILES: Record<MealComposition, MealProfile> = {
  standard: {
    label: 'Standard Carb Meal',
    composition: 'standard',
    riseStart: 15, riseEnd: 120,
    durationMultiplier: 1.0,
    suggestDualWave: false,
    description: 'Typical carbohydrate-dominant meal. Glucose rise expected within 15-120 minutes.',
  },
  'high-fat': {
    label: 'High-Fat Meal (Pizza Effect)',
    composition: 'high-fat',
    riseStart: 30, riseEnd: 360,
    durationMultiplier: 2.5,
    suggestDualWave: true,
    description: 'High-fat meals delay gastric emptying. Expect a prolonged glucose rise lasting 3-6 hours. Consider extended/dual-wave bolus.',
  },
  'high-protein': {
    label: 'High-Protein Meal',
    composition: 'high-protein',
    riseStart: 60, riseEnd: 300,
    durationMultiplier: 2.0,
    suggestDualWave: true,
    description: 'High-protein meals cause delayed gluconeogenesis. Glucose may rise 1-5 hours post-meal.',
  },
  mixed: {
    label: 'Mixed Meal (Fat + Protein + Carb)',
    composition: 'mixed',
    riseStart: 20, riseEnd: 360,
    durationMultiplier: 2.8,
    suggestDualWave: true,
    description: 'Complex mixed meals (e.g., pizza, pasta with meat sauce) produce a biphasic glucose response. Consider splitting bolus 60/40 over 3-4 hours.',
  },
  'high-fiber': {
    label: 'High-Fiber Meal',
    composition: 'high-fiber',
    riseStart: 30, riseEnd: 150,
    durationMultiplier: 1.2,
    suggestDualWave: false,
    description: 'Fiber slows absorption slightly. May see a more gradual, lower-peak glucose rise.',
  },
  liquid: {
    label: 'Liquid/Juice',
    composition: 'liquid',
    riseStart: 5, riseEnd: 60,
    durationMultiplier: 0.5,
    suggestDualWave: false,
    description: 'Liquid carbs absorb rapidly. Expect fast spike within 5-30 minutes.',
  },
};

/**
 * Analyze post-meal glucose data against expected meal profile.
 */
export function analyzeMealResponse(
  mealComposition: MealComposition,
  glucoseReadings: Array<{ minutesAfterMeal: number; value: number }>,
  preMealGlucose: number
): {
  peakRise: number;
  peakTime: number;
  withinExpectedWindow: boolean;
  recommendation: string;
} {
  if (glucoseReadings.length === 0) {
    return { peakRise: 0, peakTime: 0, withinExpectedWindow: true, recommendation: 'Insufficient data.' };
  }

  const profile = MEAL_PROFILES[mealComposition];
  let peakValue = preMealGlucose;
  let peakTime = 0;

  for (const reading of glucoseReadings) {
    if (reading.value > peakValue) {
      peakValue = reading.value;
      peakTime = reading.minutesAfterMeal;
    }
  }

  const peakRise = peakValue - preMealGlucose;
  const withinExpectedWindow = peakTime >= profile.riseStart && peakTime <= profile.riseEnd;

  let recommendation = '';
  if (!withinExpectedWindow && peakTime < profile.riseStart) {
    recommendation = 'Glucose spiked earlier than expected for this meal type. Consider pre-bolusing earlier.';
  } else if (!withinExpectedWindow && peakTime > profile.riseEnd) {
    recommendation = 'Glucose rose later than expected. Review meal composition tagging accuracy.';
  } else if (peakRise > 80 && profile.suggestDualWave) {
    recommendation = `Consider a dual-wave/extended bolus for ${profile.label} meals to reduce the ${peakRise} mg/dL spike.`;
  } else if (peakRise > 60) {
    recommendation = 'Post-meal spike above 60 mg/dL. Discuss pre-bolus timing or carb ratio adjustments with your provider.';
  } else {
    recommendation = 'Post-meal response within acceptable range. Good management!';
  }

  return { peakRise, peakTime, withinExpectedWindow, recommendation };
}
