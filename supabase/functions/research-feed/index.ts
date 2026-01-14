import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting config
const RATE_LIMIT_REQUESTS = 20;
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

interface ResearchItem {
  title: string
  link: string
  summary: string
  source: string
  impact_level: string
}

// Using Europe PMC API instead of RSS feeds
const SEARCH_QUERIES = [
  'type 1 diabetes cure',
  'type 1 diabetes treatment breakthrough',
  'stem cell therapy diabetes',
  'immunotherapy type 1 diabetes',
  'continuous glucose monitoring',
  'insulin pump therapy'
];

async function fetchFromEuropePMC(query: string): Promise<ResearchItem[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodedQuery}&format=json&pageSize=20&cursorMark=*`;
    
    console.log(`Fetching from Europe PMC: ${query}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GlucoForge-Research-Aggregator/1.0'
      }
    });

    if (!response.ok) {
      console.error(`Europe PMC API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results: ResearchItem[] = [];

    if (data.resultList?.result) {
      for (const item of data.resultList.result.slice(0, 10)) {
        results.push({
          title: item.title || 'Untitled Research',
          link: item.doi ? `https://doi.org/${item.doi}` : `https://europepmc.org/article/${item.source}/${item.id}`,
          summary: item.abstractText?.substring(0, 500) || 'No abstract available',
          source: 'Europe PMC',
          impact_level: 'High'
        });
      }
    }

    return results;
  } catch (error) {
    console.error(`Error fetching from Europe PMC for "${query}":`, error);
    return [];
  }
}

async function fetchFromPubMed(query: string): Promise<ResearchItem[]> {
  try {
    // Use NCBI E-utilities API
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=20&retmode=json&sort=date`;
    
    console.log(`Fetching from PubMed: ${query}`);
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) return [];
    
    const searchData = await searchResponse.json();
    const idList = searchData.esearchresult?.idlist || [];
    
    if (idList.length === 0) return [];
    
    // Fetch details for the IDs
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.slice(0, 10).join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) return [];
    
    const summaryData = await summaryResponse.json();
    const results: ResearchItem[] = [];
    
    for (const id of idList.slice(0, 10)) {
      const article = summaryData.result?.[id];
      if (article) {
        results.push({
          title: article.title || 'Untitled Research',
          link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          summary: article.sortfirstauthor ? `By ${article.sortfirstauthor} - ${article.source || 'PubMed'}` : 'Research article',
          source: 'PubMed',
          impact_level: 'High'
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error fetching from PubMed for "${query}":`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    console.log('Starting research feed fetch...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const allItems: ResearchItem[] = []

    // Fetch from multiple sources
    for (const query of SEARCH_QUERIES.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
      const europePMCItems = await fetchFromEuropePMC(query);
      const pubMedItems = await fetchFromPubMed(query);
      
      allItems.push(...europePMCItems, ...pubMedItems);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Total items to process: ${allItems.length}`)

    // Upsert to database
    let insertedCount = 0;
    for (const item of allItems) {
      const { error } = await supabase
        .from('research_items')
        .upsert({
          title: item.title,
          link: item.link,
          summary: item.summary,
          source: item.source,
          impact_level: item.impact_level,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'link',
          ignoreDuplicates: false
        })

      if (!error) {
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} new research items`)

    // Fetch latest items to return
    const { data: latestItems } = await supabase
      .from('research_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${allItems.length} items, inserted ${insertedCount} new items`,
        data: latestItems || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in research-feed function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
