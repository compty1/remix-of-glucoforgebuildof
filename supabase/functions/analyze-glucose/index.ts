import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting config
const RATE_LIMIT_REQUESTS = 30;
const RATE_LIMIT_WINDOW_MS = 60000;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

const analyzeRequestSchema = z.object({
  filename: z.string(),
  fileContent: z.string(),
  uploadId: z.string().uuid()
});

interface GlucoseReading {
  timestamp: Date;
  value: number;
  eventType?: string;
  insulinUnits?: number;
  carbGrams?: number;
  sensorStatus?: string;
}

// ============= VALIDATION RULES (Confidence Scoring) =============
interface ValidationFlag {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  penalty: number;
  message: string;
  evidence?: string;
}

interface DataQuality {
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

interface GapInfo {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'sensor_warmup' | 'calibration' | 'wear_off' | 'signal_loss' | 'unknown';
}

interface DeviceMetadata {
  deviceType: string;
  firmwareVersion: string | null;
  sensorAge: number | null;
  uploadSource: string;
  parserVersion: string;
}

interface NovelSignals {
  missedBoluses: MissedBolusEvent[];
  mealTimingScore: number;
  mealTimingMismatches: any[];
  sensorDrift: { driftIndex: number; direction: string; confidencePairs: number; recommendation: string | null } | null;
  autoModeMetrics: any | null;
  insulinStackingEvents: any[];
  recurringPatterns: RecurringPattern[];
  weekdayVsWeekendDiff: { weekdayTIR: number; weekendTIR: number; significantDifference: boolean } | null;
}

interface MissedBolusEvent {
  timestamp: string;
  peakGlucose: number;
  riseMagnitude: number;
  durationAboveTarget: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timeOfDay: string;
}

interface RecurringPattern {
  dayOfWeek: string;
  timeWindow: string;
  patternType: 'high' | 'low' | 'variable';
  frequency: number;
  avgMagnitude: number;
  confidence: number;
}

interface DayNightMetrics {
  dayStart: string;
  nightStart: string;
  day: { timeInRange: number; avgGlucose: number; cv: number; lowEvents: number; highEvents: number; readingsCount: number };
  night: { timeInRange: number; avgGlucose: number; cv: number; lowEvents: number; highEvents: number; readingsCount: number };
}

interface ExecutiveSummary {
  overallTIR: number;
  tirTarget: number;
  topRisks: Array<{ title: string; severity: 'critical' | 'warning' | 'info'; description: string }>;
  confidencePercent: number;
  encouragement: string;
  keyMetrics: { avgGlucose: number; gmi: number; cv: number; timeBelow70: number };
  dataQualityNote: string;
}

interface HourlyStats {
  hour: number;
  avg: number;
  min: number;
  max: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  count: number;
}

interface DailyStats {
  date: string;
  avg: number;
  min: number;
  max: number;
  tir: number;
  readings: number;
  lowEvents: number;
  highEvents: number;
}

interface AGPDataPoint {
  time: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

interface PatternResult {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timeOfDay?: string;
  frequency?: number;
  avgImpact?: number;
}

interface DetailedAnalysis {
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
}

// PDF Summary Metrics interface
interface PDFSummaryMetrics {
  gmi?: number;
  avgGlucose?: number;
  timeInRange?: number;
  timeAbove180?: number;
  timeBelow70?: number;
  cv?: number;
  reportPeriodDays?: number;
}

// ============= ENHANCED ANALYSIS FUNCTIONS =============

function calculateDataQuality(readings: GlucoseReading[]): DataQuality {
  if (readings.length === 0) {
    return {
      percentCGMActive: 0,
      totalExpectedReadings: 0,
      actualReadings: 0,
      gapCount: 0,
      largestGapMinutes: 0,
      medianIntervalMinutes: 0,
      dataStartDate: '',
      dataEndDate: '',
      daysOfData: 0,
      isSufficientForAnalysis: false,
      samplingIntervalSeconds: 300
    };
  }

  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const startDate = sorted[0].timestamp;
  const endDate = sorted[sorted.length - 1].timestamp;
  const totalMs = endDate.getTime() - startDate.getTime();
  const daysOfData = Math.max(1, totalMs / (24 * 60 * 60 * 1000));
  
  // Calculate intervals between readings
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime();
    intervals.push(diffMs / 1000); // seconds
  }
  
  // Detect sampling interval (5 min = 300s for most CGMs)
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const medianIntervalSeconds = sortedIntervals[Math.floor(sortedIntervals.length / 2)] || 300;
  const samplingIntervalSeconds = medianIntervalSeconds < 180 ? 60 : medianIntervalSeconds < 400 ? 300 : 900;
  
  // Expected readings based on sampling interval
  const expectedReadings = Math.floor(totalMs / (samplingIntervalSeconds * 1000));
  const percentActive = Math.min(100, (readings.length / expectedReadings) * 100);
  
  // Count gaps > 2 hours (7200 seconds)
  let gapCount = 0;
  let largestGapSeconds = 0;
  for (const interval of intervals) {
    if (interval > 7200) gapCount++;
    if (interval > largestGapSeconds) largestGapSeconds = interval;
  }

  return {
    percentCGMActive: Math.round(percentActive * 10) / 10,
    totalExpectedReadings: expectedReadings,
    actualReadings: readings.length,
    gapCount,
    largestGapMinutes: Math.round(largestGapSeconds / 60),
    medianIntervalMinutes: Math.round(medianIntervalSeconds / 60 * 10) / 10,
    dataStartDate: startDate.toISOString().split('T')[0],
    dataEndDate: endDate.toISOString().split('T')[0],
    daysOfData: Math.round(daysOfData * 10) / 10,
    isSufficientForAnalysis: percentActive >= 70 && daysOfData >= 3,
    samplingIntervalSeconds
  };
}

function detectGaps(readings: GlucoseReading[]): GapInfo[] {
  if (readings.length < 2) return [];
  
  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const gaps: GapInfo[] = [];
  const GAP_THRESHOLD_MINUTES = 30; // Consider gap if > 30 min
  
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime();
    const diffMinutes = diffMs / (60 * 1000);
    
    if (diffMinutes > GAP_THRESHOLD_MINUTES) {
      // Determine gap type based on context
      let gapType: GapInfo['type'] = 'unknown';
      const hour = sorted[i - 1].timestamp.getHours();
      
      if (diffMinutes <= 120 && sorted[i - 1].sensorStatus === 'warmup') {
        gapType = 'sensor_warmup';
      } else if (diffMinutes >= 480 && diffMinutes <= 600 && hour >= 22 || hour <= 6) {
        gapType = 'wear_off'; // Likely sensor removal overnight
      } else if (diffMinutes <= 60) {
        gapType = 'signal_loss';
      }
      
      gaps.push({
        startTime: sorted[i - 1].timestamp.toISOString(),
        endTime: sorted[i].timestamp.toISOString(),
        durationMinutes: Math.round(diffMinutes),
        type: gapType
      });
    }
  }
  
  return gaps.sort((a, b) => b.durationMinutes - a.durationMinutes);
}

function evaluateValidationRules(readings: GlucoseReading[], dataQuality: DataQuality): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const now = new Date();
  
  // Rule: low_wear_time
  if (dataQuality.percentCGMActive < 70) {
    flags.push({
      id: 'low_wear_time',
      severity: 'high',
      penalty: 30,
      message: `CGM active time is ${dataQuality.percentCGMActive.toFixed(1)}% (target: ≥70%)`,
      evidence: `${dataQuality.actualReadings} of ${dataQuality.totalExpectedReadings} expected readings`
    });
  }
  
  // Rule: large_gaps
  if (dataQuality.gapCount > 3) {
    flags.push({
      id: 'large_gaps',
      severity: 'medium',
      penalty: 10,
      message: `${dataQuality.gapCount} data gaps > 2 hours detected`,
      evidence: `Largest gap: ${dataQuality.largestGapMinutes} minutes`
    });
  }
  
  // Rule: sampling_interval_high
  if (dataQuality.medianIntervalMinutes > 10) {
    flags.push({
      id: 'sampling_interval_high',
      severity: 'medium',
      penalty: 12,
      message: `Sparse data: median interval ${dataQuality.medianIntervalMinutes.toFixed(1)} min (expected ~5 min)`,
      evidence: 'Time-based metrics may be less accurate'
    });
  }
  
  // Rule: insufficient_data_period
  if (dataQuality.daysOfData < 7) {
    flags.push({
      id: 'insufficient_data_period',
      severity: 'medium',
      penalty: 15,
      message: `Only ${dataQuality.daysOfData.toFixed(1)} days of data (recommend ≥14 days for patterns)`,
      evidence: 'Pattern detection may be limited'
    });
  }
  
  // Rule: out_of_range_glucose (check for implausible values)
  const outOfRange = readings.filter(r => r.value < 20 || r.value > 600);
  if (outOfRange.length > 0) {
    flags.push({
      id: 'out_of_range_glucose',
      severity: 'critical',
      penalty: 35,
      message: `${outOfRange.length} readings outside plausible range (20-600 mg/dL)`,
      evidence: 'These values are excluded from analysis'
    });
  }
  
  // Rule: future timestamps
  const futureReadings = readings.filter(r => r.timestamp > now);
  if (futureReadings.length > 0) {
    flags.push({
      id: 'timestamp_future',
      severity: 'critical',
      penalty: 40,
      message: `${futureReadings.length} readings have future timestamps`,
      evidence: 'Check device clock settings'
    });
  }
  
  return flags;
}

