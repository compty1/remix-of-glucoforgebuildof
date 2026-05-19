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

// Free APIs - no authentication required
const BIORXIV_API = 'https://api.biorxiv.org/details/biorxiv';
const MEDRXIV_API = 'https://api.biorxiv.org/details/medrxiv';
const ARXIV_API = 'http://export.arxiv.org/api/query';

interface PreprintPaper {
  paper_id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal_name: string;
  publication_date: string;
  doi: string;
  source_database: string;
  diabetes_relevance_score: number;
  full_text_url: string;
  open_access: boolean;
}

// Fetch from bioRxiv/medRxiv API
async function fetchBioRxivData(server: 'biorxiv' | 'medrxiv'): Promise<PreprintPaper[]> {
  const papers: PreprintPaper[] = [];
  const apiUrl = server === 'biorxiv' ? BIORXIV_API : MEDRXIV_API;
  
  // Get papers from the last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    console.log(`[PREPRINT-FEED] Fetching from ${server}...`);
    
    const response = await tfetch(`${apiUrl}/${startDate}/${endDate}/0/100`);
    
    if (!response.ok) {
      console.error(`[PREPRINT-FEED] ${server} API error: ${response.status}`);
      return papers;
    }

    const data = await response.json();
    
    if (data.collection) {
      for (const paper of data.collection) {
        // Filter for diabetes-related papers
        const content = `${paper.title || ''} ${paper.abstract || ''}`.toLowerCase();
        
        if (content.includes('diabetes') || 
            content.includes('glucose') || 
            content.includes('insulin') ||
            content.includes('glycemic') ||
            content.includes('beta cell') ||
            content.includes('islet')) {
          
          // Calculate relevance score
          let relevanceScore = 5;
          if (content.includes('type 1 diabetes') || content.includes('t1d')) relevanceScore += 25;
          if (content.includes('type 2 diabetes') || content.includes('t2d')) relevanceScore += 15;
          if (content.includes('glucose monitoring')) relevanceScore += 20;
          if (content.includes('insulin')) relevanceScore += 15;
          if (content.includes('cure') || content.includes('reversal')) relevanceScore += 25;
          if (content.includes('stem cell') || content.includes('regeneration')) relevanceScore += 20;
          
          relevanceScore = Math.min(relevanceScore, 100);

          papers.push({
            paper_id: `${server}_${paper.doi?.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`,
            title: paper.title || 'Untitled',
            abstract: paper.abstract || 'No abstract available',
            authors: paper.authors ? paper.authors.split('; ').slice(0, 10) : [],
            journal_name: server === 'biorxiv' ? 'bioRxiv Preprint' : 'medRxiv Preprint',
            publication_date: paper.date || new Date().toISOString().split('T')[0],
            doi: paper.doi || '',
            source_database: server,
            diabetes_relevance_score: relevanceScore,
            full_text_url: `https://www.${server}.org/content/${paper.doi}`,
            open_access: true
          });
        }
      }
    }
    
    console.log(`[PREPRINT-FEED] Found ${papers.length} diabetes-related papers from ${server}`);
  } catch (error) {
    console.error(`[PREPRINT-FEED] Error fetching from ${server}:`, error);
  }

  return papers;
}

