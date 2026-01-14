import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregationResult {
  function_name: string;
  status: 'success' | 'error';
  records_fetched: number;
  error?: string;
  execution_time_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: AggregationResult[] = [];

  try {
    console.log('🚀 Starting data orchestration...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // List of all data aggregation functions to call
    const dataFunctions = [
      'research-feed',
      'medical-research-aggregator',
      'clinical-trials-enhanced',
      'community-feed',
      'fda-data-feed',
      'patent-innovation-feed',
      'funding-research-feed',
      'medicare-data-feed',
      'financial-market-feed'
    ];

    // Call each function sequentially with error handling
    for (const functionName of dataFunctions) {
      const fnStartTime = Date.now();
      console.log(`📡 Calling ${functionName}...`);

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/${functionName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          }
        );

        const executionTime = Date.now() - fnStartTime;

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const recordCount = data.count || data.inserted || data.items?.length || 0;

          results.push({
            function_name: functionName,
            status: 'success',
            records_fetched: recordCount,
            execution_time_ms: executionTime,
          });

          console.log(`✅ ${functionName}: ${recordCount} records (${executionTime}ms)`);
        } else {
          const errorText = await response.text();
          results.push({
            function_name: functionName,
            status: 'error',
            records_fetched: 0,
            error: errorText,
            execution_time_ms: executionTime,
          });

          console.error(`❌ ${functionName} failed: ${errorText}`);
        }
      } catch (error) {
        const executionTime = Date.now() - fnStartTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          function_name: functionName,
          status: 'error',
          records_fetched: 0,
          error: errorMessage,
          execution_time_ms: executionTime,
        });

        console.error(`❌ ${functionName} exception:`, error);
      }

      // Small delay between calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Get counts from all tables
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [
      researchItems,
      medicalPapers,
      clinicalTrials,
      communityPosts,
      fdaEvents,
      patentData,
      researchFunding,
      drugPricing,
      marketData
    ] = await Promise.all([
      supabase.from('research_items').select('id', { count: 'exact', head: true }),
      supabase.from('medical_research_papers').select('id', { count: 'exact', head: true }),
      supabase.from('clinical_trials_detailed').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('fda_device_events').select('id', { count: 'exact', head: true }),
      supabase.from('patent_data').select('id', { count: 'exact', head: true }),
      supabase.from('research_funding').select('id', { count: 'exact', head: true }),
      supabase.from('drug_pricing_data').select('id', { count: 'exact', head: true }),
      supabase.from('market_data').select('id', { count: 'exact', head: true })
    ]);

    const totalExecutionTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const totalRecordsFetched = results.reduce((sum, r) => sum + r.records_fetched, 0);

    const summary = {
      orchestration_completed_at: new Date().toISOString(),
      total_execution_time_ms: totalExecutionTime,
      functions_called: dataFunctions.length,
      functions_succeeded: successCount,
      functions_failed: dataFunctions.length - successCount,
      total_new_records: totalRecordsFetched,
      database_counts: {
        research_items: researchItems.count || 0,
        medical_papers: medicalPapers.count || 0,
        clinical_trials: clinicalTrials.count || 0,
        community_posts: communityPosts.count || 0,
        fda_events: fdaEvents.count || 0,
        patent_data: patentData.count || 0,
        research_funding: researchFunding.count || 0,
        drug_pricing: drugPricing.count || 0,
        market_data: marketData.count || 0,
      },
      results,
    };

    console.log('📊 Orchestration Summary:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Orchestration failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Data orchestration failed',
        message: errorMessage,
        results,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