function calculateDayNightMetrics(readings: GlucoseReading[]): DayNightMetrics | null {
  if (readings.length < 24) return null;
  
  const DAY_START = 6; // 6 AM
  const NIGHT_START = 22; // 10 PM
  
  const dayReadings: number[] = [];
  const nightReadings: number[] = [];
  
  for (const r of readings) {
    const hour = r.timestamp.getHours();
    if (hour >= DAY_START && hour < NIGHT_START) {
      dayReadings.push(r.value);
    } else {
      nightReadings.push(r.value);
    }
  }
  
  const calcMetrics = (values: number[]) => {
    if (values.length === 0) return { timeInRange: 0, avgGlucose: 0, cv: 0, lowEvents: 0, highEvents: 0, readingsCount: 0 };
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length);
    return {
      timeInRange: (inRange / values.length) * 100,
      avgGlucose: Math.round(avg),
      cv: avg > 0 ? (stdDev / avg) * 100 : 0,
      lowEvents: values.filter(v => v < 70).length,
      highEvents: values.filter(v => v > 180).length,
      readingsCount: values.length
    };
  };
  
  return {
    dayStart: `${DAY_START}:00`,
    nightStart: `${NIGHT_START}:00`,
    day: calcMetrics(dayReadings),
    night: calcMetrics(nightReadings)
  };
}

function detectNovelSignals(readings: GlucoseReading[], hourlyData: HourlyStats[]): NovelSignals {
  const missedBoluses = detectMissedBoluses(readings);
  const recurringPatterns = detectRecurringPatterns(readings);
  const weekdayVsWeekend = analyzeWeekdayVsWeekend(readings);
  
  return {
    missedBoluses,
    mealTimingScore: 0, // Requires insulin/meal data
    mealTimingMismatches: [],
    sensorDrift: null, // Requires SMBG pairs
    autoModeMetrics: null, // Requires pump data
    insulinStackingEvents: [],
    recurringPatterns,
    weekdayVsWeekendDiff: weekdayVsWeekend
  };
}

function detectMissedBoluses(readings: GlucoseReading[]): MissedBolusEvent[] {
  const events: MissedBolusEvent[] = [];
  if (readings.length < 12) return events;
  
  const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const SLOPE_THRESHOLD = 2; // mg/dL per 5 min
  const RISE_MAGNITUDE_THRESHOLD = 40;
  
  for (let i = 3; i < sorted.length - 6; i++) {
    const prev = sorted[i - 3].value;
    const current = sorted[i].value;
    const slopeOver15min = (current - prev) / 3; // approx per 5 min
    
    if (slopeOver15min > SLOPE_THRESHOLD && current < 200) {
      // Look ahead 60 min for peak
      let peakValue = current;
      let peakIdx = i;
      for (let j = i; j < Math.min(i + 12, sorted.length); j++) {
        if (sorted[j].value > peakValue) {
          peakValue = sorted[j].value;
          peakIdx = j;
        }
      }
      
      const riseMagnitude = peakValue - prev;
      if (riseMagnitude > RISE_MAGNITUDE_THRESHOLD) {
        // Check if there's an insulin event nearby
        const hasNearbyBolus = sorted.slice(Math.max(0, i - 6), Math.min(sorted.length, i + 12))
          .some(r => r.insulinUnits && r.insulinUnits > 0);
        
        if (!hasNearbyBolus) {
          const hour = sorted[i].timestamp.getHours();
          const timeOfDay = hour >= 5 && hour < 11 ? 'morning' : 
                           hour >= 11 && hour < 14 ? 'lunch' :
                           hour >= 17 && hour < 21 ? 'dinner' : 'other';
          
          // Calculate time above target
          let durationAbove = 0;
          for (let j = peakIdx; j < Math.min(peakIdx + 24, sorted.length); j++) {
            if (sorted[j].value > 180) durationAbove++;
          }
          
          events.push({
            timestamp: sorted[i].timestamp.toISOString(),
            peakGlucose: Math.round(peakValue),
            riseMagnitude: Math.round(riseMagnitude),
            durationAboveTarget: durationAbove * 5, // Convert to minutes
            severity: riseMagnitude > 80 ? 'high' : riseMagnitude > 60 ? 'medium' : 'low',
            confidence: 0.7,
            timeOfDay
          });
          
          // Skip ahead to avoid duplicate detections
          i += 10;
        }
      }
    }
  }
  
  return events.slice(0, 10); // Return top 10
}

function detectRecurringPatterns(readings: GlucoseReading[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];
  if (readings.length < 288) return patterns; // Need at least 1 day
  
  // Group by day of week and hour
  const weekdayHourlyData: Record<string, number[]> = {};
  
  for (const r of readings) {
    const day = r.timestamp.getDay(); // 0-6
    const hour = r.timestamp.getHours();
    const key = `${day}-${hour}`;
    if (!weekdayHourlyData[key]) weekdayHourlyData[key] = [];
    weekdayHourlyData[key].push(r.value);
  }
  
  // Find time windows with consistent high or low patterns
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const values = weekdayHourlyData[key] || [];
      if (values.length < 2) continue;
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const highCount = values.filter(v => v > 180).length;
      const lowCount = values.filter(v => v < 70).length;
      
      const highFreq = highCount / values.length;
      const lowFreq = lowCount / values.length;
      
      if (highFreq > 0.5 && values.length >= 3) {
        patterns.push({
          dayOfWeek: days[day],
          timeWindow: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
          patternType: 'high',
          frequency: highFreq,
          avgMagnitude: Math.round(avg),
          confidence: Math.min(0.95, 0.5 + (values.length / 20))
        });
      } else if (lowFreq > 0.3 && values.length >= 3) {
        patterns.push({
          dayOfWeek: days[day],
          timeWindow: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
          patternType: 'low',
          frequency: lowFreq,
          avgMagnitude: Math.round(avg),
          confidence: Math.min(0.95, 0.5 + (values.length / 20))
        });
      }
    }
  }
  
  // Sort by frequency and return top patterns
  return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 8);
}

function analyzeWeekdayVsWeekend(readings: GlucoseReading[]): { weekdayTIR: number; weekendTIR: number; significantDifference: boolean } | null {
  const weekday: number[] = [];
  const weekend: number[] = [];
  
  for (const r of readings) {
    const day = r.timestamp.getDay();
    if (day === 0 || day === 6) {
      weekend.push(r.value);
    } else {
      weekday.push(r.value);
    }
  }
  
  if (weekday.length < 100 || weekend.length < 50) return null;
  
  const calcTIR = (values: number[]) => (values.filter(v => v >= 70 && v <= 180).length / values.length) * 100;
  
  const weekdayTIR = calcTIR(weekday);
  const weekendTIR = calcTIR(weekend);
  const diff = Math.abs(weekdayTIR - weekendTIR);
  
  return {
    weekdayTIR: Math.round(weekdayTIR * 10) / 10,
    weekendTIR: Math.round(weekendTIR * 10) / 10,
    significantDifference: diff > 10
  };
}

function generateExecutiveSummary(
  analysis: DetailedAnalysis, 
  patterns: PatternResult[], 
  confidenceScore: number, 
  dataQuality: DataQuality
): ExecutiveSummary {
  const topRisks: ExecutiveSummary['topRisks'] = [];
  
  // Prioritize hypoglycemia
  if (analysis.timeBelow54 > 1) {
    topRisks.push({
      title: 'Severe Hypoglycemia Risk',
      severity: 'critical',
      description: `${analysis.timeBelow54.toFixed(1)}% time below 54 mg/dL requires immediate attention`
    });
  } else if (analysis.timeBelow70 > 4) {
    topRisks.push({
      title: 'Hypoglycemia Frequency',
      severity: 'warning',
      description: `${analysis.timeBelow70.toFixed(1)}% time below 70 mg/dL (target: <4%)`
    });
  }
  
  // High glucose
  if (analysis.timeAbove250 > 10) {
    topRisks.push({
      title: 'Very High Glucose',
      severity: 'critical',
      description: `${analysis.timeAbove250.toFixed(1)}% time above 250 mg/dL`
    });
  } else if (analysis.timeAbove180 > 25) {
    topRisks.push({
      title: 'Hyperglycemia',
      severity: 'warning',
      description: `${(analysis.timeAbove180).toFixed(1)}% time above range (target: <25%)`
    });
  }
  
  // Variability
  if (analysis.cv > 36) {
    topRisks.push({
      title: 'High Variability',
      severity: 'warning',
      description: `CV of ${analysis.cv.toFixed(1)}% indicates unstable glucose (target: ≤36%)`
    });
  }
  
  // Add pattern-based risks
  const criticalPatterns = patterns.filter(p => p.severity === 'critical');
  for (const p of criticalPatterns.slice(0, 2)) {
    topRisks.push({
      title: p.title,
      severity: 'critical',
      description: p.description
    });
  }
  
  // Generate encouragement based on TIR
  let encouragement = '';
  if (analysis.timeInRange >= 70) {
    encouragement = 'Excellent glucose control! Keep up the great work.';
  } else if (analysis.timeInRange >= 60) {
    encouragement = 'Good progress! Small adjustments could help reach optimal targets.';
  } else if (analysis.timeInRange >= 50) {
    encouragement = 'You\'re making progress. Review the patterns below to identify improvement areas.';
  } else {
    encouragement = 'The patterns identified below can help guide improvements. Consider reviewing with your healthcare team.';
  }
  
  // Data quality note
  let dataQualityNote = '';
  if (confidenceScore >= 85) {
    dataQualityNote = 'High data quality - metrics are reliable for clinical interpretation.';
  } else if (confidenceScore >= 60) {
    dataQualityNote = 'Moderate data quality - review flagged issues for best accuracy.';
  } else {
    dataQualityNote = `Limited data quality (${dataQuality.percentCGMActive.toFixed(0)}% CGM active) - consider longer wear time.`;
  }
  
  return {
    overallTIR: Math.round(analysis.timeInRange * 10) / 10,
    tirTarget: 70,
    topRisks: topRisks.slice(0, 3),
    confidencePercent: confidenceScore,
    encouragement,
    keyMetrics: {
      avgGlucose: Math.round(analysis.avgGlucose),
      gmi: Math.round(analysis.gmi * 10) / 10,
      cv: Math.round(analysis.cv * 10) / 10,
      timeBelow70: Math.round(analysis.timeBelow70 * 10) / 10
    },
    dataQualityNote
  };
}

