import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Preferences {
  topics?: string[];
  devices?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email alerts");
      return new Response(
        JSON.stringify({ message: "Email not configured", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching active trending alert subscriptions...");

    // Get all active trending alert subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("email_subscriptions")
      .select("*")
      .eq("subscription_type", "trending_alerts")
      .eq("is_active", true);

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active subscriptions found");
      return new Response(
        JSON.stringify({ message: "No active subscriptions", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // Get trending posts from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: trendingPosts, error: postsError } = await supabase
      .from("community_posts")
      .select("*")
      .gte("published_at", oneDayAgo)
      .neq("post_type", "reply")
      .order("score", { ascending: false })
      .limit(50);

    if (postsError) {
      throw new Error(`Failed to fetch posts: ${postsError.message}`);
    }

    console.log(`Found ${trendingPosts?.length || 0} trending posts`);

    let emailsSent = 0;

    // Process each subscription
    for (const subscription of subscriptions) {
      const preferences = subscription.preferences as Preferences | null;
      const topics = preferences?.topics || [];
      const devices = preferences?.devices || [];

      if (topics.length === 0 && devices.length === 0) {
        continue;
      }

      // Filter posts matching user preferences
      const matchingPosts = (trendingPosts || []).filter(post => {
        // Check device match
        if (devices.length > 0 && post.device_mentioned) {
          const deviceLower = post.device_mentioned.toLowerCase();
          if (devices.some(d => deviceLower.includes(d.toLowerCase()))) {
            return true;
          }
        }

        // Check topic tag match
        if (topics.length > 0 && post.topic_tags) {
          if (post.topic_tags.some((tag: string) => 
            topics.some(t => tag.toLowerCase().includes(t.toLowerCase()))
          )) {
            return true;
          }
        }

        // Check title/content for topic keywords
        if (topics.length > 0) {
          const contentLower = `${post.title} ${post.content || ''}`.toLowerCase();
          if (topics.some(t => contentLower.includes(t.replace('_', ' ')))) {
            return true;
          }
        }

        return false;
      }).slice(0, 5);

      if (matchingPosts.length === 0) {
        console.log(`No matching posts for ${subscription.email}`);
        continue;
      }

      console.log(`Sending ${matchingPosts.length} matches to ${subscription.email}`);

      // Build email HTML
      const postsHtml = matchingPosts.map(post => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${post.title}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
            ${post.content ? post.content.substring(0, 200) + '...' : 'No content preview'}
          </p>
          <div style="font-size: 12px; color: #888;">
            <span>📊 ${post.score || 0} upvotes</span>
            <span style="margin-left: 10px;">💬 ${post.num_comments || 0} comments</span>
            <span style="margin-left: 10px;">📍 ${post.source}</span>
          </div>
          ${post.url ? `<a href="${post.url}" style="display: inline-block; margin-top: 10px; color: #0066cc;">View Original →</a>` : ''}
        </div>
      `).join('');

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">🔥 New Trending T1D Solutions</h1>
          <p style="color: #666;">We found ${matchingPosts.length} new community solutions matching your interests:</p>
          
          ${postsHtml}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px;">
            You're receiving this because you subscribed to trending T1D solutions alerts.
            <br>
            <a href="#" style="color: #0066cc;">Unsubscribe</a> | <a href="#" style="color: #0066cc;">Manage Preferences</a>
          </p>
          
          <p style="color: #888; font-size: 11px; font-style: italic;">
            Disclaimer: These are community experiences and should not replace medical advice.
          </p>
        </div>
      `;

      try {
        // Send email using Resend API directly
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "GlucoForge <alerts@resend.dev>",
            to: [subscription.email],
            subject: `🔥 ${matchingPosts.length} New T1D Solutions Matching Your Interests`,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`Resend API error for ${subscription.email}:`, errorText);
          continue;
        }

        // Update last_sent_at
        await supabase
          .from("email_subscriptions")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("id", subscription.id);

        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${subscription.email}:`, emailError);
      }
    }

    console.log(`Successfully sent ${emailsSent} alert emails`);

    return new Response(
      JSON.stringify({ 
        message: "Trending alerts processed", 
        sent: emailsSent,
        subscriptions: subscriptions.length,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-trending-alerts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
