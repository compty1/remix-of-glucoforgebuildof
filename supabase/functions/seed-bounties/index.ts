import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const bounties = [
      // RESEARCH CONTRIBUTION BOUNTIES
      {
        title: "Share Your CGM Data for Pattern Analysis",
        description: "Contribute 30+ days of anonymized CGM data to help our AI identify common glucose patterns and improve recommendations for the community. Your data helps build better pattern recognition for everyone.",
        category: "research",
        reward_amount: 25,
        status: "open",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
      },
      {
        title: "Complete 10-Question Survey on Insulin Timing",
        description: "Share your experience with pre-bolusing and insulin timing strategies. This survey takes about 5 minutes and helps us understand how different timing approaches work for different people.",
        category: "research",
        reward_amount: 15,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Document Your Pump Site Rotation for 30 Days",
        description: "Log your infusion site locations, duration, and any issues for 30 days. Help us build a comprehensive site rotation guide and identify optimal placement strategies.",
        category: "research",
        reward_amount: 40,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Submit Your Time-in-Range Data (3 months)",
        description: "Contribute 3 months of anonymized TIR, average glucose, and variability data along with your management approach. Help us identify what strategies lead to the best outcomes.",
        category: "research",
        reward_amount: 50,
        status: "open",
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Participate in Exercise Impact Study",
        description: "Track your blood sugar response to different types of exercise (cardio, strength, HIIT) over 4 weeks. Include pre-exercise levels, exercise type/duration, and post-exercise patterns.",
        category: "research",
        reward_amount: 60,
        status: "open",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },

      // CONTENT CREATION BOUNTIES
      {
        title: "Write Your T1D Diagnosis Story (500+ words)",
        description: "Share your journey from first symptoms through diagnosis and early management. Your story helps newly diagnosed individuals and families understand they're not alone. Stories will be published in our Warrior Spotlight section.",
        category: "content",
        reward_amount: 20,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Create a Tutorial Video for New CGM Users",
        description: "Record a 5-10 minute video walking through CGM setup, calibration tips, and common troubleshooting. Videos should be beginner-friendly and cover your specific CGM system (Dexcom, Libre, or Guardian).",
        category: "content",
        reward_amount: 75,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Document Your Meal Prep Routine",
        description: "Create a detailed guide to your diabetes-friendly meal prep including recipes, carb counts, and strategies for consistent glucose control. Include photos and shopping lists.",
        category: "content",
        reward_amount: 30,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Share Your Travel Kit Setup (Photos + List)",
        description: "Photograph your travel diabetes kit and provide a detailed packing list. Include TSA tips, backup supplies, and lessons learned from traveling with T1D.",
        category: "content",
        reward_amount: 15,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Write a Device Comparison Review",
        description: "If you've used multiple CGMs or pumps, write a detailed comparison of your experience. Include pros, cons, and specific scenarios where each device excelled or struggled.",
        category: "content",
        reward_amount: 35,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },

      // TESTING & FEEDBACK BOUNTIES
      {
        title: "Test New Glucose Tracking Feature",
        description: "Help us test a new glucose tracking feature before public release. Provide detailed feedback on usability, bugs, and suggestions. Requires 2 weeks of active testing.",
        category: "testing",
        reward_amount: 35,
        status: "open",
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Review 5 Diabetes Apps and Rate Them",
        description: "Download and test 5 diabetes management apps for at least 1 week each. Provide detailed reviews covering features, usability, CGM integration, and comparison to alternatives.",
        category: "testing",
        reward_amount: 25,
        status: "open",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Provide Feedback on Medication Hub",
        description: "Use our new Medication Hub for 1 week and provide structured feedback on the medication information, comparison features, and community reviews sections.",
        category: "testing",
        reward_amount: 20,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Accessibility Audit for Mobile Experience",
        description: "Test our mobile experience using screen readers or other accessibility tools. Document issues and provide recommendations for improving accessibility for users with disabilities.",
        category: "testing",
        reward_amount: 45,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },

      // DATA ENTRY BOUNTIES
      {
        title: "Help Verify 50 Device Specifications",
        description: "Review and verify specifications for 50 diabetes devices by checking manufacturer websites and documentation. Ensure our device database is accurate and up-to-date.",
        category: "data",
        reward_amount: 30,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Add Missing Insulin Pricing Data",
        description: "Research and document current retail prices for insulin products across major US pharmacies. Include manufacturer coupons and patient assistance program information.",
        category: "data",
        reward_amount: 25,
        status: "open",
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Categorize 100 Community Posts",
        description: "Review and add appropriate topic tags to 100 community posts that are missing categorization. Tags help other users find relevant content more easily.",
        category: "data",
        reward_amount: 40,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Research Diabetes Organizations in Your State",
        description: "Compile a list of diabetes support organizations, JDRF chapters, and ADA offices in your state with contact information, programs offered, and upcoming events.",
        category: "data",
        reward_amount: 20,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },

      // TRANSLATION BOUNTIES
      {
        title: "Translate Resource Guide to Spanish",
        description: "Translate our 20-page 'Newly Diagnosed Guide' from English to Spanish. Must be fluent in both languages with understanding of diabetes terminology.",
        category: "translation",
        reward_amount: 100,
        status: "open",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Translate CGM Tutorial to Portuguese",
        description: "Translate our CGM setup tutorial video script (1,500 words) to Brazilian Portuguese. Voiceover recording assistance available.",
        category: "translation",
        reward_amount: 50,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },

      // COMMUNITY BOUNTIES
      {
        title: "Host a Virtual T1D Meetup",
        description: "Organize and host a 1-hour virtual meetup for the community on a specific topic (newly diagnosed, pumping, exercise, etc.). We'll provide platform access and promotion.",
        category: "community",
        reward_amount: 40,
        status: "open",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Moderate Community Forum for 1 Month",
        description: "Help moderate our community forum by reviewing flagged posts, welcoming new members, and ensuring discussions remain supportive. Requires 1-2 hours per week.",
        category: "community",
        reward_amount: 80,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Answer 20 Newcomer Questions",
        description: "Provide thoughtful, supportive answers to 20 questions from newly diagnosed community members or their families. Answers should be based on personal experience and include appropriate disclaimers.",
        category: "community",
        reward_amount: 25,
        status: "open",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Insert bounties
    const { data, error } = await supabase
      .from('bounties')
      .upsert(bounties, { onConflict: 'title' });

    if (error) {
      console.error('Error seeding bounties:', error);
      throw error;
    }

    const categories = bounties.reduce((acc, bounty) => {
      const cat = bounty.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRewards = bounties.reduce((sum, b) => sum + (b.reward_amount || 0), 0);

    console.log(`Successfully seeded ${bounties.length} bounties worth $${totalRewards} total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${bounties.length} bounties worth $${totalRewards}`,
        categories
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in seed-bounties:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
