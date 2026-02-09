import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch posts that need re-verification:
    // 1. link_status IS NULL (never checked)
    // 2. last_checked older than 7 days
    const { data: posts, error: fetchError } = await supabase
      .from("community_posts")
      .select("id, url, canonical_url, link_status, source")
      .eq("post_type", "post")
      .limit(200);

    if (fetchError) throw fetchError;

    const needsVerification = (posts || []).filter((p: any) => {
      if (!p.link_status) return true;
      const lastChecked = p.link_status?.last_checked;
      if (!lastChecked) return true;
      return new Date(lastChecked) < sevenDaysAgo;
    });

    let checked = 0;
    let ok = 0;
    let dead = 0;
    let skipped = 0;

    for (const post of needsVerification) {
      const url = post.canonical_url || post.url;

      if (!url) {
        skipped++;
        continue;
      }

      // Reddit structural validation (can't HTTP-verify)
      const isRedditSearch = url.includes("reddit.com/search") || url.includes("reddit.com/r/");
      if (isRedditSearch) {
        const isValid = url.startsWith("https://") && url.includes("reddit.com");
        const status = isValid ? "ok_fallback" : "dead";

        await supabase
          .from("community_posts")
          .update({
            link_status: {
              status,
              method: "structural",
              last_checked: new Date().toISOString(),
              url,
            },
            source_link_verified: isValid,
            source_link_verified_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        checked++;
        if (isValid) ok++;
        else dead++;
        continue;
      }

      // HTTP verification for non-Reddit URLs
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeout);

        const isOk = response.status >= 200 && response.status < 400;

        await supabase
          .from("community_posts")
          .update({
            link_status: {
              status: isOk ? "ok" : "dead",
              http_code: response.status,
              last_checked: new Date().toISOString(),
              url,
            },
            source_link_verified: isOk,
            source_link_verified_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        checked++;
        if (isOk) ok++;
        else dead++;
      } catch (_err) {
        await supabase
          .from("community_posts")
          .update({
            link_status: {
              status: "dead",
              error: "timeout_or_network",
              last_checked: new Date().toISOString(),
              url,
            },
            source_link_verified: false,
            source_link_verified_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        checked++;
        dead++;
      }
    }

    const summary = {
      totalPosts: posts?.length || 0,
      needsVerification: needsVerification.length,
      checked,
      ok,
      dead,
      skipped,
      timestamp: new Date().toISOString(),
    };

    console.log("Scheduled maintenance complete:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scheduled maintenance error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
