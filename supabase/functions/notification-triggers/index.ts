import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users with push notifications enabled
    const { data: enabledUsers, error: usersError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('push_enabled', true);

    if (usersError) throw usersError;

    if (!enabledUsers?.length) {
      return jsonResponse({ success: true, message: 'No users to notify' });
    }

    const userIds = enabledUsers.map(u => u.user_id);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Parallel checks for new content
    const [papersResult, improvementsResult, postsResult] = await Promise.all([
      supabase.from('medical_research_papers').select('id, title').gte('created_at', oneDayAgo).limit(5),
      supabase.from('device_improvements').select('id, improvement_title').gte('created_at', oneDayAgo).limit(5),
      supabase.from('community_posts').select('id, title, score').gte('published_at', oneDayAgo).gte('score', 50).limit(5),
    ]);

    const newPapers = papersResult.data || [];
    const newImprovements = improvementsResult.data || [];
    const trendingPosts = postsResult.data || [];

    // Batch create notifications for each user
    const notifications: any[] = [];
    for (const userId of userIds) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('content_interests, device_brands')
        .eq('user_id', userId)
        .maybeSingle();

      if (newPapers.length && prefs?.content_interests?.includes('research')) {
        notifications.push({
          user_id: userId, type: 'research', title: 'New Research Published',
          message: `${newPapers.length} new research paper(s) available`, action_url: '/research', is_read: false,
        });
      }
      if (newImprovements.length && prefs?.device_brands?.length) {
        notifications.push({
          user_id: userId, type: 'device', title: 'Device Update Available',
          message: `${newImprovements.length} new device update(s)`, action_url: '/devices', is_read: false,
        });
      }
      if (trendingPosts.length && prefs?.content_interests?.includes('community')) {
        notifications.push({
          user_id: userId, type: 'community', title: 'Trending in Community',
          message: `${trendingPosts.length} popular discussion(s) you might like`, action_url: '/community', is_read: false,
        });
      }
    }

    if (notifications.length) {
      await supabase.from('notifications').insert(notifications);
    }

    return jsonResponse({
      success: true,
      usersChecked: userIds.length,
      notificationsCreated: notifications.length,
      newPapers: newPapers.length,
      newImprovements: newImprovements.length,
      trendingPosts: trendingPosts.length,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message, 500);
  }
});
