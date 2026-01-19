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

When community solutions are provided in context, reference them naturally and cite the source:
- "According to a highly-voted post from r/diabetes..."
- "Several community members have found that..."
- "A popular tip from the T1D community suggests..."

Format your responses with:
- Clear, numbered steps when giving advice
- Relevant explanations of why something works
- Empathetic acknowledgment of the challenge
- Source attribution when referencing community posts

End each response with: "💡 These tips come from the T1D community. Always discuss changes with your healthcare team."`;

// Stop words to filter out from keyword extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'just', 'should', 'now', 'i', 'me', 'my', 'myself', 'we',
  'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'this', 'that', 'these',
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'could', 'help', 'please',
  'what', 'which', 'who', 'whom', 'want', 'need', 'like', 'get', 'got', 'getting',
]);

// Common T1D-related keywords to detect
const T1D_KEYWORDS = {
  devices: ['dexcom', 'omnipod', 'tandem', 'medtronic', 'libre', 'guardian', 'cgm', 'pump', 'sensor', 'g6', 'g7'],
  topics: ['morning', 'lows', 'highs', 'dawn', 'exercise', 'workout', 'insulin', 'bolus', 'basal', 'carb', 'carbs', 
           'hypo', 'hyper', 'glucose', 'sugar', 'a1c', 'hba1c', 'nighttime', 'sleep', 'stress', 'sick', 'illness',
           'travel', 'flying', 'alcohol', 'drinking', 'eating', 'food', 'meal', 'snack', 'correction', 'dose',
           'adhesive', 'tape', 'site', 'rotation', 'absorption', 'occlusion', 'loop', 'aaps', 'diy']
};

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
  
  // Prioritize T1D-specific keywords
  const t1dWords = words.filter(word => 
    T1D_KEYWORDS.devices.includes(word) || T1D_KEYWORDS.topics.includes(word)
  );
  
  // Add other relevant words
  const otherWords = words.filter(word => 
    !T1D_KEYWORDS.devices.includes(word) && !T1D_KEYWORDS.topics.includes(word)
  );
  
  // Return T1D keywords first, then others, limit to 8
  return [...t1dWords, ...otherWords].slice(0, 8);
}

function detectDevice(text: string): string | null {
  const textLower = text.toLowerCase();
  for (const device of T1D_KEYWORDS.devices) {
    if (textLower.includes(device)) {
      return device;
    }
  }
  return null;
}

function detectTopicTags(text: string): string[] {
  const textLower = text.toLowerCase();
  const tags: string[] = [];
  
  // Map common phrases to topic tags
  const tagMappings: Record<string, string[]> = {
    'morning_lows': ['morning low', 'wake up low', 'dawn phenomenon', 'morning hypo'],
    'exercise': ['exercise', 'workout', 'gym', 'running', 'sports', 'physical activity'],
    'sensor_issues': ['sensor', 'adhesive', 'tape', 'falling off', 'cgm issues'],
    'pump_issues': ['pump', 'occlusion', 'site change', 'infusion'],
    'insulin_dosing': ['bolus', 'basal', 'dose', 'dosing', 'correction', 'ratio'],
    'diet': ['carb', 'food', 'meal', 'eating', 'diet', 'snack'],
    'nighttime': ['night', 'sleep', 'overnight', 'nighttime'],
    'travel': ['travel', 'flying', 'airport', 'vacation'],
  };
  
  for (const [tag, phrases] of Object.entries(tagMappings)) {
    if (phrases.some(phrase => textLower.includes(phrase))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, issueContext, postContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract the latest user message for context search
    const latestUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    
    // Build community context
    let communityContext = "";
    
    // If a specific post was provided as context (from "Ask AI" button)
    if (postContext) {
      communityContext = `\n\nUSER IS ASKING ABOUT THIS SPECIFIC COMMUNITY POST:\n`;
      communityContext += `Title: ${postContext.title}\n`;
      communityContext += `Source: ${postContext.source} (${postContext.score || 0} upvotes)\n`;
      if (postContext.device_mentioned) {
        communityContext += `Device: ${postContext.device_mentioned}\n`;
      }
      if (postContext.topic_tags?.length > 0) {
        communityContext += `Topics: ${postContext.topic_tags.join(', ')}\n`;
      }
      communityContext += `Content: ${postContext.content || 'No content'}\n`;
      if (postContext.url) {
        communityContext += `Original URL: ${postContext.url}\n`;
      }
    }
    
    // Search for additional relevant community posts
    if (latestUserMessage) {
      // Extract keywords using improved extraction
      const keywords = extractKeywords(latestUserMessage);
      const detectedDevice = detectDevice(latestUserMessage);
      const detectedTags = detectTopicTags(latestUserMessage);

      console.log("Search context:", { keywords, detectedDevice, detectedTags });

      // Build search conditions
      const conditions: string[] = [];
      
      // Add keyword search for title and content
      if (keywords.length > 0) {
        const keywordConditions = keywords.slice(0, 5).map((k: string) => 
          `title.ilike.%${k}%,content.ilike.%${k}%`
        ).join(",");
        conditions.push(keywordConditions);
      }
      
      // Add device-specific search
      if (detectedDevice) {
        conditions.push(`device_mentioned.ilike.%${detectedDevice}%`);
      }
      
      // Add topic tag search
      if (detectedTags.length > 0) {
        conditions.push(`topic_tags.ov.{${detectedTags.join(',')}}`);
      }

      if (conditions.length > 0) {
        // Search for relevant community posts
        const { data: posts, error } = await supabase
          .from("community_posts")
          .select("title, content, source, score, topic_tags, device_mentioned, url, is_solution")
          .or(conditions.join(","))
          .neq("sentiment", "negative")
          .neq("post_type", "reply")
          .order("score", { ascending: false, nullsFirst: false })
          .limit(8);

        if (!error && posts && posts.length > 0) {
          // Prioritize solutions
          const sortedPosts = posts.sort((a, b) => {
            if (a.is_solution && !b.is_solution) return -1;
            if (!a.is_solution && b.is_solution) return 1;
            return (b.score || 0) - (a.score || 0);
          }).slice(0, 5);

          communityContext += `\n\nRELATED COMMUNITY EXPERIENCES:\n${sortedPosts
            .map((p: any, i: number) => {
              let entry = `[${i + 1}] From ${p.source} (${p.score || 0} upvotes)${p.is_solution ? ' [MARKED AS SOLUTION]' : ''}:\n`;
              entry += `Title: ${p.title}\n`;
              if (p.device_mentioned) {
                entry += `Device: ${p.device_mentioned}\n`;
              }
              if (p.topic_tags?.length > 0) {
                entry += `Topics: ${p.topic_tags.join(', ')}\n`;
              }
              if (p.content) {
                entry += `Content: ${p.content.substring(0, 600)}${p.content.length > 600 ? '...' : ''}\n`;
              }
              if (p.url) {
                entry += `Source: ${p.url}\n`;
              }
              return entry;
            })
            .join("\n")}`;
        }
      }
    }

    // Add issue context if provided
    let issueContextStr = "";
    if (issueContext) {
      issueContextStr = `\n\nUSER'S SAVED ISSUE:\nTitle: ${issueContext.title}\nDescription: ${issueContext.description}\nCategory: ${issueContext.category}`;
    }

    const systemPrompt = T1D_SYSTEM_PROMPT + communityContext + issueContextStr;

    console.log("System prompt length:", systemPrompt.length);

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
