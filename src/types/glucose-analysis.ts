// Comprehensive CGM Analysis Types
// Clinical-grade glucose analysis pipeline interfaces

// ============= VALIDATION RULES =============
export interface ValidationRule {
  id: string;
  description: string;
  condition: string;
  window: 'row' | 'day' | 'rolling_14d' | 'dataset';
  severity: 'critical' | 'high' | 'medium' | 'low';
  penalty: number;
  action: string;
  enabled: boolean;
  example_trigger?: string;
}

export interface ValidationFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  penalty: number;
  message: string;
  evidence?: string;
}

// ============= CONFIDENCE SCORING =============
export type ConfidenceBand = 'high' | 'moderate' | 'low' | 'unreliable' | 'unknown';

export interface ConfidenceResult {
  score: number;
  band: ConfidenceBand;
  triggeredRules: ValidationFlag[];
}

// ============= DATA QUALITY =============
export interface GapInfo {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'sensor_warmup' | 'calibration' | 'wear_off' | 'signal_loss' | 'unknown';
}

export interface DataQuality {
  percentCGMActive: number;
  totalExpectedReadings: number;
  actualReadings: number;
  gapCount: number;
  largestGapMinutes: number;
  medianIntervalMinutes: number;
  dataStartDate: string;
  dataEndDate: string;
  daysOfData: number;
  isSufficientForAnalysis: boolean;
  samplingIntervalSeconds: number;
}

// ============= DEVICE METADATA =============
export type DeviceType = 'dexcom_g6' | 'dexcom_g7' | 'libre_1' | 'libre_2' | 'libre_3' | 
  'ilet_bionic' | 'tandem_tslim' | 'omnipod_5' | 'medtronic_780g' | 'unknown';

export type UploadSource = 'phone_app' | 'receiver' | 'cloud_export' | 'hcp_portal' | 'unknown';

export interface DeviceMetadata {
  deviceType: DeviceType;
  firmwareVersion: string | null;
  sensorAge?: number;
  transmitterSerial?: string;
  uploadSource: UploadSource;
  parserVersion: string;
}

// ============= NOVEL SIGNALS =============
export interface MissedBolusEvent {
  timestamp: string;
  peakGlucose: number;
  riseMagnitude: number;
  durationAboveTarget: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timeOfDay: string;
}

export interface MealTimingMismatch {
  mealTime: string;
  bolusTime: string | null;
  deltaMinutes: number;
  postprandialPeak: number;
  mismatchScore: number;
  suggestion: string;
}

export interface SensorDriftInfo {
  driftIndex: number; // mg/dL per day
  direction: 'high' | 'low' | 'stable';
  confidencePairs: number;
  recommendation: string | null;
}

export interface AutoModeMetrics {
  autoModeActivePercent: number;
  overrideFrequencyPerDay: number;
  autoBasalVolatility: number;
  rescueEventCount: number;
  exitReasons: Record<string, number>;
}

export interface InsulinStackingEvent {
  timestamp: string;
  bolusSequence: Array<{ time: string; units: number }>;
  estimatedIOB: number;
  stackingRiskScore: number;
  subsequentLowEvent: boolean;
}

export interface RecurringPattern {
  dayOfWeek: string | 'weekday' | 'weekend';
  timeWindow: string;
  patternType: 'high' | 'low' | 'variable';
  frequency: number;
  avgMagnitude: number;
  confidence: number;
}

export interface NovelSignals {
  missedBoluses: MissedBolusEvent[];
  mealTimingScore: number;
  mealTimingMismatches: MealTimingMismatch[];
  sensorDrift: SensorDriftInfo | null;
  autoModeMetrics: AutoModeMetrics | null;
  insulinStackingEvents: InsulinStackingEvent[];
  recurringPatterns: RecurringPattern[];
  weekdayVsWeekendDiff: {
    weekdayTIR: number;
    weekendTIR: number;
    significantDifference: boolean;
  } | null;
}

