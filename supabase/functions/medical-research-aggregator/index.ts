import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { fetchWithTimeout } from "../_shared/seedGuard.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

interface ResearchPaper {
  paper_id: string;
  title: string;
  abstract?: string;
  authors?: string[];
  journal_name?: string;
  publication_date?: string;
  doi?: string;
  pmid?: string;
  pmc_id?: string;
  europe_pmc_id?: string;
  study_type?: string;
  keywords?: string[];
  mesh_terms?: string[];
  citation_count?: number;
  impact_factor?: number;
  open_access?: boolean;
  pdf_url?: string;
  full_text_url?: string;
  source_database: string;
  diabetes_relevance_score?: number;
  device_mentions?: string[];
  drug_mentions?: string[];
  raw_data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting medical research aggregator process');

    const allPapers: ResearchPaper[] = [];

    // Fetch from Europe PMC API
    try {
      console.log('Fetching papers from Europe PMC');
      
      // Comprehensive diabetes research queries
      const queries = [
        'diabetes AND (device OR technology OR monitoring)',
        'continuous glucose monitoring',
        'insulin pump therapy',
        'diabetes management technology',
        'artificial pancreas',
        'beta cell regeneration diabetes',
        'stem cell therapy diabetes',
        'islet transplantation',
        'diabetes cure clinical trial',
        'immunotherapy type 1 diabetes',
        'closed loop insulin delivery',
        'glucose sensor wearable'
      ];

      for (const query of queries) {
        try {
          const europeUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=100&sort=RELEVANCE`;
          
          const response = await fetchWithTimeout(europeUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.resultList?.result) {
              for (const paper of data.resultList.result) {
                // Calculate diabetes relevance score based on content
                let relevanceScore = 1;
                const titleLower = (paper.title || '').toLowerCase();
                const abstractLower = (paper.abstractText || '').toLowerCase();
                
                if (titleLower.includes('diabetes') || titleLower.includes('glucose')) relevanceScore += 3;
                if (abstractLower.includes('type 1 diabetes') || abstractLower.includes('t1d')) relevanceScore += 2;
                if (titleLower.includes('device') || titleLower.includes('technology')) relevanceScore += 2;
                if (abstractLower.includes('continuous glucose monitoring') || abstractLower.includes('cgm')) relevanceScore += 2;
                if (abstractLower.includes('insulin pump')) relevanceScore += 2;
                
                relevanceScore = Math.min(relevanceScore, 10);

                // Extract device and drug mentions
                const deviceMentions: string[] = [];
                const drugMentions: string[] = [];
                const content = `${paper.title} ${paper.abstractText}`.toLowerCase();
                
                // Common diabetes devices
                const devices = ['dexcom', 'omnipod', 'medtronic', 'tandem', 'freestyle', 'guardian', 'enlite'];
                devices.forEach(device => {
                  if (content.includes(device)) deviceMentions.push(device);
                });
                
                // Common diabetes drugs
                const drugs = ['insulin', 'metformin', 'liraglutide', 'semaglutide', 'empagliflozin'];
                drugs.forEach(drug => {
                  if (content.includes(drug)) drugMentions.push(drug);
                });

                if (!paper.id) continue; // C80: drop papers without natural key
                const researchPaper: ResearchPaper = {
                  paper_id: paper.id,
                  title: paper.title || '',
                  abstract: paper.abstractText,
                  authors: paper.authorList?.author?.map((author: any) => 
                    `${author.firstName || ''} ${author.lastName || ''}`.trim()
                  ) || [],
                  journal_name: paper.journalInfo?.journal?.title,
                  publication_date: paper.firstPublicationDate,
                  doi: paper.doi,
                  pmid: paper.pmid,
                  pmc_id: paper.pmcid,
                  europe_pmc_id: paper.id,
                  study_type: paper.pubTypeList?.pubType?.[0]?.value,
                  keywords: paper.keywordList?.keyword || [],
                  mesh_terms: paper.meshHeadingList?.meshHeading?.map((mesh: any) => mesh.descriptorName) || [],
                  citation_count: paper.citedByCount || 0,
                  open_access: paper.isOpenAccess === 'Y',
                  pdf_url: paper.fullTextUrlList?.fullTextUrl?.find((url: any) => url.documentStyle === 'pdf')?.url,
                  full_text_url: paper.fullTextUrlList?.fullTextUrl?.find((url: any) => url.documentStyle === 'html')?.url,
                  source_database: 'europe_pmc',
                  diabetes_relevance_score: relevanceScore,
                  device_mentions: deviceMentions,
                  drug_mentions: drugMentions,
                  raw_data: paper
                };

                allPapers.push(researchPaper);
              }
            }
          }
        } catch (queryError) {
          console.error(`Error fetching Europe PMC for query ${query}:`, queryError);
        }
      }
    } catch (error) {
      console.error('Error fetching from Europe PMC:', error);
    }

    // Enhanced PubMed integration (using existing research-feed data and enhancing it)
    try {
      console.log('Enhancing existing PubMed data');
      
      // Get recent research items that need enhancement
      const { data: existingItems } = await supabase
        .from('research_items')
        .select('*')
        .is('diabetes_relevance_score', null)
        .limit(50);

      if (existingItems) {
        for (const item of existingItems) {
          // Calculate relevance score for existing items
          let relevanceScore = 1;
          const titleLower = (item.title || '').toLowerCase();
          const summaryLower = (item.summary || '').toLowerCase();
          
          if (titleLower.includes('diabetes') || titleLower.includes('glucose')) relevanceScore += 3;
          if (summaryLower.includes('type 1 diabetes') || summaryLower.includes('t1d')) relevanceScore += 2;
          if (titleLower.includes('device') || titleLower.includes('technology')) relevanceScore += 2;
          
          relevanceScore = Math.min(relevanceScore, 10);

          // Update existing research items with enhanced data
          await supabase
            .from('research_items')
            .update({
              diabetes_relevance_score: relevanceScore,
              study_type: 'Research Article',
              keywords: [item.source, 'diabetes'],
              raw_data: { enhanced: true, original_data: item }
            })
            .eq('id', item.id);
        }
      }
    } catch (error) {
      console.error('Error enhancing existing PubMed data:', error);
    }

    console.log(`Processing ${allPapers.length} research papers for database insertion`);

    // Remove duplicates by paper ID
    const uniquePapers = allPapers.filter((paper, index, self) => 
      index === self.findIndex(p => p.paper_id === paper.paper_id)
    );

    console.log(`After deduplication: ${uniquePapers.length} unique papers`);

    // Insert papers into database
    let insertedCount = 0;

    if (uniquePapers.length > 0) {
      const { data, error } = await supabase
        .from('medical_research_papers')
        .upsert(uniquePapers, { 
          onConflict: 'paper_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Database insertion error:', error);
      } else {
        insertedCount = uniquePapers.length;
        console.log(`Successfully processed ${insertedCount} research papers`);
      }
    }

    // Get latest papers from database
    const { data: latestPapers } = await supabase
      .from('medical_research_papers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const result = {
      success: true,
      message: `Processed ${insertedCount} research papers`,
      inserted: insertedCount,
      total_in_db: latestPapers?.length || 0,
      sources_monitored: ['europe_pmc', 'enhanced_pubmed'],
      queries_used: [
        'diabetes AND (device OR technology OR monitoring)',
        'continuous glucose monitoring',
        'insulin pump therapy',
        'diabetes management technology',
        'artificial pancreas'
      ],
      timestamp: new Date().toISOString(),
      data: latestPapers
    };

    console.log('Medical research aggregator completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in medical research aggregator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});