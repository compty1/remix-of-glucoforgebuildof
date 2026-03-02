import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Collect user data from all relevant tables
    const tables = [
      "profiles",
      "chat_sessions",
      "user_preferences",
      "community_statements",
      "device_reviews",
      "medication_reviews",
    ];

    const exportData: Record<string, unknown> = {
      user_id: user.id,
      email: user.email,
      exported_at: new Date().toISOString(),
      tables: {},
    };

    for (const table of tables) {
      try {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id)
          .limit(1000);
        if (data && data.length > 0) {
          (exportData.tables as Record<string, unknown>)[table] = data;
        }
      } catch {
        // Table may not exist or user_id column missing — skip
      }
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dsar-export-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
