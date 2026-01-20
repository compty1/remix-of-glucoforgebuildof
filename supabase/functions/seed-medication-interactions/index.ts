import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌱 Seeding medication interactions...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing data
    await supabase.from('medication_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Common medication interactions with diabetes drugs
    const interactions = [
      // Metformin interactions
      {
        interacting_drug_name: "Alcohol",
        interacting_drug_category: "Substance",
        severity: "major",
        description: "Alcohol combined with metformin significantly increases the risk of lactic acidosis.",
        clinical_effects: "Can cause lactic acidosis, especially with heavy alcohol consumption. May also enhance hypoglycemic effects.",
        management_recommendation: "Limit alcohol intake. Avoid binge drinking. Monitor for symptoms of lactic acidosis: muscle pain, weakness, difficulty breathing.",
        source: "FDA, Clinical Guidelines"
      },
      {
        interacting_drug_name: "Contrast Dye (Iodinated)",
        interacting_drug_category: "Diagnostic Agent",
        severity: "major",
        description: "IV contrast media can cause acute kidney injury, increasing metformin accumulation and lactic acidosis risk.",
        clinical_effects: "Potential for lactic acidosis due to impaired metformin clearance if kidney function is affected.",
        management_recommendation: "Hold metformin 48 hours before and after contrast procedures. Check kidney function before restarting.",
        source: "ACR Guidelines, FDA"
      },
      {
        interacting_drug_name: "Carbonic Anhydrase Inhibitors",
        interacting_drug_category: "Diuretic",
        severity: "moderate",
        description: "Topiramate, acetazolamide may increase risk of lactic acidosis when combined with metformin.",
        clinical_effects: "Both drugs can cause metabolic acidosis; combined use increases this risk.",
        management_recommendation: "Monitor for signs of acidosis. Consider alternative medications if possible.",
        source: "Drug Interaction Database"
      },

      // Insulin interactions
      {
        interacting_drug_name: "Beta Blockers",
        interacting_drug_category: "Cardiovascular",
        severity: "moderate",
        description: "Beta blockers can mask hypoglycemia symptoms and delay glucose recovery.",
        clinical_effects: "May hide tachycardia and tremor warning signs of low blood sugar. Can prolong hypoglycemia by blocking gluconeogenesis.",
        management_recommendation: "Use cardioselective beta blockers (metoprolol, atenolol) when possible. Educate on recognizing hypoglycemia without typical symptoms.",
        source: "Clinical Guidelines"
      },
      {
        interacting_drug_name: "ACE Inhibitors",
        interacting_drug_category: "Cardiovascular",
        severity: "minor",
        description: "ACE inhibitors may enhance insulin sensitivity, potentially increasing hypoglycemia risk.",
        clinical_effects: "Can improve insulin sensitivity, possibly requiring insulin dose reduction.",
        management_recommendation: "Monitor blood glucose more frequently when starting. Generally beneficial for diabetic nephropathy protection.",
        source: "Clinical Studies"
      },
      {
        interacting_drug_name: "Corticosteroids",
        interacting_drug_category: "Anti-inflammatory",
        severity: "major",
        description: "Corticosteroids significantly raise blood glucose, often requiring substantial insulin dose increases.",
        clinical_effects: "Causes insulin resistance and increased hepatic glucose production. May require 50-100% increase in insulin doses.",
        management_recommendation: "Anticipate need for higher insulin doses during steroid treatment. Monitor glucose frequently. Plan for dose reduction as steroids taper.",
        source: "Clinical Guidelines"
      },
      {
        interacting_drug_name: "Fluoroquinolones",
        interacting_drug_category: "Antibiotic",
        severity: "major",
        description: "Fluoroquinolone antibiotics (ciprofloxacin, levofloxacin) can cause severe hypoglycemia or hyperglycemia.",
        clinical_effects: "Can cause unpredictable blood sugar swings. Both severe hypoglycemia and hyperglycemia reported.",
        management_recommendation: "Increase glucose monitoring frequency. Consider alternative antibiotics. FDA black box warning for blood sugar effects.",
        source: "FDA Safety Alert"
      },
      {
        interacting_drug_name: "MAO Inhibitors",
        interacting_drug_category: "Antidepressant",
        severity: "major",
        description: "MAOIs can potentiate insulin effects, significantly increasing hypoglycemia risk.",
        clinical_effects: "Enhanced hypoglycemic effect of insulin. Can cause prolonged and severe low blood sugar.",
        management_recommendation: "Reduce insulin dose when starting MAOI. Very frequent glucose monitoring required. Consider alternative antidepressants.",
        source: "Drug Interaction Database"
      },
      {
        interacting_drug_name: "Salicylates (High Dose)",
        interacting_drug_category: "Analgesic",
        severity: "moderate",
        description: "High-dose aspirin (>3g/day) can enhance hypoglycemic effect of insulin.",
        clinical_effects: "Increases insulin sensitivity and may lower blood glucose. Low-dose aspirin (81mg) is safe.",
        management_recommendation: "Monitor blood glucose if using high-dose aspirin. Low-dose aspirin for cardiovascular protection is recommended in T1D.",
        source: "Clinical Guidelines"
      },
      {
        interacting_drug_name: "Thiazide Diuretics",
        interacting_drug_category: "Diuretic",
        severity: "moderate",
        description: "Thiazides can decrease insulin sensitivity and cause hyperglycemia.",
        clinical_effects: "May increase blood glucose levels and reduce insulin effectiveness.",
        management_recommendation: "Monitor glucose when starting. May need insulin dose adjustment. Consider alternative antihypertensives.",
        source: "Clinical Studies"
      },

      // SGLT2 Inhibitor interactions
      {
        interacting_drug_name: "Loop Diuretics",
        interacting_drug_category: "Diuretic",
        severity: "moderate",
        description: "Combined diuretic effect increases risk of volume depletion and acute kidney injury.",
        clinical_effects: "Enhanced fluid loss, hypotension, increased creatinine. Higher risk of euglycemic DKA.",
        management_recommendation: "Monitor fluid status and kidney function. Stay well-hydrated. May need diuretic dose reduction.",
        source: "FDA, Clinical Guidelines"
      },
      {
        interacting_drug_name: "NSAIDs",
        interacting_drug_category: "Analgesic",
        severity: "moderate",
        description: "NSAIDs can reduce the blood pressure lowering effects and impair kidney function when combined with SGLT2i.",
        clinical_effects: "May reduce blood pressure benefits. Increased risk of acute kidney injury.",
        management_recommendation: "Limit NSAID use. If needed, use lowest dose for shortest duration. Monitor kidney function.",
        source: "Clinical Guidelines"
      },

      // GLP-1 Agonist interactions
      {
        interacting_drug_name: "Warfarin",
        interacting_drug_category: "Anticoagulant",
        severity: "moderate",
        description: "GLP-1 agonists may affect warfarin absorption and INR control.",
        clinical_effects: "Delayed gastric emptying can affect warfarin absorption. INR may become unstable.",
        management_recommendation: "Monitor INR more frequently when starting or stopping GLP-1 agonist. Adjust warfarin dose as needed.",
        source: "FDA, Clinical Studies"
      },
      {
        interacting_drug_name: "Oral Contraceptives",
        interacting_drug_category: "Hormone",
        severity: "minor",
        description: "GLP-1 agonists may slightly reduce absorption of oral contraceptives.",
        clinical_effects: "Potential for reduced contraceptive effectiveness due to delayed gastric emptying.",
        management_recommendation: "Take oral contraceptive at least 1 hour before GLP-1 injection. Consider alternative contraception methods.",
        source: "Prescribing Information"
      },
      {
        interacting_drug_name: "Sulfonylureas",
        interacting_drug_category: "Oral Diabetes Medication",
        severity: "major",
        description: "Combined use with sulfonylureas significantly increases hypoglycemia risk.",
        clinical_effects: "Both medications lower blood glucose through different mechanisms. High risk of severe hypoglycemia.",
        management_recommendation: "Reduce sulfonylurea dose by 50% when adding GLP-1 agonist. Monitor glucose closely.",
        source: "Clinical Guidelines"
      },

      // Common OTC interactions
      {
        interacting_drug_name: "Pseudoephedrine",
        interacting_drug_category: "Decongestant",
        severity: "minor",
        description: "Can raise blood glucose levels through sympathomimetic effects.",
        clinical_effects: "May cause mild hyperglycemia through stress hormone-like effects.",
        management_recommendation: "Monitor glucose when using cold medications. Consider saline sprays as alternative.",
        source: "OTC Drug Information"
      },
      {
        interacting_drug_name: "Glucosamine",
        interacting_drug_category: "Supplement",
        severity: "minor",
        description: "May affect glucose metabolism in some individuals.",
        clinical_effects: "Some studies suggest possible blood glucose elevation, though evidence is mixed.",
        management_recommendation: "Monitor glucose if starting glucosamine supplements. Effect is usually minimal.",
        source: "Clinical Studies"
      },
      {
        interacting_drug_name: "Niacin (High Dose)",
        interacting_drug_category: "Supplement",
        severity: "moderate",
        description: "High-dose niacin can impair glucose tolerance and worsen glycemic control.",
        clinical_effects: "Can increase blood glucose and reduce insulin sensitivity at doses >1000mg/day.",
        management_recommendation: "Avoid high-dose niacin. Regular vitamin B3 doses are safe. Monitor glucose if prescribed.",
        source: "FDA, Clinical Guidelines"
      },

      // Antipsychotic interactions
      {
        interacting_drug_name: "Atypical Antipsychotics",
        interacting_drug_category: "Psychiatric",
        severity: "major",
        description: "Olanzapine, clozapine, risperidone can significantly worsen glucose control.",
        clinical_effects: "Can cause weight gain, insulin resistance, and new-onset diabetes. May worsen existing diabetes significantly.",
        management_recommendation: "Monitor glucose and weight closely. Consider alternatives like aripiprazole or ziprasidone which have less metabolic impact.",
        source: "FDA, Psychiatric Guidelines"
      },
      {
        interacting_drug_name: "Quetiapine",
        interacting_drug_category: "Psychiatric",
        severity: "moderate",
        description: "Moderate metabolic effects compared to other atypical antipsychotics.",
        clinical_effects: "May cause weight gain and glucose elevation, though less than olanzapine.",
        management_recommendation: "Monitor metabolic parameters. May require insulin dose adjustment.",
        source: "Clinical Guidelines"
      }
    ];

    // Insert interactions
    const { error } = await supabase
      .from('medication_interactions')
      .insert(interactions);

    if (error) {
      console.error('Error inserting interactions:', error);
      throw error;
    }

    console.log(`✅ Seeded ${interactions.length} medication interactions`);

    return new Response(
      JSON.stringify({
        success: true,
        count: interactions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error seeding interactions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
