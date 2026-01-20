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

function analyzeGlucoseData(readings: GlucoseReading[]): string[] {
  if (readings.length === 0) {
    return ['No valid glucose readings found in the file'];
  }
  
  const insights: string[] = [];
  
  // Calculate average glucose
  const avgGlucose = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
  insights.push(`Average glucose: ${avgGlucose.toFixed(0)} mg/dL (target: 70-180 mg/dL)`);
  
  // Calculate time in range (70-180 mg/dL)
  const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
  const timeInRange = (inRange / readings.length) * 100;
  insights.push(`Time in range: ${timeInRange.toFixed(0)}% (target: >70%)`);
  
  // Detect low glucose events (below 70 mg/dL)
  const lowReadings = readings.filter(r => r.value < 70);
  if (lowReadings.length > 0) {
    insights.push(`Detected ${lowReadings.length} low glucose reading(s) below 70 mg/dL`);
  }
  
  // Detect high glucose events (above 180 mg/dL)
  const highReadings = readings.filter(r => r.value > 180);
  if (highReadings.length > 0) {
    const timeAbove = (highReadings.length / readings.length) * 100;
    insights.push(`Time above range: ${timeAbove.toFixed(0)}% (${highReadings.length} high readings)`);
  }
  
  // Calculate glucose variability (coefficient of variation)
  const stdDev = Math.sqrt(
    readings.reduce((sum, r) => sum + Math.pow(r.value - avgGlucose, 2), 0) / readings.length
  );
  const cv = (stdDev / avgGlucose) * 100;
  
  if (cv < 36) {
    insights.push(`Glucose variability: ${cv.toFixed(0)}% (Good stability)`);
  } else {
    insights.push(`Glucose variability: ${cv.toFixed(0)}% (Consider improving stability)`);
  }
  
  // Estimate A1C
  const estimatedA1C = (avgGlucose + 46.7) / 28.7;
  insights.push(`Estimated A1C: ${estimatedA1C.toFixed(1)}%`);
  
  return insights;
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

    // Parse file based on extension
    let readings: GlucoseReading[] = [];
    
    if (filename.toLowerCase().endsWith('.csv')) {
      readings = parseCSV(fileContent);
    } else if (filename.toLowerCase().endsWith('.json')) {
      readings = parseJSON(fileContent);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload CSV or JSON files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze the data
    const insights = analyzeGlucoseData(readings);

    // Update upload record with analysis results
    const { error: updateError } = await supabaseClient
      .from('uploads')
      .update({
        status: 'completed',
        errors_json: { insights, readingsCount: readings.length }
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
