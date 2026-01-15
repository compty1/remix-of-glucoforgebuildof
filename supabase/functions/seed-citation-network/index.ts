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

    console.log("Fetching papers for citation network seeding...");

    // Fetch hub papers (top 15 by citation count)
    const { data: hubPapers, error: hubError } = await supabase
      .from("medical_research_papers")
      .select("id, title, citation_count, influential_citation_count")
      .gt("citation_count", 10)
      .order("citation_count", { ascending: false })
      .limit(15);

    if (hubError) throw new Error(`Failed to fetch hub papers: ${hubError.message}`);

    console.log(`Found ${hubPapers?.length || 0} hub papers`);

    // Fetch medium papers (next 40 papers with citations)
    const { data: mediumPapers, error: mediumError } = await supabase
      .from("medical_research_papers")
      .select("id, title, citation_count")
      .gt("citation_count", 0)
      .order("citation_count", { ascending: false })
      .range(15, 54);

    if (mediumError) throw new Error(`Failed to fetch medium papers: ${mediumError.message}`);

    console.log(`Found ${mediumPapers?.length || 0} medium papers`);

    if (!hubPapers?.length || !mediumPapers?.length) {
      return new Response(
        JSON.stringify({ error: "Not enough papers to create network", hubCount: hubPapers?.length, mediumCount: mediumPapers?.length }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const citations: { citing_paper_id: string; cited_paper_id: string; is_influential: boolean }[] = [];
    const existingPairs = new Set<string>();

    // Helper to add citation if not duplicate
    const addCitation = (citingId: string, citedId: string, influential: boolean) => {
      if (citingId === citedId) return; // No self-citations
      const key = `${citingId}-${citedId}`;
      if (existingPairs.has(key)) return;
      existingPairs.add(key);
      citations.push({ citing_paper_id: citingId, cited_paper_id: citedId, is_influential: influential });
    };

    // Create hub-to-hub citations (creates central cluster)
    for (let i = 0; i < hubPapers.length; i++) {
      for (let j = i + 1; j < hubPapers.length; j++) {
        // ~40% chance of hub papers citing each other
        if (Math.random() < 0.4) {
          const influential = Math.random() < 0.3; // 30% influential for hub-hub
          addCitation(hubPapers[i].id, hubPapers[j].id, influential);
        }
        if (Math.random() < 0.3) {
          const influential = Math.random() < 0.3;
          addCitation(hubPapers[j].id, hubPapers[i].id, influential);
        }
      }
    }

    // Medium papers cite hub papers (2-4 citations each)
    for (const medium of mediumPapers) {
      const numCitations = 2 + Math.floor(Math.random() * 3); // 2-4 citations
      const shuffledHubs = [...hubPapers].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numCitations && i < shuffledHubs.length; i++) {
        const influential = Math.random() < 0.15; // 15% influential
        addCitation(medium.id, shuffledHubs[i].id, influential);
      }
    }

    // Some medium papers cite other medium papers
    for (let i = 0; i < mediumPapers.length; i++) {
      for (let j = i + 1; j < mediumPapers.length; j++) {
        if (Math.random() < 0.08) { // 8% chance
          const influential = Math.random() < 0.1;
          addCitation(mediumPapers[i].id, mediumPapers[j].id, influential);
        }
      }
    }

    // Hub papers sometimes cite medium papers (reverse direction)
    for (const hub of hubPapers) {
      const numReverse = Math.floor(Math.random() * 3); // 0-2 reverse citations
      const shuffledMedium = [...mediumPapers].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numReverse && i < shuffledMedium.length; i++) {
        const influential = Math.random() < 0.2;
        addCitation(hub.id, shuffledMedium[i].id, influential);
      }
    }

    console.log(`Generated ${citations.length} citation relationships`);

    // Clear existing citations and insert new ones
    const { error: deleteError } = await supabase
      .from("paper_citations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
      console.warn("Could not clear existing citations:", deleteError.message);
    }

    // Insert in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < citations.length; i += batchSize) {
      const batch = citations.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("paper_citations")
        .insert(batch);
      
      if (insertError) {
        console.error(`Batch insert error at ${i}:`, insertError.message);
      } else {
        inserted += batch.length;
      }
    }

    const influentialCount = citations.filter(c => c.is_influential).length;

    console.log(`Successfully seeded ${inserted} citations (${influentialCount} influential)`);

    return new Response(
      JSON.stringify({
        success: true,
        citationsCreated: inserted,
        influentialCitations: influentialCount,
        hubPapersUsed: hubPapers.length,
        mediumPapersUsed: mediumPapers.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error seeding citation network:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
