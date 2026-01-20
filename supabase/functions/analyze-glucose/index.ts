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
  // Basic metrics
  readingsCount: number;
  avgGlucose: number;
  medianGlucose: number;
  stdDev: number;
  cv: number;
  
  // Time in Range metrics
  timeInRange: number;
  timeInTightRange: number;
  timeAbove180: number;
  timeAbove250: number;
  timeBelow70: number;
  timeBelow54: number;
  
  // Advanced metrics
  gmi: number;
  gvi: number;
  mage: number;
  
  // Event counts
  lowEvents: number;
  severeLowEvents: number;
  highEvents: number;
  severeHighEvents: number;
  
  // Date range
  dataStart: string;
  dataEnd: string;
  daysOfData: number;
}

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
  
  // Find header row (some exports have metadata rows before headers)
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
  
  // Find column indices based on format
  let timestampCol = -1;
  let dateCol = -1;
  let timeCol = -1;
  let valueCol = -1;
  
  headers.forEach((h, idx) => {
    // Timestamp columns
    if (h.includes('timestamp') || h === 'device timestamp' || h === 'reader timestamp') {
      timestampCol = idx;
    }
    // Separate date columns
    if (h === 'date' || h.includes('date') && !h.includes('timestamp')) {
      dateCol = idx;
    }
    // Separate time columns
    if (h === 'time' && !h.includes('timestamp')) {
      timeCol = idx;
    }
    // Value columns - Dexcom uses 'Glucose Value (mg/dL)', Libre uses 'Historic Glucose mg/dL'
    if (h.includes('glucose') || h.includes('egv') || h.includes('bg') || h.includes('historic')) {
      if (h.includes('mg') || !valueCol || valueCol === -1) {
        valueCol = idx;
      }
    }
  });
  
  // Fallback for generic CSV: assume first col is timestamp, second is value
  if (timestampCol === -1 && dateCol === -1) timestampCol = 0;
  if (valueCol === -1) valueCol = headers.length > 1 ? 1 : 0;
  
  console.log(`Parsing with cols - timestamp: ${timestampCol}, date: ${dateCol}, time: ${timeCol}, value: ${valueCol}`);
  
  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted CSV fields
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
    
    // Parse timestamp
    if (timestampCol !== -1 && parts[timestampCol]) {
      timestamp = new Date(parts[timestampCol]);
    } else if (dateCol !== -1 && timeCol !== -1 && parts[dateCol] && parts[timeCol]) {
      timestamp = new Date(`${parts[dateCol]} ${parts[timeCol]}`);
    } else if (dateCol !== -1 && parts[dateCol]) {
      timestamp = new Date(parts[dateCol]);
    } else {
      continue;
    }
    
    // Parse value
    let valueStr = parts[valueCol]?.replace(/[^\d.]/g, '') || '';
    const value = parseFloat(valueStr);
    
    if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
      readings.push({ timestamp, value });
    }
  }
  
  console.log(`Parsed ${readings.length} valid glucose readings`);
  return readings;
}

