/**
 * Phase 1: Clinical Mode Management
 * Covers: 1.20 (Menstrual cycle awareness), 1.21 (Pregnancy mode),
 *         1.22 (Pediatric thresholds), 1.25 (Carb ratio awareness)
 * 
 * MEDICAL DISCLAIMER: These are informational tools only.
 * All decisions should be made with your healthcare provider.
 */

import { CLINICAL_MODES, type ClinicalThresholds } from './insulinModels';

export type ClinicalModeKey = 'standard' | 'pregnancy' | 'pediatric' | 'elderly' | 'tight';

export interface ClinicalModeContext {
  mode: ClinicalModeKey;
  thresholds: ClinicalThresholds;
  warnings: string[];
  adjustments: ClinicalAdjustment[];
}

export interface ClinicalAdjustment {
  factor: string;
  description: string;
  impactOnTIR: 'increases_resistance' | 'decreases_resistance' | 'variable';
  recommendation: string;
}

// ============= 1.20: MENSTRUAL CYCLE AWARENESS =============

export type CyclePhase = 'follicular' | 'ovulation' | 'luteal' | 'menstrual' | 'unknown';

export interface CyclePhaseImpact {
  phase: CyclePhase;
  insulinSensitivityChange: string;
  tirImpact: string;
  recommendation: string;
}

export const CYCLE_PHASE_IMPACTS: Record<CyclePhase, CyclePhaseImpact> = {
  follicular: {
    phase: 'follicular',
    insulinSensitivityChange: 'Normal to slightly increased',
    tirImpact: 'Neutral — baseline insulin needs',
    recommendation: 'Standard insulin dosing typically works well during this phase.',
  },
  ovulation: {
    phase: 'ovulation',
    insulinSensitivityChange: 'Variable — may decrease briefly',
    tirImpact: 'Minor — possible brief insulin resistance',
    recommendation: 'Monitor for a brief spike in insulin needs around ovulation.',
  },
  luteal: {
    phase: 'luteal',
    insulinSensitivityChange: 'Significantly decreased (progesterone rises)',
    tirImpact: 'High — expect 20-40% higher insulin needs',
    recommendation: '⚠️ Progesterone increases insulin resistance. Consider increasing basal rates by 10-30% during luteal phase. Discuss with your endocrinologist.',
  },
  menstrual: {
    phase: 'menstrual',
    insulinSensitivityChange: 'Returns to baseline, may temporarily increase',
    tirImpact: 'Variable — watch for sudden sensitivity increase',
    recommendation: 'Insulin needs drop back to baseline. Watch for hypoglycemia if you kept higher doses from luteal phase.',
  },
  unknown: {
    phase: 'unknown',
    insulinSensitivityChange: 'Not tracked',
    tirImpact: 'Unknown',
    recommendation: 'Consider tracking your cycle to identify hormonal glucose patterns.',
  },
};

/**
 * Generate cycle-aware analysis warnings.
 * If the user is in luteal phase, flag that TIR may be artificially lower.
 */
export function getCycleAwareWarnings(phase: CyclePhase): string[] {
  const warnings: string[] = [];
  const impact = CYCLE_PHASE_IMPACTS[phase];

  if (phase === 'luteal') {
    warnings.push(
      '🔴 Luteal phase detected: Progesterone typically increases insulin resistance by 20-40%. ' +
      'Your TIR may be lower than usual — this is a hormonal effect, not necessarily a management issue.'
    );
    warnings.push(
      'Consider temporarily increasing basal insulin during this phase. Discuss with your endocrinologist.'
    );
  } else if (phase === 'menstrual') {
    warnings.push(
      '⚡ Menstrual phase: Insulin sensitivity is returning to baseline. ' +
      'If you increased doses during luteal phase, reduce them now to avoid hypoglycemia.'
    );
  }

  return warnings;
}

// ============= 1.21 & 1.22: CLINICAL MODE CONTEXT =============

/**
 * Get full clinical context for a given mode, including warnings and adjustments.
 */
