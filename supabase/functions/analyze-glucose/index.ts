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
}

// ============= DATE VALIDATION =============
// Filter out invalid readings with impossible dates
function validateReadings(readings: GlucoseReading[]): GlucoseReading[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const minDate = new Date('2010-01-01'); // CGMs weren't common before this
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Max 1 week in future
  
  const validated = readings.filter(r => {
    // Validate timestamp exists
    if (!r.timestamp || isNaN(r.timestamp.getTime())) {
      return false;
    }
    
    // CRITICAL: Explicitly check year to reject AI-generated garbage dates (year 0100, 5534, etc.)
    const year = r.timestamp.getFullYear();
    if (year < 2010 || year > currentYear + 1) {
      console.log(`Rejecting reading with impossible year: ${year}`);
      return false;
    }
    
    // Check date range
    if (r.timestamp < minDate || r.timestamp > maxDate) {
      return false;
    }
    
    // Validate glucose value (physiologically possible range)
    if (!r.value || isNaN(r.value)) return false;
    if (r.value < 20 || r.value > 500) return false;
    
    return true;
  });
  
  console.log(`Date validation: ${readings.length} input -> ${validated.length} valid (rejected ${readings.length - validated.length})`);
  return validated;
}

// ============= PDF REPORT TYPE DETECTION =============
// Detect if PDF is a summary report (Bionic, Clarity, LibreView) vs raw export
function detectPDFReportType(filename: string, textContent: string): 'summary_report' | 'raw_export' | 'unknown' {
  const lowerFilename = filename.toLowerCase();
  const lowerText = textContent.toLowerCase();
  
  // Check for known summary report types
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
  if (lowerText.includes('time in range') && lowerText.includes('glucose management indicator')) {
    console.log('Detected: CGM summary report (by content)');
    return 'summary_report';
  }
  
  // Check for patterns suggesting raw data export
  const timestampMatches = lowerText.match(/\d{1,2}:\d{2}:\d{2}/g);
  if (lowerText.includes('glucose value') && (lowerText.includes('timestamp') || (timestampMatches && timestampMatches.length > 10))) {
    console.log('Detected: Raw glucose data export');
    return 'raw_export';
  }
  
  return 'unknown';
}

// Validate and clamp analysis results to catch impossible values
function validateAnalysisResults(analysis: DetailedAnalysis): DetailedAnalysis {
  const validated = { ...analysis };
  
  // Clamp impossible values
  if (validated.daysOfData > 365 * 5) validated.daysOfData = Math.min(validated.daysOfData, 365);
  if (validated.cv > 150) validated.cv = Math.min(validated.cv, 100);
  if (validated.gvi > 10) validated.gvi = Math.min(validated.gvi, 5);
  
  // Ensure percentages are in valid range
  validated.timeInRange = Math.max(0, Math.min(100, validated.timeInRange));
  validated.timeInTightRange = Math.max(0, Math.min(100, validated.timeInTightRange));
  validated.timeAbove180 = Math.max(0, Math.min(100, validated.timeAbove180));
  validated.timeAbove250 = Math.max(0, Math.min(100, validated.timeAbove250));
  validated.timeBelow70 = Math.max(0, Math.min(100, validated.timeBelow70));
  validated.timeBelow54 = Math.max(0, Math.min(100, validated.timeBelow54));
  
  // Check that TIR percentages sum roughly to 100
  const total = validated.timeInRange + validated.timeAbove180 + validated.timeBelow70;
  if (Math.abs(total - 100) > 5) {
    // Recalculate based on readings count if available
    console.warn(`TIR percentages sum to ${total.toFixed(1)}%, expected ~100%`);
  }
  
  return validated;
}

// ============= FILE FORMAT DETECTION =============
function detectFileFormat(filename: string, content: string): 'pdf' | 'csv' | 'json' | 'txt' | 'unknown' {
  const lowerFilename = filename.toLowerCase();
  
  // Check by extension first
  if (lowerFilename.endsWith('.pdf') || content.startsWith('%PDF')) {
    return 'pdf';
  }
  if (lowerFilename.endsWith('.json')) {
    return 'json';
  }
  if (lowerFilename.endsWith('.csv')) {
    return 'csv';
  }
  if (lowerFilename.endsWith('.txt')) {
    return 'txt';
  }
  
  // Try to detect from content
  const trimmed = content.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (trimmed.includes(',') && (trimmed.includes('glucose') || trimmed.includes('timestamp') || trimmed.includes('date'))) {
    return 'csv';
  }
  
  return 'unknown';
}