// ============= DATE VALIDATION =============
function validateReadings(readings: GlucoseReading[]): GlucoseReading[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const minDate = new Date('2010-01-01');
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const validated = readings.filter(r => {
    if (!r.timestamp || isNaN(r.timestamp.getTime())) return false;
    
    const year = r.timestamp.getFullYear();
    if (year < 2010 || year > currentYear + 1) {
      console.log(`Rejecting reading with impossible year: ${year}`);
      return false;
    }
    
    if (r.timestamp < minDate || r.timestamp > maxDate) return false;
    if (!r.value || isNaN(r.value)) return false;
    if (r.value < 20 || r.value > 500) return false;
    
    return true;
  });
  
  console.log(`Date validation: ${readings.length} input -> ${validated.length} valid`);
  return validated;
}

// ============= TEXT QUALITY ASSESSMENT =============
interface TextQualityResult {
  score: number;
  hasNumbers: boolean;
  hasKeywords: boolean;
  isReadable: boolean;
  alphanumericRatio: number;
}

function assessTextQuality(text: string): TextQualityResult {
  if (!text || text.length < 10) {
    return { score: 0, hasNumbers: false, hasKeywords: false, isReadable: false, alphanumericRatio: 0 };
  }
  
  // Calculate alphanumeric ratio
  const alphanumericChars = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const alphanumericRatio = alphanumericChars / text.length;
  
  // Check for CGM-related keywords
  const keywords = ['glucose', 'gmi', 'time in range', 'tir', 'average', 'mean', 'mg/dl', 'mmol', 
                    'sensor', 'cgm', 'dexcom', 'libre', 'bionic', 'ilet', 'clarity', 'agp',
                    'variability', 'cv', 'coefficient', 'target', 'low', 'high', 'report'];
  const lowerText = text.toLowerCase();
  const foundKeywords = keywords.filter(k => lowerText.includes(k));
  const hasKeywords = foundKeywords.length >= 2;
  
  // Check for numeric values (glucose readings are typically 40-400)
  const numbers = text.match(/\b\d{2,3}\b/g) || [];
  const glucoseRangeNumbers = numbers.filter(n => {
    const num = parseInt(n);
    return num >= 40 && num <= 400;
  });
  const hasNumbers = glucoseRangeNumbers.length >= 3;
  
  // Check for percentage patterns (TIR, GMI, etc.)
  const percentages = text.match(/\d{1,3}\.?\d*\s*%/g) || [];
  const hasPercentages = percentages.length >= 2;
  
  // Calculate overall score (0-100)
  let score = 0;
  score += alphanumericRatio >= 0.5 ? 30 : alphanumericRatio * 60;
  score += hasKeywords ? 30 : foundKeywords.length * 10;
  score += hasNumbers ? 20 : Math.min(glucoseRangeNumbers.length * 5, 20);
  score += hasPercentages ? 20 : Math.min(percentages.length * 10, 20);
  
  const isReadable = score >= 40;
  
  console.log(`Text quality: score=${score.toFixed(0)}, alphaRatio=${alphanumericRatio.toFixed(2)}, keywords=${foundKeywords.length}, numbers=${glucoseRangeNumbers.length}, percentages=${percentages.length}`);
  
  return { score, hasNumbers, hasKeywords, isReadable, alphanumericRatio };
}

// ============= NUMERIC PATTERN EXTRACTION (FALLBACK) =============
function extractMetricsViaPatterns(text: string): PDFSummaryMetrics | null {
  const metrics: PDFSummaryMetrics = {};
  const lowerText = text.toLowerCase();
  
  // GMI patterns: "GMI 7.2%" or "GMI: 7.2" or "Glucose Management Indicator 7.2%"
  const gmiPatterns = [
    /gmi[:\s]+(\d+\.?\d*)[\s%]*/i,
    /glucose\s*management\s*indicator[:\s]+(\d+\.?\d*)/i,
    /estimated\s*a1c[:\s]+(\d+\.?\d*)/i
  ];
  for (const pattern of gmiPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 4 && value <= 15) {
        metrics.gmi = value;
        console.log(`Pattern match: GMI = ${value}`);
        break;
      }
    }
  }
  
  // Average glucose patterns: "Average 154 mg/dL" or "Mean Sensor Glucose: 154"
  const avgPatterns = [
    /(?:average|mean|avg)\s*(?:sensor\s*)?(?:glucose)?[:\s]+(\d{2,3})\s*(?:mg\/dl)?/i,
    /(?:glucose|bg)\s*(?:average|mean)[:\s]+(\d{2,3})/i,
    /(\d{2,3})\s*mg\/dl\s*(?:average|mean)/i
  ];
  for (const pattern of avgPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 50 && value <= 400) {
        metrics.avgGlucose = value;
        console.log(`Pattern match: avgGlucose = ${value}`);
        break;
      }
    }
  }
  
  // Time in Range patterns: "TIR 68.5%" or "Time in Range: 68.5%" or "70-180: 68%"
  const tirPatterns = [
    /(?:time\s*in\s*(?:target\s*)?range|tir)[:\s]*[\d\-mg\/dlto\s]*?(\d{1,2}\.?\d*)[\s]*%/i,
    /70\s*-\s*180[:\s]*(\d{1,2}\.?\d*)[\s]*%/i,
    /(\d{1,2}\.?\d*)[\s]*%\s*(?:time\s*in\s*range|tir)/i
  ];
  for (const pattern of tirPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 100) {
        metrics.timeInRange = value;
        console.log(`Pattern match: timeInRange = ${value}`);
        break;
      }
    }
  }
  
  // Time above range patterns
  const abovePatterns = [
    /(?:time\s*)?(?:above|high|>)\s*(?:range|180)[:\s]*(\d{1,2}\.?\d*)[\s]*%/i,
    /(\d{1,2}\.?\d*)[\s]*%\s*(?:above|high)/i
  ];
  for (const pattern of abovePatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 100) {
        metrics.timeAbove180 = value;
        console.log(`Pattern match: timeAbove180 = ${value}`);
        break;
      }
    }
  }
  
  // Time below range patterns
  const belowPatterns = [
    /(?:time\s*)?(?:below|low|<)\s*(?:range|70)[:\s]*(\d{1,2}\.?\d*)[\s]*%/i,
    /(\d{1,2}\.?\d*)[\s]*%\s*(?:below|low)/i
  ];
  for (const pattern of belowPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 50) {
        metrics.timeBelow70 = value;
        console.log(`Pattern match: timeBelow70 = ${value}`);
        break;
      }
    }
  }
  
  // CV patterns: "CV 32.5%" or "Coefficient of Variation: 32.5"
  const cvPatterns = [
    /(?:cv|coefficient\s*of\s*variation|glucose\s*variability)[:\s]*(\d{1,2}\.?\d*)[\s]*%?/i,
    /(\d{1,2}\.?\d*)[\s]*%\s*cv/i
  ];
  for (const pattern of cvPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= 10 && value <= 100) {
        metrics.cv = value;
        console.log(`Pattern match: CV = ${value}`);
        break;
      }
    }
  }
  
  // Report period patterns: "14 days" or "90 day report" or "Last 30 days"
  const periodPatterns = [
    /(\d{1,3})\s*(?:day|days)\s*(?:report|summary|period)?/i,
    /(?:last|past)\s*(\d{1,3})\s*(?:day|days)/i,
    /(?:report\s*period|date\s*range)[:\s]*.*?(\d{1,3})\s*days?/i
  ];
  for (const pattern of periodPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 1 && value <= 365) {
        metrics.reportPeriodDays = value;
        console.log(`Pattern match: reportPeriodDays = ${value}`);
        break;
      }
    }
  }
  
  // Check if we found anything useful
  const hasMetrics = metrics.gmi || metrics.avgGlucose || metrics.timeInRange;
  return hasMetrics ? metrics : null;
}

// ============= PDF REPORT TYPE DETECTION =============
function detectPDFReportType(filename: string, textContent: string): 'summary_report' | 'raw_export' | 'unknown' {
  const lowerFilename = filename.toLowerCase();
  const lowerText = textContent.toLowerCase();
  
  if (lowerFilename.includes('bionic') || lowerText.includes('bionic pancreas') || lowerText.includes('ilet')) {
    console.log('Detected: Bionic/iLet summary report');
    return 'summary_report';
  }
  if (lowerFilename.includes('clarity') || lowerText.includes('dexcom clarity') || lowerText.includes('clarity report')) {
    console.log('Detected: Dexcom Clarity summary report');
    return 'summary_report';
  }
  if (lowerFilename.includes('libreview') || lowerText.includes('libreview') || lowerText.includes('freestyle libre')) {
    console.log('Detected: LibreView summary report');
    return 'summary_report';
  }
  if (lowerFilename.includes('agp') || lowerText.includes('ambulatory glucose profile')) {
    console.log('Detected: AGP summary report');
    return 'summary_report';
  }
  if (lowerText.includes('time in range') && (lowerText.includes('glucose management indicator') || lowerText.includes('gmi'))) {
    console.log('Detected: CGM summary report (by content)');
    return 'summary_report';
  }
  
  const timestampMatches = lowerText.match(/\d{1,2}:\d{2}:\d{2}/g);
  if (lowerText.includes('glucose value') && (lowerText.includes('timestamp') || (timestampMatches && timestampMatches.length > 10))) {
    console.log('Detected: Raw glucose data export');
    return 'raw_export';
  }
  
  return 'unknown';
}

