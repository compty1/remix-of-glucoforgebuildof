import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const T1D_SYSTEM_PROMPT = `You are the T1D Companion, a supportive and knowledgeable assistant for people living with Type 1 Diabetes. Your role is to provide practical tips, tricks, and methods that have worked for others in the T1D community.

IMPORTANT GUIDELINES:
1. You do NOT provide medical advice - all suggestions come from community experiences shared on social media
2. Always recommend consulting healthcare providers for medical decisions
3. Be empathetic, understanding, and supportive
4. Share specific methods and tips from the community posts provided as context
5. Explain the reasoning behind tips when discussing body mechanics (insulin action, glucose metabolism, etc.)
6. Format responses clearly with actionable steps
7. Always include a brief disclaimer that these are community experiences, not medical advice

KNOWLEDGE AREAS:
- How insulin works in the body
- Glucose metabolism and regulation
- Dawn phenomenon and hormonal effects
- Exercise physiology for T1D
- Device troubleshooting (CGMs, pumps)
- Carb counting strategies
- Lifestyle management (travel, dining out, alcohol)
- Emotional support for diabetes burnout

When community solutions are provided in context, reference them naturally and share the most helpful tips from real users. Format your responses with:
- Clear, numbered steps when giving advice
- Relevant explanations of why something works
- Empathetic acknowledgment of the challenge

End each response with: "💡 These tips come from the T1D community. Always discuss changes with your healthcare team."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, issueContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract the latest user message for context search
    const latestUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    
    // Search community_posts for relevant solutions
    let communityContext = "";
    if (latestUserMessage) {
      // Extract keywords from the user message
      const keywords = latestUserMessage
        .toLowerCase()
        .split(/\s+/)
        .filter((word: string) => word.length > 3)
        .slice(0, 5);

      // Search for relevant community posts
      const { data: posts } = await supabase
        .from("community_posts")
        .select("title, content, source, score, num_comments, sentiment")
        .or(keywords.map((k: string) => `title.ilike.%${k}%,content.ilike.%${k}%`).join(","))
        .neq("sentiment", "negative")
        .order("score", { ascending: false })
        .limit(5);

      if (posts && posts.length > 0) {
        communityContext = `\n\nRELEVANT COMMUNITY EXPERIENCES:\n${posts
          .map((p: any, i: number) => 
            `[${i + 1}] From ${p.source} (${p.score || 0} upvotes):\nTitle: ${p.title}\n${p.content ? `Content: ${p.content.substring(0, 500)}...` : ""}`
          )
          .join("\n\n")}`;
      }
    }

    // Add issue context if provided
    let issueContextStr = "";
    if (issueContext) {
      issueContextStr = `\n\nUSER'S SAVED ISSUE:\nTitle: ${issueContext.title}\nDescription: ${issueContext.description}\nCategory: ${issueContext.category}`;
    }

    const systemPrompt = T1D_SYSTEM_PROMPT + communityContext + issueContextStr;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please check your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("T1D Companion chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
