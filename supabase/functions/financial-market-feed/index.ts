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
    console.log('[FINANCIAL-MARKET-FEED] Starting market data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulated market data for major diabetes companies
    // In production, this would call Yahoo Finance or Alpha Vantage APIs
    const today = new Date().toISOString().split('T')[0];
    
    const marketData = [
      {
        company_name: 'Dexcom Inc.',
        ticker_symbol: 'DXCM',
        current_price: 98.45,
        market_cap: 38500000000,
        change_percent: 2.3,
        volume: 3245000,
        data_date: today
      },
      {
        company_name: 'Tandem Diabetes Care',
        ticker_symbol: 'TNDM',
        current_price: 52.18,
        market_cap: 3400000000,
        change_percent: -1.2,
        volume: 1823000,
        data_date: today
      },
      {
        company_name: 'Abbott Laboratories',
        ticker_symbol: 'ABT',
        current_price: 117.32,
        market_cap: 203000000000,
        change_percent: 0.8,
        volume: 5124000,
        data_date: today
      },
      {
        company_name: 'Medtronic PLC',
        ticker_symbol: 'MDT',
        current_price: 87.64,
        market_cap: 114000000000,
        change_percent: 1.5,
        volume: 4567000,
        data_date: today
      },
      {
        company_name: 'Insulet Corporation',
        ticker_symbol: 'PODD',
        current_price: 245.89,
        market_cap: 17200000000,
        change_percent: 3.1,
        volume: 892000,
        data_date: today
      },
      {
        company_name: 'Eli Lilly and Company',
        ticker_symbol: 'LLY',
        current_price: 789.23,
        market_cap: 745000000000,
        change_percent: 2.7,
        volume: 2345000,
        data_date: today
      },
      {
        company_name: 'Novo Nordisk A/S',
        ticker_symbol: 'NVO',
        current_price: 102.45,
        market_cap: 465000000000,
        change_percent: 1.9,
        volume: 1876000,
        data_date: today
      }
    ];

    // Upsert market data
    const { error: marketError } = await supabaseClient
      .from('market_data')
      .upsert(marketData, { onConflict: 'ticker_symbol,data_date' });

    if (marketError) {
      console.error('[FINANCIAL-MARKET-FEED] Market data error:', marketError);
      throw marketError;
    }

    console.log(`[FINANCIAL-MARKET-FEED] Upserted ${marketData.length} market data records`);

    // Fetch and return latest data
    const { data: latestMarketData } = await supabaseClient
      .from('market_data')
      .select('*')
      .order('data_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('[FINANCIAL-MARKET-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Market data updated successfully',
        count: marketData.length,
        data: latestMarketData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FINANCIAL-MARKET-FEED] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});