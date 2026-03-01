import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Log start
  const { data: logEntry } = await supabase
    .from('data_refresh_logs')
    .insert({
      refresh_type: 'weekly-reviews',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  const logId = logEntry?.id;
  let totalRecords = 0;
  let functionsSucceeded = 0;
  let functionsFailed = 0;
  const errors: string[] = [];

  try {
    // 1. Fetch device reviews in batches of 4
    const { count: deviceCount } = await supabase
      .from('devices')
      .select('id', { count: 'exact', head: true });

    const totalDevices = deviceCount || 0;
    for (let i = 0; i < totalDevices; i += 4) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/fetch-device-reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startIndex: i, batchSize: 4 }),
        });
        const result = await res.json();
        if (result.success) {
          totalRecords += result.totalInserted || 0;
          functionsSucceeded++;
        } else {
          functionsFailed++;
          errors.push(`Device batch ${i}: ${result.error}`);
        }
      } catch (e) {
        functionsFailed++;
        errors.push(`Device batch ${i}: ${e instanceof Error ? e.message : 'unknown'}`);
      }
      // Wait between batches
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // 2. Fetch medication reviews in batches of 10
    const { count: medCount } = await supabase
      .from('medications')
      .select('id', { count: 'exact', head: true });

    const totalMeds = medCount || 0;
    for (let i = 0; i < totalMeds; i += 10) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/fetch-medication-reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startIndex: i, batchSize: 10 }),
        });
        const result = await res.json();
        if (result.success) {
          totalRecords += result.reviewsInserted || 0;
          functionsSucceeded++;
        } else {
          functionsFailed++;
          errors.push(`Med batch ${i}: ${result.error}`);
        }
      } catch (e) {
        functionsFailed++;
        errors.push(`Med batch ${i}: ${e instanceof Error ? e.message : 'unknown'}`);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // 3. Recalculate ratings
    await supabase.rpc('recalculate_device_ratings');
    await supabase.rpc('recalculate_medication_ratings');

    // 4. Update log
    if (logId) {
      await supabase
        .from('data_refresh_logs')
        .update({
          status: functionsFailed === 0 ? 'completed' : 'partial',
          completed_at: new Date().toISOString(),
          records_fetched: totalRecords,
          functions_succeeded: functionsSucceeded,
          functions_failed: functionsFailed,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          summary: { totalDevices, totalMeds, totalRecords, functionsSucceeded, functionsFailed },
        })
        .eq('id', logId);
    }

    return new Response(JSON.stringify({
      success: true,
      totalRecords,
      functionsSucceeded,
      functionsFailed,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (logId) {
      await supabase
        .from('data_refresh_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: msg,
        })
        .eq('id', logId);
    }

    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
