import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createLogger, generateRequestId } from "../_shared/logging.ts";
import { handleHealthCheck } from "../_shared/health.ts";
import { processBatch } from "../_shared/batch.ts";

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const reqId = generateRequestId();
  const log = createLogger('scheduled-maintenance', reqId);

  const healthResp = handleHealthCheck(req, 'scheduled-maintenance');
  if (healthResp) return healthResp;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    log.info('Starting scheduled maintenance');

    // Fetch posts that need re-verification
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

    log.info('Posts needing verification', { total: posts?.length, needsCheck: needsVerification.length });

    let ok = 0;
    let dead = 0;
    let skipped = 0;

    // 4.13: Process in batches to prevent deadlocks
    const { results } = await processBatch(
      needsVerification,
      async (post: any) => {
        const url = post.canonical_url || post.url;
        if (!url) { skipped++; return 'skipped'; }

        // Reddit structural validation
        const isRedditSearch = url.includes("reddit.com/search") || url.includes("reddit.com/r/");
        if (isRedditSearch) {
          const isValid = url.startsWith("https://") && url.includes("reddit.com");
          await supabase
            .from("community_posts")
            .update({
              link_status: {
                status: isValid ? "ok_fallback" : "dead",
                method: "structural",
                last_checked: new Date().toISOString(),
                url,
              },
              source_link_verified: isValid,
              source_link_verified_at: new Date().toISOString(),
            })
            .eq("id", post.id);
          if (isValid) ok++; else dead++;
          return isValid ? 'ok' : 'dead';
        }

        // HTTP verification
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
          if (isOk) ok++; else dead++;
          return isOk ? 'ok' : 'dead';
        } catch {
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
          dead++;
          return 'dead';
        }
      },
      { batchSize: 10, delayMs: 200, onError: 'skip' }
    );

    const summary = {
      totalPosts: posts?.length || 0,
      needsVerification: needsVerification.length,
      checked: results.length,
      ok,
      dead,
      skipped,
      timestamp: new Date().toISOString(),
    };

    log.info('Scheduled maintenance complete', summary);

    return jsonResponse(summary);
  } catch (error) {
    log.error('Scheduled maintenance error', { error: String(error) });
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
