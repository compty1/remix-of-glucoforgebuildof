/**
 * Phase 18.2: Predictive Alerting
 * Analyzes 14-day glucose patterns to detect recurring time-of-day lows.
 */

export interface GlucoseReading {
  timestamp: string;
  value: number;
}

export interface TimeOfDayPattern {
  hourStart: number;
  hourEnd: number;
  avgGlucose: number;
  lowCount: number;
  totalCount: number;
  lowPercentage: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface PredictiveAlert {
  type: 'recurring_low' | 'recurring_high' | 'dawn_phenomenon';
  message: string;
  hourRange: string;
  confidence: number;
  suggestedAction: string;
}

/**
 * Bucket readings into hourly windows and detect recurring patterns.
 */
export function analyzeTimeOfDayPatterns(
  readings: GlucoseReading[],
  lowThreshold = 70,
  highThreshold = 180,
): TimeOfDayPattern[] {
  const buckets: Map<number, { values: number[] }> = new Map();

  for (let h = 0; h < 24; h++) {
    buckets.set(h, { values: [] });
  }

  for (const r of readings) {
    const hour = new Date(r.timestamp).getHours();
    buckets.get(hour)?.values.push(r.value);
  }

  return Array.from(buckets.entries()).map(([hour, { values }]) => {
    const lowCount = values.filter((v) => v < lowThreshold).length;
    const total = values.length;
    const avg = total > 0 ? values.reduce((a, b) => a + b, 0) / total : 0;
    const lowPct = total > 0 ? (lowCount / total) * 100 : 0;

    return {
      hourStart: hour,
      hourEnd: (hour + 1) % 24,
      avgGlucose: Math.round(avg),
      lowCount,
      totalCount: total,
      lowPercentage: Math.round(lowPct * 10) / 10,
      riskLevel: lowPct >= 15 ? 'high' : lowPct >= 5 ? 'moderate' : 'low',
    };
  });
}

/**
 * Generate human-readable alerts from patterns.
 */
export function generatePredictiveAlerts(
  readings: GlucoseReading[],
  lowThreshold = 70,
): PredictiveAlert[] {
  const patterns = analyzeTimeOfDayPatterns(readings, lowThreshold);
  const alerts: PredictiveAlert[] = [];

  for (const p of patterns) {
    if (p.riskLevel === 'high' && p.totalCount >= 5) {
      const label = `${String(p.hourStart).padStart(2, '0')}:00–${String(p.hourEnd).padStart(2, '0')}:00`;
      alerts.push({
        type: 'recurring_low',
        message: `Recurring lows detected around ${label} (${p.lowPercentage}% of readings below ${lowThreshold} mg/dL).`,
        hourRange: label,
        confidence: Math.min(p.totalCount / 14, 1),
        suggestedAction: 'Consider reviewing basal rates or pre-meal snacks for this time window. Consult your care team.',
      });
    }
  }

  // Dawn phenomenon: check 4-8 AM for rising trend
  const dawnHours = patterns.filter((p) => p.hourStart >= 4 && p.hourStart < 8);
  const dawnAvg = dawnHours.reduce((s, p) => s + p.avgGlucose, 0) / (dawnHours.length || 1);
  if (dawnAvg > 160 && dawnHours.every((p) => p.totalCount >= 3)) {
    alerts.push({
      type: 'dawn_phenomenon',
      message: `Elevated morning glucose detected (avg ${Math.round(dawnAvg)} mg/dL between 4–8 AM).`,
      hourRange: '04:00–08:00',
      confidence: 0.7,
      suggestedAction: 'This may indicate dawn phenomenon. Discuss with your endocrinologist.',
    });
  }

  return alerts;
}
