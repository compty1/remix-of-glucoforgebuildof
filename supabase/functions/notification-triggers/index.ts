import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Running notification triggers check...');

    // Get users with push notifications enabled
    const { data: enabledUsers, error: usersError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('push_enabled', true);

    if (usersError) {
      throw usersError;
    }

    if (!enabledUsers?.length) {
      console.log('No users with push notifications enabled');
      return new Response(
        JSON.stringify({ success: true, message: 'No users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = enabledUsers.map(u => u.user_id);
    console.log(`Found ${userIds.length} users with push enabled`);

    // Check for new research papers (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: newPapers, error: papersError } = await supabase
      .from('medical_research_papers')
      .select('id, title')
      .gte('created_at', oneDayAgo)
      .limit(5);

    if (!papersError && newPapers?.length) {
      console.log(`Found ${newPapers.length} new research papers`);
      
      for (const userId of userIds) {
        // Check user's content interests
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('content_interests')
          .eq('user_id', userId)
          .maybeSingle();

        if (prefs?.content_interests?.includes('research')) {
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'research',
              title: 'New Research Published',
              message: `${newPapers.length} new research paper(s) available`,
              action_url: '/research',
              is_read: false,
            });
        }
      }
    }

    // Check for device updates (new improvements)
    const { data: newImprovements, error: improvementsError } = await supabase
      .from('device_improvements')
      .select('id, improvement_title, device_id')
      .gte('created_at', oneDayAgo)
      .limit(5);

    if (!improvementsError && newImprovements?.length) {
      console.log(`Found ${newImprovements.length} new device improvements`);

      for (const userId of userIds) {
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('device_brands')
          .eq('user_id', userId)
          .maybeSingle();

        if (prefs?.device_brands?.length) {
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'device',
              title: 'Device Update Available',
              message: `${newImprovements.length} new device update(s)`,
              action_url: '/devices',
              is_read: false,
            });
        }
      }
    }

    // Check for trending community posts
    const { data: trendingPosts, error: postsError } = await supabase
      .from('community_posts')
      .select('id, title, score')
      .gte('published_at', oneDayAgo)
      .gte('score', 50)
      .limit(5);

    if (!postsError && trendingPosts?.length) {
      console.log(`Found ${trendingPosts.length} trending community posts`);

      for (const userId of userIds) {
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('content_interests')
          .eq('user_id', userId)
          .maybeSingle();

        if (prefs?.content_interests?.includes('community')) {
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'community',
              title: 'Trending in Community',
              message: `${trendingPosts.length} popular discussion(s) you might like`,
              action_url: '/community',
              is_read: false,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        usersChecked: userIds.length,
        newPapers: newPapers?.length || 0,
        newImprovements: newImprovements?.length || 0,
        trendingPosts: trendingPosts?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in notification-triggers:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
