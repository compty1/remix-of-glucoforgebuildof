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
  source?: string;
}

interface DataFreshness {
  table_name: string;
  total_records: number;
  last_updated: string | null;
  freshness_status: 'fresh' | 'stale' | 'outdated';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: AggregationResult[] = [];

  try {
    console.log('🚀 Starting comprehensive data orchestration...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // All data aggregation functions with their data sources
    const dataFunctions = [
      { name: 'research-feed', source: 'PubMed + Europe PMC' },
      { name: 'medical-research-aggregator', source: 'Europe PMC + Enhanced PubMed' },
      { name: 'clinical-trials-enhanced', source: 'ClinicalTrials.gov API' },
      { name: 'openalex-research-feed', source: 'OpenAlex Scholarly Works API' },
      { name: 'community-feed', source: 'Community Sources' },
      { name: 'fda-data-feed', source: 'OpenFDA API' },
      { name: 'patent-innovation-feed', source: 'USPTO PatentsView API' },
      { name: 'funding-research-feed', source: 'NIH RePORTER API' },
      { name: 'medicare-data-feed', source: 'CMS Data APIs' },
      { name: 'financial-market-feed', source: 'Market Data' },
      { name: 'preprint-research-feed', source: 'bioRxiv + medRxiv + arXiv' }
    ];

    // Call each function sequentially with error handling
    for (const func of dataFunctions) {
      const fnStartTime = Date.now();
      console.log(`📡 Calling ${func.name} (${func.source})...`);

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/${func.name}`,
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
            function_name: func.name,
            status: 'success',
            records_fetched: recordCount,
            execution_time_ms: executionTime,
            source: func.source,
          });

          console.log(`✅ ${func.name}: ${recordCount} records from ${func.source} (${executionTime}ms)`);
        } else {
          const errorText = await response.text();
          results.push({
            function_name: func.name,
            status: 'error',
            records_fetched: 0,
            error: errorText,
            execution_time_ms: executionTime,
            source: func.source,
          });

          console.error(`❌ ${func.name} failed: ${errorText}`);
        }
      } catch (error) {
        const executionTime = Date.now() - fnStartTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          function_name: func.name,
          status: 'error',
          records_fetched: 0,
          error: errorMessage,
          execution_time_ms: executionTime,
          source: func.source,
        });

        console.error(`❌ ${func.name} exception:`, error);
      }

      // Small delay between calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Get counts and freshness from all tables
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tableQueries = [
      { table: 'research_items', name: 'Research Items' },
      { table: 'medical_research_papers', name: 'Medical Papers' },
      { table: 'clinical_trials_detailed', name: 'Clinical Trials' },
      { table: 'community_posts', name: 'Community Posts' },
      { table: 'fda_device_events', name: 'FDA Events' },
      { table: 'patent_data', name: 'Patents' },
      { table: 'research_funding', name: 'Research Funding' },
      { table: 'drug_pricing_data', name: 'Drug Pricing' },
      { table: 'market_data', name: 'Market Data' },
      { table: 'discoveries', name: 'Discoveries' },
      { table: 'discovery_cards', name: 'Discovery Cards' },
      { table: 'cure_therapies', name: 'Cure Therapies' }
    ];

    const freshnessData: DataFreshness[] = [];

    for (const tq of tableQueries) {
      const { count } = await supabase.from(tq.table).select('*', { count: 'exact', head: true });
      
      // Get most recent update
      const { data: latest } = await supabase
        .from(tq.table)
        .select('updated_at, created_at')
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .single();

      const lastUpdated = latest?.updated_at || latest?.created_at || null;
      
      // Determine freshness (< 1 day = fresh, < 7 days = stale, > 7 days = outdated)
      let freshness: 'fresh' | 'stale' | 'outdated' = 'outdated';
      if (lastUpdated) {
        const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) freshness = 'fresh';
        else if (hoursSinceUpdate < 168) freshness = 'stale';
      }

      freshnessData.push({
        table_name: tq.name,
        total_records: count || 0,
        last_updated: lastUpdated,
        freshness_status: freshness
      });
    }

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
      data_freshness: freshnessData,
      data_sources: {
        live_apis: [
          'NIH RePORTER (Research Funding)',
          'USPTO PatentsView (Patents)',
          'ClinicalTrials.gov (Clinical Trials)',
          'OpenFDA (Device Events)',
          'PubMed/Europe PMC (Research Papers)',
          'bioRxiv/medRxiv (Preprints)',
          'arXiv (Preprints)'
        ],
        total_tables_updated: freshnessData.filter(f => f.freshness_status === 'fresh').length
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
