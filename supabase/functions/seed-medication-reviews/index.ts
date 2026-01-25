import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if reviews already exist - allow up to 100 reviews
    const { count } = await supabase
      .from("medication_reviews")
      .select("*", { count: "exact", head: true });

    if (count && count > 80) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Medication reviews already seeded (${count} reviews exist)`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // First get medication IDs
    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("id, name")
      .limit(20);

    if (medError || !medications || medications.length === 0) {
      throw new Error("No medications found to create reviews for");
    }

    console.log(`Found ${medications.length} medications to create reviews for`);

    // Create a map of medication names to IDs
    const medMap = new Map(medications.map(m => [m.name.toLowerCase(), m.id]));

    // Review templates for realistic content
    const reviewTemplates = [
      // Humalog reviews
      {
        medication_name: "humalog",
        reviews: [
          {
            rating: 5,
            title: "Fast action for meal coverage",
            content: "Been using Humalog for 8 years. It kicks in within 10-15 minutes and handles meals well. I pre-bolus 10-15 mins before eating and rarely spike over 180.",
            pros: ["Fast onset", "Predictable action curve", "Works great with pump"],
            cons: ["Expensive without insurance", "Can stack if not careful"],
            effectiveness_rating: 5,
            side_effects_rating: 5,
            ease_of_use_rating: 4,
            duration_of_use: "5+ years",
            would_recommend: true
          },
          {
            rating: 4,
            title: "Reliable but needs pre-bolusing",
            content: "Humalog works well but you MUST pre-bolus for best results. When I don't, I spike to 200+. Started using it 3 years ago and it's become second nature.",
            pros: ["Reliable", "Well-studied", "Available in pens and vials"],
            cons: ["Requires timing discipline", "Tail can cause late lows"],
            effectiveness_rating: 4,
            side_effects_rating: 5,
            ease_of_use_rating: 3,
            duration_of_use: "1-5 years",
            would_recommend: true
          }
        ]
      },
      // Fiasp reviews
      {
        medication_name: "fiasp",
        reviews: [
          {
            rating: 5,
            title: "Game changer - almost no spike",
            content: "Switched from Humalog to Fiasp and the difference is night and day. It starts working in under 5 minutes for me. I can bolus when I start eating and stay flat.",
            pros: ["Ultra-fast onset", "Great for spontaneous eating", "Less pre-bolusing needed"],
            cons: ["Burns slightly on injection", "Slightly shorter duration"],
            effectiveness_rating: 5,
            side_effects_rating: 4,
            ease_of_use_rating: 5,
            duration_of_use: "6-12 months",
            would_recommend: true
          },
          {
            rating: 4,
            title: "Fast but burns at first",
            content: "The speed is fantastic - truly feels faster than Humalog. Minor burning sensation when injecting, especially in pumps. It faded after a few months for me.",
            pros: ["Very fast action", "Flexible timing", "Works great with closed loop"],
            cons: ["Initial injection site discomfort", "Higher cost"],
            effectiveness_rating: 5,
            side_effects_rating: 3,
            ease_of_use_rating: 4,
            duration_of_use: "1-5 years",
            would_recommend: true
          },
          {
            rating: 3,
            title: "Too fast for my pump algorithm",
            content: "Fiasp was too fast for my Control-IQ. It would over-correct because the insulin was gone before the algorithm expected. Went back to Novolog.",
            pros: ["Speed for injections", "Less planning needed"],
            cons: ["May not work well with all AID systems", "Occlusions in some pumps"],
            effectiveness_rating: 4,
            side_effects_rating: 3,
            ease_of_use_rating: 2,
            duration_of_use: "Less than 6 months",
            would_recommend: false
          }
        ]
      },
      // Lantus reviews
      {
        medication_name: "lantus",
        reviews: [
          {
            rating: 4,
            title: "Solid basal for 20 years",
            content: "I've been on Lantus since 2004. It's predictable and I know exactly how it affects me. Some people say Tresiba is flatter, but I prefer the devil I know.",
            pros: ["Long track record", "Widely available", "Predictable"],
            cons: ["Split dosing often needed", "Dawn phenomenon breakthrough"],
            effectiveness_rating: 4,
            side_effects_rating: 5,
            ease_of_use_rating: 4,
            duration_of_use: "5+ years",
            would_recommend: true
          },
          {
            rating: 3,
            title: "Works but has a peak",
            content: "Lantus has a subtle peak around 6-8 hours for me that causes afternoon lows if I'm not careful. Splitting the dose helped but it's another shot to remember.",
            pros: ["24-hour coverage", "Insurance covers it"],
            cons: ["Not truly peakless", "Can cause lows at peak time"],
            effectiveness_rating: 3,
            side_effects_rating: 4,
            ease_of_use_rating: 3,
            duration_of_use: "1-5 years",
            would_recommend: true
          }
        ]
      },
      // Tresiba reviews
      {
        medication_name: "tresiba",
        reviews: [
          {
            rating: 5,
            title: "Finally sleeping through the night",
            content: "After years of 3 AM lows on Lantus, Tresiba changed my life. The flat profile means no peaks, no lows, just steady basal coverage. Worth every penny.",
            pros: ["True 42+ hour duration", "Peakless profile", "Flexible dosing time"],
            cons: ["Expensive", "Takes 3-4 days to adjust dose"],
            effectiveness_rating: 5,
            side_effects_rating: 5,
            ease_of_use_rating: 5,
            duration_of_use: "1-5 years",
            would_recommend: true
          },
          {
            rating: 5,
            title: "The best basal insulin available",
            content: "I can miss my injection by hours and it doesn't matter. I can travel across time zones easily. My overnight graphs are flat lines now. Absolute game changer.",
            pros: ["Ultra-stable", "Time flexibility", "No splitting needed"],
            cons: ["High out-of-pocket cost", "Slow to adjust if dose is wrong"],
            effectiveness_rating: 5,
            side_effects_rating: 5,
            ease_of_use_rating: 5,
            duration_of_use: "1-5 years",
            would_recommend: true
          }
        ]
      },
      // Novolog reviews
      {
        medication_name: "novolog",
        reviews: [
          {
            rating: 4,
            title: "Workhorse insulin",
            content: "Novolog has been my rapid-acting for 10 years. Consistent, reliable, and I know exactly how it works. May not be the fastest but it gets the job done.",
            pros: ["Reliable", "Well-studied", "Good pump compatibility"],
            cons: ["Requires pre-bolusing", "Not as fast as Fiasp"],
            effectiveness_rating: 4,
            side_effects_rating: 5,
            ease_of_use_rating: 4,
            duration_of_use: "5+ years",
            would_recommend: true
          }
        ]
      },
      // Lyumjev reviews
      {
        medication_name: "lyumjev",
        reviews: [
          {
            rating: 5,
            title: "Faster than Humalog, less irritation than Fiasp",
            content: "Lyumjev is my sweet spot. It's noticeably faster than regular Humalog but doesn't burn like Fiasp did. I can bolus right when food arrives.",
            pros: ["Fast action", "Minimal site irritation", "Works well in pumps"],
            cons: ["Still relatively new", "May need dose adjustment from Humalog"],
            effectiveness_rating: 5,
            side_effects_rating: 4,
            ease_of_use_rating: 5,
            duration_of_use: "6-12 months",
            would_recommend: true
          },
          {
            rating: 4,
            title: "Good speed, some sites get red",
            content: "The speed is great but I get redness at about 30% of injection sites. Not painful, just cosmetic. Worth it for the improved post-meal control.",
            pros: ["Fast onset", "Better than regular lispro"],
            cons: ["Site reactions", "Learning curve for timing"],
            effectiveness_rating: 5,
            side_effects_rating: 3,
            ease_of_use_rating: 4,
            duration_of_use: "6-12 months",
            would_recommend: true
          }
        ]
      },
      // Basaglar reviews
      {
        medication_name: "basaglar",
        reviews: [
          {
            rating: 4,
            title: "Same as Lantus, half the price",
            content: "My insurance switched me to Basaglar from Lantus and I notice zero difference. Same action, same timing, same results. Much more affordable.",
            pros: ["Biosimilar savings", "Identical to Lantus", "Same pen design"],
            cons: ["Still has Lantus peak issues", "Some pharmacies don't stock it"],
            effectiveness_rating: 4,
            side_effects_rating: 5,
            ease_of_use_rating: 4,
            duration_of_use: "1-5 years",
            would_recommend: true
          }
        ]
      },
      // Ozempic reviews (if in T1D database for adjunct therapy)
      {
        medication_name: "ozempic",
        reviews: [
          {
            rating: 4,
            title: "Helps with insulin resistance and appetite",
            content: "My endo added Ozempic to help with insulin resistance. My total daily insulin dropped 30% and I finally lost some weight. Nausea was rough for 2 weeks.",
            pros: ["Reduces insulin needs", "Weight loss", "Glucose stability"],
            cons: ["Nausea initially", "GI side effects", "Expensive"],
            effectiveness_rating: 5,
            side_effects_rating: 2,
            ease_of_use_rating: 5,
            duration_of_use: "6-12 months",
            would_recommend: true
          }
        ]
      },
      // Metformin reviews
      {
        medication_name: "metformin",
        reviews: [
          {
            rating: 4,
            title: "Helpful for double diabetes",
            content: "I developed insulin resistance on top of T1D. Metformin extended release helped reduce my basal needs by about 15%. Extended release minimized the stomach issues.",
            pros: ["Reduces insulin resistance", "Cheap", "Long safety record"],
            cons: ["GI issues common", "B12 monitoring needed"],
            effectiveness_rating: 4,
            side_effects_rating: 3,
            ease_of_use_rating: 4,
            duration_of_use: "1-5 years",
            would_recommend: true
          }
        ]
      }
    ];

    const reviewsToInsert = [];
    
    for (const template of reviewTemplates) {
      const medId = medMap.get(template.medication_name);
      if (medId) {
        for (const review of template.reviews) {
          reviewsToInsert.push({
            medication_id: medId,
            user_id: null,
            rating: review.rating,
            title: review.title,
            content: review.content,
            pros: review.pros,
            cons: review.cons,
            effectiveness_rating: review.effectiveness_rating,
            side_effects_rating: review.side_effects_rating,
            ease_of_use_rating: review.ease_of_use_rating,
            duration_of_use: review.duration_of_use,
            would_recommend: review.would_recommend,
            helpful_count: Math.floor(Math.random() * 150) + 20
          });
        }
      }
    }

    if (reviewsToInsert.length === 0) {
      throw new Error("No reviews could be created - check medication names match");
    }

    console.log(`Inserting ${reviewsToInsert.length} medication reviews...`);

    const { error: insertError } = await supabase
      .from("medication_reviews")
      .insert(reviewsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log(`Successfully seeded ${reviewsToInsert.length} medication reviews`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${reviewsToInsert.length} medication reviews`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-medication-reviews:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
