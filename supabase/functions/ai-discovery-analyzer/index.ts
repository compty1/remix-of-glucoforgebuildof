import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAuth, requireJsonContentType } from "../_shared/auth.ts";

import { fetchWithTimeout } from "../_shared/seedGuard.ts";
const RATE_LIMIT_REQUESTS = 30;
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

interface CredibilityFactors {
  peer_reviewed?: boolean;
  multiple_sources?: number;
  clinical_trial_backed?: boolean;
  community_validation?: number;
  fda_approved?: boolean;
  cross_referenced?: number;
  author_reputation?: number;
  recency_years?: number;
  phase?: string;
  multi_center?: boolean;
  enrollment?: number;
  impact_factor?: number;
  citation_count?: number;
  biological_plausibility?: string;
}

function calculateCredibilityScore(factors: CredibilityFactors): number {
  let score = 50; // Baseline
  
  if (factors.peer_reviewed) score += 30;
  if (factors.multiple_sources) score += Math.min(factors.multiple_sources * 5, 20);
  if (factors.clinical_trial_backed) score += 25;
  if (factors.community_validation && factors.community_validation > 100) score += 15;
  if (factors.fda_approved) score += 20;
  if (factors.cross_referenced) score += Math.min(factors.cross_referenced * 5, 10);
  if (factors.author_reputation) score += factors.author_reputation;
  if (factors.recency_years) score -= Math.min(factors.recency_years * 5, 15);
  
  // Additional factors
  if (factors.phase === 'Phase 3') score += 15;
  else if (factors.phase === 'Phase 2') score += 10;
  else if (factors.phase === 'Phase 1') score += 5;
  
  if (factors.multi_center) score += 8;
  if (factors.enrollment && factors.enrollment > 100) score += 10;
  if (factors.impact_factor && factors.impact_factor > 5) score += 12;
  if (factors.citation_count && factors.citation_count > 50) score += 8;
  
  if (factors.biological_plausibility === 'high') score += 15;
  else if (factors.biological_plausibility === 'medium') score += 8;
  
  return Math.max(0, Math.min(100, score));
}