// ============= PDF PARSING WITH AI =============
// Try to extract text content from PDF binary data
function extractTextFromPDFBinary(pdfContent: string): string {
  // Check if content is base64 encoded
  let rawContent = pdfContent;
  
  // Try to decode base64 if it looks like base64
  if (/^[A-Za-z0-9+/=]+$/.test(pdfContent.replace(/\s/g, '').substring(0, 100))) {
    try {
      const decoded = atob(pdfContent.replace(/\s/g, ''));
      rawContent = decoded;
    } catch {
      // Not base64, use as-is
    }
  }
  
  // Extract text content from PDF structure
  // PDFs contain text in various formats - look for common patterns
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
  
  // Pattern 3: Look for readable ASCII sequences
  const asciiMatches = rawContent.match(/[A-Za-z][A-Za-z0-9\s.,:%\-\/]{10,100}/g);
  if (asciiMatches) {
    asciiMatches.forEach(m => textPatterns.push(m));
  }
  
  // Clean and join extracted text
  const extractedText = textPatterns
    .join(' ')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`Extracted ${extractedText.length} chars of text from PDF`);
  return extractedText;
}

// Extract summary metrics from CGM report PDFs (like Bionic, Clarity, LibreView reports)
interface PDFSummaryMetrics {
  gmi?: number;
  avgGlucose?: number;
  timeInRange?: number;
  timeAbove180?: number;
  timeBelow70?: number;
  cv?: number;
  reportPeriodDays?: number;
}

