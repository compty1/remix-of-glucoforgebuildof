/**
 * Wave 1.3: Micro-Bolus Detection for Closed-Loop Pumps
 * Omnipod 5 / Control-IQ deliver micro-boluses every 5 minutes.
 * Without aggregation, this logs as 288 discrete "boluses" per day,
 * completely breaking pattern recognition.
 */

import type { ParsedGlucoseReading } from './dataParser';

export interface AggregatedInsulinDelivery {
  hourStart: Date;
  totalUnits: number;
  microBolusCount: number;
  deliveryType: 'aggregated_basal' | 'manual_bolus';
}

/**
 * Threshold for identifying closed-loop micro-boluses.
 * Typical micro-boluses are 0.025u–0.15u delivered every 5 minutes.
 */
const MICRO_BOLUS_THRESHOLD_UNITS = 0.2;
const MICRO_BOLUS_MAX_GAP_MINUTES = 10;

/**
 * Detect if a set of readings appears to be from a closed-loop pump
 * based on insulin delivery patterns.
 */
export function detectClosedLoopPattern(
  readings: ParsedGlucoseReading[],
): boolean {
  const withInsulin = readings.filter(
    r => r.insulinUnits !== undefined && r.insulinUnits > 0,
  );
  if (withInsulin.length < 20) return false;

  const microBoluses = withInsulin.filter(
    r => r.insulinUnits! <= MICRO_BOLUS_THRESHOLD_UNITS,
  );

  // If >60% of insulin events are micro-boluses, likely closed-loop
  return microBoluses.length / withInsulin.length > 0.6;
}

/**
 * Collapse micro-boluses into hourly basal delivery summaries.
 * Manual boluses (>threshold) are preserved as-is.
 */
export function collapseClosedLoopBoluses(
  readings: ParsedGlucoseReading[],
): {
  readings: ParsedGlucoseReading[];
  aggregatedDelivery: AggregatedInsulinDelivery[];
} {
  const isClosedLoop = detectClosedLoopPattern(readings);
  if (!isClosedLoop) {
    return { readings, aggregatedDelivery: [] };
  }

  const aggregated: AggregatedInsulinDelivery[] = [];
  const processedReadings: ParsedGlucoseReading[] = [];

  // Group by hour
  const hourlyBuckets = new Map<
    string,
    { microTotal: number; microCount: number; hourStart: Date }
  >();

  for (const reading of readings) {
    const hourKey = `${reading.timestamp.getFullYear()}-${reading.timestamp.getMonth()}-${reading.timestamp.getDate()}-${reading.timestamp.getHours()}`;

    if (
      reading.insulinUnits !== undefined &&
      reading.insulinUnits > 0 &&
      reading.insulinUnits <= MICRO_BOLUS_THRESHOLD_UNITS
    ) {
      // Micro-bolus: aggregate into hourly bucket
      const existing = hourlyBuckets.get(hourKey);
      if (existing) {
        existing.microTotal += reading.insulinUnits;
        existing.microCount++;
      } else {
        const hourStart = new Date(reading.timestamp);
        hourStart.setMinutes(0, 0, 0);
        hourlyBuckets.set(hourKey, {
          microTotal: reading.insulinUnits,
          microCount: 1,
          hourStart,
        });
      }

      // Preserve the glucose reading but strip the micro-bolus insulin
      processedReadings.push({
        ...reading,
        insulinUnits: undefined,
        notes: reading.notes
          ? `${reading.notes} [micro-bolus aggregated]`
          : undefined,
      });
    } else {
      // Manual bolus or no insulin: keep as-is
      processedReadings.push(reading);
    }
  }

  // Convert hourly buckets to aggregated delivery records
  for (const [, bucket] of hourlyBuckets) {
    aggregated.push({
      hourStart: bucket.hourStart,
      totalUnits: Math.round(bucket.microTotal * 1000) / 1000,
      microBolusCount: bucket.microCount,
      deliveryType: 'aggregated_basal',
    });
  }

  aggregated.sort((a, b) => a.hourStart.getTime() - b.hourStart.getTime());

  return { readings: processedReadings, aggregatedDelivery: aggregated };
}

/**
 * Format aggregated delivery for AI prompt context.
 */
export function formatClosedLoopDeliveryForPrompt(
  delivery: AggregatedInsulinDelivery[],
): string {
  if (delivery.length === 0) return '';

  const totalUnits = delivery.reduce((sum, d) => sum + d.totalUnits, 0);
  const hourlyRates = delivery.map(d => ({
    hour: d.hourStart.getHours(),
    rate: d.totalUnits,
  }));

  return [
    'CLOSED-LOOP PUMP DELIVERY (micro-boluses aggregated hourly):',
    `- Total automated delivery: ${totalUnits.toFixed(1)}u`,
    `- Hours with delivery: ${delivery.length}`,
    `- Hourly rates: ${hourlyRates
      .map(h => `${h.hour}:00=${h.rate.toFixed(2)}u`)
      .join(', ')}`,
    '- Note: Individual micro-boluses have been aggregated. Do not interpret as manual boluses.',
  ].join('\n');
}
