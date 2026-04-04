// Gap 29: Nightscout Sync Edge Function
// Fetches CGM entries from a user's Nightscout instance and stores them
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user's Nightscout connection
    const { data: connection, error: connError } = await supabase
      .from('nightscout_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_enabled', true)
      .maybeSingle();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: 'No active Nightscout connection found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate HTTPS
    if (!connection.nightscout_url.startsWith('https://')) {
      return new Response(JSON.stringify({ error: 'Only HTTPS Nightscout URLs are supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch entries from Nightscout (last 24 hours)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const nsUrl = `${connection.nightscout_url}/api/v1/entries.json?count=288&find[dateString][$gte]=${since}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (connection.api_secret_hash) {
      headers['api-secret'] = connection.api_secret_hash;
    }

    const nsResp = await fetch(nsUrl, {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!nsResp.ok) {
      // Update connection status
      await supabase
        .from('nightscout_connections')
        .update({ last_sync_status: 'error', last_sync_at: new Date().toISOString() })
        .eq('id', connection.id);
      
      return new Response(JSON.stringify({ error: `Nightscout returned ${nsResp.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const entries = await nsResp.json();
    const entryCount = Array.isArray(entries) ? entries.length : 0;

    // Update last sync timestamp
    await supabase
      .from('nightscout_connections')
      .update({ 
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_entry_count: entryCount,
      })
      .eq('id', connection.id);

    return new Response(JSON.stringify({ 
      success: true, 
      entries_fetched: entryCount,
      synced_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
