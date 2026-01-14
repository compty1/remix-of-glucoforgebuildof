import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PATENT-INNOVATION-FEED] Starting patent data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulated patent data for diabetes innovations
    // In production, this would call USPTO PatentsView API
    const patentData = [
      {
        patent_id: 'US11234567B2',
        title: 'Non-Invasive Glucose Monitoring System Using Optical Sensors',
        abstract: 'A novel approach to continuous glucose monitoring without the need for blood samples, utilizing near-infrared spectroscopy and machine learning algorithms for accurate glucose level determination.',
        inventors: ['Jane Smith', 'Robert Chen', 'Maria Garcia'],
        assignee: 'MedTech Innovations Inc.',
        patent_date: '2024-01-15',
        diabetes_relevance_score: 95,
        patent_url: 'https://patents.google.com/patent/US11234567B2'
      },
      {
        patent_id: 'US11234568B2',
        title: 'Smart Insulin Delivery System with Predictive Algorithms',
        abstract: 'An automated insulin delivery system that predicts future glucose levels based on historical data, meal intake, and activity patterns, automatically adjusting insulin delivery rates.',
        inventors: ['David Lee', 'Sarah Johnson'],
        assignee: 'Diabetes Solutions Corp.',
        patent_date: '2023-11-20',
        diabetes_relevance_score: 98,
        patent_url: 'https://patents.google.com/patent/US11234568B2'
      },
      {
        patent_id: 'US11234569B2',
        title: 'Implantable Biosensor for Real-Time Glucose Detection',
        abstract: 'A biocompatible sensor that can be implanted subcutaneously for long-term glucose monitoring, with wireless data transmission capabilities.',
        inventors: ['Michael Brown', 'Lisa Anderson'],
        assignee: 'BioSense Technologies',
        patent_date: '2023-09-08',
        diabetes_relevance_score: 92,
        patent_url: 'https://patents.google.com/patent/US11234569B2'
      },
      {
        patent_id: 'US11234570B2',
        title: 'Artificial Pancreas System with Cloud Integration',
        abstract: 'A comprehensive diabetes management system combining CGM, insulin pump, and cloud-based analytics for optimal glucose control and remote monitoring by healthcare providers.',
        inventors: ['Emily Wilson', 'Thomas Martinez'],
        assignee: 'HealthTech Global',
        patent_date: '2023-07-12',
        diabetes_relevance_score: 96,
        patent_url: 'https://patents.google.com/patent/US11234570B2'
      },
      {
        patent_id: 'US11234571B2',
        title: 'Wearable Sweat-Based Glucose Sensor',
        abstract: 'A non-invasive wearable device that monitors glucose levels through sweat analysis, providing continuous feedback without skin penetration.',
        inventors: ['Kevin Zhang', 'Amanda Taylor'],
        assignee: 'WearableTech Inc.',
        patent_date: '2023-05-25',
        diabetes_relevance_score: 88,
        patent_url: 'https://patents.google.com/patent/US11234571B2'
      },
      {
        patent_id: 'US11234572B2',
        title: 'Dual-Hormone Closed-Loop System',
        abstract: 'An advanced artificial pancreas that delivers both insulin and glucagon for superior glucose control, mimicking natural pancreatic function.',
        inventors: ['Rachel Kim', 'Daniel White'],
        assignee: 'Advanced Diabetes Research',
        patent_date: '2023-03-14',
        diabetes_relevance_score: 94,
        patent_url: 'https://patents.google.com/patent/US11234572B2'
      }
    ];

    // Upsert patent data
    const { error: patentError } = await supabaseClient
      .from('patent_data')
      .upsert(patentData, { onConflict: 'patent_id' });

    if (patentError) {
      console.error('[PATENT-INNOVATION-FEED] Patent data error:', patentError);
      throw patentError;
    }

    console.log(`[PATENT-INNOVATION-FEED] Upserted ${patentData.length} patent records`);

    // Fetch and return latest data
    const { data: latestPatents } = await supabaseClient
      .from('patent_data')
      .select('*')
      .order('patent_date', { ascending: false })
      .limit(20);

    console.log('[PATENT-INNOVATION-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Patent data updated successfully',
        count: patentData.length,
        data: latestPatents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PATENT-INNOVATION-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});