// Validate and clamp analysis results
function validateAnalysisResults(analysis: DetailedAnalysis): DetailedAnalysis {
  const validated = { ...analysis };
  
  if (validated.daysOfData > 365 * 5) validated.daysOfData = Math.min(validated.daysOfData, 365);
  if (validated.cv > 150) validated.cv = Math.min(validated.cv, 100);
  if (validated.gvi > 10) validated.gvi = Math.min(validated.gvi, 5);
  
  validated.timeInRange = Math.max(0, Math.min(100, validated.timeInRange));
  validated.timeInTightRange = Math.max(0, Math.min(100, validated.timeInTightRange));
  validated.timeAbove180 = Math.max(0, Math.min(100, validated.timeAbove180));
  validated.timeAbove250 = Math.max(0, Math.min(100, validated.timeAbove250));
  validated.timeBelow70 = Math.max(0, Math.min(100, validated.timeBelow70));
  validated.timeBelow54 = Math.max(0, Math.min(100, validated.timeBelow54));
  
  return validated;
}

// ============= FILE FORMAT DETECTION =============
function detectFileFormat(filename: string, content: string): 'pdf' | 'csv' | 'json' | 'txt' | 'unknown' {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.endsWith('.pdf') || content.startsWith('%PDF') || /^[A-Za-z0-9+/=]+$/.test(content.replace(/\s/g, '').substring(0, 100))) {
    return 'pdf';
  }
  if (lowerFilename.endsWith('.json')) return 'json';
  if (lowerFilename.endsWith('.csv')) return 'csv';
  if (lowerFilename.endsWith('.txt')) return 'txt';
  
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
  if (trimmed.includes(',') && (trimmed.includes('glucose') || trimmed.includes('timestamp') || trimmed.includes('date'))) {
    return 'csv';
  }
  
  return 'unknown';
}

// ============= AI VISION PDF EXTRACTION (PRIMARY METHOD) =============
async function extractPDFWithVision(base64PDF: string, filename: string): Promise<{ metrics: PDFSummaryMetrics | null; text: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured for vision extraction");
    return { metrics: null, text: '' };
  }
  
  console.log('Using AI Vision to extract PDF content...');
  
  try {
    // Use Gemini with vision capability to read the PDF document
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a CGM (Continuous Glucose Monitor) report data extractor. Your task is to extract glucose metrics from diabetes management reports.

REPORT TYPES YOU'LL SEE:
- Bionic Pancreas/iLet Reports: Look for "Mean Sensor Glucose", "Time in Target Range (70-180)", "GMI", "CV"
- Dexcom Clarity Reports: Look for "Average Glucose", "Time in Range", "GMI", "Standard Deviation"
- LibreView/AGP Reports: Look for "Average Glucose", "Time in Target", "Glucose Variability"
- Generic CGM Reports: Look for percentages near range labels, glucose averages, GMI/A1C estimates

EXTRACTION RULES:
1. GMI (Glucose Management Indicator): A number between 5.0 and 10.0, similar to A1C percentage
2. Average Glucose: A number between 80-250 mg/dL typically
3. Time in Range (70-180 mg/dL): A percentage, typically 40-90%
4. Time Above Range (>180): A percentage
5. Time Below Range (<70): A percentage, usually 0-10%
6. CV (Coefficient of Variation): A percentage, typically 20-50%
7. Report Period: Number of days covered (7, 14, 30, 90, etc.)

OUTPUT FORMAT: Return ONLY a valid JSON object with these fields (use null for missing values):
{
  "gmi": number or null,
  "avgGlucose": number or null,
  "timeInRange": number or null,
  "timeAbove180": number or null,
  "timeBelow70": number or null,
  "cv": number or null,
  "reportPeriodDays": number or null,
  "extractedText": "key text excerpts from the report"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract CGM metrics from this ${filename} report. Return the JSON object with extracted values.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64PDF}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0 // Deterministic output
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vision API error: ${response.status} - ${errorText}`);
      return { metrics: null, text: '' };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('Vision API response:', content.substring(0, 500));
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const metrics: PDFSummaryMetrics = {};
        
        // Validate and extract each metric
        if (parsed.gmi && typeof parsed.gmi === 'number' && parsed.gmi >= 4 && parsed.gmi <= 15) {
          metrics.gmi = parsed.gmi;
        }
        if (parsed.avgGlucose && typeof parsed.avgGlucose === 'number' && parsed.avgGlucose >= 50 && parsed.avgGlucose <= 400) {
          metrics.avgGlucose = parsed.avgGlucose;
        }
        if (parsed.timeInRange !== null && typeof parsed.timeInRange === 'number' && parsed.timeInRange >= 0 && parsed.timeInRange <= 100) {
          metrics.timeInRange = parsed.timeInRange;
        }
        if (parsed.timeAbove180 !== null && typeof parsed.timeAbove180 === 'number' && parsed.timeAbove180 >= 0 && parsed.timeAbove180 <= 100) {
          metrics.timeAbove180 = parsed.timeAbove180;
        }
        if (parsed.timeBelow70 !== null && typeof parsed.timeBelow70 === 'number' && parsed.timeBelow70 >= 0 && parsed.timeBelow70 <= 100) {
          metrics.timeBelow70 = parsed.timeBelow70;
        }
        if (parsed.cv && typeof parsed.cv === 'number' && parsed.cv >= 0 && parsed.cv <= 100) {
          metrics.cv = parsed.cv;
        }
        if (parsed.reportPeriodDays && typeof parsed.reportPeriodDays === 'number' && parsed.reportPeriodDays >= 1 && parsed.reportPeriodDays <= 365) {
          metrics.reportPeriodDays = parsed.reportPeriodDays;
        }
        
        const extractedText = parsed.extractedText || '';
        console.log('Vision extracted metrics:', JSON.stringify(metrics));
        
        return { metrics, text: extractedText };
      } catch (parseError) {
        console.error('Failed to parse vision response JSON:', parseError);
      }
    }
    
    return { metrics: null, text: content };
  } catch (error) {
    console.error("Vision extraction error:", error);
    return { metrics: null, text: '' };
  }
}

// ============= LEGACY PDF TEXT EXTRACTION (FALLBACK) =============
function extractTextFromPDFBinary(pdfContent: string): string {
  let rawContent = pdfContent;
  
  // Try to decode base64
  if (/^[A-Za-z0-9+/=]+$/.test(pdfContent.replace(/\s/g, '').substring(0, 100))) {
    try {
      rawContent = atob(pdfContent.replace(/\s/g, ''));
    } catch {
      // Not base64
    }
  }
  
  const textPatterns: string[] = [];
  
  // Pattern 1: Text in parentheses (Tj operator)
  const parenMatches = rawContent.match(/\(([^)]{2,200})\)/g);
  if (parenMatches) {
    parenMatches.forEach(m => {
      const text = m.slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')');
      if (/[a-zA-Z0-9]/.test(text)) {
        textPatterns.push(text);
      }
    });
  }
  
  // Pattern 2: Text between BT/ET blocks
  const btMatches = rawContent.match(/BT[\s\S]{10,2000}?ET/g);
  if (btMatches) {
    btMatches.forEach(block => {
      const innerText = block.match(/\(([^)]+)\)/g);
      if (innerText) {
        innerText.forEach(t => textPatterns.push(t.slice(1, -1)));
      }
    });
  }
  
  // Pattern 3: Readable ASCII sequences
  const asciiMatches = rawContent.match(/[A-Za-z][A-Za-z0-9\s.,:%\-\/]{10,100}/g);
  if (asciiMatches) {
    asciiMatches.forEach(m => textPatterns.push(m));
  }
  
  const extractedText = textPatterns
    .join(' ')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`Legacy extraction: ${extractedText.length} chars`);
  return extractedText;
}

// ============= AI TEXT-BASED SUMMARY EXTRACTION (FALLBACK) =============
async function extractSummaryMetricsFromText(pdfText: string, filename: string): Promise<PDFSummaryMetrics | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY || pdfText.length < 30) {
    console.log('Cannot extract summary: No API key or insufficient text');
    return null;
  }
  
  // First, try pattern-based extraction (fast, no API call)
  const patternMetrics = extractMetricsViaPatterns(pdfText);
  if (patternMetrics && (patternMetrics.avgGlucose || patternMetrics.timeInRange || patternMetrics.gmi)) {
    console.log('Successfully extracted metrics via patterns:', JSON.stringify(patternMetrics));
    return patternMetrics;
  }
  
  console.log(`Extracting summary metrics from text (${pdfText.length} chars)...`);
  
  try {
    // Detect report type for better prompts
    const lowerFilename = filename.toLowerCase();
    const lowerText = pdfText.toLowerCase();
    let reportType = 'generic';
    
    if (lowerFilename.includes('bionic') || lowerText.includes('bionic') || lowerText.includes('ilet')) {
      reportType = 'bionic';
    } else if (lowerFilename.includes('clarity') || lowerText.includes('dexcom') || lowerText.includes('clarity')) {
      reportType = 'dexcom';
    } else if (lowerFilename.includes('libre') || lowerText.includes('libre') || lowerText.includes('abbott')) {
      reportType = 'libre';
    }
    
    // Build report-specific hints
    let reportHints = '';
    if (reportType === 'bionic') {
      reportHints = `
BIONIC/ILET REPORT HINTS:
- "Mean Sensor Glucose" or "Mean CGM" = avgGlucose
- "Time in Target Range" with "70-180" = timeInRange percentage
- "GMI" or "Glucose Management Indicator" = gmi percentage
- "CV" or "Coefficient of Variation" = cv percentage
- Look for tables with these values side by side`;
    } else if (reportType === 'dexcom') {
      reportHints = `
DEXCOM CLARITY HINTS:
- "Average Glucose" in mg/dL = avgGlucose
- "Time in Range (70-180 mg/dL)" = timeInRange percentage
- "GMI" = gmi percentage
- Look for the main summary panel with large numbers`;
    } else if (reportType === 'libre') {
      reportHints = `
LIBRE/AGP HINTS:
- "Average Glucose" = avgGlucose
- "Time in Target Range" = timeInRange percentage
- "Glucose Variability" or "CV%" = cv percentage
- Look for the AGP profile section`;
    }
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a CGM report data extractor. Extract diabetes metrics from the text.
${reportHints}

EXTRACTION RULES:
1. Extract ONLY values that are clearly present in the text
2. For percentages, extract just the number (e.g., "68.5" not "68.5%")
3. GMI is typically 5.0-10.0 (like A1C)
4. Average glucose is typically 80-250 mg/dL
5. Time in Range is 0-100%
6. CV is typically 20-60%

Return ONLY valid JSON: {"gmi": number|null, "avgGlucose": number|null, "timeInRange": number|null, "timeAbove180": number|null, "timeBelow70": number|null, "cv": number|null, "reportPeriodDays": number|null}`
          },
          {
            role: "user",
            content: `Extract metrics from this ${reportType} CGM report:\n\n${pdfText.slice(0, 8000)}`
          }
        ],
        max_tokens: 500,
        temperature: 0 // Deterministic
      }),
    });
    
    if (!response.ok) {
      console.error(`AI extraction failed: ${response.status}`);
      return patternMetrics; // Return pattern results if API fails
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const metrics = JSON.parse(jsonMatch[0]);
      
      // Validate extracted values
      if (metrics.gmi && (metrics.gmi < 4 || metrics.gmi > 15)) metrics.gmi = null;
      if (metrics.avgGlucose && (metrics.avgGlucose < 50 || metrics.avgGlucose > 400)) metrics.avgGlucose = null;
      if (metrics.timeInRange !== undefined && metrics.timeInRange !== null) {
        metrics.timeInRange = Math.max(0, Math.min(100, metrics.timeInRange));
      }
      if (metrics.cv !== undefined && metrics.cv !== null) {
        metrics.cv = Math.max(0, Math.min(100, metrics.cv));
      }
      
      console.log('AI extracted metrics:', JSON.stringify(metrics));
      return metrics;
    }
    
    return patternMetrics;
  } catch (error) {
    console.error("Error extracting summary metrics:", error);
    return patternMetrics;
  }
}

