/**
 * Phase 1.16-1.25: Clinical detection algorithms for CGM analysis.
 * Used by both the frontend and referenced by the edge function logic.
 * 
 * MEDICAL DISCLAIMER: These are analytical tools only.
 * All findings should be reviewed with a healthcare provider.
 */

/**
 * 1.16: CGM Compression Low Detection
 * Compression lows occur when sleeping on the sensor, causing false low readings.
 * Characteristics: sudden drop to ~40-55 mg/dL during sleep hours (11PM-7AM),
 * followed by a rapid return to normal, with no preceding downward trend.
 */
export interface CompressionLowEvent {
  timestamp: string;
  nadirValue: number;
  durationMinutes: number;
  confidence: number;
  priorTrend: 'stable' | 'rising' | 'falling';
}

export function detectCompressionLows(
  readings: Array<{ timestamp: Date; value: number }>
): CompressionLowEvent[] {
  if (readings.length < 20) return [];

  const events: CompressionLowEvent[] = [];
  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  for (let i = 6; i < sorted.length - 6; i++) {
    const hour = sorted[i].timestamp.getHours();
    // Only check during typical sleep hours (11PM - 7AM)
    if (hour >= 7 && hour < 23) continue;

    const current = sorted[i].value;
    if (current >= 65) continue; // Not a low

    // Check prior trend (30 min before): was glucose stable/rising?
    const priorValues = sorted.slice(Math.max(0, i - 6), i).map(r => r.value);
    const priorAvg = priorValues.reduce((a, b) => a + b, 0) / priorValues.length;
    const priorTrend: 'stable' | 'rising' | 'falling' = 
      priorAvg - current > 30 && priorAvg > 100 ? 'stable' :
      priorAvg > current + 10 ? 'falling' : 'rising';

    // Check recovery (30 min after): rapid return to >90 mg/dL?
    const postValues = sorted.slice(i + 1, Math.min(sorted.length, i + 7)).map(r => r.value);
    const postAvg = postValues.reduce((a, b) => a + b, 0) / (postValues.length || 1);
    const rapidRecovery = postAvg > 90;

    // Compression low signature: abrupt drop during sleep + rapid recovery + prior was normal
    if (priorTrend !== 'falling' && rapidRecovery && priorAvg > 80) {
      // Calculate duration of the low
      let duration = 0;
      for (let j = i; j < Math.min(sorted.length, i + 12); j++) {
        if (sorted[j].value < 70) {
          duration += 5; // ~5 min intervals
        } else break;
      }

      const confidence = 
        (priorAvg > 100 ? 0.3 : 0.1) +
        (rapidRecovery ? 0.3 : 0) +
        (current < 50 ? 0.2 : 0.1) +
        (duration < 45 ? 0.2 : 0.1);

      events.push({
        timestamp: sorted[i].timestamp.toISOString(),
        nadirValue: Math.round(current),
        durationMinutes: duration,
        confidence: Math.min(0.95, confidence),
        priorTrend,
      });

      i += 6; // Skip ahead to avoid duplicates
    }
  }

  return events.slice(0, 10);
}

/**
 * 1.17: Hypoglycemia Unawareness Detection
 * Detects patterns suggesting reduced awareness of low blood sugar.
 * Indicators: frequent lows without correction, prolonged time below 70,
 * and lack of rebound highs (suggesting no counter-regulatory response).
 */
export interface HypoUnawarenessIndicator {
  score: number; // 0-100, higher = more concerning
  indicators: string[];
  lowFrequency: number; // lows per day
  avgLowDuration: number; // minutes
  prolongedLows: number; // events >30 min below 54
  recommendation: string;
}

export function assessHypoUnawareness(
  readings: Array<{ timestamp: Date; value: number }>,
  daysOfData: number
): HypoUnawarenessIndicator | null {
  if (readings.length < 288 || daysOfData < 3) return null; // Need at least 1 day

  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const indicators: string[] = [];
  let score = 0;

  // Count low events and their durations
  let lowEventCount = 0;
  let totalLowDuration = 0;
  let prolongedSevereLows = 0;
  let inLow = false;
  let lowStartIdx = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].value < 70 && !inLow) {
      inLow = true;
      lowStartIdx = i;
      lowEventCount++;
    } else if (sorted[i].value >= 70 && inLow) {
      inLow = false;
      const durationMs = sorted[i].timestamp.getTime() - sorted[lowStartIdx].timestamp.getTime();
      const durationMin = durationMs / 60000;
      totalLowDuration += durationMin;

      // Check if any readings during this event were <54
      const hasSevereLow = sorted.slice(lowStartIdx, i).some(r => r.value < 54);
      if (hasSevereLow && durationMin > 30) {
        prolongedSevereLows++;
      }
    }
  }

  const lowsPerDay = lowEventCount / Math.max(1, daysOfData);
  const avgLowDuration = lowEventCount > 0 ? totalLowDuration / lowEventCount : 0;

  // Scoring
  if (lowsPerDay > 2) {
    score += 25;
    indicators.push(`Frequent lows: ${lowsPerDay.toFixed(1)} episodes/day (target: <1)`);
  } else if (lowsPerDay > 1) {
    score += 15;
    indicators.push(`Elevated low frequency: ${lowsPerDay.toFixed(1)} episodes/day`);
  }

  if (avgLowDuration > 30) {
    score += 25;
    indicators.push(`Prolonged lows averaging ${Math.round(avgLowDuration)} minutes`);
  } else if (avgLowDuration > 15) {
    score += 10;
  }

  if (prolongedSevereLows > 0) {
    score += 30;
    indicators.push(`${prolongedSevereLows} severe low episodes (>30 min below 54 mg/dL)`);
  }

  // Check for nocturnal lows without correction
  const nocturnalLows = sorted.filter(r => {
    const h = r.timestamp.getHours();
    return r.value < 60 && (h >= 23 || h <= 5);
  });
  if (nocturnalLows.length > daysOfData * 0.5) {
    score += 20;
    indicators.push('Frequent nocturnal lows detected — may indicate unawareness during sleep');
  }

  if (indicators.length === 0) return null;

  const recommendation = score >= 50
    ? '⚠️ Pattern suggests possible hypoglycemia unawareness. Discuss with your endocrinologist. Consider CGM alerts and temporary higher glucose targets.'
    : 'Monitor low patterns. Consider adjusting CGM low alerts to a higher threshold.';

  return {
    score: Math.min(100, score),
    indicators,
    lowFrequency: Math.round(lowsPerDay * 10) / 10,
    avgLowDuration: Math.round(avgLowDuration),
    prolongedLows: prolongedSevereLows,
    recommendation,
  };
}

