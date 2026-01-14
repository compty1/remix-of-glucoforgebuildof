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
    console.log('[FUNDING-RESEARCH-FEED] Starting research funding data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulated NIH research funding data
    // In production, this would call NIH RePORTER API
    const fundingData = [
      {
        project_number: '1R01DK123456-01',
        project_title: 'Novel Beta Cell Regeneration Strategies for Type 1 Diabetes',
        principal_investigator: 'Dr. Sarah Johnson',
        organization: 'Stanford University',
        funding_amount: 2500000,
        fiscal_year: 2024,
        project_start_date: '2024-07-01',
        project_end_date: '2029-06-30',
        abstract: 'This project aims to develop innovative approaches for regenerating insulin-producing beta cells in patients with Type 1 diabetes using stem cell technology and gene therapy.'
      },
      {
        project_number: '1R01DK123457-01',
        project_title: 'Artificial Intelligence for Glucose Prediction and Insulin Dosing',
        principal_investigator: 'Dr. Michael Chen',
        organization: 'MIT',
        funding_amount: 3200000,
        fiscal_year: 2024,
        project_start_date: '2024-09-01',
        project_end_date: '2029-08-31',
        abstract: 'Development of advanced machine learning algorithms for predicting glucose levels and optimizing automated insulin delivery in closed-loop systems.'
      },
      {
        project_number: '1R01DK123458-01',
        project_title: 'Immunotherapy to Prevent Type 1 Diabetes Progression',
        principal_investigator: 'Dr. Emily Rodriguez',
        organization: 'Johns Hopkins University',
        funding_amount: 2800000,
        fiscal_year: 2024,
        project_start_date: '2024-05-15',
        project_end_date: '2029-05-14',
        abstract: 'Investigation of novel immunotherapy approaches to halt autoimmune destruction of beta cells in individuals at high risk for Type 1 diabetes.'
      },
      {
        project_number: '1R01DK123459-01',
        project_title: 'Non-Invasive Glucose Monitoring Using Optical Technologies',
        principal_investigator: 'Dr. James Lee',
        organization: 'UC Berkeley',
        funding_amount: 1900000,
        fiscal_year: 2023,
        project_start_date: '2023-08-01',
        project_end_date: '2028-07-31',
        abstract: 'Development of next-generation non-invasive glucose monitoring devices using advanced optical sensing and spectroscopy techniques.'
      },
      {
        project_number: '1R01DK123460-01',
        project_title: 'Gut Microbiome and Type 2 Diabetes Risk',
        principal_investigator: 'Dr. Lisa Martinez',
        organization: 'Harvard Medical School',
        funding_amount: 2100000,
        fiscal_year: 2023,
        project_start_date: '2023-10-01',
        project_end_date: '2028-09-30',
        abstract: 'Comprehensive study of the relationship between gut microbiome composition and Type 2 diabetes development, with focus on potential therapeutic interventions.'
      },
      {
        project_number: '1R01DK123461-01',
        project_title: 'Smart Insulin Formulations with Glucose-Responsive Release',
        principal_investigator: 'Dr. David Kim',
        organization: 'University of Washington',
        funding_amount: 2600000,
        fiscal_year: 2023,
        project_start_date: '2023-06-01',
        project_end_date: '2028-05-31',
        abstract: 'Design and testing of glucose-responsive insulin formulations that automatically adjust release rates based on blood glucose levels.'
      }
    ];

    // Upsert funding data
    const { error: fundingError } = await supabaseClient
      .from('research_funding')
      .upsert(fundingData, { onConflict: 'project_number' });

    if (fundingError) {
      console.error('[FUNDING-RESEARCH-FEED] Funding data error:', fundingError);
      throw fundingError;
    }

    console.log(`[FUNDING-RESEARCH-FEED] Upserted ${fundingData.length} funding records`);

    // Fetch and return latest data
    const { data: latestFunding } = await supabaseClient
      .from('research_funding')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .order('funding_amount', { ascending: false })
      .limit(20);

    console.log('[FUNDING-RESEARCH-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research funding data updated successfully',
        count: fundingData.length,
        data: latestFunding
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FUNDING-RESEARCH-FEED] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});