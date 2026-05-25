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

  // C92 (Wave D): per-upstream-source telemetry so an OpenFDA/OpenAlex
  // outage no longer shows green on the SystemHealth dashboard.
  const upstreams: Array<{ key: string; url: string }> = [
    { key: 'pubmed', url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi?db=pubmed&retmode=json' },
    { key: 'europepmc', url: 'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=test&format=json&pageSize=1' },
    { key: 'openalex', url: 'https://api.openalex.org/works?per-page=1' },
    { key: 'semantic_scholar', url: 'https://api.semanticscholar.org/graph/v1/paper/search?query=diabetes&limit=1' },
    { key: 'clinicaltrials', url: 'https://clinicaltrials.gov/api/v2/studies?pageSize=1' },
    { key: 'openfda', url: 'https://api.fda.gov/device/event.json?limit=1' },
    { key: 'nih_reporter', url: 'https://api.reporter.nih.gov/v2/projects/search?criteria=%7B%7D&limit=1' },
    { key: 'patentsview', url: 'https://search.patentsview.org/api/v1/patent/?q=%7B%22_text_any%22%3A%7B%22patent_title%22%3A%22diabetes%22%7D%7D&o=%7B%22size%22%3A1%7D' },
    { key: 'cms_nadac', url: 'https://data.medicaid.gov/api/1/datastore/query/aa64474a-d161-4089-be2f-5a21a15e4a57/0?limit=1' },
    { key: 'stooq', url: 'https://stooq.com/q/d/l/?s=dxcm.us&i=d' },
  ];
  await Promise.all(upstreams.map(async ({ key, url }) => {
    const t0 = Date.now();
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      checks[`upstream_${key}`] = {
        status: r.ok ? 'healthy' : (r.status === 429 ? 'rate_limited' : 'degraded'),
        latencyMs: Date.now() - t0,
        ...(r.ok ? {} : { error: `HTTP ${r.status}` }),
      };
    } catch (e) {
      checks[`upstream_${key}`] = {
        status: 'unreachable',
        latencyMs: Date.now() - t0,
        error: e instanceof Error ? e.message : 'unknown',
      };
    }
  }));

  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");

  return jsonResponse({
    status: allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
  }, allHealthy ? 200 : 503);
});
