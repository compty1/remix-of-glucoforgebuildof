import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get papers with Semantic Scholar IDs
    const { data: papers, error: papersError } = await supabase
      .from("medical_research_papers")
      .select("id, semantic_scholar_id")
      .not("semantic_scholar_id", "is", null)
      .limit(50);

    if (papersError) throw papersError;
    
    let citationsAdded = 0;

    for (const paper of papers || []) {
      try {
        // Fetch references from Semantic Scholar
        const response = await fetch(
          `https://api.semanticscholar.org/graph/v1/paper/${paper.semantic_scholar_id}/references?fields=paperId,isInfluential&limit=20`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        for (const ref of data.data || []) {
          if (!ref.citedPaper?.paperId) continue;
          
          // Find if referenced paper exists in our DB
          const { data: citedPaper } = await supabase
            .from("medical_research_papers")
            .select("id")
            .eq("semantic_scholar_id", ref.citedPaper.paperId)
            .maybeSingle();
          
          if (citedPaper) {
            const { error: insertError } = await supabase
              .from("paper_citations")
              .upsert({
                citing_paper_id: paper.id,
                cited_paper_id: citedPaper.id,
                is_influential: ref.isInfluential || false,
              }, { onConflict: "citing_paper_id,cited_paper_id" });
            
            if (!insertError) citationsAdded++;
          }
        }
        
        await new Promise(r => setTimeout(r, 200)); // Rate limiting
      } catch (e) {
        console.error(`Error processing paper ${paper.id}:`, e);
      }
    }

    return new Response(JSON.stringify({ success: true, citationsAdded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