// ============= CSV PARSING =============
function detectCSVFormat(content: string): 'dexcom' | 'libre' | 'generic' {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('dexcom') || lowerContent.includes('clarity') || lowerContent.includes('egv')) {
    return 'dexcom';
  }
  if (lowerContent.includes('libre') || lowerContent.includes('abbott') || lowerContent.includes('libreview')) {
    return 'libre';
  }
  return 'generic';
}

function parseCSV(content: string): GlucoseReading[] {
  const lines = content.split('\n').filter(line => line.trim());
  const readings: GlucoseReading[] = [];
  const format = detectCSVFormat(content);
  
  console.log(`Detected CSV format: ${format}`);
  
  let headerIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('timestamp') || line.includes('date') || line.includes('time') || 
        line.includes('glucose') || line.includes('egv') || line.includes('historic')) {
      headerIndex = i;
      break;
    }
  }
  
  const headers = lines[headerIndex]?.toLowerCase().split(',').map(h => h.trim().replace(/"/g, '')) || [];
  
  let timestampCol = -1;
  let dateCol = -1;
  let timeCol = -1;
  let valueCol = -1;
  
  headers.forEach((h, idx) => {
    if (h.includes('timestamp') || h === 'device timestamp' || h === 'reader timestamp') {
      timestampCol = idx;
    }
    if (h === 'date' || (h.includes('date') && !h.includes('timestamp'))) {
      dateCol = idx;
    }
    if (h === 'time' && !h.includes('timestamp')) {
      timeCol = idx;
    }
    if (h.includes('glucose') || h.includes('egv') || h.includes('bg') || h.includes('historic')) {
      if (h.includes('mg') || valueCol === -1) {
        valueCol = idx;
      }
    }
  });
  
  if (timestampCol === -1 && dateCol === -1) timestampCol = 0;
  if (valueCol === -1) valueCol = headers.length > 1 ? 1 : 0;
  
  console.log(`CSV columns - timestamp: ${timestampCol}, date: ${dateCol}, time: ${timeCol}, value: ${valueCol}`);
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim().replace(/"/g, ''));
    
    if (parts.length <= Math.max(timestampCol, dateCol, valueCol)) continue;
    
    let timestamp: Date;
    
    if (timestampCol !== -1 && parts[timestampCol]) {
      timestamp = new Date(parts[timestampCol]);
    } else if (dateCol !== -1 && timeCol !== -1 && parts[dateCol] && parts[timeCol]) {
      timestamp = new Date(`${parts[dateCol]} ${parts[timeCol]}`);
    } else if (dateCol !== -1 && parts[dateCol]) {
      timestamp = new Date(parts[dateCol]);
    } else {
      continue;
    }
    
    const valueStr = parts[valueCol]?.replace(/[^\d.]/g, '') || '';
    const value = parseFloat(valueStr);
    
    if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
      readings.push({ timestamp, value });
    }
  }
  
  console.log(`Parsed ${readings.length} glucose readings from CSV`);
  return readings;
}

function parseJSON(content: string): GlucoseReading[] {
  try {
    const data = JSON.parse(content);
    const readings: GlucoseReading[] = [];
    
    if (Array.isArray(data)) {
      for (const item of data) {
        const timestamp = new Date(item.timestamp || item.time || item.date);
        const value = parseFloat(item.value || item.glucose || item.bg);
        
        if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
          readings.push({ timestamp, value });
        }
      }
    }
    
    return readings;
  } catch {
    return [];
  }
}

