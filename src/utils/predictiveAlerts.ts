/**
 * Phase 18.2 + Wave 1.4: Predictive Alerting with Refractory Period
 * Analyzes 14-day glucose patterns to detect recurring time-of-day lows.
 * Includes 30-minute refractory period to prevent panic re-alerts after low treatment.
 * Includes XAI trigger data for explainability (Wave 3.5).
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

/** Wave 3.5: XAI trigger data for explainability */
export interface TriggerDataPoint {
  timestamp: string;
  value: number;
  reason: string;
}

export interface PredictiveAlert {
  type: 'recurring_low' | 'recurring_high' | 'dawn_phenomenon';
  message: string;
  hourRange: string;
  confidence: number;
  suggestedAction: string;
  /** Wave 3.5: Specific data points that triggered this alert */
  triggerData: TriggerDataPoint[];
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
 * Wave 1.4: Apply refractory period to prevent re-alerting after low treatments.
 * After a low reading, suppress alerts for the specified refractory window.
 */
function applyRefractoryPeriod(
  readings: GlucoseReading[],
  lowThreshold: number,
  refractoryMinutes: number,
): GlucoseReading[] {
  if (refractoryMinutes <= 0) return readings;

  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const filtered: GlucoseReading[] = [];
  let lastLowTimestamp: number | null = null;

  for (const r of sorted) {
    const ts = new Date(r.timestamp).getTime();

    if (r.value < lowThreshold) {
      // This is a low — record it and include it
      lastLowTimestamp = ts;
      filtered.push(r);
    } else if (
      lastLowTimestamp !== null &&
      ts - lastLowTimestamp < refractoryMinutes * 60 * 1000
    ) {
      // Within refractory period after a low — skip this reading for pattern analysis
      // (the reading still exists in the data, just not counted for alert generation)
      continue;
    } else {
      filtered.push(r);
    }
  }

  return filtered;
}

/**
 * Generate human-readable alerts from patterns.
 * Wave 1.4: Includes refractoryPeriodMinutes (default 30) to prevent panic re-alerts.
 * Wave 3.5: Includes triggerData for XAI explainability.
 */
export function generatePredictiveAlerts(
  readings: GlucoseReading[],
  lowThreshold = 70,
  refractoryPeriodMinutes = 30,
): PredictiveAlert[] {
  // Apply refractory period before pattern analysis
  const filteredReadings = applyRefractoryPeriod(
    readings,
    lowThreshold,
    refractoryPeriodMinutes,
  );

  const patterns = analyzeTimeOfDayPatterns(filteredReadings, lowThreshold);
  const alerts: PredictiveAlert[] = [];

  for (const p of patterns) {
    if (p.riskLevel === 'high' && p.totalCount >= 5) {
      const label = `${String(p.hourStart).padStart(2, '0')}:00–${String(p.hourEnd).padStart(2, '0')}:00`;

      // Wave 3.5: Collect actual trigger data points
      const triggerData: TriggerDataPoint[] = filteredReadings
        .filter(r => {
          const hour = new Date(r.timestamp).getHours();
          return hour === p.hourStart && r.value < lowThreshold;
        })
        .slice(0, 10) // Limit to 10 examples for readability
        .map(r => ({
          timestamp: r.timestamp,
          value: r.value,
          reason: `Below ${lowThreshold} mg/dL during ${label}`,
        }));

      alerts.push({
        type: 'recurring_low',
        message: `Recurring lows detected around ${label} (${p.lowPercentage}% of readings below ${lowThreshold} mg/dL).`,
        hourRange: label,
        confidence: Math.min(p.totalCount / 14, 1),
        suggestedAction: 'Consider reviewing basal rates or pre-meal snacks for this time window. Consult your care team.',
        triggerData,
      });
    }
  }

  // Dawn phenomenon: check 4-8 AM for rising trend
  const dawnHours = patterns.filter((p) => p.hourStart >= 4 && p.hourStart < 8);
  const dawnAvg = dawnHours.reduce((s, p) => s + p.avgGlucose, 0) / (dawnHours.length || 1);
  if (dawnAvg > 160 && dawnHours.every((p) => p.totalCount >= 3)) {
    // Collect trigger data for dawn phenomenon
    const dawnTriggerData: TriggerDataPoint[] = filteredReadings
      .filter(r => {
        const hour = new Date(r.timestamp).getHours();
        return hour >= 4 && hour < 8 && r.value > 160;
      })
      .slice(0, 10)
      .map(r => ({
        timestamp: r.timestamp,
        value: r.value,
        reason: `Elevated glucose (>${160} mg/dL) during 04:00–08:00`,
      }));

    alerts.push({
      type: 'dawn_phenomenon',
      message: `Elevated morning glucose detected (avg ${Math.round(dawnAvg)} mg/dL between 4–8 AM).`,
      hourRange: '04:00–08:00',
      confidence: 0.7,
      suggestedAction: 'This may indicate dawn phenomenon. Discuss with your endocrinologist.',
      triggerData: dawnTriggerData,
    });
  }

  return alerts;
}
