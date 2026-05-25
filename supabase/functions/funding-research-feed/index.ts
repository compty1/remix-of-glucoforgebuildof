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

// NIH RePORTER API V2 - Free, no API key required
const NIH_REPORTER_API = 'https://api.reporter.nih.gov/v2/projects/search';

interface NIHProject {
  project_number: string;
  project_title: string;
  principal_investigator: string | null;
  organization: string | null;
  funding_amount: number | null;
  fiscal_year: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  abstract: string | null;
}

async function fetchNIHReporterData(): Promise<NIHProject[]> {
  const projects: NIHProject[] = [];
  
  // Search criteria for diabetes-related research
  const searchCriteria = {
    criteria: {
      advanced_text_search: {
        operator: "or",
        search_field: "all",
        search_text: "type 1 diabetes OR beta cell regeneration OR islet transplantation OR continuous glucose monitoring OR artificial pancreas OR insulin delivery OR immunotherapy diabetes"
      },
      fiscal_years: [2023, 2024, 2025, 2026],
      include_active_projects: true
    },
    offset: 0,
    limit: 100,
    sort_field: "fiscal_year",
    sort_order: "desc"
  };

  try {
    console.log('[NIH-REPORTER] Fetching diabetes research funding data...');
    
    const response = await tfetch(NIH_REPORTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(searchCriteria)
    });

    if (!response.ok) {
      console.error(`[NIH-REPORTER] API error: ${response.status}`);
      return projects;
    }

    const data = await response.json();
    
    if (data.results) {
      console.log(`[NIH-REPORTER] Found ${data.results.length} projects`);
      
      for (const project of data.results) {
        const projectNumber = project.project_num || project.core_project_num;
        if (!projectNumber) continue; // C80: drop rows without natural key
        // Extract principal investigator name
        let piName = 'Unknown';
        if (project.principal_investigators && project.principal_investigators.length > 0) {
          const pi = project.principal_investigators[0];
          piName = `${pi.first_name || ''} ${pi.last_name || ''}`.trim();
        }

        // Format dates
        const startDate = project.project_start_date 
          ? new Date(project.project_start_date).toISOString().split('T')[0]
          : null;
        const endDate = project.project_end_date
          ? new Date(project.project_end_date).toISOString().split('T')[0]
          : null;

        projects.push({
          project_number: projectNumber,
          project_title: project.project_title || 'Untitled Project',
          principal_investigator: piName,
          organization: project.organization?.org_name || 'Unknown Organization',
          funding_amount: project.award_amount || 0,
          fiscal_year: project.fiscal_year || new Date().getFullYear(),
          project_start_date: startDate,
          project_end_date: endDate,
          abstract: project.abstract_text || project.phr_text || 'No abstract available'
        });
      }
    }
  } catch (error) {
    console.error('[NIH-REPORTER] Error fetching data:', error);
  }

  return projects;
}

// Additional search for specific cure-related research
async function fetchCureResearchData(): Promise<NIHProject[]> {
  const projects: NIHProject[] = [];
  
  const cureSearchCriteria = {
    criteria: {
      advanced_text_search: {
        operator: "and",
        search_field: "all",
        search_text: "diabetes cure stem cell OR diabetes reversal OR beta cell replacement"
      },
      fiscal_years: [2022, 2023, 2024, 2025, 2026],
      include_active_projects: true
    },
    offset: 0,
    limit: 50,
    sort_field: "award_amount",
    sort_order: "desc"
  };

  try {
    console.log('[NIH-REPORTER] Fetching cure-focused research...');
    
    const response = await tfetch(NIH_REPORTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cureSearchCriteria)
    });

    if (!response.ok) {
      return projects;
    }

    const data = await response.json();
    
    if (data.results) {
      console.log(`[NIH-REPORTER] Found ${data.results.length} cure-focused projects`);
      
      for (const project of data.results) {
        const projectNumber = project.project_num || project.core_project_num;
        if (!projectNumber) continue;
        let piName = 'Unknown';
        if (project.principal_investigators && project.principal_investigators.length > 0) {
          const pi = project.principal_investigators[0];
          piName = `${pi.first_name || ''} ${pi.last_name || ''}`.trim();
        }

        const startDate = project.project_start_date 
          ? new Date(project.project_start_date).toISOString().split('T')[0]
          : null;
        const endDate = project.project_end_date
          ? new Date(project.project_end_date).toISOString().split('T')[0]
          : null;

        projects.push({
          project_number: projectNumber,
          project_title: project.project_title || 'Untitled Project',
          principal_investigator: piName,
          organization: project.organization?.org_name || 'Unknown Organization',
          funding_amount: project.award_amount || 0,
          fiscal_year: project.fiscal_year || new Date().getFullYear(),
          project_start_date: startDate,
          project_end_date: endDate,
          abstract: project.abstract_text || project.phr_text || 'No abstract available'
        });
      }
    }
  } catch (error) {
    console.error('[NIH-REPORTER] Error fetching cure research:', error);
  }

  return projects;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[FUNDING-RESEARCH-FEED] Starting NIH RePORTER data fetch');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from NIH RePORTER API
    const [generalProjects, cureProjects] = await Promise.all([
      fetchNIHReporterData(),
      fetchCureResearchData()
    ]);

    // Combine and deduplicate by project number
    const allProjects = [...generalProjects, ...cureProjects];
    const uniqueProjects = allProjects.filter((project, index, self) =>
      index === self.findIndex(p => p.project_number === project.project_number)
    );

    console.log(`[FUNDING-RESEARCH-FEED] Processing ${uniqueProjects.length} unique projects`);

    if (uniqueProjects.length === 0) {
      console.log('[FUNDING-RESEARCH-FEED] No projects found from NIH API, returning existing data');
      
      const { data: existingData } = await supabaseClient
        .from('research_funding')
        .select('*')
        .order('fiscal_year', { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No new data from NIH API, returning cached data',
          count: existingData?.length || 0,
          source: 'cache',
          data: existingData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert funding data
    const { error: fundingError } = await supabaseClient
      .from('research_funding')
      .upsert(uniqueProjects, { onConflict: 'project_number' });

    if (fundingError) {
      console.error('[FUNDING-RESEARCH-FEED] Funding data error:', fundingError);
      throw fundingError;
    }

    console.log(`[FUNDING-RESEARCH-FEED] Upserted ${uniqueProjects.length} funding records from NIH RePORTER`);

    // Fetch and return latest data
    const { data: latestFunding } = await supabaseClient
      .from('research_funding')
      .select('*')
      .order('fiscal_year', { ascending: false })
      .order('funding_amount', { ascending: false })
      .limit(50);

    // Calculate total funding
    const totalFunding = uniqueProjects.reduce((sum, p) => sum + (p.funding_amount || 0), 0);

    console.log('[FUNDING-RESEARCH-FEED] Successfully completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Research funding data updated from NIH RePORTER',
        count: uniqueProjects.length,
        total_funding: totalFunding,
        source: 'NIH RePORTER API',
        api_url: 'https://reporter.nih.gov/',
        timestamp: new Date().toISOString(),
        data: latestFunding
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FUNDING-RESEARCH-FEED] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
