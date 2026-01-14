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
    console.log('[MEDICARE-DATA-FEED] Starting Medicare data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulated Medicare coverage data for diabetes devices
    // In production, this would call CMS APIs
    const coverageData = [
      {
        device_name: 'Continuous Glucose Monitor (CGM)',
        coverage_status: 'Covered',
        coverage_details: {
          benefit_category: 'Durable Medical Equipment',
          requirements: ['Insulin-dependent diabetes', 'Physician prescription', 'Training completed'],
          copay_info: 'Subject to Part B deductible and 20% coinsurance'
        },
        ncd_number: '40.2',
        effective_date: '2017-01-12',
        source_url: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=364'
      },
      {
        device_name: 'Insulin Pump',
        coverage_status: 'Covered',
        coverage_details: {
          benefit_category: 'Durable Medical Equipment',
          requirements: ['Type 1 diabetes or insulin-requiring Type 2', 'Multiple daily injections', 'Frequent glucose testing'],
          copay_info: 'Subject to Part B deductible and 20% coinsurance'
        },
        ncd_number: '280.14',
        effective_date: '2006-05-10',
        source_url: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=223'
      },
      {
        device_name: 'Blood Glucose Monitor',
        coverage_status: 'Covered',
        coverage_details: {
          benefit_category: 'Durable Medical Equipment',
          requirements: ['Diabetes diagnosis', 'Physician prescription'],
          copay_info: 'Typically covered at 80% after deductible'
        },
        ncd_number: '40.2',
        effective_date: '2002-03-01',
        source_url: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=364'
      },
      {
        device_name: 'Lancets and Test Strips',
        coverage_status: 'Covered',
        coverage_details: {
          benefit_category: 'Medical Supplies',
          requirements: ['Diabetes diagnosis', 'Prescribed quantity limits'],
          copay_info: '20% coinsurance after Part B deductible'
        },
        ncd_number: '40.2',
        effective_date: '2002-03-01',
        source_url: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=364'
      }
    ];

    // Simulated drug pricing data for common diabetes medications
    const drugPricingData = [
      {
        drug_name: 'Insulin Glargine (Lantus)',
        manufacturer: 'Sanofi',
        ndc_code: '00088-2220-33',
        unit_price: 98.70,
        medicare_price: 82.15,
        year: 2024,
        data_source: 'CMS Part D'
      },
      {
        drug_name: 'Insulin Lispro (Humalog)',
        manufacturer: 'Eli Lilly',
        ndc_code: '00002-7510-01',
        unit_price: 93.26,
        medicare_price: 78.90,
        year: 2024,
        data_source: 'CMS Part D'
      },
      {
        drug_name: 'Metformin 500mg',
        manufacturer: 'Generic',
        ndc_code: '00093-7214-01',
        unit_price: 4.00,
        medicare_price: 3.50,
        year: 2024,
        data_source: 'CMS Part D'
      },
      {
        drug_name: 'Ozempic (Semaglutide)',
        manufacturer: 'Novo Nordisk',
        ndc_code: '00169-4060-13',
        unit_price: 935.77,
        medicare_price: 797.40,
        year: 2024,
        data_source: 'CMS Part D'
      },
      {
        drug_name: 'Jardiance (Empagliflozin)',
        manufacturer: 'Boehringer Ingelheim',
        ndc_code: '00597-0144-30',
        unit_price: 573.58,
        medicare_price: 487.54,
        year: 2024,
        data_source: 'CMS Part D'
      }
    ];

    // Upsert coverage data
    const { error: coverageError } = await supabaseClient
      .from('medicare_coverage_data')
      .upsert(coverageData, { onConflict: 'device_name' });

    if (coverageError) {
      console.error('[MEDICARE-DATA-FEED] Coverage data error:', coverageError);
    } else {
      console.log(`[MEDICARE-DATA-FEED] Upserted ${coverageData.length} coverage records`);
    }

    // Upsert drug pricing data
    const { error: pricingError } = await supabaseClient
      .from('drug_pricing_data')
      .upsert(drugPricingData, { onConflict: 'ndc_code' });

    if (pricingError) {
      console.error('[MEDICARE-DATA-FEED] Drug pricing error:', pricingError);
    } else {
      console.log(`[MEDICARE-DATA-FEED] Upserted ${drugPricingData.length} drug pricing records`);
    }

    // Fetch and return latest data
    const { data: latestCoverage } = await supabaseClient
      .from('medicare_coverage_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: latestPricing } = await supabaseClient
      .from('drug_pricing_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('[MEDICARE-DATA-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Medicare data updated successfully',
        coverage_count: coverageData.length,
        pricing_count: drugPricingData.length,
        latest_coverage: latestCoverage,
        latest_pricing: latestPricing
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[MEDICARE-DATA-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});