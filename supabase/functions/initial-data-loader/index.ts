import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { requireAdmin } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Wave 1 hardening: only admins may trigger bulk data load
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    console.log('🌱 Starting initial data population for discoveries table...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Fetch all available data from existing tables
    console.log('📥 Fetching data from all sources...');

    const [researchItems, medicalPapers, clinicalTrials, communityPosts] = await Promise.all([
      supabase.from('research_items').select('*').limit(100),
      supabase.from('medical_research_papers').select('*').limit(200),
      supabase.from('clinical_trials_detailed').select('*').limit(150),
      supabase.from('community_posts').select('*').order('published_at', { ascending: false }).limit(500)
    ]);

    console.log(`Found: ${researchItems.data?.length || 0} research items, ${medicalPapers.data?.length || 0} papers, ${clinicalTrials.data?.length || 0} trials, ${communityPosts.data?.length || 0} posts`);

    const discoveries = [];

    // Step 2: Transform research items into discoveries
    if (researchItems.data) {
      for (const item of researchItems.data) {
        discoveries.push({
          title: item.title,
          summary: item.summary || 'No summary available',
          full_text: null,
          discovery_type: 'research_paper',
          category: 'research',
          impact_level: item.impact_level || 'Medium',
          credibility_score: 70,
          credibility_factors: {
            peer_reviewed: true,
            multiple_sources: 1,
            source_count: 1
          },
          primary_source: item.source,
          source_urls: [item.link],
          publication_date: item.publication_date,
          ai_analysis: null,
          related_research_ids: []
        });
      }
    }

    // Step 3: Transform medical research papers
    if (medicalPapers.data) {
      for (const paper of medicalPapers.data) {
        const credibility = calculatePaperCredibility(paper);
        
        discoveries.push({
          title: paper.title,
          summary: paper.abstract?.substring(0, 500) || 'No abstract available',
          full_text: paper.abstract,
          discovery_type: 'research_paper',
          category: 'research',
          impact_level: paper.impact_factor > 5 ? 'High' : 'Medium',
          credibility_score: credibility,
          credibility_factors: {
            peer_reviewed: true,
            open_access: paper.open_access,
            citation_count: paper.citation_count,
            impact_factor: paper.impact_factor
          },
          primary_source: paper.source_database,
          source_urls: [
            paper.doi ? `https://doi.org/${paper.doi}` : null,
            paper.full_text_url,
            paper.pdf_url
          ].filter(Boolean),
          publication_date: paper.publication_date,
          ai_analysis: null
        });
      }
    }

    // Step 4: Transform clinical trials
    if (clinicalTrials.data) {
      for (const trial of clinicalTrials.data) {
        const isCureRelated = trial.title.toLowerCase().includes('cure') || 
                              trial.title.toLowerCase().includes('beta cell') ||
                              trial.title.toLowerCase().includes('stem cell') ||
                              trial.title.toLowerCase().includes('immunotherapy');

        discoveries.push({
          title: trial.title,
          summary: trial.brief_summary || 'No summary available',
          full_text: trial.detailed_description,
          discovery_type: isCureRelated ? 'cure_breakthrough' : 'clinical_trial',
          category: 'treatment',
          impact_level: trial.phase === 'Phase 3' || trial.phase === 'Phase 4' ? 'High' : 
                       trial.phase === 'Phase 2' ? 'Medium' : 'Low',
          credibility_score: calculateTrialCredibility(trial),
          credibility_factors: {
            phase: trial.phase,
            status: trial.overall_status,
            enrollment: trial.enrollment_count,
            sponsor: trial.sponsor_name
          },
          primary_source: 'ClinicalTrials.gov',
          source_urls: [trial.study_url],
          publication_date: trial.start_date,
          ai_analysis: null,
          related_trial_ids: []
        });
      }
    }

    // Step 5: Detect symptom patterns in community posts
    if (communityPosts.data) {
      const symptomPatterns = detectSymptomPatterns(communityPosts.data);
      
      for (const pattern of symptomPatterns) {
        discoveries.push({
          title: `Community Pattern: ${pattern.symptom}`,
          summary: `${pattern.count} patients report ${pattern.description}`,
          discovery_type: 'community_symptom',
          category: 'symptom',
          impact_level: pattern.count > 100 ? 'High' : pattern.count > 50 ? 'Medium' : 'Low',
          credibility_score: Math.min(50 + pattern.count / 10, 80),
          credibility_factors: {
            community_validation: pattern.count,
            sentiment: pattern.sentiment,
            devices_mentioned: pattern.devices
          },
          primary_source: 'Reddit r/diabetes_t1d',
          source_urls: [],
          publication_date: new Date().toISOString().split('T')[0],
          ai_analysis: null,
          related_post_ids: pattern.post_ids
        });
      }
    }

    console.log(`✨ Generated ${discoveries.length} discoveries`);

    // Step 6: Insert into discoveries table
    if (discoveries.length > 0) {
      const { data, error } = await supabase
        .from('discoveries')
        .upsert(discoveries, { onConflict: 'title' });

      if (error) {
        console.error('❌ Error inserting discoveries:', error);
        throw error;
      }

      console.log(`✅ Successfully inserted ${discoveries.length} discoveries`);
    }

    // Step 7: Get final stats
    const { count } = await supabase
      .from('discoveries')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        discoveries_created: discoveries.length,
        total_discoveries_in_db: count,
        breakdown: {
          cure_breakthroughs: discoveries.filter(d => d.discovery_type === 'cure_breakthrough').length,
          clinical_trials: discoveries.filter(d => d.discovery_type === 'clinical_trial').length,
          research_papers: discoveries.filter(d => d.discovery_type === 'research_paper').length,
          community_symptoms: discoveries.filter(d => d.discovery_type === 'community_symptom').length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Initial data loading failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculatePaperCredibility(paper: any): number {
  let score = 50;
  
  if (paper.open_access) score += 10;
  if (paper.citation_count > 50) score += 20;
  else if (paper.citation_count > 10) score += 10;
  
  if (paper.impact_factor > 5) score += 20;
  else if (paper.impact_factor > 2) score += 10;
  
  return Math.min(100, score);
}

function calculateTrialCredibility(trial: any): number {
  let score = 60;
  
  if (trial.phase === 'Phase 3' || trial.phase === 'Phase 4') score += 20;
  else if (trial.phase === 'Phase 2') score += 10;
  
  if (trial.overall_status === 'Completed') score += 15;
  else if (trial.overall_status === 'Active, not recruiting') score += 10;
  else if (trial.overall_status === 'Recruiting') score += 5;
  
  if (trial.enrollment_count > 100) score += 5;
  
  return Math.min(100, score);
}

function detectSymptomPatterns(posts: any[]): any[] {
  const symptomKeywords = [
    'compression low', 'adhesive', 'skin reaction', 'sensor failure',
    'brain fog', 'fatigue', 'nausea', 'headache', 'anxiety', 
    'sleep issues', 'dawn phenomenon'
  ];

  const patterns = [];

  for (const keyword of symptomKeywords) {
    const matchingPosts = posts.filter(post => 
      post.title?.toLowerCase().includes(keyword) || 
      post.content?.toLowerCase().includes(keyword)
    );

    if (matchingPosts.length >= 10) {
      patterns.push({
        symptom: keyword,
        description: `experiencing ${keyword}`,
        count: matchingPosts.length,
        sentiment: matchingPosts.filter(p => p.sentiment === 'negative').length > matchingPosts.length / 2 ? 'negative' : 'neutral',
        devices: [...new Set(matchingPosts.map(p => p.device_mentioned).filter(Boolean))],
        post_ids: matchingPosts.map(p => p.id).slice(0, 20)
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count).slice(0, 20);
}
