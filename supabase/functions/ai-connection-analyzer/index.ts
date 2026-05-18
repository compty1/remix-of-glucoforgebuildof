import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAuth, requireJsonContentType } from "../_shared/auth.ts";

import { fetchWithTimeout } from "../_shared/seedGuard.ts";
interface DiscoveredConnection {
  title: string;
  description: string;
  connection_type: 'food' | 'biology' | 'device' | 'chemical' | 'environmental' | 'symptom' | 'treatment';
  biological_mechanism: string;
  practical_implications: string[];
  keywords: string[];
  confidence_factors: {
    peer_reviewed_support: boolean;
    community_validation_count: number;
    mechanistic_plausibility: 'high' | 'medium' | 'low';
  };
  novelty_factors: string[];
  source_evidence: {
    papers: Array<{ paper_id: string; title: string; relevance: string }>;
    posts: Array<{ post_id: string; title: string; source: string }>;
    trials: Array<{ trial_id: string; title: string; phase: string }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentTypeError = requireJsonContentType(req);
    if (contentTypeError) return contentTypeError;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Use user auth context for RLS
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Fetching research data for analysis...');

    // Fetch data from multiple sources in parallel
    const [papersResult, postsResult, trialsResult] = await Promise.all([
      supabase
        .from('medical_research_papers')
        .select('id, paper_id, title, abstract, tldr_summary, keywords, fields_of_study')
        .order('influential_citation_count', { ascending: false })
        .limit(100),
      supabase
        .from('community_posts')
        .select('id, post_id, title, content, topic_tags, source, score')
        .eq('is_solution', true)
        .order('score', { ascending: false })
        .limit(100),
      supabase
        .from('clinical_trials_detailed')
        .select('id, nct_id, title, brief_summary, interventions, phase, conditions')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const papers = papersResult.data || [];
    const posts = postsResult.data || [];
    const trials = trialsResult.data || [];

    console.log(`Fetched ${papers.length} papers, ${posts.length} posts, ${trials.length} trials`);

    // Build context for AI analysis
    const researchContext = papers.slice(0, 30).map(p => ({
      id: p.id,
      title: p.title,
      summary: p.tldr_summary || p.abstract?.substring(0, 300),
      keywords: p.keywords || p.fields_of_study,
    }));

    const communityContext = posts.slice(0, 30).map(p => ({
      id: p.id,
      title: p.title,
      content: p.content?.substring(0, 300),
      tags: p.topic_tags,
      source: p.source,
    }));

    const trialsContext = trials.slice(0, 20).map(t => ({
      id: t.id,
      nct_id: t.nct_id,
      title: t.title,
      summary: t.brief_summary?.substring(0, 300),
      interventions: t.interventions,
      phase: t.phase,
    }));

    const systemPrompt = `You are an advanced medical research analyst specializing in Type 1 Diabetes. Your task is to discover novel, accurate connections by cross-referencing research papers, community experiences, and clinical trials.

Focus on finding connections that are:
1. ACCURATE - backed by multiple independent sources
2. NOVEL - not commonly acknowledged or found in mainstream diabetes education
3. ACTIONABLE - patients can use this information practically
4. CROSS-VALIDATED - appear in both research AND community reports

Connection categories to identify:
- FOOD: How specific foods/compounds affect blood glucose beyond simple carbs
- BIOLOGY: T1D biological mechanisms not in textbooks
- DEVICE: Device behaviors discovered through data analysis
- CHEMICAL: How chemicals/medications affect diabetes
- ENVIRONMENTAL: External factors affecting management
- SYMPTOM: Non-obvious symptom correlations
- TREATMENT: Unexpected treatment combinations

For each connection, you MUST provide concrete evidence from the data provided.`;

    const userPrompt = `Analyze the following data to discover 5-8 novel, accurate connections related to Type 1 Diabetes management.

RESEARCH PAPERS:
${JSON.stringify(researchContext, null, 2)}

COMMUNITY SOLUTIONS:
${JSON.stringify(communityContext, null, 2)}

CLINICAL TRIALS:
${JSON.stringify(trialsContext, null, 2)}

Return connections using the suggest_connections function. Each connection must reference specific sources from the data above.`;

    console.log('Calling AI for connection analysis...');

    const aiResponse = await fetchWithTimeout('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_connections',
              description: 'Return discovered connections between research, community data, and clinical trials',
              parameters: {
                type: 'object',
                properties: {
                  connections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Clear, specific connection title' },
                        description: { type: 'string', description: 'Detailed explanation of the connection (2-3 sentences)' },
                        connection_type: { 
                          type: 'string', 
                          enum: ['food', 'biology', 'device', 'chemical', 'environmental', 'symptom', 'treatment'] 
                        },
                        biological_mechanism: { type: 'string', description: 'Scientific explanation of why this works' },
                        practical_implications: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'How patients can apply this (2-4 tips)'
                        },
                        keywords: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Relevant search keywords (4-6)'
                        },
                        confidence_factors: {
                          type: 'object',
                          properties: {
                            peer_reviewed_support: { type: 'boolean' },
                            community_validation_count: { type: 'number' },
                            mechanistic_plausibility: { type: 'string', enum: ['high', 'medium', 'low'] }
                          },
                          required: ['peer_reviewed_support', 'community_validation_count', 'mechanistic_plausibility']
                        },
                        novelty_factors: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Why this is surprising or under-recognized'
                        },
                        source_evidence: {
                          type: 'object',
                          properties: {
                            papers: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  paper_id: { type: 'string' },
                                  title: { type: 'string' },
                                  relevance: { type: 'string' }
                                },
                                required: ['paper_id', 'title', 'relevance']
                              }
                            },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  post_id: { type: 'string' },
                                  title: { type: 'string' },
                                  source: { type: 'string' }
                                },
                                required: ['post_id', 'title', 'source']
                              }
                            },
                            trials: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  trial_id: { type: 'string' },
                                  title: { type: 'string' },
                                  phase: { type: 'string' }
                                },
                                required: ['trial_id', 'title', 'phase']
                              }
                            }
                          },
                          required: ['papers', 'posts', 'trials']
                        }
                      },
                      required: ['title', 'description', 'connection_type', 'biological_mechanism', 'practical_implications', 'keywords', 'confidence_factors', 'novelty_factors', 'source_evidence']
                    }
                  }
                },
                required: ['connections']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_connections' } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract connections from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No connections returned from AI');
    }

    const parsedConnections = JSON.parse(toolCall.function.arguments);
    const discoveredConnections: DiscoveredConnection[] = parsedConnections.connections || [];

    console.log(`Discovered ${discoveredConnections.length} connections`);

    // Calculate scores and store connections
    const insertPromises = discoveredConnections.map(async (conn) => {
      // Calculate confidence score (0-100)
      let confidenceScore = 0;
      if (conn.confidence_factors.peer_reviewed_support) confidenceScore += 30;
      if (conn.confidence_factors.community_validation_count >= 10) confidenceScore += 20;
      else if (conn.confidence_factors.community_validation_count >= 5) confidenceScore += 10;
      if (conn.confidence_factors.mechanistic_plausibility === 'high') confidenceScore += 25;
      else if (conn.confidence_factors.mechanistic_plausibility === 'medium') confidenceScore += 15;
      if (conn.source_evidence.papers.length > 0) confidenceScore += 10;
      if (conn.source_evidence.trials.length > 0) confidenceScore += 15;
      confidenceScore = Math.min(100, confidenceScore);

      // Calculate novelty score (0-100)
      let noveltyScore = 0;
      noveltyScore += Math.min(40, conn.novelty_factors.length * 15);
      if (conn.source_evidence.posts.length > conn.source_evidence.papers.length) noveltyScore += 20;
      if (conn.connection_type === 'environmental' || conn.connection_type === 'symptom') noveltyScore += 20;
      noveltyScore = Math.min(100, noveltyScore + Math.floor(Math.random() * 20)); // Add some variance

      // Determine validation status
      let validationStatus = 'hypothesis';
      if (confidenceScore >= 70 && conn.source_evidence.papers.length >= 2) {
        validationStatus = 'confirmed';
      } else if (confidenceScore >= 50 || conn.source_evidence.papers.length >= 1) {
        validationStatus = 'emerging';
      }

      const crossValidationCount = 
        (conn.source_evidence.papers.length > 0 ? 1 : 0) +
        (conn.source_evidence.posts.length > 0 ? 1 : 0) +
        (conn.source_evidence.trials.length > 0 ? 1 : 0);

      return supabase.from('ai_found_connections').insert({
        title: conn.title,
        description: conn.description,
        connection_type: conn.connection_type,
        source_papers: conn.source_evidence.papers,
        source_posts: conn.source_evidence.posts,
        source_trials: conn.source_evidence.trials,
        confidence_score: confidenceScore,
        novelty_score: noveltyScore,
        community_mentions: conn.confidence_factors.community_validation_count,
        research_citations: conn.source_evidence.papers.length,
        validation_status: validationStatus,
        cross_validation_count: crossValidationCount,
        biological_mechanism: conn.biological_mechanism,
        practical_implications: conn.practical_implications,
        keywords: conn.keywords,
        ai_analysis: {
          confidence_factors: conn.confidence_factors,
          novelty_factors: conn.novelty_factors,
        },
      });
    });

    await Promise.all(insertPromises);
    console.log('Connections stored successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      connections_found: discoveredConnections.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-connection-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
