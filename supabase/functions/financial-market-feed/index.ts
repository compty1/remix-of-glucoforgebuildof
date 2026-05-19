import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const FETCH_TIMEOUT_MS = 25_000;
function tfetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), FETCH_TIMEOUT_MS);
  return fetch(input, { ...init, signal: init.signal ?? c.signal }).finally(() => clearTimeout(t));
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Diabetes-related company tickers
const DIABETES_TICKERS = [
  { ticker: 'DXCM', name: 'Dexcom Inc.' },
  { ticker: 'TNDM', name: 'Tandem Diabetes Care' },
  { ticker: 'ABT', name: 'Abbott Laboratories' },
  { ticker: 'MDT', name: 'Medtronic PLC' },
  { ticker: 'PODD', name: 'Insulet Corporation' },
  { ticker: 'LLY', name: 'Eli Lilly and Company' },
  { ticker: 'NVO', name: 'Novo Nordisk A/S' },
];

// Fetch real stock quotes from Yahoo Finance v8 API (free, no key needed)
async function fetchQuote(ticker: string): Promise<{
  price: number;
  marketCap: number;
  changePercent: number;
  volume: number;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = await tfetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`[FINANCIAL-MARKET-FEED] Yahoo Finance returned ${response.status} for ${ticker}`);
      return null;
    }

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) return null;

    const price = meta.regularMarketPrice || 0;
    const previousClose = meta.chartPreviousClose || meta.previousClose || price;
    const changePercent = previousClose > 0
      ? ((price - previousClose) / previousClose) * 100
      : 0;

    return {
      price: Math.round(price * 100) / 100,
      marketCap: meta.marketCap || 0,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: meta.regularMarketVolume || 0,
    };
  } catch (err) {
    console.error(`[FINANCIAL-MARKET-FEED] Error fetching ${ticker}:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[FINANCIAL-MARKET-FEED] Starting real market data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];
    const marketData: any[] = [];

    for (const company of DIABETES_TICKERS) {
      const quote = await fetchQuote(company.ticker);

      if (quote) {
        marketData.push({
          company_name: company.name,
          ticker_symbol: company.ticker,
          current_price: quote.price,
          market_cap: quote.marketCap,
          change_percent: quote.changePercent,
          volume: quote.volume,
          data_date: today,
        });
        console.log(`[FINANCIAL-MARKET-FEED] ${company.ticker}: $${quote.price} (${quote.changePercent > 0 ? '+' : ''}${quote.changePercent}%)`);
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (marketData.length === 0) {
      console.log('[FINANCIAL-MARKET-FEED] No data fetched from Yahoo Finance');
      return new Response(
        JSON.stringify({ success: true, message: 'No market data available', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert market data
    const { error: marketError } = await supabaseClient
      .from('market_data')
      .upsert(marketData, { onConflict: 'ticker_symbol,data_date' });

    if (marketError) {
      console.error('[FINANCIAL-MARKET-FEED] Market data error:', marketError);
      throw marketError;
    }

    console.log(`[FINANCIAL-MARKET-FEED] Upserted ${marketData.length} real market data records`);

    // Fetch and return latest data
    const { data: latestMarketData } = await supabaseClient
      .from('market_data')
      .select('*')
      .order('data_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Market data updated from Yahoo Finance',
        count: marketData.length,
        data: latestMarketData,
        source: 'Yahoo Finance',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FINANCIAL-MARKET-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
