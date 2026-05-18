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

    // Check if reviews already exist
    const { count } = await supabase
      .from("app_reviews")
      .select("*", { count: "exact", head: true });

    if (count && count > 80) {
      return new Response(
        JSON.stringify({ success: true, message: `App reviews already seeded (${count} reviews exist)` }),
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

    const reviewTemplates = [
      // mySugr reviews
      { appName: 'mySugr', reviews: [
        { rating: 5, author: 'DiabetesDad2020', content: 'Best logging app I\'ve found. The Bolus Calculator is a game-changer and the data export to PDF for my endo visits saves so much time. Been using it for 3 years now.', source_platform: 'App Store' },
        { rating: 5, author: 'T1DRunner', content: 'Love how it syncs with my Accu-Chek meter automatically. The monster feature for kids is clever. Customer support is responsive too.', source_platform: 'Google Play' },
        { rating: 4, author: 'CarbCounterPro', content: 'Great for tracking but wish it had better integration with CGMs. The food database could be more comprehensive. Still, best logging experience overall.', source_platform: 'Reddit' },
        { rating: 4, author: 'InsulinLife', content: 'Pro subscription is worth it for the analysis features. The weekly and monthly reports help me spot patterns I\'d miss otherwise.', source_platform: 'App Store' },
        { rating: 3, author: 'NewlyDiagnosed', content: 'Good app but steep learning curve. Took a few weeks to figure out all the features. Once you get it, it\'s powerful though.', source_platform: 'Google Play' },
        { rating: 5, author: 'SugarMom', content: 'Using this for my daughter. The monster theme makes her actually want to log her numbers! Parental oversight features are exactly what we needed.', source_platform: 'App Store' },
        { rating: 4, author: 'LoopUser123', content: 'Works well alongside my DIY Loop setup. Data syncs reliably and the interface is clean. Minor bugs occasionally but updates fix them quickly.', source_platform: 'Reddit' },
        { rating: 5, author: 'EndoApproved', content: 'As someone managing T1D for 25 years, this is the best tool I\'ve used. The Roche integration and data visualization are excellent.', source_platform: 'Google Play' }
      ]},
      // Nightscout reviews
      { appName: 'Nightscout', reviews: [
        { rating: 5, author: 'DIYDiabetes', content: 'Changed our lives. Being able to see my son\'s glucose at school gave us peace of mind we didn\'t know was possible. Worth every minute of setup.', source_platform: 'Reddit' },
        { rating: 5, author: 'TechDad', content: 'The open-source community is incredible. New features constantly. Heroku hosting is free and setup guides are thorough.', source_platform: 'Facebook' },
        { rating: 4, author: 'T1DMom2Boys', content: 'Steep technical learning curve but so worth it. Pebble watch integration was a game-changer for us. Would recommend to any parent.', source_platform: 'Reddit' },
        { rating: 5, author: 'OpenSourceFan', content: 'This is what diabetes tech should be - open, customizable, community-driven. The careportal makes remote management actually work.', source_platform: 'GitHub' },
        { rating: 3, author: 'NonTechMom', content: 'Powerful but needed help from the Facebook group to set it up. Once running it\'s amazing, but not for the technically challenged.', source_platform: 'Facebook' },
        { rating: 5, author: 'GlobalDiabetes', content: 'Using this in South Africa where commercial CGM apps have limited support. Nightscout works everywhere and the community is globally supportive.', source_platform: 'Reddit' },
        { rating: 4, author: 'LoopBuilder', content: 'Essential for any DIY closed loop. The API is well documented and the plugins add functionality beyond any commercial solution.', source_platform: 'GitHub' }
      ]},
      // Sugarmate reviews  
      { appName: 'Sugarmate', reviews: [
        { rating: 5, author: 'DexcomLover', content: 'The Apple Watch complication shows my glucose on my watch face - something Dexcom should have done years ago. This is the real killer feature.', source_platform: 'App Store' },
        { rating: 5, author: 'SiriIntegration', content: '"Hey Siri, what\'s my blood sugar?" - this alone is worth installing. The Alexa and Google Home integration is equally good.', source_platform: 'Reddit' },
        { rating: 4, author: 'SharedCareGiver', content: 'The follower features are excellent. Multiple caregivers can follow without needing separate Dexcom Share invites.', source_platform: 'App Store' },
        { rating: 4, author: 'WatchObsessed', content: 'Best Dexcom companion app for Apple Watch users. The complications are beautiful and actually show the trend arrow clearly.', source_platform: 'Reddit' },
        { rating: 5, author: 'TextAlerts4Me', content: 'Custom text alerts to my spouse when I go low at night have prevented several emergencies. Worth every penny of the premium.', source_platform: 'Google Play' },
        { rating: 3, author: 'AndroidUser', content: 'Features aren\'t as polished on Android as iOS. Works but you can tell it was iOS-first development.', source_platform: 'Google Play' }
      ]},
      // Glooko reviews
      { appName: 'Glooko', reviews: [
        { rating: 5, author: 'ClinicManager', content: 'From a healthcare provider perspective, this is the gold standard. Having all patient data in one place regardless of device brand is invaluable.', source_platform: 'App Store' },
        { rating: 4, author: 'MultiDeviceUser', content: 'Finally something that pulls data from my Omnipod, Dexcom, AND Accu-Chek all together. The unified reports are great for endo visits.', source_platform: 'Google Play' },
        { rating: 4, author: 'DataExporter', content: 'Population health features are powerful if your clinic uses it. Being able to upload to their portal before appointments saves chair time.', source_platform: 'Reddit' },
        { rating: 3, author: 'HomeUser', content: 'More enterprise-focused than consumer-friendly. Works well but the interface feels clinical rather than personal.', source_platform: 'App Store' },
        { rating: 5, author: 'ResearchParticipant', content: 'Been using this for a clinical trial. The data quality and export features are exactly what research needs. Very reliable.', source_platform: 'Facebook' }
      ]},
      // Tidepool reviews
      { appName: 'Tidepool', reviews: [
        { rating: 5, author: 'OpenSourceAdvocate', content: 'Free, open source, and works with almost every device. This is how diabetes data should work. The nonprofit model gives me trust.', source_platform: 'Reddit' },
        { rating: 5, author: 'TandemLooper', content: 'Native Tandem integration is seamless. All my Control-IQ data in one beautiful timeline view. Love the "Basics" aggregation view.', source_platform: 'App Store' },
        { rating: 4, author: 'DataNerd', content: 'The visualizations are the best I\'ve seen. Being able to see insulin, carbs, and glucose on one timeline is incredibly helpful for pattern recognition.', source_platform: 'Reddit' },
        { rating: 4, author: 'MedtronicUser', content: 'Works with my old Medtronic pump which most apps don\'t support anymore. Great for legacy device users.', source_platform: 'Facebook' },
        { rating: 5, author: 'FDACleared', content: 'The fact that Tidepool Loop got FDA clearance shows the quality. Using the beta and it\'s solid.', source_platform: 'Reddit' },
        { rating: 3, author: 'MobileFirst', content: 'Web app is better than mobile. Would love to see more mobile-first features and better offline support.', source_platform: 'App Store' }
      ]},
      // Dexcom Clarity reviews
      { appName: 'Dexcom Clarity', reviews: [
        { rating: 5, author: 'AGPFan', content: 'The AGP report is the industry standard for a reason. My endo can read it instantly and make informed adjustments.', source_platform: 'App Store' },
        { rating: 4, author: 'G7User', content: 'Works great with G7. Automatic uploads mean I never have to remember to sync before appointments.', source_platform: 'Google Play' },
        { rating: 4, author: 'TimeInRange', content: 'Love seeing my TIR trends over time. The comparisons between time periods help me see if changes are working.', source_platform: 'App Store' },
        { rating: 3, author: 'ShareFrustrated', content: 'Good for personal use but Share features are limited compared to third-party apps like Sugarmate.', source_platform: 'Reddit' },
        { rating: 5, author: 'ClinicIntegrated', content: 'Clinic sharing works perfectly. My endo reviews my data before appointments which makes visits more productive.', source_platform: 'Google Play' },
        { rating: 4, author: 'CGMNewbie', content: 'Easy to use and understand. The patterns report helped me identify my problem times of day quickly.', source_platform: 'App Store' }
      ]},
      // Glucose Buddy reviews
      { appName: 'Glucose Buddy', reviews: [
        { rating: 4, author: 'SimpleLogger', content: 'Clean, simple interface. Doesn\'t try to do too much. Just logs glucose, meds, food, and exercise without overwhelming.', source_platform: 'App Store' },
        { rating: 4, author: 'T2DManagement', content: 'Great for Type 2 management. The medication reminders are reliable and the A1c estimator is helpful.', source_platform: 'Google Play' },
        { rating: 3, author: 'LongTimeUser', content: 'Been using since 2010. Reliable but hasn\'t evolved much. Would love to see CGM integration.', source_platform: 'App Store' },
        { rating: 5, author: 'BackToBasics', content: 'After trying every fancy app, I came back to Glucose Buddy. Sometimes simple is better.', source_platform: 'Reddit' },
        { rating: 4, author: 'HealthKitSync', content: 'Apple Health integration works well. All my data flows to Health app for a unified view.', source_platform: 'App Store' }
      ]},
      // Diabits reviews
      { appName: 'Diabits', reviews: [
        { rating: 5, author: 'AIBeliever', content: 'The AI predictions are surprisingly accurate. Warns me about predicted lows 30-60 minutes ahead.', source_platform: 'App Store' },
        { rating: 4, author: 'GlucoseForecast', content: 'Predictive alerts have prevented several lows. The machine learning actually seems to learn my patterns.', source_platform: 'Google Play' },
        { rating: 4, author: 'TechForward', content: 'Most innovative diabetes app I\'ve tried. The predictions get more accurate over time as it learns you.', source_platform: 'Reddit' },
        { rating: 3, author: 'SkepticalUser', content: 'Predictions are hit or miss early on. Need to use it for 2-3 weeks before it starts being useful.', source_platform: 'App Store' },
        { rating: 5, author: 'NightTimeHelper', content: 'The overnight predictions have been a sleep saver. I can go to bed knowing it\'ll warn me.', source_platform: 'Google Play' }
      ]},
      // One Drop reviews
      { appName: 'One Drop', reviews: [
        { rating: 5, author: 'CoachingFan', content: 'The certified diabetes educator coaching is worth the subscription alone. Real human support when you need it.', source_platform: 'App Store' },
        { rating: 4, author: 'AllInOneDevice', content: 'Their meter + app combo is sleek. The Chrome meter is beautiful and the strips are affordable with subscription.', source_platform: 'Google Play' },
        { rating: 4, author: 'AIandHuman', content: 'Combination of AI insights and human coaching is unique. Best of both worlds for behavior change.', source_platform: 'Reddit' },
        { rating: 3, author: 'T1DPerspective', content: 'More T2D focused but still useful for T1D. The coaching understands the difference when you specify.', source_platform: 'App Store' },
        { rating: 5, author: 'LifestyleChange', content: 'One Drop helped me finally get my A1c under 7. The coaching accountability was what I needed.', source_platform: 'Facebook' }
      ]},
      // LibreView reviews
      { appName: 'LibreView', reviews: [
        { rating: 5, author: 'Libre3User', content: 'Libre 3 real-time integration is seamless. Finally works as well as Dexcom for continuous monitoring.', source_platform: 'App Store' },
        { rating: 4, author: 'AGPReport', content: 'The AGP report is industry standard. Easy to share with healthcare team directly from the app.', source_platform: 'Google Play' },
        { rating: 4, author: 'GlobalAccess', content: 'Works in more countries than Dexcom Clarity. Important for those of us who travel internationally.', source_platform: 'Reddit' },
        { rating: 3, author: 'Libre2Lag', content: 'Libre 2 scanning gets tedious. Wish they\'d add automatic upload for all sensor versions.', source_platform: 'App Store' },
        { rating: 5, author: 'CostConscious', content: 'Between Libre being cheaper and LibreView being free, this is the affordable CGM ecosystem.', source_platform: 'Facebook' }
      ]}
    ];

    const reviews = [];
    const appMap = new Map(apps.map(app => [app.name.toLowerCase(), app.id]));

    for (const template of reviewTemplates) {
      const appId = appMap.get(template.appName.toLowerCase());
      if (appId) {
        for (const review of template.reviews) {
          reviews.push({
            app_id: appId,
            rating: review.rating,
            author: review.author,
            content: review.content,
            source_platform: review.source_platform,
            source_url: review.source_platform === 'Reddit' ? 'https://reddit.com/r/diabetes' : null
          });
        }
      }
    }

    // Clear existing and insert new
    await supabase.from("app_reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { error } = await supabase.from("app_reviews").insert(reviews);
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: `Seeded ${reviews.length} app reviews across ${reviewTemplates.length} apps` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-app-reviews:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