export function getClinicalModeContext(mode: ClinicalModeKey): ClinicalModeContext {
  const thresholds = CLINICAL_MODES[mode];
  const warnings: string[] = [];
  const adjustments: ClinicalAdjustment[] = [];

  if (mode === 'pregnancy') {
    warnings.push(
      '🤰 Pregnancy Mode: Tighter targets (63-140 mg/dL) per ADA Standards of Care. ' +
      'GMI target <6.0%. Prioritize avoiding hypoglycemia below 63 mg/dL.'
    );
    warnings.push(
      'Insulin requirements typically increase 2-3x during pregnancy. ' +
      'Weekly endocrinologist review recommended.'
    );
    adjustments.push({
      factor: 'Pregnancy hormones',
      description: 'Placental hormones (hPL, cortisol) cause progressive insulin resistance',
      impactOnTIR: 'increases_resistance',
      recommendation: 'Expect basal and bolus needs to increase significantly by 3rd trimester.',
    });
  }

  if (mode === 'pediatric') {
    warnings.push(
      '👶 Pediatric Mode: Same TIR targets as adults (70-180 mg/dL, ≥70%). ' +
      'Extra caution with hypoglycemia — children may not recognize or communicate lows.'
    );
    warnings.push(
      'Growth hormones cause significant insulin resistance during puberty. ' +
      'Dawn phenomenon may be more pronounced.'
    );
    adjustments.push({
      factor: 'Growth hormones',
      description: 'Puberty and growth spurts cause variable insulin resistance',
      impactOnTIR: 'variable',
      recommendation: 'Expect unpredictable insulin needs during growth spurts. Frequent dose adjustments may be needed.',
    });
  }

  if (mode === 'elderly') {
    warnings.push(
      '👴 Elderly/High-Risk Mode: Relaxed targets (70-250 mg/dL, ≥50% TIR). ' +
      'Hypoglycemia avoidance is the top priority — falls and cardiac events are serious risks.'
    );
    adjustments.push({
      factor: 'Reduced counter-regulation',
      description: 'Diminished glucagon response and hypoglycemia unawareness are common',
      impactOnTIR: 'variable',
      recommendation: 'Use higher CGM low alert thresholds (80+ mg/dL). Simplify insulin regimens where possible.',
    });
  }

  if (mode === 'tight') {
    warnings.push(
      '🎯 Tight Control Mode: Narrower range (70-140 mg/dL, ≥50% TIR). ' +
      'Only recommended for highly motivated users with good hypoglycemia awareness and reliable CGM use.'
    );
  }

  return { mode, thresholds, warnings, adjustments };
}

// ============= 1.25: CARB RATIO AWARENESS =============

export interface CarbRatioContext {
  timeOfDay: string;
  typicalRatioRange: string;
  factors: string[];
  warning: string | null;
}

/**
 * Get carb ratio awareness context for different times of day.
 * This is educational — NOT dosing advice.
 */
export function getCarbRatioContext(): CarbRatioContext[] {
  return [
    {
      timeOfDay: 'Morning (6-10 AM)',
      typicalRatioRange: '1:6 to 1:10',
      factors: ['Dawn phenomenon increases resistance', 'Cortisol peaks in early morning'],
      warning: 'Morning carb ratios are often the strongest (lowest number) due to dawn phenomenon.',
    },
    {
      timeOfDay: 'Midday (10 AM - 2 PM)',
      typicalRatioRange: '1:10 to 1:15',
      factors: ['Typically most insulin-sensitive period', 'Activity level affects sensitivity'],
      warning: null,
    },
    {
      timeOfDay: 'Afternoon (2-6 PM)',
      typicalRatioRange: '1:10 to 1:15',
      factors: ['Post-lunch activity', 'Exercise may increase sensitivity'],
      warning: 'If exercising after lunch, carb ratio may need to be weaker (higher number).',
    },
    {
      timeOfDay: 'Evening (6-10 PM)',
      typicalRatioRange: '1:8 to 1:12',
      factors: ['Variable based on dinner composition', 'High-fat meals delay absorption'],
      warning: 'High-fat/protein dinners may need extended bolusing (dual-wave/square-wave).',
    },
  ];
}

/**
 * Analyze if detected post-meal spikes suggest carb ratio adjustments.
 * Returns educational context, NOT specific dose recommendations.
 */
export function analyzePostMealPatterns(
  patterns: Array<{ type: string; timeOfDay?: string; avgImpact?: number }>
): string[] {
  const suggestions: string[] = [];

  const mealSpikes = patterns.filter(p => p.type === 'post_meal_spike');
  
  for (const spike of mealSpikes) {
    if (spike.avgImpact && spike.avgImpact > 80) {
      suggestions.push(
        `⚠️ Large ${spike.timeOfDay || ''} post-meal spikes (avg ${Math.round(spike.avgImpact)} mg/dL rise) ` +
        `may indicate the insulin-to-carb ratio for this meal time needs review. ` +
        `Discuss with your healthcare provider.`
      );
    } else if (spike.avgImpact && spike.avgImpact > 50) {
      suggestions.push(
        `📊 Moderate ${spike.timeOfDay || ''} post-meal rise (avg ${Math.round(spike.avgImpact)} mg/dL). ` +
        `Consider pre-bolusing 15-20 minutes before meals if safe to do so.`
      );
    }
  }

  if (suggestions.length === 0 && mealSpikes.length > 0) {
    suggestions.push('✅ Post-meal glucose rises are within acceptable ranges.');
  }

  return suggestions;
}
