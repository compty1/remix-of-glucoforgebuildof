import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAlex API - Free, no API key required
// Adding mailto parameter for faster response (polite pool)
const OPENALEX_BASE_URL = 'https://api.openalex.org/works';
const MAILTO_EMAIL = Deno.env.get('OPENALEX_CONTACT_EMAIL') || 'contact@glucoforge.app';

// Comprehensive diabetes and cure-focused search queries
const OPENALEX_QUERIES = [
  'type 1 diabetes cure',
  'beta cell regeneration',
  'islet transplantation',
  'continuous glucose monitoring',
  'artificial pancreas closed loop',
  'stem cell therapy diabetes',
  'immunotherapy type 1 diabetes',
  'glucose monitoring machine learning',
  'diabetes encapsulation therapy',
  'gene therapy diabetes treatment',
  'CAR-T diabetes autoimmune',
  'regulatory T cell diabetes'
];

interface OpenAlexWork {
  id: string;
  display_name: string;
  title?: string;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: Array<{
    author: { display_name: string };
    institutions: Array<{ display_name: string }>;
  }>;
  publication_date?: string;
  doi?: string;
  cited_by_count?: number;
  concepts?: Array<{ display_name: string; score: number }>;
  open_access?: { is_oa: boolean };
  primary_location?: {
    pdf_url?: string;
    source?: { display_name: string };
  };
  type?: string;
}

// Convert inverted index abstract to readable text
function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return '';
  
  const words: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([pos, word]);
    }
  }
  
  words.sort((a, b) => a[0] - b[0]);
  return words.map(([_, word]) => word).join(' ');
}

// Calculate diabetes relevance score based on concepts and keywords
function calculateRelevanceScore(work: OpenAlexWork): number {
  const diabetesKeywords = [
    'diabetes', 'glucose', 'insulin', 'pancreas', 'islet', 'beta cell',
    'glycemic', 'hyperglycemia', 'hypoglycemia', 'hba1c', 'cgm', 'pump'
  ];
  
  let score = 0;
  const title = (work.display_name || work.title || '').toLowerCase();
  const abstract = reconstructAbstract(work.abstract_inverted_index).toLowerCase();
  const text = `${title} ${abstract}`;
  
  // Check for keyword matches
  for (const keyword of diabetesKeywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }
  
  // Add score from concepts
  if (work.concepts) {
    for (const concept of work.concepts) {
      const conceptName = concept.display_name.toLowerCase();
      if (diabetesKeywords.some(kw => conceptName.includes(kw))) {
        score += concept.score * 20;
      }
    }
  }
  
  // Bonus for citation count (research impact)
  if (work.cited_by_count && work.cited_by_count > 10) {
    score += Math.min(work.cited_by_count / 10, 20);
  }
  
  return Math.min(Math.round(score), 100);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔬 Starting OpenAlex scholarly works aggregation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get date from 90 days ago for recent research
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const fromDate = ninetyDaysAgo.toISOString().split('T')[0];

    const allPapers: Array<{
      paper_id: string;
      title: string;
      abstract: string | null;
      authors: string[];
      publication_date: string | null;
      doi: string | null;
      citation_count: number | null;
      keywords: string[];
      open_access: boolean;
      pdf_url: string | null;
      journal_name: string | null;
      source_database: string;
      diabetes_relevance_score: number;
    }> = [];

    // Fetch from OpenAlex for each query
    for (const query of OPENALEX_QUERIES) {
      try {
        const params = new URLSearchParams({
          search: query,
          filter: `from_publication_date:${fromDate}`,
          sort: 'cited_by_count:desc',
          'per-page': '25',
          mailto: MAILTO_EMAIL
        });

        const response = await fetch(`${OPENALEX_BASE_URL}?${params}`);
        
        if (!response.ok) {
          console.error(`OpenAlex API error for "${query}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        const works: OpenAlexWork[] = data.results || [];
        
        console.log(`📚 Found ${works.length} works for "${query}"`);

        for (const work of works) {
          // Skip if no title
          if (!work.display_name && !work.title) continue;
          
          // Extract OpenAlex ID as paper_id
          const openalexId = work.id?.replace('https://openalex.org/', '') || '';
          if (!openalexId) continue;

          // Check for duplicates
          if (allPapers.some(p => p.paper_id === openalexId)) continue;

          // Extract authors
          const authors = (work.authorships || [])
            .map(a => a.author?.display_name)
            .filter(Boolean) as string[];

          // Extract concepts as keywords
          const keywords = (work.concepts || [])
            .filter(c => c.score > 0.3)
            .map(c => c.display_name);

          // Extract journal/source name
          const journalName = work.primary_location?.source?.display_name || null;

          allPapers.push({
            paper_id: openalexId,
            title: work.display_name || work.title || '',
            abstract: reconstructAbstract(work.abstract_inverted_index) || null,
            authors,
            publication_date: work.publication_date || null,
            doi: work.doi?.replace('https://doi.org/', '') || null,
            citation_count: work.cited_by_count || null,
            keywords,
            open_access: work.open_access?.is_oa || false,
            pdf_url: work.primary_location?.pdf_url || null,
            journal_name: journalName,
            source_database: 'openalex',
            diabetes_relevance_score: calculateRelevanceScore(work)
          });
        }

        // Small delay between queries to be polite to the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error fetching OpenAlex for "${query}":`, error);
      }
    }

    console.log(`📊 Total unique papers collected: ${allPapers.length}`);

    // Filter by relevance score (keep papers with score >= 20)
    const relevantPapers = allPapers.filter(p => p.diabetes_relevance_score >= 20);
    console.log(`🎯 Relevant papers (score >= 20): ${relevantPapers.length}`);

    // Insert into database with upsert
    if (relevantPapers.length > 0) {
      const { error: insertError } = await supabase
        .from('medical_research_papers')
        .upsert(
          relevantPapers.map(paper => ({
            paper_id: paper.paper_id,
            title: paper.title,
            abstract: paper.abstract,
            authors: paper.authors,
            publication_date: paper.publication_date,
            doi: paper.doi,
            citation_count: paper.citation_count,
            keywords: paper.keywords,
            open_access: paper.open_access,
            pdf_url: paper.pdf_url,
            journal_name: paper.journal_name,
            source_database: paper.source_database,
            diabetes_relevance_score: paper.diabetes_relevance_score,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'paper_id' }
        );

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
    }

    const result = {
      success: true,
      source: 'OpenAlex Scholarly Works API',
      queries_executed: OPENALEX_QUERIES.length,
      total_papers_found: allPapers.length,
      relevant_papers_inserted: relevantPapers.length,
      date_range: `${fromDate} to present`,
      timestamp: new Date().toISOString()
    };

    console.log('✅ OpenAlex aggregation complete:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ OpenAlex aggregation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'OpenAlex aggregation failed', 
        message: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