/**
 * 1.19: Exercise Type Classification
 * Differentiates aerobic vs anaerobic exercise effects on glucose.
 */
export type ExerciseType = 'aerobic' | 'anaerobic' | 'mixed' | 'unknown';

export interface ExerciseImpact {
  type: ExerciseType;
  glucoseEffect: 'lowering' | 'raising' | 'biphasic';
  sensitivityDuration: string;
  recommendation: string;
}

export const EXERCISE_IMPACTS: Record<ExerciseType, ExerciseImpact> = {
  aerobic: {
    type: 'aerobic',
    glucoseEffect: 'lowering',
    sensitivityDuration: 'Up to 24 hours post-exercise',
    recommendation: 'Consider reducing basal by 20-50% during exercise and monitoring for delayed lows.',
  },
  anaerobic: {
    type: 'anaerobic',
    glucoseEffect: 'raising',
    sensitivityDuration: '1-2 hours post-exercise (initial spike), then lowering for 12-24 hours',
    recommendation: 'Expect initial glucose spike from hepatic glucose release. Do NOT correct aggressively — delayed lows may follow.',
  },
  mixed: {
    type: 'mixed',
    glucoseEffect: 'biphasic',
    sensitivityDuration: 'Variable — monitor closely for 24 hours',
    recommendation: 'Mixed exercise creates unpredictable glucose responses. Monitor frequently and have fast-acting carbs available.',
  },
  unknown: {
    type: 'unknown',
    glucoseEffect: 'lowering',
    sensitivityDuration: 'Unknown',
    recommendation: 'Track your exercise type to get personalized glucose impact analysis.',
  },
};

/**
 * 1.23: Data Completeness Assessment
 * Provides user-friendly data completeness warnings.
 */
export interface DataCompletenessAssessment {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  warnings: string[];
  recommendations: string[];
  metricsReliability: Record<string, 'reliable' | 'limited' | 'unreliable'>;
}

export function assessDataCompleteness(
  readingsCount: number,
  daysOfData: number,
  percentActive: number,
  gapCount: number
): DataCompletenessAssessment {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Wear time
  if (percentActive < 70) {
    score -= 30;
    warnings.push(`CGM wear time is ${percentActive.toFixed(0)}% (minimum recommended: 70%)`);
    recommendations.push('Try to wear your CGM sensor continuously for more accurate analysis');
  } else if (percentActive < 85) {
    score -= 10;
  }

  // Days of data
  if (daysOfData < 3) {
    score -= 30;
    warnings.push('Less than 3 days of data — insufficient for pattern detection');
    recommendations.push('Upload at least 7-14 days of data for meaningful patterns');
  } else if (daysOfData < 7) {
    score -= 15;
    warnings.push('Less than 7 days — some patterns may be missed');
  } else if (daysOfData < 14) {
    score -= 5;
  }

  // Readings density
  const expectedReadingsPerDay = 288; // 5-min intervals
  const actualPerDay = readingsCount / Math.max(1, daysOfData);
  if (actualPerDay < expectedReadingsPerDay * 0.5) {
    score -= 20;
    warnings.push('Low reading density — gaps may affect accuracy');
  }

  // Gap count
  if (gapCount > 5) {
    score -= 10;
    warnings.push(`${gapCount} data gaps detected`);
    recommendations.push('Check sensor adhesion and signal strength');
  }

  score = Math.max(0, score);

  const grade: DataCompletenessAssessment['grade'] = 
    score >= 90 ? 'A' :
    score >= 75 ? 'B' :
    score >= 60 ? 'C' :
    score >= 40 ? 'D' : 'F';

  // Determine which metrics are reliable given the data
  const metricsReliability: Record<string, 'reliable' | 'limited' | 'unreliable'> = {
    tir: percentActive >= 70 ? 'reliable' : percentActive >= 50 ? 'limited' : 'unreliable',
    gmi: daysOfData >= 10 ? 'reliable' : daysOfData >= 5 ? 'limited' : 'unreliable',
    cv: readingsCount >= 288 ? 'reliable' : readingsCount >= 72 ? 'limited' : 'unreliable',
    mage: readingsCount >= 288 && percentActive >= 70 ? 'reliable' : 'limited',
    patterns: daysOfData >= 7 ? 'reliable' : daysOfData >= 3 ? 'limited' : 'unreliable',
    agp: daysOfData >= 14 ? 'reliable' : daysOfData >= 7 ? 'limited' : 'unreliable',
  };

  return { overallScore: score, grade, warnings, recommendations, metricsReliability };
}
