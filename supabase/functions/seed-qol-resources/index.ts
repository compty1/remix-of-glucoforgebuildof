import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    console.log('🌱 Seeding Quality of Life resources...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing data
    await supabase.from('quality_of_life_resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('t1d_supplement_deficiencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Supplement deficiencies common in T1D
    const deficiencies = [
      {
        nutrient_name: "Vitamin D",
        prevalence_in_t1d: 78,
        symptoms_of_deficiency: ["Fatigue", "Bone pain", "Muscle weakness", "Depression", "Impaired wound healing", "Increased infections"],
        recommended_daily_amount: "1,000-4,000 IU daily",
        food_sources: ["Fatty fish", "Egg yolks", "Fortified milk", "Mushrooms exposed to UV light"],
        supplement_form: "Vitamin D3 (cholecalciferol)",
        testing_method: "25-hydroxyvitamin D blood test",
        interaction_with_insulin: "May improve insulin sensitivity. Low vitamin D linked to higher A1C.",
        optimal_timing: "With fatty meal for better absorption"
      },
      {
        nutrient_name: "Magnesium",
        prevalence_in_t1d: 65,
        symptoms_of_deficiency: ["Muscle cramps", "Fatigue", "Irregular heartbeat", "Numbness", "Poor blood sugar control"],
        recommended_daily_amount: "310-420 mg daily",
        food_sources: ["Dark chocolate", "Avocados", "Nuts", "Seeds", "Leafy greens", "Legumes"],
        supplement_form: "Magnesium glycinate or citrate",
        testing_method: "Serum magnesium or RBC magnesium test",
        interaction_with_insulin: "Critical for insulin signaling. Deficiency causes insulin resistance.",
        optimal_timing: "Evening, may help sleep quality"
      },
      {
        nutrient_name: "Vitamin B12",
        prevalence_in_t1d: 40,
        symptoms_of_deficiency: ["Fatigue", "Weakness", "Numbness/tingling", "Memory problems", "Balance issues"],
        recommended_daily_amount: "2.4 mcg daily (higher if on metformin)",
        food_sources: ["Meat", "Fish", "Eggs", "Dairy", "Fortified cereals"],
        supplement_form: "Methylcobalamin or cyanocobalamin",
        testing_method: "Serum B12, methylmalonic acid (MMA)",
        interaction_with_insulin: "Metformin depletes B12. Essential for nerve function.",
        optimal_timing: "Morning with breakfast"
      },
      {
        nutrient_name: "Zinc",
        prevalence_in_t1d: 35,
        symptoms_of_deficiency: ["Poor wound healing", "Hair loss", "Decreased taste", "Frequent infections", "Skin problems"],
        recommended_daily_amount: "8-11 mg daily",
        food_sources: ["Oysters", "Beef", "Pumpkin seeds", "Chickpeas", "Cashews"],
        supplement_form: "Zinc picolinate or gluconate",
        testing_method: "Serum zinc level",
        interaction_with_insulin: "Important for insulin storage and secretion in beta cells.",
        optimal_timing: "With food to prevent nausea"
      },
      {
        nutrient_name: "Omega-3 Fatty Acids",
        prevalence_in_t1d: 55,
        symptoms_of_deficiency: ["Dry skin", "Joint pain", "Mood changes", "Poor concentration", "Cardiovascular issues"],
        recommended_daily_amount: "1,000-2,000 mg EPA+DHA daily",
        food_sources: ["Fatty fish (salmon, mackerel)", "Flaxseeds", "Chia seeds", "Walnuts"],
        supplement_form: "Fish oil or algae-based omega-3",
        testing_method: "Omega-3 index blood test",
        interaction_with_insulin: "Reduces inflammation. May improve cardiovascular outcomes in T1D.",
        optimal_timing: "With meals to reduce fishy burps"
      },
      {
        nutrient_name: "Alpha-Lipoic Acid",
        prevalence_in_t1d: 70,
        symptoms_of_deficiency: ["Neuropathy symptoms", "Poor antioxidant status", "Fatigue"],
        recommended_daily_amount: "300-600 mg daily",
        food_sources: ["Spinach", "Broccoli", "Organ meats", "Tomatoes"],
        supplement_form: "R-lipoic acid (most bioavailable)",
        testing_method: "Not routinely tested; clinical assessment",
        interaction_with_insulin: "May lower blood sugar; monitor closely when starting.",
        optimal_timing: "On empty stomach, 30 min before meals"
      },
      {
        nutrient_name: "Chromium",
        prevalence_in_t1d: 30,
        symptoms_of_deficiency: ["Poor glucose tolerance", "Weight gain", "Anxiety", "Fatigue"],
        recommended_daily_amount: "25-35 mcg daily",
        food_sources: ["Broccoli", "Grape juice", "Whole grains", "Beef"],
        supplement_form: "Chromium picolinate",
        testing_method: "Not commonly tested; clinical response",
        interaction_with_insulin: "Enhances insulin sensitivity. May reduce insulin requirements.",
        optimal_timing: "With meals"
      }
    ];

    // Quality of Life resources
    const resources = [
      // Supplements
      {
        category: "supplements",
        name: "Vitamin D3 Supplementation",
        description: "Essential fat-soluble vitamin that 78% of T1D patients are deficient in. Critical for immune function, bone health, and may improve insulin sensitivity.",
        benefits_for_t1d: "Studies show correlation between vitamin D levels and A1C. May reduce risk of T1D-related complications and support immune regulation.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "1,000-4,000 IU daily based on blood levels",
        precautions: "Have levels tested before high-dose supplementation. Can interact with some medications.",
        cost_range: "$10-25/month",
        availability: "OTC at pharmacies and health stores"
      },
      {
        category: "supplements",
        name: "Magnesium Glycinate",
        description: "Highly absorbable form of magnesium that supports muscle function, sleep quality, and blood sugar control.",
        benefits_for_t1d: "Essential for insulin signaling. May reduce insulin resistance, improve sleep, and decrease muscle cramps common in diabetes.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "200-400 mg before bed",
        precautions: "Start low, can cause loose stools. Avoid if kidney function is impaired.",
        cost_range: "$15-30/month",
        availability: "Health food stores, online retailers"
      },
      {
        category: "supplements",
        name: "Alpha-Lipoic Acid (ALA)",
        description: "Powerful antioxidant that may help with diabetic neuropathy and oxidative stress reduction.",
        benefits_for_t1d: "Clinical trials show improvement in neuropathy symptoms. Provides antioxidant support for diabetes-related oxidative stress.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        dosage_info: "300-600 mg daily",
        precautions: "May lower blood sugar - monitor glucose closely when starting. Take on empty stomach.",
        cost_range: "$20-40/month",
        availability: "Health food stores, online"
      },
      {
        category: "supplements",
        name: "Omega-3 Fish Oil",
        description: "Essential fatty acids EPA and DHA that support heart health and reduce inflammation.",
        benefits_for_t1d: "T1D patients have higher cardiovascular risk. Omega-3s reduce triglycerides and inflammation. May support mental health.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "1,000-2,000 mg EPA+DHA daily",
        precautions: "Choose quality brands tested for purity. May increase bleeding risk at very high doses.",
        cost_range: "$15-35/month",
        availability: "Widely available at pharmacies"
      },

      // Management Tools
      {
        category: "tools",
        name: "Frio Cooling Cases",
        description: "Evaporative cooling wallets that keep insulin at safe temperatures without electricity or ice for up to 45 hours.",
        benefits_for_t1d: "Essential for travel, outdoor activities, and hot climates. Eliminates worry about insulin degradation from heat exposure.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        cost_range: "$25-45",
        availability: "Online, diabetes supply retailers"
      },
      {
        category: "tools",
        name: "Sharps Mail-Back Container",
        description: "Pre-paid sharps disposal containers that can be mailed back for safe disposal when full.",
        benefits_for_t1d: "Convenient, safe needle disposal without finding local drop-off sites. Important for environmental responsibility.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        cost_range: "$20-35 per container",
        availability: "Online diabetes suppliers, pharmacies"
      },
      {
        category: "tools",
        name: "Glucose Tabs Keychain Holder",
        description: "Compact, waterproof keychain holder for fast-acting glucose tabs. Always have hypo treatment available.",
        benefits_for_t1d: "Peace of mind knowing you always have glucose available. Reduces anxiety about being caught without treatment.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        cost_range: "$8-15",
        availability: "Etsy, Amazon, diabetes accessory sites"
      },
      {
        category: "tools",
        name: "Medical ID Jewelry",
        description: "Bracelets, necklaces, or tags that identify you as having Type 1 Diabetes in emergencies.",
        benefits_for_t1d: "Critical safety item. First responders check for medical IDs. Can prevent dangerous mistreatment in emergencies.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        cost_range: "$15-100+",
        availability: "Road ID, American Medical ID, local jewelers"
      },

      // Prescription Savings
      {
        category: "prescription",
        name: "GoodRx",
        description: "Free app that compares prescription prices across pharmacies and provides discount coupons.",
        benefits_for_t1d: "Can save 50-80% on insulin and supplies at participating pharmacies. No insurance required.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        source_url: "https://www.goodrx.com",
        cost_range: "Free to use",
        availability: "App stores, website"
      },
      {
        category: "prescription",
        name: "Manufacturer Patient Assistance Programs",
        description: "Programs from Eli Lilly, Novo Nordisk, and Sanofi providing free or reduced-cost insulin to qualifying patients.",
        benefits_for_t1d: "Can provide free insulin for those who qualify based on income. Significant cost savings.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        source_url: "https://getinsulin.org",
        cost_range: "Free to $35/month depending on program",
        availability: "Apply through manufacturer websites"
      },
      {
        category: "prescription",
        name: "Mark Cuban Cost Plus Drugs",
        description: "Online pharmacy offering medications at cost plus 15% markup plus $3 dispensing fee.",
        benefits_for_t1d: "Transparent pricing on many diabetes medications. Often significantly cheaper than retail.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        source_url: "https://costplusdrugs.com",
        cost_range: "Varies by medication",
        availability: "Online only with valid prescription"
      },

      // Symptom Relief
      {
        category: "symptom_relief",
        name: "Capsaicin Cream for Neuropathy",
        description: "Topical cream derived from chili peppers that can reduce neuropathic pain signals.",
        benefits_for_t1d: "FDA-approved for diabetic neuropathy. Can reduce burning, tingling sensations in hands and feet.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "Apply 3-4 times daily. Takes 2-4 weeks for full effect.",
        precautions: "Wash hands after applying. Avoid eyes and broken skin. Initial burning sensation is normal.",
        cost_range: "$10-25",
        availability: "OTC at pharmacies (Zostrix, Capzasin)"
      },
      {
        category: "symptom_relief",
        name: "Compression Socks for Circulation",
        description: "Graduated compression hosiery that improves blood flow and reduces swelling in legs and feet.",
        benefits_for_t1d: "Helps with circulation issues common in diabetes. Reduces swelling, fatigue, and may help prevent complications.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        cost_range: "$15-40 per pair",
        availability: "Pharmacies, online, medical supply stores"
      },
      {
        category: "symptom_relief",
        name: "Moisturizing Foot Cream",
        description: "Specialized diabetic foot cream that hydrates without leaving residue between toes.",
        benefits_for_t1d: "Prevents dry, cracked skin that can lead to infections. Essential part of diabetic foot care routine.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "Apply daily, especially after bathing",
        precautions: "Avoid applying between toes where moisture can cause fungal infections.",
        cost_range: "$8-20",
        availability: "Pharmacies (Eucerin, CeraVe, Flexitol)"
      },

      // Lifestyle
      {
        category: "lifestyle",
        name: "Post-Meal Walking Protocol",
        description: "10-15 minute walk after meals to significantly reduce post-meal glucose spikes.",
        benefits_for_t1d: "Studies show 30-50% reduction in post-meal spikes. Simple, free, and effective glucose management tool.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "10-15 minutes starting 15-30 minutes after eating",
        cost_range: "Free",
        availability: "Anywhere you can walk safely"
      },
      {
        category: "lifestyle",
        name: "CGM Alert Optimization",
        description: "Strategic adjustment of CGM alerts to reduce alarm fatigue while maintaining safety.",
        benefits_for_t1d: "Better sleep quality, reduced stress and burnout. Set urgent low at 55, predictive low at 80, high at 200+ initially.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        cost_range: "Free (CGM setting changes)",
        availability: "Through your CGM app settings"
      },
      {
        category: "lifestyle",
        name: "Structured Diabetes Breaks",
        description: "Scheduled periods where you focus less intensely on diabetes management to prevent burnout.",
        benefits_for_t1d: "Reduces diabetes distress and burnout. Improves long-term adherence and mental health outcomes.",
        scientific_evidence_level: "moderate",
        recommended_by_community: true,
        precautions: "Maintain safety baselines even during breaks. Not appropriate during illness or major life changes.",
        cost_range: "Free",
        availability: "Self-scheduled, consider discussing with care team"
      },
      {
        category: "lifestyle",
        name: "Sleep Hygiene for Stable Overnight Glucose",
        description: "Evidence-based sleep practices that can improve overnight glucose stability and reduce dawn phenomenon.",
        benefits_for_t1d: "Better sleep improves insulin sensitivity, reduces stress hormones, and can lead to more stable overnight glucose.",
        scientific_evidence_level: "strong",
        recommended_by_community: true,
        dosage_info: "7-9 hours nightly, consistent sleep/wake times",
        cost_range: "Free",
        availability: "Lifestyle modifications"
      }
    ];

    // Insert deficiencies
    const { error: defError } = await supabase
      .from('t1d_supplement_deficiencies')
      .insert(deficiencies);

    if (defError) {
      console.error('Error inserting deficiencies:', defError);
      throw defError;
    }

    // Insert resources
    const { error: resError } = await supabase
      .from('quality_of_life_resources')
      .insert(resources);

    if (resError) {
      console.error('Error inserting resources:', resError);
      throw resError;
    }

    console.log(`✅ Seeded ${deficiencies.length} deficiencies and ${resources.length} resources`);

    return new Response(
      JSON.stringify({
        success: true,
        deficiencies_count: deficiencies.length,
        resources_count: resources.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error seeding QoL resources:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
