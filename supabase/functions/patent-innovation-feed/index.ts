import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// USPTO PatentsView API - Free, no API key required
const PATENTSVIEW_API = 'https://api.patentsview.org/patents/query';

interface PatentData {
  patent_id: string;
  title: string;
  abstract: string;
  inventors: string[];
  assignee: string;
  patent_date: string;
  diabetes_relevance_score: number;
  patent_url: string;
}

async function fetchPatentsViewData(query: string): Promise<PatentData[]> {
  const patents: PatentData[] = [];
  
  try {
    console.log(`[PATENTSVIEW] Fetching patents for: ${query}`);
    
    // PatentsView API query format
    const requestBody = {
      q: {
        _or: [
          { _text_any: { patent_title: query } },
          { _text_any: { patent_abstract: query } }
        ]
      },
      f: [
        "patent_number",
        "patent_title",
        "patent_abstract",
        "patent_date",
        "inventor_first_name",
        "inventor_last_name",
        "assignee_organization"
      ],
      o: {
        page: 1,
        per_page: 50
      },
      s: [{ patent_date: "desc" }]
    };

    const response = await fetch(PATENTSVIEW_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`[PATENTSVIEW] API error: ${response.status}`);
      return patents;
    }

    const data = await response.json();
    
    if (data.patents) {
      console.log(`[PATENTSVIEW] Found ${data.patents.length} patents for "${query}"`);
      
      for (const patent of data.patents) {
        // Extract inventors
        const inventors: string[] = [];
        if (patent.inventors) {
          for (const inv of patent.inventors) {
            const name = `${inv.inventor_first_name || ''} ${inv.inventor_last_name || ''}`.trim();
            if (name) inventors.push(name);
          }
        }

        // Extract assignee
        let assignee = 'Unknown Assignee';
        if (patent.assignees && patent.assignees.length > 0) {
          assignee = patent.assignees[0].assignee_organization || 'Unknown Assignee';
        }

        // Calculate relevance score based on title and abstract
        let relevanceScore = 5;
        const content = `${patent.patent_title || ''} ${patent.patent_abstract || ''}`.toLowerCase();
        
        if (content.includes('diabetes')) relevanceScore += 20;
        if (content.includes('glucose')) relevanceScore += 15;
        if (content.includes('insulin')) relevanceScore += 15;
        if (content.includes('pancreas') || content.includes('pancreatic')) relevanceScore += 10;
        if (content.includes('monitoring') || content.includes('sensor')) relevanceScore += 10;
        if (content.includes('continuous')) relevanceScore += 10;
        if (content.includes('blood sugar')) relevanceScore += 10;
        if (content.includes('wearable')) relevanceScore += 5;
        
        relevanceScore = Math.min(relevanceScore, 100);

        patents.push({
          patent_id: `US${patent.patent_number}`,
          title: patent.patent_title || 'Untitled Patent',
          abstract: patent.patent_abstract || 'No abstract available',
          inventors: inventors.slice(0, 5),
          assignee: assignee,
          patent_date: patent.patent_date || new Date().toISOString().split('T')[0],
          diabetes_relevance_score: relevanceScore,
          patent_url: `https://patents.google.com/patent/US${patent.patent_number}`
        });
      }
    }
  } catch (error) {
    console.error(`[PATENTSVIEW] Error fetching patents for "${query}":`, error);
  }

  return patents;
}

// Fetch from Google Patents (via search page scraping alternative - using direct links)
async function fetchRecentDiabetesPatents(): Promise<PatentData[]> {
  const searchTerms = [
    'diabetes glucose monitoring',
    'insulin delivery system',
    'continuous glucose sensor',
    'artificial pancreas',
    'blood glucose meter',
    'diabetes wearable device'
  ];

  const allPatents: PatentData[] = [];

  for (const term of searchTerms) {
    const patents = await fetchPatentsViewData(term);
    allPatents.push(...patents);
    
    // Rate limiting - PatentsView recommends 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allPatents;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PATENT-INNOVATION-FEED] Starting USPTO PatentsView data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from USPTO PatentsView API
    const patents = await fetchRecentDiabetesPatents();

    // Deduplicate by patent_id
    const uniquePatents = patents.filter((patent, index, self) =>
      index === self.findIndex(p => p.patent_id === patent.patent_id)
    );

    console.log(`[PATENT-INNOVATION-FEED] Processing ${uniquePatents.length} unique patents`);

    if (uniquePatents.length === 0) {
      console.log('[PATENT-INNOVATION-FEED] No patents found from USPTO API, returning existing data');
      
      const { data: existingData } = await supabaseClient
        .from('patent_data')
        .select('*')
        .order('patent_date', { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new data from USPTO API, returning cached data',
          count: existingData?.length || 0,
          source: 'cache',
          data: existingData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert patent data
    const { error: patentError } = await supabaseClient
      .from('patent_data')
      .upsert(uniquePatents, { onConflict: 'patent_id' });

    if (patentError) {
      console.error('[PATENT-INNOVATION-FEED] Patent data error:', patentError);
      throw patentError;
    }

    console.log(`[PATENT-INNOVATION-FEED] Upserted ${uniquePatents.length} patent records from USPTO PatentsView`);

    // Fetch and return latest data
    const { data: latestPatents } = await supabaseClient
      .from('patent_data')
      .select('*')
      .order('patent_date', { ascending: false })
      .limit(50);

    // Get top assignees
    const assigneeCounts: Record<string, number> = {};
    for (const patent of uniquePatents) {
      assigneeCounts[patent.assignee] = (assigneeCounts[patent.assignee] || 0) + 1;
    }
    const topAssignees = Object.entries(assigneeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    console.log('[PATENT-INNOVATION-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Patent data updated from USPTO PatentsView',
        count: uniquePatents.length,
        top_assignees: topAssignees,
        source: 'USPTO PatentsView API',
        api_url: 'https://patentsview.org/',
        timestamp: new Date().toISOString(),
        data: latestPatents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PATENT-INNOVATION-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