function parseJSON(content: string): GlucoseReading[] {
  try {
    const data = JSON.parse(content);
    const readings: GlucoseReading[] = [];
    
    // Handle array of readings
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

// Calculate percentile from sorted array
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

// Calculate hourly statistics for AGP
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

// Generate AGP data with time labels
function generateAGPData(hourlyStats: HourlyStats[]): AGPDataPoint[] {
  return hourlyStats.map(stat => ({
    time: `${stat.hour.toString().padStart(2, '0')}:00`,
    p5: percentile(Array(stat.count).fill(stat.avg), 5) * 0.85, // Approximation
    p25: stat.p25,
    p50: stat.p50,
    p75: stat.p75,
    p95: stat.p90 * 1.1 // Approximation
  }));
}

// Calculate daily statistics
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

// Calculate MAGE (Mean Amplitude of Glycemic Excursions)
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

// Detect patterns in glucose data
function detectPatterns(readings: GlucoseReading[], hourlyStats: HourlyStats[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  
  // Dawn phenomenon detection (rising glucose 4-8 AM)
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
        description: `Your glucose rises an average of ${Math.round(dawnHours[dawnHours.length - 1].avg - dawnHours[0].avg)} mg/dL between 4-8 AM. Consider adjusting basal rates during early morning hours.`,
        timeOfDay: '4:00 AM - 8:00 AM',
        avgImpact: dawnHours[dawnHours.length - 1].avg - dawnHours[0].avg
      });
    }
  }
  
  // Post-meal spike detection (hours 7-9, 12-14, 18-20)
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
        description: `Average ${Math.round(maxPostMeal - preMeal)} mg/dL rise after ${meal.name}. Consider pre-bolusing 10-15 minutes earlier.`,
        timeOfDay: `${meal.start}:00 - ${meal.end}:00`,
        avgImpact: maxPostMeal - preMeal
      });
    }
  });
  
  // Overnight stability check (11 PM - 4 AM)
  const overnightHours = hourlyStats.filter(h => h.hour >= 23 || h.hour <= 4);
  if (overnightHours.length > 0) {
    const overnightValues = overnightHours.map(h => h.avg);
    const overnightMean = overnightValues.reduce((a, b) => a + b, 0) / overnightValues.length;
    const overnightStdDev = Math.sqrt(
      overnightValues.reduce((sum, v) => sum + Math.pow(v - overnightMean, 2), 0) / overnightValues.length
    );
    const overnightCV = (overnightStdDev / overnightMean) * 100;
    
    if (overnightCV < 20) {
      patterns.push({
        type: 'overnight_stability',
        severity: 'info',
        title: 'Excellent Overnight Stability',
        description: `Your overnight glucose variability is ${Math.round(overnightCV)}% CV, indicating well-tuned basal rates. Keep up the great work!`,
        timeOfDay: '11:00 PM - 4:00 AM'
      });
    } else if (overnightCV > 36) {
      patterns.push({
        type: 'overnight_instability',
        severity: 'warning',
        title: 'Overnight Variability',
        description: `Your overnight glucose variability is ${Math.round(overnightCV)}% CV. Consider reviewing basal rates or late snacks.`,
        timeOfDay: '11:00 PM - 4:00 AM'
      });
    }
  }
  
  // Low event clustering
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
      description: `Lows tend to occur around: ${lowTimes}. Review insulin timing or add snacks during these periods.`,
      frequency: lowsByHour.length
    });
  }
  
  // High event clustering  
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
      description: `Highs tend to occur around: ${highTimes}. Review carb coverage or basal rates during these times.`,
      frequency: highsByHour.length
    });
  }
  
  return patterns;
}

// Count glucose events
function countGlucoseEvents(readings: GlucoseReading[]): {
  lowEvents: number;
  severeLowEvents: number;
  highEvents: number;
  severeHighEvents: number;
} {
  let lowEvents = 0;
  let severeLowEvents = 0;
  let highEvents = 0;
  let severeHighEvents = 0;
  let inLow = false;
  let inSevereLow = false;
  let inHigh = false;
  let inSevereHigh = false;
  
  readings.forEach(r => {
    // Count low events (consecutive readings below 70)
    if (r.value < 70) {
      if (!inLow) {
        lowEvents++;
        inLow = true;
      }
    } else {
      inLow = false;
    }
    
    // Count severe low events (below 54)
    if (r.value < 54) {
      if (!inSevereLow) {
        severeLowEvents++;
        inSevereLow = true;
      }
    } else {
      inSevereLow = false;
    }
    
    // Count high events (above 180)
    if (r.value > 180) {
      if (!inHigh) {
        highEvents++;
        inHigh = true;
      }
    } else {
      inHigh = false;
    }
    
    // Count severe high events (above 250)
    if (r.value > 250) {
      if (!inSevereHigh) {
        severeHighEvents++;
        inSevereHigh = true;
      }
    } else {
      inSevereHigh = false;
    }
  });
  
  return { lowEvents, severeLowEvents, highEvents, severeHighEvents };
}

