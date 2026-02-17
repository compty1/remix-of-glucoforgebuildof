import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const dailyBriefingRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  dayNumber: z.number().int().min(1).max(365).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    
    // Validate input with Zod
    const validation = dailyBriefingRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request parameters',
          details: validation.error.errors 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { userId, dayNumber } = validation.data;
    console.log('Daily briefing request:', { userId, dayNumber });

    // Get onboarding tip for specific day or random tip
    const { data: tips, error: tipsError } = await supabaseClient
      .from('onboarding_tips')
      .select('*')
      .eq('day_number', dayNumber || 1)
      .maybeSingle();

    if (tipsError) {
      console.error('Error fetching tips:', tipsError);
      throw tipsError;
    }

    // Get user profile if userId provided
    let userProfile = null;
    if (userId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      userProfile = profile;
    }

    // Get latest community trends
    const { data: trends, error: trendsError } = await supabaseClient
      .from('trend_analysis_metrics')
      .select('*')
      .order('seven_day_count', { ascending: false })
      .limit(3);

    if (trendsError) {
      console.error('Error fetching trends:', trendsError);
    }

    const briefing = {
      tip: tips,
      userProfile,
      trends: trends || [],
      generated_at: new Date().toISOString()
    };

    console.log('Generated briefing:', briefing);

    return new Response(JSON.stringify(briefing), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in daily-briefing function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);