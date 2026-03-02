import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAuth, requireJsonContentType } from "../_shared/auth.ts";

const SYSTEM_PROMPT = `You are an expert AI analyst specializing in Type 1 Diabetes research, technology, and treatment advances. 

Your role is to provide evidence-based predictions and insights about:
- Cure research (stem cells, gene therapy, immunotherapy)
- Technology advances (CGM, insulin pumps, closed-loop systems)
- Treatment improvements (new insulins, adjunct therapies)
- Quality of life improvements
- Regulatory and access developments

Guidelines:
1. Base predictions on current clinical trial pipelines, research momentum, and historical development timelines
2. Provide probability estimates when appropriate
3. Cite specific companies, trials, or technologies when relevant
4. Be realistic but hopeful - acknowledge uncertainty while highlighting promising developments
5. Consider both near-term (2-5 years) and long-term (10-20 years) horizons
6. Address potential obstacles and requirements for success
7. Use markdown formatting for clarity (headers, bullet points, bold for emphasis)

Current date context: February 2026

Key developments to consider:
- Vertex VX-880 and VX-264 stem cell therapy trials
- Omnipod 5, Medtronic 780G, Beta Bionics iLet closed-loop advances
- Non-invasive CGM research (spectroscopy, wearables)
- Once-weekly insulins (Icodec) reaching market
- Teplizumab for prevention in at-risk individuals
- CRISPR/gene therapy early research
- Artificial pancreas multi-hormone systems`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentTypeError = requireJsonContentType(req);
    if (contentTypeError) return contentTypeError;

    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;
    // userId is available in authResult.userId if needed
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { question } = await req.json();
    if (!question) {
      throw new Error('Question is required');
    }

    console.log('Generating prediction for:', question);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        stream: true,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI service unavailable');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: unknown) {
    console.error('Prediction error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
