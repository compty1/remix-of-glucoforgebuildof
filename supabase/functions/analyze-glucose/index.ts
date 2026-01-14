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

function parseCSV(content: string): GlucoseReading[] {
  const lines = content.split('\n').filter(line => line.trim());
  const readings: GlucoseReading[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length < 2) continue;
    
    // Try common CSV formats: timestamp,value or date,time,value
    let timestamp: Date;
    let value: number;
    
    if (parts.length === 2) {
      // Format: timestamp,value
      timestamp = new Date(parts[0].trim());
      value = parseFloat(parts[1].trim());
    } else if (parts.length >= 3) {
      // Format: date,time,value or index,timestamp,value
      const possibleTimestamp = parts[0].trim() + ' ' + parts[1].trim();
      timestamp = new Date(possibleTimestamp);
      
      // If first attempt fails, try second column as timestamp
      if (isNaN(timestamp.getTime())) {
        timestamp = new Date(parts[1].trim());
        value = parseFloat(parts[2].trim());
      } else {
        value = parseFloat(parts[2].trim());
      }
    } else {
      continue;
    }
    
    if (!isNaN(timestamp.getTime()) && !isNaN(value) && value > 0 && value < 600) {
      readings.push({ timestamp, value });
    }
  }
  
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