async function callLovableAI(systemPrompt: string, userContent: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const response = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
    const error = await response.text();
    console.error('Lovable AI error:', response.status, error);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeCureBreakthrough(discovery: any) {
  console.log('🔬 Analyzing cure breakthrough:', discovery.title);
  
  const systemPrompt = `You are a medical research analyst specializing in Type 1 Diabetes. 
Analyze research and determine if this is a potential cure breakthrough.

Return a JSON object with:
{
  "is_breakthrough": boolean,
  "confidence": number (0-100),
  "mechanism": string,
  "phase": string,
  "biological_plausibility": "high" | "medium" | "low",
  "limitations": string[],
  "timeline_estimate": string,
  "key_findings": string[]
}`;

  try {
    let analysisText = await callLovableAI(systemPrompt, JSON.stringify({
      title: discovery.title,
      summary: discovery.summary,
      full_text: discovery.full_text,
      credibility_factors: discovery.credibility_factors
    }));
    
    // Strip markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(analysisText);
    console.log('✅ Cure analysis complete:', analysis.confidence);
    return analysis;
  } catch (error) {
    console.error('❌ Cure analysis failed:', error);
    return {
      is_breakthrough: false,
      confidence: 0,
      mechanism: 'Analysis failed',
      biological_plausibility: 'low',
      limitations: ['AI analysis unavailable'],
      timeline_estimate: 'Unknown',
      key_findings: []
    };
  }
}

async function detectSymptomPatterns(posts: any[]) {
  console.log('🧪 Detecting symptom patterns from', posts.length, 'posts');
  
  const systemPrompt = `You are analyzing Type 1 Diabetes patient reports to identify symptom patterns.

Look for:
1. Symptoms mentioned frequently (>20 times) not documented in medical literature
2. Device-related issues reported consistently
3. Correlations between symptoms and conditions
4. Common side effects not in official sources

Return JSON array:
[{
  "symptom_name": string,
  "description": string,
  "frequency": number,
  "severity": "high" | "medium" | "low",
  "devices_mentioned": string[],
  "biological_plausibility": "high" | "medium" | "low",
  "credibility_score": number (0-100),
  "post_ids": string[]
}]`;

  try {
    const postsData = posts.slice(0, 100).map(p => ({
      id: p.id,
      title: p.post_json?.data?.title || '',
      text: p.post_json?.data?.selftext || '',
      sentiment: p.sentiment
    }));
    
    let analysisText = await callLovableAI(systemPrompt, JSON.stringify(postsData));
    
    // Strip markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const patterns = JSON.parse(analysisText);
    console.log('✅ Found', patterns.length, 'symptom patterns');
    return patterns;
  } catch (error) {
    console.error('❌ Symptom pattern detection failed:', error);
    return [];
  }
}

async function findCorrelations(allData: any) {
  console.log('🔗 Finding correlations across all data sources');
  
  const systemPrompt = `Cross-reference Type 1 Diabetes data to find connections:

1. Research findings that validate community experiences
2. Clinical trial results matching community reports
3. Device issues in posts that have FDA reports
4. Research explaining patient symptoms

Return JSON array:
[{
  "title": string,
  "description": string,
  "confidence": number (0-100),
  "biological_explanation": string,
  "sources": [{
    "source": string,
    "claim": string,
    "validation": "confirmed" | "correlated" | "contradicts"
  }],
  "impact": "breakthrough" | "high" | "medium" | "low"
}]`;

  try {
    const correlationData = {
      research_count: allData.research?.length || 0,
      trials_count: allData.trials?.length || 0,
      posts_count: allData.posts?.length || 0,
      sample_research: allData.research?.slice(0, 10) || [],
      sample_trials: allData.trials?.slice(0, 10) || [],
      sample_posts: allData.posts?.slice(0, 20) || []
    };
    
    let analysisText = await callLovableAI(systemPrompt, JSON.stringify(correlationData));
    
    // Strip markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const correlations = JSON.parse(analysisText);
    console.log('✅ Found', correlations.length, 'correlations');
    return correlations;
  } catch (error) {
    console.error('❌ Correlation analysis failed:', error);
    return [];
  }
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
    const contentTypeError = requireJsonContentType(req);
    if (contentTypeError) return contentTypeError;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    console.log('🚀 Starting AI discovery analysis...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Use user auth context for RLS
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Fetch all existing discoveries
    const { data: existingDiscoveries, error: discError } = await supabase
      .from('discoveries')
      .select('*')
      .order('discovered_at', { ascending: false })
      .limit(100);

    if (discError) throw discError;

    console.log(`📊 Found ${existingDiscoveries?.length || 0} existing discoveries`);

    // Fetch community posts for symptom pattern analysis
    const { data: communityPosts } = await supabase
      .from('community_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(200);

    console.log(`💬 Analyzing ${communityPosts?.length || 0} community posts`);

    const newDiscoveries = [];

    // 1. Analyze cure breakthroughs with AI
    const cureBreakthroughs = existingDiscoveries?.filter(d => d.discovery_type === 'cure_breakthrough') || [];
    for (const cure of cureBreakthroughs.slice(0, 5)) {
      if (!cure.ai_analysis) {
        const analysis = await analyzeCureBreakthrough(cure);
        
        // Update with AI analysis
        await supabase
          .from('discoveries')
          .update({
            ai_analysis: analysis,
            credibility_score: calculateCredibilityScore({
              ...cure.credibility_factors,
              biological_plausibility: analysis.biological_plausibility
            }),
            last_validated_at: new Date().toISOString()
          })
          .eq('id', cure.id);
      }
    }

    // 2. Detect emerging symptom patterns
    let symptomPatterns: any[] = [];
    if (communityPosts && communityPosts.length > 0) {
      symptomPatterns = await detectSymptomPatterns(communityPosts);
      
      for (const pattern of symptomPatterns) {
        newDiscoveries.push({
          title: `Community Pattern: ${pattern.symptom_name}`,
          summary: `${pattern.frequency} patients report ${pattern.description}`,
          full_text: `Biological plausibility: ${pattern.biological_plausibility}. Devices mentioned: ${pattern.devices_mentioned?.join(', ') || 'None'}`,
          discovery_type: 'community_symptom',
          category: 'symptom',
          impact_level: pattern.severity === 'high' ? 'High' : 'Medium',
          credibility_score: pattern.credibility_score,
          credibility_factors: {
            community_validation: pattern.frequency,
            devices_mentioned: pattern.devices_mentioned,
            biological_plausibility: pattern.biological_plausibility
          },
          primary_source: 'Community Analysis',
          ai_analysis: {
            pattern_type: 'symptom',
            biological_plausibility: pattern.biological_plausibility,
            frequency: pattern.frequency
          },
          related_post_ids: pattern.post_ids,
          // C84: AI-synthesized rows are labeled and dated from underlying
          // evidence — was always-today which pushed synthesized cards to the
          // top of "Latest research" indefinitely.
          publication_date: pattern.first_seen_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          is_ai_synthesized: true
        });
      }
    }

    // 3. Find correlations across data sources
    const allData = {
      research: existingDiscoveries?.filter(d => d.discovery_type === 'research_paper') || [],
      trials: existingDiscoveries?.filter(d => d.discovery_type === 'clinical_trial') || [],
      posts: communityPosts || []
    };

    const correlations = await findCorrelations(allData);
    
    for (const correlation of correlations) {
      newDiscoveries.push({
        title: correlation.title,
        summary: correlation.description,
        full_text: correlation.biological_explanation,
        discovery_type: 'ai_correlation',
        category: 'research',
        impact_level: correlation.impact === 'breakthrough' ? 'Breakthrough' : 
                      correlation.impact === 'high' ? 'High' : 'Medium',
        credibility_score: correlation.confidence,
        credibility_factors: {
          multiple_sources: correlation.sources?.length || 0,
          cross_referenced: correlation.sources?.length || 0,
          biological_plausibility: 'high'
        },
        primary_source: 'AI Analysis',
        cross_references: correlation.sources,
        ai_analysis: {
          correlation_type: 'cross_source',
          confidence: correlation.confidence,
          biological_explanation: correlation.biological_explanation
        },
        publication_date: correlation.earliest_source_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        is_ai_synthesized: true
      });
    }

    // Insert new discoveries
    if (newDiscoveries.length > 0) {
      console.log(`💾 Inserting ${newDiscoveries.length} new discoveries...`);
      const { error: insertError } = await supabase
        .from('discoveries')
        .insert(newDiscoveries);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    console.log('✅ AI analysis complete');

    return new Response(
      JSON.stringify({
        success: true,
        analyzed_cures: cureBreakthroughs.length,
        new_symptom_patterns: symptomPatterns.length,
        new_correlations: correlations.length,
        total_new_discoveries: newDiscoveries.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 AI analysis failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'AI discovery analysis failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