// Comprehensive glucose analysis
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
  
  // Sort readings by timestamp
  readings.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const values = readings.map(r => r.value);
  const insights: string[] = [];
  
  // Basic statistics
  const avgGlucose = values.reduce((sum, v) => sum + v, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const medianGlucose = percentile(values, 50);
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avgGlucose, 2), 0) / values.length);
  const cv = (stdDev / avgGlucose) * 100;
  
  // Time in Range calculations
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
  
  // GMI (Glucose Management Indicator) - more accurate than eA1C
  const gmi = 3.31 + (0.02392 * avgGlucose);
  
  // GVI (Glycemic Variability Index)
  const idealDelta = 5; // mg/dL expected per 5 min
  let actualDeltas = 0;
  for (let i = 1; i < readings.length; i++) {
    actualDeltas += Math.abs(readings[i].value - readings[i-1].value);
  }
  const gvi = actualDeltas / ((readings.length - 1) * idealDelta);
  
  // MAGE
  const mage = calculateMAGE(readings, stdDev);
  
  // Event counts
  const events = countGlucoseEvents(readings);
  
  // Calculate hourly and daily statistics
  const hourlyData = calculateHourlyStatistics(readings);
  const dailyData = calculateDailyStatistics(readings);
  const agpData = generateAGPData(hourlyData);
  
  // Detect patterns
  const patterns = detectPatterns(readings, hourlyData);
  
  // Data range
  const dataStart = readings[0].timestamp.toISOString().split('T')[0];
  const dataEnd = readings[readings.length - 1].timestamp.toISOString().split('T')[0];
  const daysOfData = Math.ceil((readings[readings.length - 1].timestamp.getTime() - readings[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate insights
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
  
  // Pattern-based insights
  patterns.forEach(p => {
    if (p.severity === 'critical' || p.severity === 'warning') {
      insights.push(`⚡ ${p.title}: ${p.description.split('.')[0]}`);
    }
  });
  
  const detailedAnalysis: DetailedAnalysis = {
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
  
  return { insights, detailedAnalysis, hourlyData, dailyData, agpData, patterns };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate request
    const requestBody = await req.json();
    const validation = analyzeRequestSchema.safeParse(requestBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filename, fileContent, uploadId } = validation.data;

    console.log(`Analyzing glucose data from: ${filename}`);

    // Parse file based on extension or content detection
    let readings: GlucoseReading[] = [];
    const lowerFilename = filename.toLowerCase();
    
    // Check file extension first
    if (lowerFilename.endsWith('.csv') || lowerFilename.endsWith('.txt')) {
      readings = parseCSV(fileContent);
    } else if (lowerFilename.endsWith('.json')) {
      readings = parseJSON(fileContent);
    } else {
      // Try to detect format from content
      const trimmedContent = fileContent.trim();
      if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
        // Looks like JSON
        readings = parseJSON(fileContent);
      } else if (trimmedContent.includes(',') || trimmedContent.includes('\t')) {
        // Looks like CSV/TSV
        readings = parseCSV(fileContent);
      } else {
        return new Response(
          JSON.stringify({ error: 'Unsupported file format. Please upload CSV, TXT, or JSON files.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Comprehensive analysis
    const { insights, detailedAnalysis, hourlyData, dailyData, agpData, patterns } = analyzeGlucoseDataComprehensive(readings);
    
    // Generate AI recommendations based on patterns
    const recommendations: string[] = [];
    
    patterns.forEach(p => {
      if (p.type === 'dawn_phenomenon') {
        recommendations.push('Consider increasing basal rate by 0.1-0.2 u/hr from 3-6 AM');
        recommendations.push('Discuss extended-release insulin timing with your endocrinologist');
      }
      if (p.type === 'post_meal_spike') {
        recommendations.push(`Pre-bolus ${p.title?.toLowerCase().includes('breakfast') ? 'breakfast' : p.title?.toLowerCase().includes('lunch') ? 'lunch' : 'dinner'} by 10-15 minutes`);
        recommendations.push('Consider reducing fast-acting carbs at this meal');
      }
      if (p.type === 'low_clustering') {
        recommendations.push('Review basal rates during problem times');
        recommendations.push('Consider adding a small snack before predictable lows');
      }
      if (p.type === 'overnight_instability') {
        recommendations.push('Check for undigested dinner carbs affecting overnight glucose');
        recommendations.push('Consider adjusting overnight basal profile');
      }
    });
    
    if (detailedAnalysis.cv > 36) {
      recommendations.push('Focus on consistent meal timing and carb portions');
      recommendations.push('Review correction factor - may need adjustment');
    }
    
    if (detailedAnalysis.timeBelow70 > 4) {
      recommendations.push('Consider reducing basal or bolus insulin');
      recommendations.push('Keep fast-acting glucose readily available');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Your current settings appear well-optimized!');
      recommendations.push('Continue regular uploads to track trends over time');
    }
    
    recommendations.push('💡 Always discuss changes with your healthcare provider before adjusting treatment');

    // Update upload record with comprehensive analysis results
    const { error: updateError } = await supabaseClient
      .from('uploads')
      .update({
        status: 'completed',
        insights: insights,
        readings_count: readings.length,
        analysis_results: { insights, readingsCount: readings.length },
        detailed_analysis: detailedAnalysis,
        hourly_data: hourlyData,
        daily_data: dailyData,
        agp_data: agpData,
        patterns: patterns,
        recommendations: recommendations
      })
      .eq('id', uploadId);
      
    if (updateError) {
      console.error('Error updating upload record:', updateError);
    }

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
        message: `Successfully analyzed ${readings.length} glucose readings`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});