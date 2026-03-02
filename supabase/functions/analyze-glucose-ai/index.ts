import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAuth, requireJsonContentType } from "../_shared/auth.ts";
import { MEDICAL_SAFETY_SUFFIX, TEMPERATURE_GUIDE, enforceTokenLimit } from "../_shared/promptGuards.ts";

interface GlucoseMetrics {
  avgGlucose: number;
  cv: number;
  timeInRange: number;
  timeBelow70: number;
  timeAbove180: number;
  gmi: number;
  mage: number;
}

interface Pattern {
  type: string;
  severity: string;
  title: string;
  description: string;
  timeOfDay?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentTypeError = requireJsonContentType(req);
    if (contentTypeError) return contentTypeError;

    const sizeError = await validateBodySize(req);
    if (sizeError) return sizeError;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { metrics, patterns, hourlyData } = await req.json() as {
      metrics: GlucoseMetrics;
      patterns: Pattern[];
      hourlyData: { hour: number; avg: number }[];
    };

    const systemPrompt = `You are an expert diabetes data analyst and certified diabetes educator. Analyze the provided CGM glucose metrics and patterns to provide actionable insights.

Your analysis should be:
1. SPECIFIC - Reference actual numbers from the data
2. ACTIONABLE - Provide concrete steps the person can take
3. EMPATHETIC - Acknowledge the challenges of diabetes management
4. SAFE - Always recommend consulting healthcare providers for treatment changes

Focus on:
- Pattern interpretation (dawn phenomenon, post-meal spikes, nocturnal lows)
- Lifestyle correlations (meal timing, exercise, sleep)
- Specific insulin adjustment suggestions (with caveats about provider consultation)
- Encouraging what's working well
- Prioritizing the most impactful changes first` + MEDICAL_SAFETY_SUFFIX;

    const userPrompt = `Analyze this CGM data and provide personalized insights:

GLUCOSE METRICS:
- Average Glucose: ${metrics.avgGlucose.toFixed(0)} mg/dL
- Glucose Variability (CV): ${metrics.cv.toFixed(1)}%
- Time in Range (70-180): ${metrics.timeInRange.toFixed(1)}%
- Time Below 70: ${metrics.timeBelow70.toFixed(1)}%
- Time Above 180: ${metrics.timeAbove180.toFixed(1)}%
- GMI (estimated A1C): ${metrics.gmi.toFixed(1)}%
- MAGE (swing amplitude): ${metrics.mage.toFixed(0)} mg/dL

DETECTED PATTERNS:
${patterns.map(p => `- ${p.title} (${p.severity}): ${p.description}`).join('\n')}

HOURLY AVERAGES:
${hourlyData.map(h => `${h.hour}:00 - ${h.avg.toFixed(0)} mg/dL`).join('\n')}

Provide:
1. A brief overall assessment (2-3 sentences)
2. Top 3 priority areas to focus on
3. Specific, actionable recommendations for each priority
4. What's working well (positive reinforcement)
5. Questions to discuss with their healthcare provider`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: TEMPERATURE_GUIDE.clinical_analysis,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices?.[0]?.message?.content || "Unable to generate AI analysis.";

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("AI analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});