import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

const requestSchema = z.object({
  limit: z.number().int().min(1).max(100).optional()
}).optional();

interface ClinicalTrial {
  nct_id: string;
  title: string;
  brief_summary?: string;
  detailed_description?: string;
  phase?: string;
  study_type?: string;
  overall_status?: string;
  primary_purpose?: string;
  intervention_type?: string;
  sponsor_name?: string;
  lead_sponsor_class?: string;
  start_date?: string;
  completion_date?: string;
  enrollment_count?: number;
  location_countries?: string[];
  conditions?: string[];
  interventions?: string[];
  primary_outcomes?: string[];
  secondary_outcomes?: string[];
  eligibility_criteria?: string;
  min_age?: string;
  max_age?: string;
  gender?: string;
  source_registry: string;
  study_url?: string;
  last_update_date?: string;
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

    console.log('Starting enhanced clinical trials fetch process');

    const allTrials: ClinicalTrial[] = [];

    // Fetch from ClinicalTrials.gov API
    try {
      console.log('Fetching trials from ClinicalTrials.gov API');
      
      // Comprehensive diabetes-specific queries including cure-focused searches
      const queries = [
        'type+1+diabetes',
        'diabetes+device',
        'continuous+glucose+monitoring',
        'insulin+pump',
        'diabetes+technology',
        'beta+cell+regeneration',
        'islet+transplantation',
        'stem+cell+diabetes',
        'diabetes+cure',
        'diabetes+reversal',
        'immunotherapy+diabetes',
        'artificial+pancreas'
      ];

      for (const query of queries) {
        const apiUrl = `https://clinicaltrials.gov/api/query/full_studies?expr=${encodeURIComponent(query)}&min_rnk=1&max_rnk=50&fmt=json`;
        
        try {
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.FullStudiesResponse?.FullStudies) {
              for (const study of data.FullStudiesResponse.FullStudies) {
                const studyData = study.Study;
                const protocolSection = studyData.ProtocolSection;
                const identificationModule = protocolSection?.IdentificationModule;
                const statusModule = protocolSection?.StatusModule;
                const designModule = protocolSection?.DesignModule;
                const armsInterventionsModule = protocolSection?.ArmsInterventionsModule;
                const outcomesModule = protocolSection?.OutcomesModule;
                const eligibilityModule = protocolSection?.EligibilityModule;
                const contactsLocationsModule = protocolSection?.ContactsLocationsModule;
                const sponsorCollaboratorsModule = protocolSection?.SponsorCollaboratorsModule;

                // Extract conditions
                const conditions: string[] = [];
                if (identificationModule?.ConditionList?.Condition) {
                  conditions.push(...identificationModule.ConditionList.Condition);
                }

                // Extract interventions
                const interventions: string[] = [];
                if (armsInterventionsModule?.InterventionList?.Intervention) {
                  for (const intervention of armsInterventionsModule.InterventionList.Intervention) {
                    interventions.push(intervention.InterventionName || intervention.InterventionDescription);
                  }
                }

                // Extract countries
                const countries: string[] = [];
                if (contactsLocationsModule?.LocationList?.Location) {
                  for (const location of contactsLocationsModule.LocationList.Location) {
                    if (location.LocationCountry && !countries.includes(location.LocationCountry)) {
                      countries.push(location.LocationCountry);
                    }
                  }
                }

                // Extract outcomes
                const primaryOutcomes: string[] = [];
                const secondaryOutcomes: string[] = [];
                
                if (outcomesModule?.PrimaryOutcomeList?.PrimaryOutcome) {
                  for (const outcome of outcomesModule.PrimaryOutcomeList.PrimaryOutcome) {
                    primaryOutcomes.push(outcome.PrimaryOutcomeMeasure);
                  }
                }
                
                if (outcomesModule?.SecondaryOutcomeList?.SecondaryOutcome) {
                  for (const outcome of outcomesModule.SecondaryOutcomeList.SecondaryOutcome) {
                    secondaryOutcomes.push(outcome.SecondaryOutcomeMeasure);
                  }
                }

                const trial: ClinicalTrial = {
                  nct_id: identificationModule?.NCTId || `trial_${Date.now()}_${Math.random()}`,
                  title: identificationModule?.BriefTitle || '',
                  brief_summary: identificationModule?.BriefSummary,
                  detailed_description: identificationModule?.DetailedDescription,
                  phase: designModule?.PhaseList?.Phase?.[0],
                  study_type: designModule?.StudyType,
                  overall_status: statusModule?.OverallStatus,
                  primary_purpose: designModule?.DesignInfo?.DesignPrimaryPurpose,
                  intervention_type: armsInterventionsModule?.InterventionList?.Intervention?.[0]?.InterventionType,
                  sponsor_name: sponsorCollaboratorsModule?.LeadSponsor?.LeadSponsorName,
                  lead_sponsor_class: sponsorCollaboratorsModule?.LeadSponsor?.LeadSponsorClass,
                  start_date: statusModule?.StartDateStruct?.StartDate,
                  completion_date: statusModule?.CompletionDateStruct?.CompletionDate,
                  enrollment_count: statusModule?.EnrollmentInfo?.EnrollmentCount,
                  location_countries: countries,
                  conditions: conditions,
                  interventions: interventions,
                  primary_outcomes: primaryOutcomes,
                  secondary_outcomes: secondaryOutcomes,
                  eligibility_criteria: eligibilityModule?.EligibilityCriteria,
                  min_age: eligibilityModule?.MinimumAge,
                  max_age: eligibilityModule?.MaximumAge,
                  gender: eligibilityModule?.Gender,
                  source_registry: 'clinicaltrials.gov',
                  study_url: `https://clinicaltrials.gov/ct2/show/${identificationModule?.NCTId}`,
                  last_update_date: statusModule?.LastUpdatePostDateStruct?.LastUpdatePostDate,
                  raw_data: studyData
                };

                allTrials.push(trial);
              }
            }
          }
        } catch (queryError) {
          console.error(`Error fetching trials for query ${query}:`, queryError);
        }
      }
    } catch (error) {
      console.error('Error fetching from ClinicalTrials.gov:', error);
    }

    // TODO: Add WHO ICTRP and EU Clinical Trials Register when their APIs are available
    // For now, we focus on the robust ClinicalTrials.gov API

    console.log(`Processing ${allTrials.length} clinical trials for database insertion`);

    // Remove duplicates by NCT ID
    const uniqueTrials = allTrials.filter((trial, index, self) => 
      index === self.findIndex(t => t.nct_id === trial.nct_id)
    );

    console.log(`After deduplication: ${uniqueTrials.length} unique trials`);

    // Insert trials into database
    let insertedCount = 0;

    if (uniqueTrials.length > 0) {
      const { data, error } = await supabase
        .from('clinical_trials_detailed')
        .upsert(uniqueTrials, { 
          onConflict: 'nct_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Database insertion error:', error);
      } else {
        insertedCount = uniqueTrials.length;
        console.log(`Successfully processed ${insertedCount} clinical trials`);
      }
    }

    // Get latest trials from database
    const { data: latestTrials } = await supabase
      .from('clinical_trials_detailed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const result = {
      success: true,
      message: `Processed ${insertedCount} clinical trials`,
      inserted: insertedCount,
      total_in_db: latestTrials?.length || 0,
      sources_monitored: ['clinicaltrials.gov'],
      queries_used: ['type 1 diabetes', 'diabetes device', 'continuous glucose monitoring', 'insulin pump', 'diabetes technology'],
      timestamp: new Date().toISOString(),
      data: latestTrials
    };

    console.log('Enhanced clinical trials fetch completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced clinical trials feed:', error);
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