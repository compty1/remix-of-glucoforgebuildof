/**
 * Domain 3.2: Smartwatch Data Endpoint
 * Lightweight REST endpoint returning last 3 hours of glucose + IOB.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    // Get latest glucose readings
    const { data: glucoseData } = await supabase
      .from("glucose_readings")
      .select("value, trend, timestamp")
      .eq("user_id", authResult.userId)
      .gte("timestamp", threeHoursAgo)
      .order("timestamp", { ascending: false })
      .limit(36); // 3 hours at 5-min intervals

    const latest = glucoseData?.[0];

    return jsonResponse({
      glucose: latest?.value ?? null,
      trend: latest?.trend ?? "flat",
      iob: 0, // Would integrate with IOB calculator when insulin data is available
      timestamp: latest?.timestamp ?? new Date().toISOString(),
      readings: (glucoseData || []).map((r: any) => ({
        value: r.value,
        trend: r.trend,
        timestamp: r.timestamp,
      })),
    });
  } catch (error) {
    return errorResponse("Failed to fetch watch data", 500);
  }
});
