import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if buzz already exists
    const { count } = await supabase
      .from("app_community_buzz")
      .select("*", { count: "exact", head: true });

    if (count && count > 100) {
      return new Response(
        JSON.stringify({ success: true, message: `App community buzz already seeded (${count} posts exist)` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get all apps
    const { data: apps } = await supabase.from("diabetes_apps").select("id, name");
    if (!apps || apps.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No apps found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const buzzTemplates = [
      // mySugr buzz
      { appName: 'mySugr', posts: [
        { content: 'Just discovered the mySugr bolus calculator and it\'s honestly changed my life. Finally doing split doses correctly.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 234, category: 'feature_praise' },
        { content: 'mySugr Pro subscription is so worth it. The estimated A1c tracking kept me accountable between endo visits.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 89, category: 'subscription' },
        { content: 'Wish mySugr had direct Dexcom integration instead of just Apple Health sync. Misses some readings.', source_platform: 'Reddit', sentiment: 'neutral', upvotes: 156, category: 'feature_request' },
        { content: 'The monster theme got my 10 year old actually excited about logging. Whoever designed that deserves an award.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 312, category: 'feature_praise' },
        { content: 'mySugr export to PDF for doctor visits is the most underrated feature. Clean, professional looking reports.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 178, category: 'feature_praise' },
        { content: 'Anyone else having sync issues with mySugr after the iOS 18 update? Lost 3 days of data.', source_platform: 'Twitter', sentiment: 'negative', upvotes: 45, category: 'bug_report' }
      ]},
      // Nightscout buzz
      { appName: 'Nightscout', posts: [
        { content: 'Setting up Nightscout was the best weekend project ever. Seeing my daughter\'s BG at work gives me peace.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 567, category: 'setup_success' },
        { content: 'The Nightscout + Loop combo should be FDA approved for saving marriages. No more 3am arguments about low alarms.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 423, category: 'humor' },
        { content: 'Nightscout community helped me troubleshoot for 6 hours. This open source community is incredible.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 289, category: 'community' },
        { content: 'Free Heroku tier going away hit hard. Had to migrate to Railway but it was worth the effort to keep NS running.', source_platform: 'Reddit', sentiment: 'neutral', upvotes: 234, category: 'hosting' },
        { content: 'Teacher called to thank me for the NS link. She can see before lows affect his learning. Game changer for school.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 678, category: 'real_world_impact' },
        { content: 'CGM in the Cloud Facebook group saved me weeks of frustration. Fastest setup support I\'ve ever experienced.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 345, category: 'community' }
      ]},
      // Sugarmate buzz
      { appName: 'Sugarmate', posts: [
        { content: 'Sugarmate Apple Watch complication > Dexcom app. There, I said it. No regrets.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 456, category: 'comparison' },
        { content: '"Hey Siri, what\'s my blood sugar?" might be my most used Siri command now thanks to Sugarmate.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 234, category: 'feature_praise' },
        { content: 'The text message alerts to my wife when I go low have literally saved my life twice. Not exaggerating.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 789, category: 'safety' },
        { content: 'Sugarmate was acquired by Tandem. Hoping they keep the app running and don\'t sunset it.', source_platform: 'Twitter', sentiment: 'neutral', upvotes: 345, category: 'news' },
        { content: 'Anyone else\'s Sugarmate struggling with the G7 integration? Works great with G6 but G7 is spotty.', source_platform: 'Reddit', sentiment: 'negative', upvotes: 123, category: 'bug_report' }
      ]},
      // Glooko buzz
      { appName: 'Glooko', posts: [
        { content: 'Finally an app that pulls from ALL my devices. Omnipod, Dexcom, and Contour all in one place.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 234, category: 'feature_praise' },
        { content: 'My endo\'s office switched to Glooko. Appointments are so much more productive when they\'ve seen my data beforehand.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 167, category: 'clinic_integration' },
        { content: 'Glooko feels more "clinical" than personal. Works great for medical use but mySugr is better for daily logging.', source_platform: 'Reddit', sentiment: 'neutral', upvotes: 98, category: 'comparison' },
        { content: 'The population health analytics in Glooko are wild. My endo showed me how I compare to other T1Ds anonymously.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 145, category: 'feature_praise' }
      ]},
      // Tidepool buzz
      { appName: 'Tidepool', posts: [
        { content: 'Tidepool being nonprofit and open source is exactly what diabetes tech needs. No profit motive = patient first.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 567, category: 'company_values' },
        { content: 'Tidepool Loop got FDA clearance! This is huge for the DIY community. Legitimacy matters.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 1234, category: 'news' },
        { content: 'The Tidepool data visualization is genuinely beautiful. Best overlaid view of insulin + carbs + glucose I\'ve seen.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 345, category: 'design' },
        { content: 'Uploaded 8 years of Medtronic data to Tidepool. Seeing my entire diabetes history visualized was emotional.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 456, category: 'personal_story' },
        { content: 'Tidepool Mobile could use some work but the web app is fantastic. Desktop-first design shows.', source_platform: 'Reddit', sentiment: 'neutral', upvotes: 123, category: 'feature_request' }
      ]},
      // Dexcom Clarity buzz
      { appName: 'Dexcom Clarity', posts: [
        { content: 'AGP reports in Clarity are the industry standard for a reason. Every endo knows how to read them instantly.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 234, category: 'feature_praise' },
        { content: 'Wish Clarity had a better Apple Watch app. Sugarmate fills the gap but shouldn\'t need a third party.', source_platform: 'Twitter', sentiment: 'neutral', upvotes: 189, category: 'feature_request' },
        { content: 'The automatic clinic sharing in Clarity is clutch. My endo reviews my data BEFORE appointments now.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 345, category: 'clinic_integration' },
        { content: 'Clarity patterns report helped me figure out my Dawn Phenomenon was actually a Somogyi effect. Changed everything.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 567, category: 'personal_story' }
      ]},
      // One Drop buzz
      { appName: 'One Drop', posts: [
        { content: 'The One Drop coaching is what sets it apart. Having a real CDE in my pocket when I need questions answered.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 234, category: 'coaching' },
        { content: 'One Drop Chrome meter is the most aesthetically pleasing diabetes device I own. Actually want to use it.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 178, category: 'design' },
        { content: 'Subscription model makes strips affordable. No more $1/strip at the pharmacy robbery.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 345, category: 'pricing' },
        { content: 'One Drop helped me finally understand how stress affects my blood sugar. The AI insights are surprisingly accurate.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 123, category: 'ai_insights' }
      ]},
      // LibreView buzz
      { appName: 'LibreView', posts: [
        { content: 'LibreView with Libre 3 is finally real-time. No more scanning every 8 hours. Game changer for Libre users.', source_platform: 'Reddit', sentiment: 'positive', upvotes: 456, category: 'feature_praise' },
        { content: 'LibreView AGP is identical quality to Dexcom Clarity. Don\'t let anyone tell you Libre is inferior for data.', source_platform: 'Twitter', sentiment: 'positive', upvotes: 234, category: 'comparison' },
        { content: 'Wish LibreView had better third-party integrations. Locked ecosystem compared to Dexcom.', source_platform: 'Reddit', sentiment: 'neutral', upvotes: 178, category: 'feature_request' },
        { content: 'LibreView + Libre 3 is the most cost-effective real CGM solution. Insurance covers it when Dexcom gets denied.', source_platform: 'Facebook', sentiment: 'positive', upvotes: 567, category: 'pricing' }
      ]}
    ];

    const buzzPosts = [];
    const appMap = new Map(apps.map(app => [app.name.toLowerCase(), app.id]));
    const now = new Date();

    for (const template of buzzTemplates) {
      const appId = appMap.get(template.appName.toLowerCase());
      for (const post of template.posts) {
        const daysAgo = Math.floor(Math.random() * 180) + 1; // Random date within last 6 months
        const publishedAt = new Date(now);
        publishedAt.setDate(publishedAt.getDate() - daysAgo);

        buzzPosts.push({
          app_id: appId || null,
          app_name: template.appName,
          content: post.content,
          source_platform: post.source_platform,
          sentiment: post.sentiment,
          upvotes: post.upvotes,
          category: post.category,
          author_anonymous: `u/${Math.random().toString(36).substring(2, 10)}`,
          published_at: publishedAt.toISOString(),
          source_url: post.source_platform === 'Reddit' ? 'https://reddit.com/r/diabetes' : 
                     post.source_platform === 'Twitter' ? 'https://twitter.com' :
                     post.source_platform === 'Facebook' ? 'https://facebook.com/groups/diabetes' : null
        });
      }
    }

    // Clear existing and insert new
    await supabase.from("app_community_buzz").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { error } = await supabase.from("app_community_buzz").insert(buzzPosts);
    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${buzzPosts.length} community buzz posts across ${buzzTemplates.length} apps` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-app-community-buzz:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
