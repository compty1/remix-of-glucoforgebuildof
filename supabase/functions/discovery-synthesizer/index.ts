import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIp);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (clientData.count >= RATE_LIMIT_REQUESTS) return false;
  clientData.count++;
  return true;
}

function calculateCredibilityScore(factors: any): number {
  let score = 50;
  
  if (factors.peer_reviewed) score += 30;
  if (factors.source === 'PubMed' || factors.source === 'Europe PMC') score += 15;
  if (factors.recency_years) score -= Math.min(factors.recency_years * 3, 15);
  if (factors.impact_level === 'High') score += 10;
  if (factors.biological_plausibility === 'high') score += 15;
  else if (factors.biological_plausibility === 'medium') score += 8;
  
  return Math.max(0, Math.min(100, score));
}

function categorizeResearch(item: any): string {
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  
  if (/(cgm|dexcom|libre|pump|omnipod|tandem|sensor|monitor|device)/i.test(text)) {
    return 'device';
  }
  if (/(insulin|drug|medication|therapy.*drug|teplizumab)/i.test(text)) {
    return 'medication';
  }
  if (/(treatment|therapy|intervention|clinical)/i.test(text)) {
    return 'treatment';
  }
  if (/(ai|algorithm|machine learning|predict|software|app)/i.test(text)) {
    return 'technology';
  }
  if (/(prevent|risk|predict.*onset|delay|screening)/i.test(text)) {
    return 'prevention';
  }
  if (/(cure|breakthrough|stem cell|immunotherapy|beta cell)/i.test(text)) {
    return 'cure_research';
  }
  
  return 'research';
}

function determineImpactLevel(item: any): string {
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  
  if (/(breakthrough|cure|revolutionary|significant|major|novel)/i.test(text)) {
    return 'Breakthrough';
  }
  if (/(clinical trial|phase|promising|effective|improve)/i.test(text)) {
    return 'High';
  }
  return 'Medium';
}

function getYearsSince(dateString: string | null): number {
  if (!dateString) return 5;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365));
}

async function callLovableAI(systemPrompt: string, userContent: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.warn('LOVABLE_API_KEY not configured, skipping AI analysis');
    return null;
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Lovable AI error:', response.status);
      return null;
    }

    const data = await response.json();
    let analysisText = data.choices[0].message.content;
    
    // Strip markdown code blocks
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(analysisText);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

async function synthesizeFromResearchItems(supabase: any) {
  console.log('📚 Synthesizing research items...');
  
  const { data: items, error } = await supabase
    .from('research_items')
    .select('*')
    .is('diabetes_relevance_score', null)
    .limit(20);

  if (error || !items || items.length === 0) {
    console.log('No unprocessed research items found');
    return [];
  }

  console.log(`Found ${items.length} research items to process`);
  const discoveries = [];

  for (const item of items) {
    // Check for duplicates
    const { data: existing } = await supabase
      .from('discoveries')
      .select('id')
      .eq('title', item.title)
      .single();

    if (existing) {
      console.log(`Skipping duplicate: ${item.title}`);
      await supabase
        .from('research_items')
        .update({ diabetes_relevance_score: 100 })
        .eq('id', item.id);
      continue;
    }

    // AI analysis
    const systemPrompt = `Analyze this Type 1 Diabetes research and return JSON:
{
  "summary": "2-3 sentence summary",
  "biological_plausibility": "high" | "medium" | "low",
  "key_findings": ["finding1", "finding2"],
  "clinical_relevance": string,
  "confidence": number (0-100)
}`;

    const aiAnalysis = await callLovableAI(systemPrompt, JSON.stringify({
      title: item.title,
      summary: item.summary,
      source: item.source
    }));

    const category = categorizeResearch(item);
    const impactLevel = determineImpactLevel(item);
    const recencyYears = getYearsSince(item.publication_date);

    const credibilityScore = calculateCredibilityScore({
      peer_reviewed: true,
      source: item.source,
      recency_years: recencyYears,
      impact_level: impactLevel,
      biological_plausibility: aiAnalysis?.biological_plausibility || 'medium'
    });

    discoveries.push({
      title: item.title,
      summary: aiAnalysis?.summary || item.summary || 'Research finding',
      full_text: aiAnalysis?.clinical_relevance || item.summary || '',
      discovery_type: 'research_paper',
      category: category,
      impact_level: impactLevel,
      credibility_score: credibilityScore,
      credibility_factors: {
        peer_reviewed: true,
        source: item.source,
        recency_years: recencyYears,
        biological_plausibility: aiAnalysis?.biological_plausibility || 'medium'
      },
      primary_source: item.source,
      source_urls: [item.link],
      ai_analysis: aiAnalysis,
      publication_date: item.publication_date || new Date().toISOString().split('T')[0],
      discovered_at: new Date().toISOString(),
      last_validated_at: new Date().toISOString()
    });

    // Mark as processed
    await supabase
      .from('research_items')
      .update({ diabetes_relevance_score: credibilityScore })
      .eq('id', item.id);
  }

  console.log(`✅ Synthesized ${discoveries.length} research discoveries`);
  return discoveries;
}

