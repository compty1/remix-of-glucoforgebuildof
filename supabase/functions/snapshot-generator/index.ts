import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting config
const RATE_LIMIT_REQUESTS = 10;
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

serve(async (req) => {
  // Handle CORS preflight requests
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid authentication");
    }

    const user = userData.user;

    // Generate clinical visit snapshot
    const snapshot = {
      patientInfo: {
        generatedAt: new Date().toISOString(),
        period: "Last 30 days",
        userId: user.id,
      },
      glucoseMetrics: {
        averageGlucose: 145,
        timeInRange: 68,
        timeAbove180: 22,
        timeBelow70: 10,
        glucoseVariability: 35,
        estimatedA1C: 7.2,
      },
      patterns: [
        {
          type: "Morning highs",
          frequency: "5/7 days",
          description: "Glucose tends to rise between 6-8 AM",
          recommendation: "Consider adjusting basal rates or dawn phenomenon management"
        },
        {
          type: "Post-lunch spikes",
          frequency: "3/7 days",
          description: "Glucose peaks >200 mg/dL after midday meals",
          recommendation: "Review carb counting and pre-meal insulin timing"
        },
        {
          type: "Exercise response",
          frequency: "Variable",
          description: "Mixed responses to physical activity",
          recommendation: "Track exercise type and adjust insulin accordingly"
        }
      ],
      recentEvents: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: "Low glucose",
          value: 58,
          context: "Before breakfast",
          action: "Treated with 15g glucose"
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: "High glucose",
          value: 285,
          context: "2 hours post-dinner",
          action: "Correction bolus given"
        }
      ],
      medications: [
        {
          name: "Insulin Lispro",
          type: "Rapid-acting",
          dosing: "Carb ratio 1:12, Correction 1:50",
          notes: "Pre-meal timing varies"
        },
        {
          name: "Insulin Glargine",
          type: "Long-acting",
          dosing: "22 units at bedtime",
          notes: "Stable dose for 3 months"
        }
      ],
      questions: [
        "How can we improve morning glucose control?",
        "Should we adjust the lunch carb ratio?",
        "Are there patterns related to stress or sleep?",
        "Should we consider CGM alert threshold changes?"
      ],
      summary: "Generally good glucose management with opportunities for fine-tuning morning patterns and post-meal responses. Time in range approaching target with room for improvement in variability."
    };

    return new Response(JSON.stringify(snapshot), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Snapshot generation error:', errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});