// Fetch from arXiv API (uses Atom XML format)
async function fetchArxivData(): Promise<PreprintPaper[]> {
  const papers: PreprintPaper[] = [];
  
  const searchQueries = [
    'diabetes glucose monitoring',
    'machine learning diabetes prediction',
    'continuous glucose monitoring artificial intelligence',
    'insulin delivery algorithm'
  ];

  for (const query of searchQueries) {
    try {
      console.log(`[PREPRINT-FEED] Fetching from arXiv: ${query}`);
      
      const encodedQuery = encodeURIComponent(query);
      const response = await tfetch(
        `${ARXIV_API}?search_query=all:${encodedQuery}&start=0&max_results=25&sortBy=lastUpdatedDate&sortOrder=descending`
      );

      if (!response.ok) {
        console.error(`[PREPRINT-FEED] arXiv API error: ${response.status}`);
        continue;
      }

      const xmlText = await response.text();
      
      // Parse XML entries (simple regex-based parsing for Deno)
      const entries = xmlText.split('<entry>').slice(1);
      
      for (const entry of entries) {
        const getTag = (tag: string) => {
          const match = entry.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`));
          return match ? match[1].trim() : '';
        };

        const title = getTag('title').replace(/\s+/g, ' ');
        const summary = getTag('summary').replace(/\s+/g, ' ');
        const published = getTag('published').split('T')[0];
        const updated = getTag('updated').split('T')[0];
        
        // Extract ID
        const idMatch = entry.match(/<id>([^<]+)<\/id>/);
        const arxivId = idMatch ? idMatch[1].split('/').pop() : '';
        
        // Extract authors
        const authorMatches = entry.matchAll(/<author>\s*<name>([^<]+)<\/name>/g);
        const authors = [...authorMatches].map(m => m[1]).slice(0, 10);

        if (title && arxivId) {
          // Calculate relevance
          const content = `${title} ${summary}`.toLowerCase();
          let relevanceScore = 5;
          
          if (content.includes('diabetes')) relevanceScore += 25;
          if (content.includes('glucose')) relevanceScore += 20;
          if (content.includes('insulin')) relevanceScore += 15;
          if (content.includes('prediction') || content.includes('machine learning')) relevanceScore += 10;
          
          relevanceScore = Math.min(relevanceScore, 100);

          papers.push({
            paper_id: `arxiv_${arxivId.replace(/[^a-zA-Z0-9.]/g, '_')}`,
            title: title,
            abstract: summary.substring(0, 2000),
            authors: authors,
            journal_name: 'arXiv Preprint',
            publication_date: published || updated,
            doi: '',
            source_database: 'arxiv',
            diabetes_relevance_score: relevanceScore,
            full_text_url: `https://arxiv.org/abs/${arxivId}`,
            open_access: true
          });
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[PREPRINT-FEED] Error fetching arXiv for "${query}":`, error);
    }
  }

  console.log(`[PREPRINT-FEED] Found ${papers.length} papers from arXiv`);
  return papers;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PREPRINT-RESEARCH-FEED] Starting preprint data aggregation');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from all preprint sources in parallel
    const [biorxivPapers, medrxivPapers, arxivPapers] = await Promise.all([
      fetchBioRxivData('biorxiv'),
      fetchBioRxivData('medrxiv'),
      fetchArxivData()
    ]);

    const allPapers = [...biorxivPapers, ...medrxivPapers, ...arxivPapers];

    // Deduplicate by paper_id
    const uniquePapers = allPapers.filter((paper, index, self) =>
      index === self.findIndex(p => p.paper_id === paper.paper_id)
    );

    console.log(`[PREPRINT-RESEARCH-FEED] Processing ${uniquePapers.length} unique preprints`);

    if (uniquePapers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No diabetes-related preprints found in the last 30 days',
          count: 0,
          sources: ['bioRxiv', 'medRxiv', 'arXiv']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert to medical_research_papers table
    const { error } = await supabaseClient
      .from('medical_research_papers')
      .upsert(uniquePapers, { onConflict: 'paper_id' });

    if (error) {
      console.error('[PREPRINT-RESEARCH-FEED] Database error:', error);
      throw error;
    }

    // Get source breakdown
    const sourceBreakdown = {
      biorxiv: biorxivPapers.length,
      medrxiv: medrxivPapers.length,
      arxiv: arxivPapers.length
    };

    // Fetch latest papers
    const { data: latestPapers } = await supabaseClient
      .from('medical_research_papers')
      .select('*')
      .in('source_database', ['biorxiv', 'medrxiv', 'arxiv'])
      .order('publication_date', { ascending: false })
      .limit(50);

    console.log('[PREPRINT-RESEARCH-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${uniquePapers.length} preprint papers`,
        count: uniquePapers.length,
        sources: sourceBreakdown,
        apis_used: [
          'https://api.biorxiv.org/',
          'https://api.medrxiv.org/',
          'http://export.arxiv.org/api/'
        ],
        timestamp: new Date().toISOString(),
        data: latestPapers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PREPRINT-RESEARCH-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