async function synthesizeFromClinicalTrials(supabase: any) {
  console.log('🧪 Synthesizing clinical trials...');
  
  const { data: trials, error } = await supabase
    .from('clinical_trials_detailed')
    .select('*')
    .is('raw_data', null)
    .limit(10);

  if (error || !trials || trials.length === 0) {
    console.log('No unprocessed clinical trials found');
    return [];
  }

  console.log(`Found ${trials.length} clinical trials to process`);
  const discoveries = [];

  for (const trial of trials) {
    const { data: existing } = await supabase
      .from('discoveries')
      .select('id')
      .eq('title', trial.title)
      .single();

    if (existing) {
      console.log(`Skipping duplicate trial: ${trial.title}`);
      await supabase
        .from('clinical_trials_detailed')
        .update({ raw_data: { processed: true } })
        .eq('id', trial.id);
      continue;
    }

    const systemPrompt = `Analyze this Type 1 Diabetes clinical trial:
{
  "significance": string,
  "breakthrough_potential": "high" | "medium" | "low",
  "patient_impact": string,
  "confidence": number (0-100)
}`;

    const aiAnalysis = await callLovableAI(systemPrompt, JSON.stringify({
      title: trial.title,
      phase: trial.phase,
      status: trial.overall_status,
      summary: trial.brief_summary,
      enrollment: trial.enrollment_count
    }));

    const impactLevel = trial.phase === 'Phase 3' ? 'High' : 
                       trial.phase === 'Phase 2' ? 'Medium' : 'Low';

    const credibilityScore = calculateCredibilityScore({
      clinical_trial_backed: true,
      phase: trial.phase,
      enrollment: trial.enrollment_count,
      biological_plausibility: aiAnalysis?.breakthrough_potential || 'medium'
    });

    discoveries.push({
      title: trial.title,
      summary: aiAnalysis?.significance || trial.brief_summary || 'Clinical trial',
      full_text: aiAnalysis?.patient_impact || trial.detailed_description || '',
      discovery_type: 'clinical_trial',
      category: 'treatment',
      impact_level: impactLevel,
      credibility_score: credibilityScore,
      credibility_factors: {
        clinical_trial_backed: true,
        phase: trial.phase,
        enrollment_count: trial.enrollment_count,
        multi_center: (trial.location_countries?.length || 0) > 1
      },
      primary_source: trial.source_registry,
      source_urls: [trial.study_url],
      ai_analysis: aiAnalysis,
      publication_date: trial.start_date || new Date().toISOString().split('T')[0],
      discovered_at: new Date().toISOString(),
      last_validated_at: new Date().toISOString()
    });

    await supabase
      .from('clinical_trials_detailed')
      .update({ raw_data: { processed: true, credibility: credibilityScore } })
      .eq('id', trial.id);
  }

  console.log(`✅ Synthesized ${discoveries.length} clinical trial discoveries`);
  return discoveries;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔄 Starting discovery synthesis...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const researchDiscoveries = await synthesizeFromResearchItems(supabase);
    const trialDiscoveries = await synthesizeFromClinicalTrials(supabase);

    const allDiscoveries = [...researchDiscoveries, ...trialDiscoveries];

    if (allDiscoveries.length > 0) {
      console.log(`💾 Inserting ${allDiscoveries.length} new discoveries...`);
      const { error: insertError } = await supabase
        .from('discoveries')
        .insert(allDiscoveries);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Synthesis complete');

    return new Response(
      JSON.stringify({
        success: true,
        research_synthesized: researchDiscoveries.length,
        trials_synthesized: trialDiscoveries.length,
        total_discoveries: allDiscoveries.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Synthesis failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Discovery synthesis failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