async function extractSummaryMetricsFromPDF(pdfText: string, filename: string): Promise<PDFSummaryMetrics | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY || pdfText.length < 30) {
    console.log('Cannot extract summary: No API key or insufficient text');
    return null;
  }
  
  console.log(`Extracting summary metrics from PDF (${pdfText.length} chars of text)`);
  
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
            content: `You are a specialized CGM report data extractor. Extract summary metrics from diabetes CGM reports.

COMMON REPORT FORMATS AND METRIC LOCATIONS:
- Bionic/iLet Report: Look for "GMI", "Time in Range", "Mean Glucose", "CV"
- Dexcom Clarity: Look for "GMI", "Time in Range (70-180 mg/dL)", "Average Glucose", "Standard Deviation"
- LibreView/AGP: Look for "Time in Target Range", "Average Glucose", "Glucose Variability", "CV%"
- General CGM reports: Look for percentages next to "TIR", "Time in Range", averages near "Mean", "Average"

EXTRACTION RULES:
1. Extract ONLY metrics that are clearly visible in the text
2. For percentages, extract the NUMBER only (e.g., "68.5" not "68.5%")
3. For glucose values, use mg/dL (convert mmol/L by multiplying by 18 if needed)
4. GMI is typically 5.0-10.0 range (similar to A1C)
5. Time in Range is typically 0-100 percentage
6. CV (Coefficient of Variation) is typically 20-60%

Return ONLY a valid JSON object. Use null for metrics not found.
Example: {"gmi": 7.2, "avgGlucose": 154, "timeInRange": 68.5, "timeAbove180": 25.0, "timeBelow70": 3.5, "cv": 32.5, "reportPeriodDays": 14}`
          },
          {
            role: "user",
            content: `Extract CGM summary metrics from this report (${filename}):\n\n${pdfText.slice(0, 10000)}`
          }
        ],
        max_tokens: 600,
        temperature: 0.1
      }),
    });
    
    if (!response.ok) {
      console.error(`AI metrics extraction failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const metrics = JSON.parse(jsonMatch[0]);
      
      // Validate extracted metrics are reasonable
      if (metrics.gmi && (metrics.gmi < 4 || metrics.gmi > 15)) {
        console.log(`Rejecting invalid GMI: ${metrics.gmi}`);
        metrics.gmi = null;
      }
      if (metrics.avgGlucose && (metrics.avgGlucose < 50 || metrics.avgGlucose > 400)) {
        console.log(`Rejecting invalid avgGlucose: ${metrics.avgGlucose}`);
        metrics.avgGlucose = null;
      }
      if (metrics.timeInRange && (metrics.timeInRange < 0 || metrics.timeInRange > 100)) {
        metrics.timeInRange = Math.max(0, Math.min(100, metrics.timeInRange));
      }
      if (metrics.cv && (metrics.cv < 0 || metrics.cv > 100)) {
        metrics.cv = Math.max(0, Math.min(100, metrics.cv));
      }
      
      console.log('Extracted and validated summary metrics:', JSON.stringify(metrics));
      return metrics;
    }
    
    console.log('No valid JSON found in AI response');
    return null;
  } catch (error) {
    console.error("Error extracting summary metrics:", error);
    return null;
  }
}

async function extractReadingsFromPDFWithAI(pdfTextContent: string, filename: string): Promise<GlucoseReading[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured for PDF parsing");
    return [];
  }
  
  // Extract text from PDF binary
  const extractedText = extractTextFromPDFBinary(pdfTextContent);
  
  if (extractedText.length < 50) {
    console.log("Insufficient text extracted from PDF");
    return [];
  }
  
  // Limit content size for AI
  const cleanContent = extractedText.slice(0, 15000);
  
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
            content: `You are a specialized CGM data extractor. Your task is to extract glucose readings from PDF report content.

CRITICAL RULES:
1. Extract ONLY valid glucose readings with timestamps
2. Dates must be realistic (between 2015 and current year)
3. Glucose values must be in mg/dL (typically 40-400)
4. Return ONLY a valid JSON array - no explanations
5. If no valid readings can be extracted, return empty array []

Output format: [{"timestamp": "YYYY-MM-DD HH:mm", "value": number}, ...]`
          },
          {
            role: "user",
            content: `Extract all glucose readings from this CGM report PDF content:\n\n${cleanContent}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });
    
    if (!response.ok) {
      console.error(`AI extraction failed: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log("No JSON array found in AI response");
      return [];
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    const readings: GlucoseReading[] = [];
    
    for (const item of parsed) {
      if (item.timestamp && item.value) {
        const timestamp = new Date(item.timestamp);
        const value = parseFloat(item.value);
        
        if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 20 && value < 500) {
          readings.push({ timestamp, value });
        }
      }
    }
    
    console.log(`AI extracted ${readings.length} readings from PDF`);
    return readings;
    
  } catch (error) {
    console.error("Error during AI PDF extraction:", error);
    return [];
  }
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

// Enhanced pattern detection
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
  }
  
  // Exercise drop detection (rapid decline in afternoon)
  const afternoonHours = hourlyStats.filter(h => h.hour >= 14 && h.hour <= 18);
  if (afternoonHours.length >= 2) {
    for (let i = 1; i < afternoonHours.length; i++) {
      const drop = afternoonHours[i-1].avg - afternoonHours[i].avg;
      if (drop > 40) {
        patterns.push({
          type: 'exercise_drop',
          severity: 'info',
          title: 'Afternoon Glucose Drop Pattern',
          description: `Significant glucose drops detected in afternoon hours. If related to exercise, consider reducing bolus before activity or adding a snack.`,
          timeOfDay: '2:00 PM - 6:00 PM',
          avgImpact: drop
        });
        break;
      }
    }
  }
  
  // Rebound high detection (high within 2 hours of a low)
  const sortedReadings = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  let reboundCount = 0;
  for (let i = 0; i < sortedReadings.length - 1; i++) {
    if (sortedReadings[i].value < 70) {
      // Look for high within next 2 hours
      for (let j = i + 1; j < sortedReadings.length; j++) {
        const timeDiff = (sortedReadings[j].timestamp.getTime() - sortedReadings[i].timestamp.getTime()) / (1000 * 60);
        if (timeDiff > 120) break;
        if (sortedReadings[j].value > 200) {
          reboundCount++;
          break;
        }
      }
    }
  }
  
  if (reboundCount >= 3) {
    patterns.push({
      type: 'rebound_high',
      severity: 'warning',
      title: 'Rebound High Pattern',
      description: `${reboundCount} instances of high glucose following lows detected. This may indicate overtreating lows. Try using 15g fast carbs and waiting 15 minutes.`,
      frequency: reboundCount
    });
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
    if (r.value < 70) {
      if (!inLow) {
        lowEvents++;
        inLow = true;
      }
    } else {
      inLow = false;
    }
    
    if (r.value < 54) {
      if (!inSevereLow) {
        severeLowEvents++;
        inSevereLow = true;
      }
    } else {
      inSevereLow = false;
    }
    
    if (r.value > 180) {
      if (!inHigh) {
        highEvents++;
        inHigh = true;
      }
    } else {
      inHigh = false;
    }
    
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

// Generate AI-powered recommendations
async function generateAIRecommendations(
  detailedAnalysis: DetailedAnalysis,
  patterns: PatternResult[]
): Promise<{ recommendations: string[]; aiInsights: any }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  // Generate base recommendations
  const recommendations: string[] = [];
  
  patterns.forEach(p => {
    if (p.type === 'dawn_phenomenon') {
      recommendations.push('Consider increasing basal rate by 0.1-0.2 u/hr from 3-6 AM');
      recommendations.push('Discuss extended-release insulin timing with your endocrinologist');
    }
    if (p.type === 'post_meal_spike') {
      const meal = p.title?.toLowerCase().includes('breakfast') ? 'breakfast' : 
                   p.title?.toLowerCase().includes('lunch') ? 'lunch' : 'dinner';
      recommendations.push(`Pre-bolus ${meal} by 10-15 minutes`);
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
    if (p.type === 'rebound_high') {
      recommendations.push('Use the 15/15 rule: 15g fast carbs, wait 15 minutes before re-checking');
      recommendations.push('Keep glucose tablets handy instead of overconsuming food');
    }
    if (p.type === 'exercise_drop') {
      recommendations.push('Reduce bolus by 25-50% before planned exercise');
      recommendations.push('Consider a 15-30g carb snack before intense activity');
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
  
  // Try to get AI-enhanced insights
  let aiInsights = null;
  
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
              content: `You are a diabetes educator AI assistant analyzing CGM data. Provide clear, actionable insights.
              
Format your response as JSON with this structure:
{
  "summary": "2-3 sentence overall assessment",
  "keyFindings": ["finding 1", "finding 2"],
  "priorityActions": ["action 1", "action 2"],
  "encouragement": "positive reinforcement message"
}`
            },
            {
              role: "user",
              content: `Analyze this glucose data:
- Average: ${detailedAnalysis.avgGlucose.toFixed(0)} mg/dL
- Time in Range (70-180): ${detailedAnalysis.timeInRange.toFixed(1)}%
- CV: ${detailedAnalysis.cv.toFixed(1)}%
- GMI: ${detailedAnalysis.gmi.toFixed(1)}%
- Low events: ${detailedAnalysis.lowEvents}
- High events: ${detailedAnalysis.highEvents}
- Days of data: ${detailedAnalysis.daysOfData}

Detected patterns: ${patterns.map(p => p.title).join(', ') || 'None'}`
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error("AI insights generation failed:", error);
    }
  }
  
  return { recommendations, aiInsights };
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
  
  // GMI (Glucose Management Indicator)
  const gmi = 3.31 + (0.02392 * avgGlucose);
  
  // GVI (Glycemic Variability Index)
  const idealDelta = 5;
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
  
  // Validate analysis results
  detailedAnalysis = validateAnalysisResults(detailedAnalysis);
  
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

    // Detect file format
    const fileFormat = detectFileFormat(filename, fileContent);
    console.log(`Detected file format: ${fileFormat}`);
    
    let readings: GlucoseReading[] = [];
    
    // Parse file based on detected format
    if (fileFormat === 'pdf') {
      console.log('Processing PDF file...');
      
      // First, extract text and detect report type
      const extractedText = extractTextFromPDFBinary(fileContent);
      const reportType = detectPDFReportType(filename, extractedText);
      console.log(`PDF report type: ${reportType}`);
      
      // For summary reports, skip individual reading extraction and go straight to summary metrics
      if (reportType === 'summary_report') {
        console.log('Detected summary report - extracting metrics directly (skipping individual readings)');
        const summaryMetrics = await extractSummaryMetricsFromPDF(extractedText, filename);
        
        if (summaryMetrics && (summaryMetrics.avgGlucose || summaryMetrics.timeInRange || summaryMetrics.gmi)) {
          console.log('Successfully extracted summary metrics from report');
          
          // Calculate estimated timeAbove250 if not provided
          const timeAbove250 = summaryMetrics.timeAbove180 ? Math.max(0, summaryMetrics.timeAbove180 * 0.3) : 0;
          
          const syntheticAnalysis = {
            readingsCount: 0,
            avgGlucose: summaryMetrics.avgGlucose || 0,
            medianGlucose: summaryMetrics.avgGlucose || 0,
            stdDev: summaryMetrics.cv && summaryMetrics.avgGlucose ? (summaryMetrics.cv / 100) * summaryMetrics.avgGlucose : 0,
            cv: summaryMetrics.cv || 0,
            timeInRange: summaryMetrics.timeInRange || 0,
            timeInTightRange: summaryMetrics.timeInRange ? summaryMetrics.timeInRange * 0.6 : 0,
            timeAbove180: summaryMetrics.timeAbove180 || 0,
            timeAbove250,
            timeBelow70: summaryMetrics.timeBelow70 || 0,
            timeBelow54: summaryMetrics.timeBelow70 ? summaryMetrics.timeBelow70 * 0.3 : 0,
            gmi: summaryMetrics.gmi || (summaryMetrics.avgGlucose ? 3.31 + 0.02392 * summaryMetrics.avgGlucose : 0),
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
          
          const reportDays = summaryMetrics.reportPeriodDays || 14;
          const insights: string[] = [];
          
          insights.push(`📊 Summary Report Analysis (${reportDays} days)`);
          if (summaryMetrics.avgGlucose) {
            insights.push(`📈 Average Glucose: ${Math.round(summaryMetrics.avgGlucose)} mg/dL`);
          }
          if (summaryMetrics.gmi) {
            const gmiStatus = summaryMetrics.gmi < 7 ? '✓ Well controlled' : summaryMetrics.gmi < 8 ? '(Target: <7%)' : '⚠️ Needs attention';
            insights.push(`🎯 GMI (Estimated A1C): ${summaryMetrics.gmi.toFixed(1)}% ${gmiStatus}`);
          }
          if (summaryMetrics.timeInRange) {
            const tirStatus = summaryMetrics.timeInRange >= 70 ? '✓ Target met!' : `(Target: ≥70%)`;
            insights.push(`⏱️ Time in Range (70-180): ${summaryMetrics.timeInRange.toFixed(1)}% ${tirStatus}`);
          }
          if (summaryMetrics.timeAbove180) {
            insights.push(`🔺 Time Above Range: ${summaryMetrics.timeAbove180.toFixed(1)}%`);
          }
          if (summaryMetrics.timeBelow70) {
            const lowStatus = summaryMetrics.timeBelow70 < 4 ? '✓ Within target' : '⚠️ Review needed (Target: <4%)';
            insights.push(`🔻 Time Below Range: ${summaryMetrics.timeBelow70.toFixed(1)}% ${lowStatus}`);
          }
          if (summaryMetrics.cv) {
            const cvStatus = summaryMetrics.cv < 36 ? '✓ Stable' : '(Target: <36%)';
            insights.push(`🌊 Glucose Variability (CV): ${summaryMetrics.cv.toFixed(1)}% ${cvStatus}`);
          }
          insights.push(`ℹ️ For detailed patterns & AGP charts, export raw CGM data as CSV`);
          
          const recommendations = [
            'This analysis is based on summary metrics from your PDF report.',
            'For detailed pattern detection (dawn phenomenon, post-meal spikes, etc.), export your raw CGM data as CSV.',
            '📋 How to export CSV: Dexcom Clarity → Export → CSV | LibreView → Download Data → CSV',
            '💡 Always discuss changes with your healthcare provider.'
          ];
          
          // Update upload record
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
              ai_insights: { summary: 'Metrics extracted from PDF summary report. Upload CSV for detailed analysis.', fromSummary: true }
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
              message: 'Extracted summary metrics from PDF report. For detailed analysis, export as CSV.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      // For unknown or raw_export PDFs, try to extract individual readings
      console.log('Attempting to extract individual readings from PDF...');
      readings = await extractReadingsFromPDFWithAI(fileContent, filename);
      console.log(`AI extracted ${readings.length} readings from PDF`);
      
      // If we got readings, validate them strictly
      if (readings.length > 0) {
        const beforeValidation = readings.length;
        readings = validateReadings(readings);
        console.log(`After validation: ${readings.length} of ${beforeValidation} readings valid`);
      }
      
      // If still no valid readings, try summary extraction as fallback
      if (readings.length < 5) {
        console.log('Insufficient valid readings, falling back to summary extraction...');
        const summaryMetrics = await extractSummaryMetricsFromPDF(extractedText, filename);
        
        if (summaryMetrics && (summaryMetrics.avgGlucose || summaryMetrics.timeInRange || summaryMetrics.gmi)) {
          console.log('Fallback: Found summary metrics in PDF');
          
          const syntheticAnalysis = {
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
            summaryMetrics.gmi ? `🎯 GMI (Estimated A1C): ${summaryMetrics.gmi.toFixed(1)}%` : null,
            summaryMetrics.timeInRange ? `⏱️ Time in Range (70-180): ${summaryMetrics.timeInRange.toFixed(1)}%` : null,
            summaryMetrics.cv ? `🌊 CV (Variability): ${summaryMetrics.cv.toFixed(1)}%` : null,
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
        
        // No readings and no summary metrics - report error
        await supabaseClient
          .from('uploads')
          .update({ 
            status: 'error', 
            insights: ['Could not extract glucose data from PDF. Please export as CSV from your CGM app.'] 
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
    } else if (fileFormat === 'json') {
      readings = parseJSON(fileContent);
    } else if (fileFormat === 'csv' || fileFormat === 'txt') {
      readings = parseCSV(fileContent);
    } else {
      // Try CSV parsing as fallback
      readings = parseCSV(fileContent);
      if (readings.length === 0) {
        readings = parseJSON(fileContent);
      }
    }
    
    // Validate readings to filter out invalid dates/values
    const validatedReadings = validateReadings(readings);
    console.log(`Validated ${validatedReadings.length} of ${readings.length} readings`);
    
    if (validatedReadings.length === 0) {
      await supabaseClient
        .from('uploads')
        .update({ status: 'error', insights: ['No valid glucose readings found. Please check file format and date range.'] })
        .eq('id', uploadId);
        
      return new Response(
        JSON.stringify({ 
          error: 'No valid glucose readings found in the file',
          parsedCount: readings.length,
          validCount: 0,
          suggestion: 'Ensure dates are between 2010 and present, and glucose values are between 20-500 mg/dL'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Comprehensive analysis
    const { insights, detailedAnalysis, hourlyData, dailyData, agpData, patterns } = analyzeGlucoseDataComprehensive(validatedReadings);
    
    // Generate AI recommendations
    const { recommendations, aiInsights } = await generateAIRecommendations(detailedAnalysis, patterns);

    // Update upload record with comprehensive analysis results
    const { error: updateError } = await supabaseClient
      .from('uploads')
      .update({
        status: 'completed',
        insights: insights,
        readings_count: validatedReadings.length,
        analysis_results: { insights, readingsCount: validatedReadings.length },
        detailed_analysis: detailedAnalysis,
        hourly_data: hourlyData,
        daily_data: dailyData,
        agp_data: agpData,
        patterns: patterns,
        recommendations: recommendations,
        ai_insights: aiInsights
      })
      .eq('id', uploadId);
      
    if (updateError) {
      console.error('Error updating upload record:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        readingsCount: validatedReadings.length,
        detailedAnalysis,
        hourlyData,
        dailyData,
        agpData,
        patterns,
        recommendations,
        aiInsights,
        message: `Successfully analyzed ${validatedReadings.length} glucose readings`
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
