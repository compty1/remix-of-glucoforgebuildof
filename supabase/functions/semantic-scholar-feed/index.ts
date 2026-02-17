import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Diabetes/T1D-focused search queries for Semantic Scholar
const SEMANTIC_SCHOLAR_QUERIES = [
  'type 1 diabetes cure',
  'beta cell regeneration diabetes',
  'islet transplantation outcomes',
  'artificial pancreas closed loop system',
  'continuous glucose monitoring accuracy',
  'stem cell therapy diabetes treatment',
  'immunotherapy autoimmune diabetes',
  'diabetes gene therapy CRISPR',
  'encapsulated islet cells transplant',
  'regulatory T cells type 1 diabetes',
  'CAR-T therapy diabetes',
  'glucose sensor nanotechnology'
];

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  authors?: Array<{ authorId: string; name: string }>;
  year?: number;
  venue?: string;
  publicationDate?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  tldr?: { text: string };
  openAccessPdf?: { url: string };
  fieldsOfStudy?: string[];
  externalIds?: {
    DOI?: string;
    PubMed?: string;
    ArXiv?: string;
    DBLP?: string;
  };
}

interface SemanticScholarResponse {
  total: number;
  data: SemanticScholarPaper[];
}

// Calculate diabetes relevance score based on content
function calculateRelevanceScore(paper: SemanticScholarPaper): number {
  let score = 0;
  const text = `${paper.title || ''} ${paper.abstract || ''} ${paper.tldr?.text || ''}`.toLowerCase();
  
  // High-value keywords
  const highValueKeywords = ['type 1 diabetes', 't1d', 'beta cell', 'islet', 'insulin', 'autoimmune diabetes'];
  const mediumValueKeywords = ['glucose', 'pancreas', 'glycemic', 'hyperglycemia', 'hypoglycemia', 'cgm'];
  const lowValueKeywords = ['diabetes', 'metabolic', 'endocrine', 'blood sugar'];

  highValueKeywords.forEach(kw => {
    if (text.includes(kw)) score += 30;
  });
  
  mediumValueKeywords.forEach(kw => {
    if (text.includes(kw)) score += 15;
  });
  
  lowValueKeywords.forEach(kw => {
    if (text.includes(kw)) score += 5;
  });

  // Bonus for fields of study
  if (paper.fieldsOfStudy?.some(f => 
    f.toLowerCase().includes('medicine') || 
    f.toLowerCase().includes('biology')
  )) {
    score += 10;
  }

  // Bonus for high citations (indicates influential research)
  if (paper.citationCount && paper.citationCount > 100) score += 10;
  if (paper.influentialCitationCount && paper.influentialCitationCount > 10) score += 15;

  // Bonus for having TLDR (AI-analyzed)
  if (paper.tldr?.text) score += 5;

  return Math.min(100, score);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔬 Starting Semantic Scholar feed aggregation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allPapers: SemanticScholarPaper[] = [];
    const seenPaperIds = new Set<string>();

    // Semantic Scholar API fields to request
    const fields = [
      'paperId',
      'title',
      'abstract',
      'authors',
      'year',
      'venue',
      'publicationDate',
      'citationCount',
      'influentialCitationCount',
      'tldr',
      'openAccessPdf',
      'fieldsOfStudy',
      'externalIds'
    ].join(',');

    // Fetch papers for each query
    for (const query of SEMANTIC_SCHOLAR_QUERIES) {
      try {
        console.log(`📚 Searching Semantic Scholar for: "${query}"`);
        
        const url = new URL('https://api.semanticscholar.org/graph/v1/paper/search');
        url.searchParams.set('query', query);
        url.searchParams.set('fields', fields);
        url.searchParams.set('limit', '50');
        url.searchParams.set('year', '2023-'); // Recent papers only

        const response = await fetch(url.toString(), {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Semantic Scholar API error for "${query}": ${response.status} - ${errorText}`);
          
          // Handle rate limiting
          if (response.status === 429) {
            console.log('⏳ Rate limited, waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          continue;
        }

        const data: SemanticScholarResponse = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          for (const paper of data.data) {
            if (!seenPaperIds.has(paper.paperId) && paper.title) {
              seenPaperIds.add(paper.paperId);
              allPapers.push(paper);
            }
          }
          console.log(`✅ Found ${data.data.length} papers for "${query}" (${allPapers.length} total unique)`);
        }

        // Respect rate limits - Semantic Scholar requires longer delays without API key
        // Unauthenticated: ~100 requests per 5 minutes = ~1 request per 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3500));

      } catch (error) {
        console.error(`❌ Error fetching papers for "${query}":`, error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Extra delay on error
      }
    }

    console.log(`📊 Total unique papers collected: ${allPapers.length}`);

    // Filter by relevance and prepare for database
    const relevantPapers = allPapers
      .map(paper => ({
        paper,
        relevanceScore: calculateRelevanceScore(paper)
      }))
      .filter(({ relevanceScore }) => relevanceScore >= 20)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`📈 Papers meeting relevance threshold (≥20): ${relevantPapers.length}`);

    // Upsert papers to database
    let insertedCount = 0;
    let updatedCount = 0;

    for (const { paper, relevanceScore } of relevantPapers) {
      try {
        // Check if paper already exists by DOI or paper_id
        let existingPaper = null;
        
        if (paper.externalIds?.DOI) {
          const { data } = await supabase
            .from('medical_research_papers')
            .select('id, source_database')
            .eq('doi', paper.externalIds.DOI)
            .maybeSingle();
          existingPaper = data;
        }

        if (!existingPaper) {
          const { data } = await supabase
            .from('medical_research_papers')
            .select('id, source_database')
            .eq('paper_id', `s2:${paper.paperId}`)
            .maybeSingle();
          existingPaper = data;
        }

        const paperData = {
          paper_id: `s2:${paper.paperId}`,
          title: paper.title,
          abstract: paper.abstract || null,
          authors: paper.authors?.map(a => a.name) || null,
          journal_name: paper.venue || null,
          publication_date: paper.publicationDate || null,
          doi: paper.externalIds?.DOI || null,
          pmid: paper.externalIds?.PubMed || null,
          citation_count: paper.citationCount || null,
          influential_citation_count: paper.influentialCitationCount || null,
          tldr_summary: paper.tldr?.text || null,
          semantic_scholar_id: paper.paperId,
          fields_of_study: paper.fieldsOfStudy || null,
          open_access: paper.openAccessPdf?.url ? true : false,
          pdf_url: paper.openAccessPdf?.url || null,
          source_database: 'semantic_scholar',
          diabetes_relevance_score: relevanceScore,
          updated_at: new Date().toISOString(),
        };

        if (existingPaper) {
          // Update existing paper with Semantic Scholar-specific fields
          const { error } = await supabase
            .from('medical_research_papers')
            .update({
              tldr_summary: paperData.tldr_summary,
              influential_citation_count: paperData.influential_citation_count,
              semantic_scholar_id: paperData.semantic_scholar_id,
              fields_of_study: paperData.fields_of_study,
              citation_count: paperData.citation_count,
              updated_at: paperData.updated_at,
            })
            .eq('id', existingPaper.id);

          if (error) throw error;
          updatedCount++;
        } else {
          // Insert new paper
          const { error } = await supabase
            .from('medical_research_papers')
            .insert({
              ...paperData,
              created_at: new Date().toISOString(),
            });

          if (error) {
            if (error.code === '23505') {
              // Duplicate key - skip
              console.log(`⏭️ Skipping duplicate: ${paper.title.substring(0, 50)}...`);
            } else {
              throw error;
            }
          } else {
            insertedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error upserting paper "${paper.title?.substring(0, 50)}...":`, error);
      }
    }

    // Count papers with TLDR summaries
    const papersWithTldr = relevantPapers.filter(p => p.paper.tldr?.text).length;
    const papersWithInfluentialCitations = relevantPapers.filter(
      p => p.paper.influentialCitationCount && p.paper.influentialCitationCount > 0
    ).length;

    const summary = {
      source: 'Semantic Scholar',
      timestamp: new Date().toISOString(),
      queries_executed: SEMANTIC_SCHOLAR_QUERIES.length,
      total_papers_fetched: allPapers.length,
      papers_meeting_relevance_threshold: relevantPapers.length,
      inserted: insertedCount,
      updated: updatedCount,
      papers_with_tldr_summary: papersWithTldr,
      papers_with_influential_citations: papersWithInfluentialCitations,
      unique_features: [
        'AI-generated TLDR summaries',
        'Influential citation tracking',
        'Fields of study categorization'
      ]
    };

    console.log('✅ Semantic Scholar feed completed:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Semantic Scholar feed failed:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Semantic Scholar data',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