// ============= STATISTICAL CALCULATIONS =============
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function calculateHourlyStatistics(readings: GlucoseReading[]): HourlyStats[] {
  const hourlyData: Map<number, number[]> = new Map();
  
  for (let h = 0; h < 24; h++) {
    hourlyData.set(h, []);
  }
  
  readings.forEach(r => {
    const hour = r.timestamp.getHours();
    hourlyData.get(hour)?.push(r.value);
  });
  
  const stats: HourlyStats[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const values = hourlyData.get(hour) || [];
    if (values.length === 0) {
      stats.push({ hour, avg: 0, min: 0, max: 0, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, count: 0 });
      continue;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    stats.push({
      hour,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p10: percentile(values, 10),
      p25: percentile(values, 25),
      p50: percentile(values, 50),
      p75: percentile(values, 75),
      p90: percentile(values, 90),
      count: values.length
    });
  }
  
  return stats;
}

function generateAGPData(hourlyStats: HourlyStats[]): AGPDataPoint[] {
  return hourlyStats.map(stat => ({
    time: `${stat.hour.toString().padStart(2, '0')}:00`,
    p5: percentile(Array(stat.count).fill(stat.avg), 5) * 0.85,
    p25: stat.p25,
    p50: stat.p50,
    p75: stat.p75,
    p95: stat.p90 * 1.1
  }));
}

function calculateDailyStatistics(readings: GlucoseReading[]): DailyStats[] {
  const dailyData: Map<string, GlucoseReading[]> = new Map();
  
  readings.forEach(r => {
    const dateStr = r.timestamp.toISOString().split('T')[0];
    if (!dailyData.has(dateStr)) {
      dailyData.set(dateStr, []);
    }
    dailyData.get(dateStr)?.push(r);
  });
  
  const stats: DailyStats[] = [];
  const sortedDates = [...dailyData.keys()].sort();
  
  for (const date of sortedDates) {
    const dayReadings = dailyData.get(date) || [];
    const values = dayReadings.map(r => r.value);
    
    if (values.length === 0) continue;
    
    const inRange = values.filter(v => v >= 70 && v <= 180).length;
    const lows = values.filter(v => v < 70).length;
    const highs = values.filter(v => v > 180).length;
    
    stats.push({
      date,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      tir: (inRange / values.length) * 100,
      readings: values.length,
      lowEvents: lows,
      highEvents: highs
    });
  }
  
  return stats;
}

function calculateMAGE(readings: GlucoseReading[], stdDev: number): number {
  if (readings.length < 10) return 0;
  
  const values = readings.map(r => r.value);
  const excursions: number[] = [];
  
  let peak = values[0];
  let nadir = values[0];
  let direction: 'up' | 'down' = 'up';
  
  for (let i = 1; i < values.length; i++) {
    if (direction === 'up') {
      if (values[i] > peak) {
        peak = values[i];
      } else if (peak - values[i] > stdDev) {
        excursions.push(peak - nadir);
        nadir = values[i];
        direction = 'down';
      }
    } else {
      if (values[i] < nadir) {
        nadir = values[i];
      } else if (values[i] - nadir > stdDev) {
        excursions.push(peak - nadir);
        peak = values[i];
        direction = 'up';
      }
    }
  }
  
  if (excursions.length === 0) return 0;
  return excursions.reduce((a, b) => a + b, 0) / excursions.length;
}

// ============= PATTERN DETECTION =============
function detectPatterns(readings: GlucoseReading[], hourlyStats: HourlyStats[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  
  // Dawn phenomenon (4-8 AM)
  const dawnHours = hourlyStats.filter(h => h.hour >= 4 && h.hour <= 8);
  if (dawnHours.length >= 3) {
    let risingTrend = true;
    for (let i = 1; i < dawnHours.length; i++) {
      if (dawnHours[i].avg < dawnHours[i-1].avg) {
        risingTrend = false;
        break;
      }
    }
    if (risingTrend && dawnHours[dawnHours.length - 1].avg - dawnHours[0].avg > 20) {
      patterns.push({
        type: 'dawn_phenomenon',
        severity: 'warning',
        title: 'Dawn Phenomenon Detected',
        description: `Your glucose rises an average of ${Math.round(dawnHours[dawnHours.length - 1].avg - dawnHours[0].avg)} mg/dL between 4-8 AM.`,
        timeOfDay: '4:00 AM - 8:00 AM',
        avgImpact: dawnHours[dawnHours.length - 1].avg - dawnHours[0].avg
      });
    }
  }
  
  // Post-meal spikes
  const mealHours = [
    { start: 7, end: 9, name: 'breakfast' },
    { start: 12, end: 14, name: 'lunch' },
    { start: 18, end: 20, name: 'dinner' }
  ];
  
  mealHours.forEach(meal => {
    const preMeal = hourlyStats.find(h => h.hour === meal.start - 1)?.avg || 0;
    const postMeal = hourlyStats.filter(h => h.hour >= meal.start && h.hour <= meal.end);
    const maxPostMeal = Math.max(...postMeal.map(h => h.avg));
    
    if (preMeal > 0 && maxPostMeal - preMeal > 50) {
      patterns.push({
        type: 'post_meal_spike',
        severity: maxPostMeal > 200 ? 'warning' : 'info',
        title: `Post-${meal.name.charAt(0).toUpperCase() + meal.name.slice(1)} Spike`,
        description: `Average ${Math.round(maxPostMeal - preMeal)} mg/dL rise after ${meal.name}.`,
        timeOfDay: `${meal.start}:00 - ${meal.end}:00`,
        avgImpact: maxPostMeal - preMeal
      });
    }
  });
  
  // Overnight stability (11 PM - 4 AM)
  const overnightHours = hourlyStats.filter(h => h.hour >= 23 || h.hour <= 4);
  if (overnightHours.length > 0) {
    const overnightValues = overnightHours.map(h => h.avg).filter(v => v > 0);
    if (overnightValues.length > 0) {
      const overnightMean = overnightValues.reduce((a, b) => a + b, 0) / overnightValues.length;
      const overnightStdDev = Math.sqrt(
        overnightValues.reduce((sum, v) => sum + Math.pow(v - overnightMean, 2), 0) / overnightValues.length
      );
      const overnightCV = overnightMean > 0 ? (overnightStdDev / overnightMean) * 100 : 0;
      
      if (overnightCV > 0 && overnightCV < 20) {
        patterns.push({
          type: 'overnight_stability',
          severity: 'info',
          title: 'Excellent Overnight Stability',
          description: `Your overnight glucose variability is ${Math.round(overnightCV)}% CV.`,
          timeOfDay: '11:00 PM - 4:00 AM'
        });
      } else if (overnightCV > 36) {
        patterns.push({
          type: 'overnight_instability',
          severity: 'warning',
          title: 'Overnight Variability',
          description: `Your overnight glucose variability is ${Math.round(overnightCV)}% CV.`,
          timeOfDay: '11:00 PM - 4:00 AM'
        });
      }
    }
  }
  
  // Low clustering
  const lowsByHour = hourlyStats.filter(h => {
    const values = readings.filter(r => r.timestamp.getHours() === h.hour).map(r => r.value);
    return values.filter(v => v < 70).length > values.length * 0.1;
  });
  
  if (lowsByHour.length > 0) {
    const lowTimes = lowsByHour.map(h => `${h.hour}:00`).join(', ');
    patterns.push({
      type: 'low_clustering',
      severity: 'critical',
      title: 'Recurring Low Pattern',
      description: `Lows tend to occur around: ${lowTimes}.`,
      frequency: lowsByHour.length
    });
  }
  
  // High clustering
  const highsByHour = hourlyStats.filter(h => {
    const values = readings.filter(r => r.timestamp.getHours() === h.hour).map(r => r.value);
    return values.filter(v => v > 250).length > values.length * 0.15;
  });
  
  if (highsByHour.length > 0) {
    const highTimes = highsByHour.map(h => `${h.hour}:00`).join(', ');
    patterns.push({
      type: 'high_clustering',
      severity: 'warning',
      title: 'Recurring High Pattern',
      description: `Highs tend to occur around: ${highTimes}.`,
      frequency: highsByHour.length
    });
  }
  
  return patterns;
}

function countGlucoseEvents(readings: GlucoseReading[]): { lowEvents: number; severeLowEvents: number; highEvents: number; severeHighEvents: number } {
  let lowEvents = 0, severeLowEvents = 0, highEvents = 0, severeHighEvents = 0;
  let inLow = false, inSevereLow = false, inHigh = false, inSevereHigh = false;
  
  readings.forEach(r => {
    if (r.value < 70) { if (!inLow) { lowEvents++; inLow = true; } } else { inLow = false; }
    if (r.value < 54) { if (!inSevereLow) { severeLowEvents++; inSevereLow = true; } } else { inSevereLow = false; }
    if (r.value > 180) { if (!inHigh) { highEvents++; inHigh = true; } } else { inHigh = false; }
    if (r.value > 250) { if (!inSevereHigh) { severeHighEvents++; inSevereHigh = true; } } else { inSevereHigh = false; }
  });
  
  return { lowEvents, severeLowEvents, highEvents, severeHighEvents };
}

// ============= AI RECOMMENDATIONS =============
async function generateAIRecommendations(
  detailedAnalysis: DetailedAnalysis,
  patterns: PatternResult[]
): Promise<{ recommendations: string[]; aiInsights: any }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const recommendations: string[] = [];
  
  patterns.forEach(p => {
    if (p.type === 'dawn_phenomenon') {
      recommendations.push('Consider increasing basal rate by 0.1-0.2 u/hr from 3-6 AM');
    }
    if (p.type === 'post_meal_spike') {
      recommendations.push('Pre-bolus meals by 10-15 minutes');
    }
    if (p.type === 'low_clustering') {
      recommendations.push('Review basal rates during problem times');
    }
    if (p.type === 'overnight_instability') {
      recommendations.push('Review overnight basal rates');
    }
    if (p.type === 'high_clustering') {
      recommendations.push('Consider adjusting insulin-to-carb ratios');
    }
  });
  
  if (detailedAnalysis.timeBelow70 > 4) {
    recommendations.push('Prioritize reducing hypoglycemia - discuss with your provider');
  }
  if (detailedAnalysis.cv > 36) {
    recommendations.push('Focus on reducing variability for better control');
  }
  if (detailedAnalysis.timeInRange < 70) {
    recommendations.push('Small adjustments to timing or doses could improve TIR');
  }
  
  let aiInsights: any = {};
  
  if (LOVABLE_API_KEY) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a diabetes educator AI. Provide brief, actionable insights based on CGM data.
Keep responses concise and practical. Focus on the 2-3 most important findings.`
            },
            {
              role: "user",
              content: `CGM Analysis:
- Readings: ${detailedAnalysis.readingsCount} over ${detailedAnalysis.daysOfData} days
- Avg Glucose: ${detailedAnalysis.avgGlucose?.toFixed(0) || 'N/A'} mg/dL
- GMI: ${detailedAnalysis.gmi?.toFixed(1) || 'N/A'}%
- TIR: ${detailedAnalysis.timeInRange?.toFixed(1) || 'N/A'}%
- CV: ${detailedAnalysis.cv?.toFixed(1) || 'N/A'}%
- Time Low: ${detailedAnalysis.timeBelow70?.toFixed(1) || 'N/A'}%
- Time High: ${detailedAnalysis.timeAbove180?.toFixed(1) || 'N/A'}%
- Patterns: ${patterns.map(p => p.type).join(', ') || 'None detected'}

Provide 3-4 key findings and actionable recommendations.`
            }
          ],
          max_tokens: 600,
          temperature: 0.3
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        aiInsights = {
          summary: content,
          keyFindings: patterns.map(p => p.description),
          priorityActions: recommendations.slice(0, 3)
        };
      }
    } catch (error) {
      console.error("AI insights generation failed:", error);
    }
  }
  
  return { recommendations, aiInsights };
}

// ============= COMPREHENSIVE ANALYSIS =============
function analyzeGlucoseDataComprehensive(readings: GlucoseReading[]): {
  insights: string[];
  detailedAnalysis: DetailedAnalysis;
  hourlyData: HourlyStats[];
  dailyData: DailyStats[];
  agpData: AGPDataPoint[];
  patterns: PatternResult[];
} {
  if (readings.length === 0) {
    return {
      insights: ['No valid glucose readings found in the file'],
      detailedAnalysis: {} as DetailedAnalysis,
      hourlyData: [],
      dailyData: [],
      agpData: [],
      patterns: []
    };
  }
  
  readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const values = readings.map(r => r.value);
  const insights: string[] = [];
  
  const avgGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;
  const medianGlucose = percentile(values, 50);
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avgGlucose, 2), 0) / values.length);
  const cv = (stdDev / avgGlucose) * 100;
  
  const inRange = values.filter(v => v >= 70 && v <= 180).length;
  const inTightRange = values.filter(v => v >= 70 && v <= 140).length;
  const above180 = values.filter(v => v > 180).length;
  const above250 = values.filter(v => v > 250).length;
  const below70 = values.filter(v => v < 70).length;
  const below54 = values.filter(v => v < 54).length;
  
  const timeInRange = (inRange / values.length) * 100;
  const timeInTightRange = (inTightRange / values.length) * 100;
  const timeAbove180 = (above180 / values.length) * 100;
  const timeAbove250 = (above250 / values.length) * 100;
  const timeBelow70 = (below70 / values.length) * 100;
  const timeBelow54 = (below54 / values.length) * 100;
  
  const gmi = 3.31 + (0.02392 * avgGlucose);
  
  const idealDelta = 5;
  let actualDeltas = 0;
  for (let i = 1; i < readings.length; i++) {
    actualDeltas += Math.abs(readings[i].value - readings[i-1].value);
  }
  const gvi = actualDeltas / ((readings.length - 1) * idealDelta);
  
  const mage = calculateMAGE(readings, stdDev);
  const events = countGlucoseEvents(readings);
  
  const hourlyData = calculateHourlyStatistics(readings);
  const dailyData = calculateDailyStatistics(readings);
  const agpData = generateAGPData(hourlyData);
  const patterns = detectPatterns(readings, hourlyData);
  
  const dataStart = readings[0].timestamp.toISOString().split('T')[0];
  const dataEnd = readings[readings.length - 1].timestamp.toISOString().split('T')[0];
  const daysOfData = Math.ceil((readings[readings.length - 1].timestamp.getTime() - readings[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  insights.push(`📊 Analyzed ${readings.length.toLocaleString()} readings over ${daysOfData} days (${dataStart} to ${dataEnd})`);
  insights.push(`📈 Average glucose: ${avgGlucose.toFixed(0)} mg/dL | Median: ${medianGlucose.toFixed(0)} mg/dL`);
  insights.push(`🎯 Time in Range (70-180): ${timeInRange.toFixed(1)}% ${timeInRange >= 70 ? '✓ Target met!' : '(Target: ≥70%)'}`);
  insights.push(`🔬 GMI (Glucose Management Indicator): ${gmi.toFixed(1)}%`);
  
  if (cv < 36) {
    insights.push(`📉 Glucose Variability: ${cv.toFixed(1)}% CV - Excellent stability!`);
  } else {
    insights.push(`📉 Glucose Variability: ${cv.toFixed(1)}% CV - Room for improvement (Target: <36%)`);
  }
  
  if (timeBelow70 > 4) {
    insights.push(`⚠️ Time Below Range: ${timeBelow70.toFixed(1)}% - Higher than recommended (Target: <4%)`);
  } else if (timeBelow70 > 0) {
    insights.push(`⚡ Time Below Range: ${timeBelow70.toFixed(1)}% - Within target`);
  }
  
  if (timeAbove250 > 5) {
    insights.push(`🔴 Time Very High (>250): ${timeAbove250.toFixed(1)}% - Needs attention (Target: <5%)`);
  }
  
  if (mage > 0) {
    insights.push(`🌊 MAGE (Glucose Swings): ${mage.toFixed(0)} mg/dL ${mage < 60 ? '- Good' : '- Review meal timing'}`);
  }
  
  patterns.forEach(p => {
    if (p.severity === 'critical' || p.severity === 'warning') {
      insights.push(`⚡ ${p.title}: ${p.description.split('.')[0]}`);
    }
  });
  
  let detailedAnalysis: DetailedAnalysis = {
    readingsCount: readings.length,
    avgGlucose,
    medianGlucose,
    stdDev,
    cv,
    timeInRange,
    timeInTightRange,
    timeAbove180,
    timeAbove250,
    timeBelow70,
    timeBelow54,
    gmi,
    gvi,
    mage,
    lowEvents: events.lowEvents,
    severeLowEvents: events.severeLowEvents,
    highEvents: events.highEvents,
    severeHighEvents: events.severeHighEvents,
    dataStart,
    dataEnd,
    daysOfData
  };
  
  detailedAnalysis = validateAnalysisResults(detailedAnalysis);
  
  return { insights, detailedAnalysis, hourlyData, dailyData, agpData, patterns };
}

// ============= MAIN SERVER =============
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const requestBody = await req.json();
    const validation = analyzeRequestSchema.safeParse(requestBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filename, fileContent, uploadId } = validation.data;
    console.log(`Analyzing: ${filename} (${fileContent.length} chars)`);

    const fileFormat = detectFileFormat(filename, fileContent);
    console.log(`File format: ${fileFormat}`);
    
    let readings: GlucoseReading[] = [];
    
    // ============= PDF PROCESSING =============
    if (fileFormat === 'pdf') {
      console.log('Processing PDF...');
      
      // STEP 1: Try AI Vision extraction (primary method)
      const visionResult = await extractPDFWithVision(fileContent, filename);
      
      if (visionResult.metrics && (visionResult.metrics.avgGlucose || visionResult.metrics.timeInRange || visionResult.metrics.gmi)) {
        console.log('Vision extraction successful!');
        const metrics = visionResult.metrics;
        
        // Build synthetic analysis from vision-extracted metrics
        const syntheticAnalysis: DetailedAnalysis = {
          readingsCount: 0,
          avgGlucose: metrics.avgGlucose || 0,
          medianGlucose: metrics.avgGlucose || 0,
          stdDev: metrics.cv && metrics.avgGlucose ? (metrics.cv / 100) * metrics.avgGlucose : 0,
          cv: metrics.cv || 0,
          timeInRange: metrics.timeInRange || 0,
          timeInTightRange: metrics.timeInRange ? metrics.timeInRange * 0.6 : 0,
          timeAbove180: metrics.timeAbove180 || 0,
          timeAbove250: metrics.timeAbove180 ? metrics.timeAbove180 * 0.3 : 0,
          timeBelow70: metrics.timeBelow70 || 0,
          timeBelow54: metrics.timeBelow70 ? metrics.timeBelow70 * 0.3 : 0,
          gmi: metrics.gmi || (metrics.avgGlucose ? 3.31 + 0.02392 * metrics.avgGlucose : 0),
          gvi: 0,
          mage: 0,
          lowEvents: 0,
          severeLowEvents: 0,
          highEvents: 0,
          severeHighEvents: 0,
          dataStart: new Date(Date.now() - (metrics.reportPeriodDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dataEnd: new Date().toISOString().split('T')[0],
          daysOfData: metrics.reportPeriodDays || 14,
          fromSummaryReport: true
        };
        
        const reportDays = metrics.reportPeriodDays || 14;
        const insights: string[] = [];
        
        insights.push(`📊 Summary Report Analysis (${reportDays} days)`);
        if (metrics.avgGlucose) insights.push(`📈 Average Glucose: ${Math.round(metrics.avgGlucose)} mg/dL`);
        if (metrics.gmi) {
          const gmiStatus = metrics.gmi < 7 ? '✓ Well controlled' : metrics.gmi < 8 ? '(Target: <7%)' : '⚠️ Needs attention';
          insights.push(`🎯 GMI (Estimated A1C): ${metrics.gmi.toFixed(1)}% ${gmiStatus}`);
        }
        if (metrics.timeInRange) {
          const tirStatus = metrics.timeInRange >= 70 ? '✓ Target met!' : '(Target: ≥70%)';
          insights.push(`⏱️ Time in Range (70-180): ${metrics.timeInRange.toFixed(1)}% ${tirStatus}`);
        }
        if (metrics.timeAbove180) insights.push(`🔺 Time Above Range: ${metrics.timeAbove180.toFixed(1)}%`);
        if (metrics.timeBelow70) {
          const lowStatus = metrics.timeBelow70 < 4 ? '✓ Within target' : '⚠️ Review needed';
          insights.push(`🔻 Time Below Range: ${metrics.timeBelow70.toFixed(1)}% ${lowStatus}`);
        }
        if (metrics.cv) {
          const cvStatus = metrics.cv < 36 ? '✓ Stable' : '(Target: <36%)';
          insights.push(`🌊 Glucose Variability (CV): ${metrics.cv.toFixed(1)}% ${cvStatus}`);
        }
        insights.push(`ℹ️ For detailed patterns & AGP charts, export raw CGM data as CSV`);
        
        const recommendations = [
          'This analysis is based on summary metrics from your PDF report.',
          'For detailed pattern detection, export your raw CGM data as CSV.',
          '📋 How to export: Dexcom Clarity → Export → CSV | LibreView → Download Data → CSV',
          '💡 Always discuss changes with your healthcare provider.'
        ];
        
        await supabaseClient
          .from('uploads')
          .update({
            status: 'completed',
            insights,
            readings_count: 0,
            analysis_results: { insights, readingsCount: 0, fromSummary: true },
            detailed_analysis: syntheticAnalysis,
            hourly_data: [],
            daily_data: [],
            agp_data: [],
            patterns: [],
            recommendations,
            ai_insights: { summary: 'Metrics extracted from PDF via AI Vision.', fromSummary: true }
          })
          .eq('id', uploadId);
        
        return new Response(
          JSON.stringify({
            success: true,
            insights,
            readingsCount: 0,
            detailedAnalysis: syntheticAnalysis,
            hourlyData: [],
            dailyData: [],
            agpData: [],
            patterns: [],
            recommendations,
            aiInsights: { summary: 'Summary metrics extracted from PDF report.', fromSummary: true },
            fromSummary: true,
            message: 'Extracted metrics via AI Vision. For detailed analysis, export as CSV.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      console.log('Vision extraction failed, trying fallback methods...');
      
      // STEP 2: Try legacy text extraction + AI/pattern matching (fallback)
      const extractedText = extractTextFromPDFBinary(fileContent);
      const textQuality = assessTextQuality(extractedText);
      console.log(`Text quality: ${JSON.stringify(textQuality)}`);
      
      if (textQuality.isReadable) {
        const reportType = detectPDFReportType(filename, extractedText);
        console.log(`Report type: ${reportType}`);
        
        // Try summary extraction from text
        const summaryMetrics = await extractSummaryMetricsFromText(extractedText, filename);
        
        if (summaryMetrics && (summaryMetrics.avgGlucose || summaryMetrics.timeInRange || summaryMetrics.gmi)) {
          console.log('Fallback summary extraction successful');
          
          const syntheticAnalysis: DetailedAnalysis = {
            readingsCount: 0,
            avgGlucose: summaryMetrics.avgGlucose || 0,
            medianGlucose: summaryMetrics.avgGlucose || 0,
            stdDev: summaryMetrics.cv && summaryMetrics.avgGlucose ? (summaryMetrics.cv / 100) * summaryMetrics.avgGlucose : 0,
            cv: summaryMetrics.cv || 0,
            timeInRange: summaryMetrics.timeInRange || 0,
            timeInTightRange: 0,
            timeAbove180: summaryMetrics.timeAbove180 || 0,
            timeAbove250: 0,
            timeBelow70: summaryMetrics.timeBelow70 || 0,
            timeBelow54: 0,
            gmi: summaryMetrics.gmi || 0,
            gvi: 0,
            mage: 0,
            lowEvents: 0,
            severeLowEvents: 0,
            highEvents: 0,
            severeHighEvents: 0,
            dataStart: new Date(Date.now() - (summaryMetrics.reportPeriodDays || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dataEnd: new Date().toISOString().split('T')[0],
            daysOfData: summaryMetrics.reportPeriodDays || 14,
            fromSummaryReport: true
          };
          
          const insights = [
            `📊 Report Summary (${summaryMetrics.reportPeriodDays || 14} days)`,
            summaryMetrics.avgGlucose ? `📈 Average Glucose: ${Math.round(summaryMetrics.avgGlucose)} mg/dL` : null,
            summaryMetrics.gmi ? `🎯 GMI: ${summaryMetrics.gmi.toFixed(1)}%` : null,
            summaryMetrics.timeInRange ? `⏱️ Time in Range: ${summaryMetrics.timeInRange.toFixed(1)}%` : null,
            summaryMetrics.cv ? `🌊 CV: ${summaryMetrics.cv.toFixed(1)}%` : null,
            `ℹ️ For detailed patterns, export as CSV from your CGM app`
          ].filter(Boolean) as string[];
          
          await supabaseClient
            .from('uploads')
            .update({
              status: 'completed',
              insights,
              readings_count: 0,
              detailed_analysis: syntheticAnalysis,
              hourly_data: [],
              daily_data: [],
              agp_data: [],
              patterns: [],
              recommendations: ['Export raw CGM data as CSV for detailed pattern analysis.'],
              ai_insights: { summary: 'Summary extracted from PDF.', fromSummary: true }
            })
            .eq('id', uploadId);
          
          return new Response(
            JSON.stringify({
              success: true,
              insights,
              readingsCount: 0,
              detailedAnalysis: syntheticAnalysis,
              hourlyData: [],
              dailyData: [],
              agpData: [],
              patterns: [],
              recommendations: ['Export raw CGM data as CSV for detailed pattern analysis.'],
              aiInsights: { summary: 'Summary metrics extracted.', fromSummary: true },
              fromSummary: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      // All PDF extraction methods failed
      console.log('All PDF extraction methods failed');
      
      await supabaseClient
        .from('uploads')
        .update({ 
          status: 'error', 
          insights: ['Could not extract glucose data from this PDF. Please export as CSV from your CGM app.'] 
        })
        .eq('id', uploadId);
        
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract glucose data from PDF. Please export as CSV from your CGM app.',
          suggestion: 'Try exporting from Dexcom Clarity, LibreView, or your pump software as CSV format'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // ============= CSV/JSON/TXT PROCESSING =============
    if (fileFormat === 'csv' || fileFormat === 'txt') {
      readings = parseCSV(fileContent);
    } else if (fileFormat === 'json') {
      readings = parseJSON(fileContent);
    } else {
      // Try CSV as fallback
      readings = parseCSV(fileContent);
    }
    
    // Validate readings
    if (readings.length > 0) {
      readings = validateReadings(readings);
    }
    
    if (readings.length < 5) {
      await supabaseClient
        .from('uploads')
        .update({ 
          status: 'error', 
          insights: [`Only ${readings.length} valid readings found. Please check the file format.`] 
        })
        .eq('id', uploadId);
        
      return new Response(
        JSON.stringify({ 
          error: `Insufficient data: only ${readings.length} valid glucose readings found.`,
          suggestion: 'Ensure your file contains glucose values with timestamps in a supported format (CSV, JSON).'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Perform comprehensive analysis
    const { insights, detailedAnalysis, hourlyData, dailyData, agpData, patterns } = analyzeGlucoseDataComprehensive(readings);
    
    // Generate AI recommendations
    const { recommendations, aiInsights } = await generateAIRecommendations(detailedAnalysis, patterns);
    
    // Auto-create journal entries from detected patterns
    const journalEntriesCreated: string[] = [];
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseClient.auth.getUser(token);
        userId = user?.id || null;
      } catch (e) {
        console.log('Could not get user from token for journal entries');
      }
    }
    
    if (userId && patterns.length > 0) {
      const significantPatterns = patterns.filter(p => 
        p.severity === 'warning' || p.severity === 'critical'
      );
      
      for (const pattern of significantPatterns.slice(0, 5)) {
        const direction = pattern.type.includes('low') || pattern.type.includes('hypo') ? 'Low' : 'High';
        const tags = [
          'auto-detected',
          pattern.type.replace(/_/g, '-'),
          pattern.severity,
          pattern.timeOfDay || 'all-day'
        ].filter(Boolean);
        
        try {
          await supabaseClient
            .from('shifts')
            .insert({
              user_id: userId,
              shift_time: new Date().toISOString(),
              direction,
              context: `[Auto-detected from glucose data upload] ${pattern.title}: ${pattern.description}`,
              tags
            });
          journalEntriesCreated.push(pattern.title);
        } catch (e) {
          console.log('Could not create journal entry for pattern:', pattern.type, e);
        }
      }
      
      if (journalEntriesCreated.length > 0) {
        console.log(`Created ${journalEntriesCreated.length} auto-journal entries for user ${userId}`);
      }
    }
    
    // Calculate enhanced analysis fields
    const dataQuality = calculateDataQuality(readings);
    const gapAnalysis = detectGaps(readings);
    const validationFlags = evaluateValidationRules(readings, dataQuality);
    const confidenceScore = Math.max(0, 100 - validationFlags.reduce((sum: number, f: ValidationFlag) => sum + f.penalty, 0));
    const confidenceBand = confidenceScore >= 85 ? 'high' : confidenceScore >= 60 ? 'moderate' : confidenceScore >= 30 ? 'low' : 'unreliable';
    const dayNightAnalysis = calculateDayNightMetrics(readings);
    const novelSignals = detectNovelSignals(readings, hourlyData);
    const executiveSummary = generateExecutiveSummary(detailedAnalysis, patterns, confidenceScore, dataQuality);
    const deviceMetadata = { deviceType: detectCSVFormat(fileContent), firmwareVersion: null, sensorAge: null, uploadSource: 'cloud_export', parserVersion: '2.0.0' };

    // Update database with enhanced fields
    await supabaseClient
      .from('uploads')
      .update({
        status: 'completed',
        insights,
        readings_count: readings.length,
        analysis_results: { insights, readingsCount: readings.length },
        detailed_analysis: detailedAnalysis,
        hourly_data: hourlyData,
        daily_data: dailyData,
        agp_data: agpData,
        patterns,
        recommendations,
        ai_insights: aiInsights,
        // New enhanced fields
        confidence_score: confidenceScore,
        confidence_band: confidenceBand,
        validation_flags: validationFlags,
        wear_time_percent: dataQuality.percentCGMActive,
        gap_analysis: gapAnalysis,
        data_quality: dataQuality,
        device_metadata: deviceMetadata,
        novel_signals: novelSignals,
        day_night_analysis: dayNightAnalysis
      })
      .eq('id', uploadId);
    
    console.log(`Analysis complete: ${readings.length} readings, ${patterns.length} patterns`);
    
    return new Response(
      JSON.stringify({
        success: true,
        insights,
        readingsCount: readings.length,
        detailedAnalysis,
        hourlyData,
        dailyData,
        agpData,
        patterns,
        recommendations,
        aiInsights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred during analysis.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
