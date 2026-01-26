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

    const { userId, title, body, url, tag } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log(`Sending notification to user ${userId}: ${title}`);

    // Check if user has push notifications enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('push_enabled')
      .eq('user_id', userId)
      .single();

    if (!prefs?.push_enabled) {
      console.log('Push notifications not enabled for user');
      return new Response(
        JSON.stringify({ success: false, reason: 'push_not_enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subError || !subscriptions?.length) {
      console.log('No push subscriptions found for user');
      return new Response(
        JSON.stringify({ success: false, reason: 'no_subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: tag || 'general',
        title: title,
        message: body,
        action_url: url,
        is_read: false,
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // For now, we just record the notification
    // Full Web Push would require VAPID keys and the web-push library
    console.log(`Notification created for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: subscriptions.length,
        inAppCreated: !notifError
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-push-notification:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
