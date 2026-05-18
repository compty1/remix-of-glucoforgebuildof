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

    // Check if data already exists
    const { count } = await supabase
      .from("diabetes_myths")
      .select("*", { count: "exact", head: true });

    if (count && count > 5) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Diabetes myths already seeded (${count} records exist)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const diabetesMyths = [
      {
        myth: "Eating too much sugar causes Type 1 diabetes",
        official_verdict: "false",
        official_explanation: "Type 1 diabetes is an autoimmune condition where the body's immune system attacks insulin-producing beta cells. Sugar consumption does not cause or trigger this autoimmune response.",
        official_sources: ["American Diabetes Association", "JDRF", "CDC Diabetes Division", "Diabetes UK"],
        autonomous_verdict: "false",
        autonomous_explanation: "No causal mechanism exists between sugar intake and autoimmune beta cell destruction. The autoimmune process in T1D is triggered by genetic predisposition combined with environmental factors (likely viral).",
        autonomous_reasoning: "While diet can influence metabolic health, the pathophysiology of Type 1 diabetes involves HLA gene variants and autoantibodies (GAD65, IA-2, ZnT8) that attack pancreatic islets. This process is fundamentally different from insulin resistance seen in Type 2. Population studies show T1D rates rising globally regardless of regional sugar consumption patterns.",
      },
      {
        myth: "People with Type 1 diabetes can't eat carbohydrates",
        official_verdict: "false",
        official_explanation: "People with Type 1 diabetes can eat carbohydrates; they just need to match their insulin doses appropriately. Carb counting and insulin adjustment allow for flexible diets.",
        official_sources: ["American Diabetes Association", "Joslin Diabetes Center", "NICE Guidelines UK"],
        autonomous_verdict: "false",
        autonomous_explanation: "Carbohydrate consumption is both safe and often necessary for people with T1D. Modern insulin therapy, especially with CGM integration, enables precise carb-to-insulin matching.",
        autonomous_reasoning: "Low-carb diets may simplify management for some, but they're a choice, not a requirement. The brain requires glucose. Athletes with T1D often consume significant carbohydrates with appropriate insulin dosing. The key is matching insulin to intake, not eliminating macronutrients.",
      },
      {
        myth: "Type 1 diabetes only affects children",
        official_verdict: "false",
        official_explanation: "While often called 'juvenile diabetes,' Type 1 can develop at any age. LADA (Latent Autoimmune Diabetes in Adults) is a form of Type 1 that develops in adulthood, often after age 30.",
        official_sources: ["ADA", "Diabetes Care Journal", "Lancet Diabetes & Endocrinology"],
        autonomous_verdict: "false",
        autonomous_explanation: "Adult-onset Type 1 (including LADA) accounts for approximately 40% of new T1D diagnoses. The autoimmune process can be triggered at any life stage.",
        autonomous_reasoning: "Studies show that half of T1D diagnoses occur after age 18. Adult-onset cases are frequently misdiagnosed as Type 2 due to age bias, leading to delayed proper treatment. The autoimmune markers (GAD antibodies, low C-peptide) are the same regardless of diagnosis age.",
      },
      {
        myth: "Insulin is a cure for Type 1 diabetes",
        official_verdict: "false",
        official_explanation: "Insulin is a life-sustaining treatment, not a cure. It replaces the hormone that the body can no longer produce but does not address the underlying autoimmune destruction of beta cells.",
        official_sources: ["ADA", "JDRF", "Endocrine Society"],
        autonomous_verdict: "false",
        autonomous_explanation: "Insulin is essential for survival but requires constant management. A true cure would restore endogenous insulin production or halt autoimmune destruction.",
        autonomous_reasoning: "While insulin enables people with T1D to live full lives, it requires 24/7 management, carries risks (hypoglycemia, DKA if interrupted), and doesn't prevent long-term complications entirely. Current research into beta cell transplantation, immunomodulation, and stem cell therapies aims for actual cures.",
      },
      {
        myth: "You can outgrow Type 1 diabetes",
        official_verdict: "false",
        official_explanation: "Type 1 diabetes is a lifelong condition. Once the immune system has destroyed the insulin-producing beta cells, they do not regenerate. There is no remission or 'growing out of it.'",
        official_sources: ["ADA", "JDRF", "Diabetes UK"],
        autonomous_verdict: "false",
        autonomous_explanation: "Beta cell destruction is permanent with current medical knowledge. The 'honeymoon period' (partial remission) is temporary and not a cure.",
        autonomous_reasoning: "Some newly diagnosed patients experience a 'honeymoon phase' where residual beta cells produce some insulin, reducing external insulin needs. This can last months to years but inevitably ends. No verified cases exist of complete T1D reversal. Emerging treatments targeting beta cell regeneration remain experimental.",
      },
      {
        myth: "People with Type 1 diabetes cannot exercise or play sports",
        official_verdict: "false",
        official_explanation: "Exercise is safe and beneficial for people with T1D. Many professional athletes have Type 1 diabetes. Proper glucose management before, during, and after exercise is key.",
        official_sources: ["ADA", "JDRF", "Exercise and Sport Sciences Reviews"],
        autonomous_verdict: "false",
        autonomous_explanation: "Exercise is not only safe but recommended. Athletes with T1D compete at Olympic and professional levels across all sports.",
        autonomous_reasoning: "CGM technology and insulin pumps have revolutionized exercise management. Athletes like Nick Jonas, Gary Hall Jr., and Jay Cutler demonstrate elite performance is achievable. Studies show improved cardiovascular outcomes and better glucose control with regular exercise in T1D.",
      },
      {
        myth: "Type 1 diabetes is caused by being overweight",
        official_verdict: "false",
        official_explanation: "Type 1 diabetes is an autoimmune disease unrelated to weight. Unlike Type 2, where obesity is a risk factor, T1D occurs in people of all body types.",
        official_sources: ["ADA", "CDC", "WHO Diabetes Fact Sheet"],
        autonomous_verdict: "false",
        autonomous_explanation: "Body weight does not influence autoimmune beta cell destruction. Many people with T1D are underweight at diagnosis due to uncontrolled glucose levels.",
        autonomous_reasoning: "The confusion stems from Type 2 diabetes, where obesity is a significant risk factor. Type 1's autoimmune etiology is distinct. However, 'double diabetes' (T1D with insulin resistance) can occur in overweight T1D patients, complicating management but not causing the original condition.",
      },
      {
        myth: "Type 1 diabetes can be controlled with diet and exercise alone",
        official_verdict: "false",
        official_explanation: "Unlike some cases of Type 2 diabetes, Type 1 absolutely requires insulin therapy. Without exogenous insulin, people with T1D will develop diabetic ketoacidosis (DKA) and die.",
        official_sources: ["ADA", "Endocrine Society", "WHO"],
        autonomous_verdict: "false",
        autonomous_explanation: "Insulin is non-negotiable for T1D survival. Diet and exercise are important adjuncts but cannot replace insulin.",
        autonomous_reasoning: "Before insulin's discovery in 1921, T1D was universally fatal within 1-2 years. The complete absence of endogenous insulin production means no metabolic adjustments can compensate. Low-carb diets reduce insulin needs but cannot eliminate them.",
      },
      {
        myth: "CGM and insulin pumps make diabetes management easy",
        official_verdict: "partially_true",
        official_explanation: "Technology significantly improves management and outcomes, but diabetes remains a 24/7 condition requiring constant attention. Technology fails, requires calibration, and doesn't eliminate the cognitive burden.",
        official_sources: ["ADA Standards of Care", "Diabetes Technology & Therapeutics"],
        autonomous_verdict: "partially_true",
        autonomous_explanation: "Technology reduces burden but introduces new challenges: device failures, skin issues, data overload, and cost barriers. 'Easier' is relative.",
        autonomous_reasoning: "Automated insulin delivery systems reduce time-in-range deviations and nocturnal hypoglycemia significantly. However, they require site changes, sensor insertions, troubleshooting, and don't eliminate decision-making. The mental load remains substantial. Access inequality means many globally lack these tools.",
      },
      {
        myth: "Hypoglycemia is always the person's fault",
        official_verdict: "false",
        official_explanation: "Hypoglycemia can occur despite perfect management. Factors like unexpected physical activity, hormonal changes, illness, and the inherent unpredictability of insulin absorption all contribute.",
        official_sources: ["ADA", "Diabetes Care Journal", "ISPAD Guidelines"],
        autonomous_verdict: "false",
        autonomous_explanation: "Even with optimal technology and adherence, variables outside patient control cause hypoglycemia. Blaming patients creates harmful stigma.",
        autonomous_reasoning: "Insulin pharmacokinetics vary day-to-day. Stress hormones fluctuate. Exercise effects are delayed. Gastroparesis affects digestion timing. Even closed-loop systems cannot prevent all lows. Research shows hypoglycemia fear leads to intentional hyperglycemia, worse long-term outcomes.",
      },
      {
        myth: "Type 1 diabetes is contagious",
        official_verdict: "false",
        official_explanation: "Type 1 diabetes is not contagious. You cannot 'catch' it from someone who has it. While viral infections may play a role in triggering the autoimmune response in genetically susceptible individuals, the disease itself cannot be transmitted.",
        official_sources: ["CDC", "ADA", "WHO"],
        autonomous_verdict: "false",
        autonomous_explanation: "T1D is an autoimmune condition with genetic and environmental triggers. No pathogen transmission causes diabetes directly.",
        autonomous_reasoning: "While viruses (especially enteroviruses) may trigger autoimmunity in susceptible individuals, this is not transmission of diabetes itself. The genetic HLA risk factors must be present. Household contacts and close contacts of T1D patients do not have elevated risk unless they share genetic susceptibility.",
      },
      {
        myth: "People with Type 1 diabetes should not have children",
        official_verdict: "false",
        official_explanation: "With proper planning and management, people with Type 1 diabetes can have healthy pregnancies and children. Pre-conception care and tight glucose control are important but parenthood is absolutely achievable.",
        official_sources: ["ADA", "ACOG", "NICE Pregnancy Guidelines"],
        autonomous_verdict: "false",
        autonomous_explanation: "Successful T1D pregnancies are common with modern care. While risks are elevated compared to non-diabetic pregnancies, outcomes are generally excellent with proper management.",
        autonomous_reasoning: "Pre-conception A1C targets, folic acid supplementation, and frequent monitoring optimize outcomes. CGM use during pregnancy has improved results significantly. The genetic risk of passing T1D is approximately 5-8% with one diabetic parent—elevated but not prohibitive. Many endocrinologists specialize in diabetic pregnancies.",
      },
      {
        myth: "Cinnamon and other supplements can cure or treat Type 1 diabetes",
        official_verdict: "false",
        official_explanation: "No supplement, herb, or alternative treatment can replace insulin for Type 1 diabetes. Some supplements may have modest effects on blood sugar in Type 2, but they are not a substitute for medical treatment.",
        official_sources: ["ADA", "NIH NCCIH", "Cochrane Reviews"],
        autonomous_verdict: "false",
        autonomous_explanation: "No supplement addresses the fundamental lack of beta cells in T1D. Claims of 'natural cures' are dangerous misinformation.",
        autonomous_reasoning: "Cinnamon studies show minimal effects in Type 2 diabetes only. Berberine, chromium, and other supplements do not restore insulin production. Delaying or replacing insulin therapy with supplements can be fatal. The placebo effect and normal blood sugar variation lead to anecdotal 'success' stories.",
      },
      {
        myth: "Low blood sugar is worse than high blood sugar",
        official_verdict: "partially_true",
        official_explanation: "Severe hypoglycemia can be immediately dangerous and even fatal if untreated. However, chronic hyperglycemia causes the long-term complications of diabetes. Both require attention and prevention.",
        official_sources: ["ADA Standards of Care", "Diabetes Care Journal"],
        autonomous_verdict: "partially_true",
        autonomous_explanation: "Acute hypoglycemia is more immediately dangerous. Chronic hyperglycemia is more dangerous long-term. Neither should be minimized.",
        autonomous_reasoning: "Severe hypoglycemia can cause seizures, unconsciousness, and death within hours. However, sustained hyperglycemia (years of high A1C) causes retinopathy, nephropathy, neuropathy, and cardiovascular disease. The '50/50 rule' oversimplifies: avoiding both through time-in-range optimization is the goal of modern management.",
      },
      {
        myth: "Vaccines caused the rise in Type 1 diabetes",
        official_verdict: "false",
        official_explanation: "Extensive research has found no link between childhood vaccines and Type 1 diabetes. The rise in T1D rates correlates with improved hygiene and other environmental factors, not vaccination rates.",
        official_sources: ["CDC", "WHO", "Cochrane Reviews", "TEDDY Study"],
        autonomous_verdict: "false",
        autonomous_explanation: "Large population studies consistently show no correlation between vaccination and T1D development. The hygiene hypothesis offers a more plausible explanation for rising rates.",
        autonomous_reasoning: "Multiple cohort studies with millions of subjects show no vaccine-T1D link. T1D rates rose before many modern vaccines existed. Countries with lower vaccination rates don't have lower T1D rates. The hygiene hypothesis suggests reduced microbial exposure alters immune development, potentially increasing autoimmunity. This is an area of active research.",
      },
    ];

    // Insert diabetes myths
    const { error: mythsError } = await supabase
      .from("diabetes_myths")
      .insert(diabetesMyths);

    if (mythsError) {
      console.error("Error seeding diabetes myths:", mythsError);
      throw mythsError;
    }

    console.log(`Successfully seeded ${diabetesMyths.length} diabetes myths`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${diabetesMyths.length} diabetes myths`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-diabetes-myths:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
