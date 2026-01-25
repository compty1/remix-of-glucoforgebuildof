// Glucose Data Validation Rules Configuration
// Based on clinical CGM data quality standards

import type { ValidationRule, ValidationFlag, ConfidenceBand, ConfidenceResult } from '@/types/glucose-analysis';

export const VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'timestamp_future',
    description: 'Timestamp is in the future relative to ingestion time',
    condition: 'record.timestamp_utc > ingestion_time',
    window: 'row',
    severity: 'critical',
    penalty: 40,
    action: 'Reject row; flag dataset for clock drift investigation',
    enabled: true,
    example_trigger: 'device timestamp 2030-01-01T00:00:00Z'
  },
  {
    id: 'timestamp_drift',
    description: 'Device local time differs from UTC by more than allowed drift',
    condition: 'abs(record.local_timestamp - record.timestamp_utc) > 12h',
    window: 'row',
    severity: 'high',
    penalty: 20,
    action: 'Flag timezone mismatch; recommend user verify device time',
    enabled: true,
    example_trigger: 'local_timestamp offset 13 hours'
  },
  {
    id: 'low_wear_time',
    description: 'Percent CGM active below minimum threshold over rolling window',
    condition: 'dataset.percent_cgm_active_14d < 70',
    window: 'rolling_14d',
    severity: 'high',
    penalty: 30,
    action: 'Mark report confidence low; require more data for reliable analysis',
    enabled: true,
    example_trigger: '14-day active time 55%'
  },
  {
    id: 'large_gaps',
    description: 'Excessive long gaps in CGM data',
    condition: 'dataset.count_gaps_over_2h > 3',
    window: 'rolling_14d',
    severity: 'medium',
    penalty: 10,
    action: 'Show gap map and call out likely missed-wear or upload issues',
    enabled: true,
    example_trigger: '4 gaps > 2 hours in 14 days'
  },
  {
    id: 'duplicate_rows',
    description: 'Exact duplicate rows detected',
    condition: 'exists duplicate where device_id and timestamp_utc and glucose_mg_dl identical',
    window: 'dataset',
    severity: 'low',
    penalty: 2,
    action: 'Deduplicate rows; log parser behavior',
    enabled: true,
    example_trigger: 'two identical rows for same timestamp'
  },
  {
    id: 'out_of_range_glucose',
    description: 'Glucose values outside physiologic plausibility bounds',
    condition: 'record.glucose_mg_dl < 20 or record.glucose_mg_dl > 1000',
    window: 'row',
    severity: 'critical',
    penalty: 35,
    action: 'Mark value suspect; exclude from metric calculations until reviewed',
    enabled: true,
    example_trigger: 'glucose 5 mg/dL'
  },
  {
    id: 'implausible_insulin',
    description: 'Insulin or carb entries exceed plausibility thresholds',
    condition: 'record.insulin_units > 50 or record.carb_event > 500',
    window: 'row',
    severity: 'medium',
    penalty: 15,
    action: 'Flag for manual review; sanitize extreme values',
    enabled: true,
    example_trigger: 'bolus 120 U'
  },
  {
    id: 'missing_required_fields',
    description: 'Required canonical fields missing in import',
    condition: 'missing(record.timestamp_utc) or missing(record.device_id) or missing(record.glucose_status)',
    window: 'row',
    severity: 'critical',
    penalty: 50,
    action: 'Reject import; require canonical mapping',
    enabled: true,
    example_trigger: 'no timestamp present'
  },
  {
    id: 'firmware_unknown',
    description: 'Firmware or export format not recognized',
    condition: 'is_null(record.firmware_version) or record.firmware_version not in supported_firmware_list',
    window: 'dataset',
    severity: 'low',
    penalty: 5,
    action: 'Record parser version; recommend parser update and compatibility check',
    enabled: true,
    example_trigger: 'firmware vX.Y.Z unknown'
  },
  {
    id: 'sampling_interval_high',
    description: 'Median inter-sample interval exceeds expected (indicates sparse data)',
    condition: 'dataset.median_inter_sample_interval_minutes > 10',
    window: 'rolling_14d',
    severity: 'medium',
    penalty: 12,
    action: 'Lower confidence for time-based metrics; show sampling interval in report',
    enabled: true,
    example_trigger: 'median interval 12 minutes'
  },
  {
    id: 'suspicious_sensor_age',
    description: 'Sensor age exceeds typical lifespan',
    condition: 'record.sensor_age_hours > 336',
    window: 'row',
    severity: 'medium',
    penalty: 8,
    action: 'Flag possible sensor reuse beyond recommended lifespan',
    enabled: true,
    example_trigger: 'sensor_age_hours 400'
  },
  {
    id: 'inconsistent_upload_source',
    description: 'Multiple upload sources with overlapping timestamps',
    condition: 'exists overlapping_rows from different upload_source within 1 minute',
    window: 'dataset',
    severity: 'low',
    penalty: 3,
    action: 'Prefer cloud export; deduplicate and log source',
    enabled: true,
    example_trigger: 'phone_app and receiver rows same timestamp'
  }
];

export const CONFIDENCE_CONFIG = {
  baseScore: 100,
  minScore: 0,
  maxScore: 100,
  bands: {
    high: { min: 85, max: 100 },
    moderate: { min: 60, max: 84 },
    low: { min: 30, max: 59 },
    unreliable: { min: 0, max: 29 }
  }
};

export function getConfidenceBand(score: number): ConfidenceBand {
  if (score >= CONFIDENCE_CONFIG.bands.high.min) return 'high';
  if (score >= CONFIDENCE_CONFIG.bands.moderate.min) return 'moderate';
  if (score >= CONFIDENCE_CONFIG.bands.low.min) return 'low';
  return 'unreliable';
}

export function calculateConfidenceScore(triggeredRules: ValidationFlag[]): ConfidenceResult {
  // Deduplicate by rule id and sum unique penalties
  const uniquePenalties = new Map<string, number>();
  triggeredRules.forEach(rule => {
    if (!uniquePenalties.has(rule.id) || uniquePenalties.get(rule.id)! < rule.penalty) {
      uniquePenalties.set(rule.id, rule.penalty);
    }
  });
  
  const totalPenalty = Array.from(uniquePenalties.values()).reduce((sum, p) => sum + p, 0);
  const score = Math.max(
    CONFIDENCE_CONFIG.minScore,
    Math.min(CONFIDENCE_CONFIG.maxScore, CONFIDENCE_CONFIG.baseScore - totalPenalty)
  );
  
  return {
    score,
    band: getConfidenceBand(score),
    triggeredRules
  };
}

export function getConfidenceBandDescription(band: ConfidenceBand): string {
  switch (band) {
    case 'high':
      return 'High confidence — metrics reliable for clinical interpretation';
    case 'moderate':
      return 'Moderate confidence — proceed with caution, review caveats';
    case 'low':
      return 'Low confidence — major data issues, limited automated claims';
    case 'unreliable':
      return 'Unreliable — insufficient data, consider re-upload';
    default:
      return 'Unknown confidence level';
  }
}

export function getConfidenceBandColor(band: ConfidenceBand): string {
  switch (band) {
    case 'high':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'moderate':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'unreliable':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
}