// ============= DAY/NIGHT ANALYSIS =============
export interface DayNightMetrics {
  dayStart: string;
  nightStart: string;
  day: {
    timeInRange: number;
    avgGlucose: number;
    cv: number;
    lowEvents: number;
    highEvents: number;
    readingsCount: number;
  };
  night: {
    timeInRange: number;
    avgGlucose: number;
    cv: number;
    lowEvents: number;
    highEvents: number;
    readingsCount: number;
  };
}

// ============= INSULIN & MEAL EVENTS =============
export type InsulinEventType = 'BOLUS' | 'BASAL_START' | 'BASAL_STOP' | 'TEMP_BASAL' | 
  'SUSPEND' | 'RESUME' | 'AUTO_BASAL' | 'CORRECTION';

export interface InsulinEvent {
  timestamp: string;
  eventType: InsulinEventType;
  units: number | null;
  duration?: number; // minutes for temp basal
  basalRate?: number; // u/hr
  source: 'parsed' | 'inferred';
}

export interface MealEvent {
  timestamp: string;
  carbsGrams: number | null;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  source: 'user_entry' | 'auto_detected' | 'parsed';
}

// ============= ENHANCED ANALYSIS RESULT =============
export interface EnhancedDetailedAnalysis {
  // Standard metrics (existing)
  readingsCount: number;
  avgGlucose: number;
  medianGlucose: number;
  stdDev: number;
  cv: number;
  timeInRange: number;
  timeInTightRange: number;
  timeAbove180: number;
  timeAbove250: number;
  timeBelow70: number;
  timeBelow54: number;
  gmi: number;
  gvi: number;
  mage: number;
  lowEvents: number;
  severeLowEvents: number;
  highEvents: number;
  severeHighEvents: number;
  dataStart: string;
  dataEnd: string;
  daysOfData: number;
  fromSummaryReport?: boolean;
  
  // Enhanced fields
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  dataQuality: DataQuality;
  dayNightAnalysis: DayNightMetrics | null;
}

// ============= PRIORITIZED RECOMMENDATIONS =============
export interface PrioritizedRecommendation {
  id: string;
  priority: number;
  riskScore: number;
  category: 'hypoglycemia' | 'hyperglycemia' | 'variability' | 'timing' | 'pattern' | 'general';
  title: string;
  description: string;
  evidence: string;
  action: string;
  clinicianNote?: string;
}

// ============= EXECUTIVE SUMMARY =============
export interface ExecutiveSummary {
  overallTIR: number;
  tirTarget: number;
  topRisks: Array<{
    title: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
  }>;
  confidencePercent: number;
  encouragement: string;
  keyMetrics: {
    avgGlucose: number;
    gmi: number;
    cv: number;
    timeBelow70: number;
  };
  dataQualityNote: string;
}

// ============= COMPLETE ANALYSIS RESPONSE =============
export interface CompleteAnalysisResponse {
  success: boolean;
  insights: string[];
  readingsCount: number;
  
  // Core analysis
  detailedAnalysis: EnhancedDetailedAnalysis;
  hourlyData: any[];
  dailyData: any[];
  agpData: any[];
  patterns: any[];
  
  // Enhanced fields
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  validationFlags: ValidationFlag[];
  dataQuality: DataQuality;
  deviceMetadata: DeviceMetadata;
  novelSignals: NovelSignals;
  dayNightAnalysis: DayNightMetrics | null;
  insulinEvents: InsulinEvent[];
  mealEvents: MealEvent[];
  
  // Recommendations
  recommendations: string[];
  prioritizedRecommendations: PrioritizedRecommendation[];
  executiveSummary: ExecutiveSummary;
  
  // AI insights
  aiInsights: {
    summary?: string;
    keyFindings?: string[];
    priorityActions?: string[];
    encouragement?: string;
  };
  
  fromSummary?: boolean;
}
