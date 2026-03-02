/**
 * Domain 6.3: Health Check Endpoint
 * Tests DB connectivity and returns structured status JSON.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const checks: Record<string, { status: string; latencyMs: number; error?: string }> = {};

  // DB connectivity
  const dbStart = Date.now();
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { error } = await supabase.from("admin_settings").select("id").limit(1);
    checks.database = {
      status: error ? "degraded" : "healthy",
      latencyMs: Date.now() - dbStart,
      ...(error && { error: error.message }),
    };
  } catch (e) {
    checks.database = {
      status: "down",
      latencyMs: Date.now() - dbStart,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }

  // AI gateway
  const aiStart = Date.now();
  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/health", {
      signal: AbortSignal.timeout(5000),
    });
    checks.ai_gateway = {
      status: resp.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - aiStart,
    };
  } catch {
    checks.ai_gateway = {
      status: "unreachable",
      latencyMs: Date.now() - aiStart,
    };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");

  return jsonResponse({
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  }, allHealthy ? 200 : 503);
});
