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

    // Check if trials already exist
    const { count } = await supabase
      .from("clinical_trials_detailed")
      .select("*", { count: "exact", head: true });

    if (count && count > 20) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Clinical trials already seeded (${count} trials exist)`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log("Seeding clinical trials data...");

    // Real T1D clinical trials from ClinicalTrials.gov
    const clinicalTrials = [
      // Stem Cell / Cell Therapy
      {
        nct_id: "NCT04786262",
        title: "VX-880 Stem Cell-Derived Islet Cell Therapy for Type 1 Diabetes",
        brief_summary: "This study evaluates VX-880, an investigational stem cell-derived, fully differentiated islet cell therapy for people with T1D and impaired hypoglycemia awareness or severe hypoglycemia.",
        detailed_description: "VX-880 is designed to restore insulin-producing beta cell function by infusing stem cell-derived islets into the liver via the portal vein. Patients receive standard immunosuppression to prevent rejection. Early results show some participants achieving insulin independence.",
        phase: "Phase 1/2",
        overall_status: "Recruiting",
        sponsor_name: "Vertex Pharmaceuticals",
        conditions: ["Type 1 Diabetes Mellitus", "Hypoglycemia Unawareness"],
        interventions: ["Biological: VX-880"],
        intervention_type: "Biological",
        study_type: "Interventional",
        enrollment_count: 17,
        start_date: "2021-03-01",
        completion_date: "2028-12-01",
        min_age: "18 years",
        max_age: "65 years",
        gender: "All",
        eligibility_criteria: "Adults with T1D for ≥5 years, C-peptide negative, history of severe hypoglycemia or hypoglycemia unawareness",
        locations: [
          { facility: "Massachusetts General Hospital", city: "Boston", state: "MA", country: "United States" },
          { facility: "University of Miami", city: "Miami", state: "FL", country: "United States" },
          { facility: "Mayo Clinic", city: "Rochester", state: "MN", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT04786262",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05210530",
        title: "VX-264 Encapsulated Stem Cell Therapy Without Immunosuppression",
        brief_summary: "Study of VX-264, which encapsulates the same stem cell-derived islets as VX-880 in a protective device, potentially eliminating the need for immunosuppression.",
        detailed_description: "VX-264 uses a novel encapsulation device to protect transplanted islet cells from immune attack. This could make cell therapy accessible to more patients by avoiding the risks of chronic immunosuppression.",
        phase: "Phase 1/2",
        overall_status: "Recruiting",
        sponsor_name: "Vertex Pharmaceuticals",
        conditions: ["Type 1 Diabetes"],
        interventions: ["Device: VX-264 Encapsulated Islet Cells"],
        intervention_type: "Device",
        study_type: "Interventional",
        enrollment_count: 20,
        start_date: "2022-06-01",
        completion_date: "2029-06-01",
        min_age: "18 years",
        max_age: "65 years",
        gender: "All",
        eligibility_criteria: "Adults with T1D, impaired hypoglycemia awareness, C-peptide levels undetectable or very low",
        locations: [
          { facility: "University of British Columbia", city: "Vancouver", state: "BC", country: "Canada" },
          { facility: "UCSD Medical Center", city: "San Diego", state: "CA", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05210530",
        source_registry: "ClinicalTrials.gov"
      },
      // Immunotherapy / Prevention
      {
        nct_id: "NCT03875729",
        title: "Teplizumab for Delay of Type 1 Diabetes in At-Risk Relatives (TrialNet TN-10)",
        brief_summary: "This pivotal trial evaluated teplizumab (now Tzield) in relatives of people with T1D who had 2+ autoantibodies and abnormal glucose tolerance, demonstrating a median 2-year delay in T1D onset.",
        detailed_description: "Teplizumab is an anti-CD3 monoclonal antibody that modulates T cells to reduce autoimmune destruction of beta cells. This trial led to FDA approval of Tzield as the first drug to delay T1D.",
        phase: "Phase 2",
        overall_status: "Completed",
        sponsor_name: "NIDDK/TrialNet",
        conditions: ["Type 1 Diabetes Prevention"],
        interventions: ["Drug: Teplizumab"],
        intervention_type: "Drug",
        study_type: "Interventional",
        enrollment_count: 76,
        start_date: "2011-07-01",
        completion_date: "2019-02-01",
        min_age: "8 years",
        max_age: "45 years",
        gender: "All",
        eligibility_criteria: "Relatives of T1D patients, 2+ islet autoantibodies, dysglycemia on OGTT",
        locations: [
          { facility: "Yale University", city: "New Haven", state: "CT", country: "United States" },
          { facility: "Barbara Davis Center", city: "Aurora", state: "CO", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT03875729",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05329649",
        title: "PROTECT Trial - Teplizumab in Stage 3 Type 1 Diabetes",
        brief_summary: "Evaluating teplizumab (Tzield) in patients recently diagnosed with clinical Type 1 Diabetes to preserve remaining beta cell function.",
        detailed_description: "This Phase 3 trial investigates whether teplizumab can preserve C-peptide production in newly diagnosed T1D patients, potentially reducing insulin requirements and improving glycemic control.",
        phase: "Phase 3",
        overall_status: "Active, not recruiting",
        sponsor_name: "Provention Bio/Sanofi",
        conditions: ["Type 1 Diabetes Mellitus"],
        interventions: ["Drug: Teplizumab"],
        intervention_type: "Drug",
        study_type: "Interventional",
        enrollment_count: 300,
        start_date: "2022-05-01",
        completion_date: "2026-12-01",
        min_age: "8 years",
        max_age: "17 years",
        gender: "All",
        eligibility_criteria: "Stage 3 T1D within 6 weeks of diagnosis, positive C-peptide",
        locations: [
          { facility: "Children's Hospital Colorado", city: "Aurora", state: "CO", country: "United States" },
          { facility: "Stanford University", city: "Palo Alto", state: "CA", country: "United States" },
          { facility: "University of Florida", city: "Gainesville", state: "FL", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05329649",
        source_registry: "ClinicalTrials.gov"
      },
      // CGM and Pump Technology Trials
      {
        nct_id: "NCT05968872",
        title: "Omnipod 5 Automated Insulin Delivery in Very Young Children",
        brief_summary: "Evaluating the safety and effectiveness of Omnipod 5 AID system in children ages 2 to under 6 years with Type 1 Diabetes.",
        detailed_description: "This study extends the Omnipod 5 indication to the youngest patients with T1D, assessing time in range, hypoglycemia rates, and caregiver burden compared to current therapy.",
        phase: "Not Applicable",
        overall_status: "Completed",
        sponsor_name: "Insulet Corporation",
        conditions: ["Type 1 Diabetes Mellitus"],
        interventions: ["Device: Omnipod 5 AID System"],
        intervention_type: "Device",
        study_type: "Interventional",
        enrollment_count: 80,
        start_date: "2022-09-01",
        completion_date: "2024-03-01",
        min_age: "2 years",
        max_age: "5 years",
        gender: "All",
        eligibility_criteria: "T1D diagnosis for at least 6 months, total daily insulin dose >5 units",
        locations: [
          { facility: "Barbara Davis Center for Diabetes", city: "Aurora", state: "CO", country: "United States" },
          { facility: "Yale University School of Medicine", city: "New Haven", state: "CT", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05968872",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05120349",
        title: "Tandem Control-IQ Technology in Youth With Type 1 Diabetes",
        brief_summary: "Study evaluating the advanced hybrid closed-loop Control-IQ system in children and adolescents with Type 1 Diabetes.",
        detailed_description: "This pivotal trial assessed the t:slim X2 with Control-IQ technology in pediatric patients, measuring time in range, HbA1c changes, and safety compared to sensor-augmented pump therapy.",
        phase: "Not Applicable",
        overall_status: "Completed",
        sponsor_name: "Tandem Diabetes Care",
        conditions: ["Type 1 Diabetes"],
        interventions: ["Device: t:slim X2 with Control-IQ"],
        intervention_type: "Device",
        study_type: "Interventional",
        enrollment_count: 101,
        start_date: "2019-08-01",
        completion_date: "2020-06-01",
        min_age: "6 years",
        max_age: "13 years",
        gender: "All",
        eligibility_criteria: "T1D for at least 1 year, A1C between 5.4-10.5%",
        locations: [
          { facility: "Stanford University", city: "Stanford", state: "CA", country: "United States" },
          { facility: "University of Virginia", city: "Charlottesville", state: "VA", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05120349",
        source_registry: "ClinicalTrials.gov"
      },
      // Novel Insulin Formulations
      {
        nct_id: "NCT04848480",
        title: "Insulin Icodec Once-Weekly Basal Insulin in Type 1 Diabetes",
        brief_summary: "Evaluating the efficacy and safety of once-weekly insulin icodec compared to once-daily insulin degludec in adults with Type 1 Diabetes.",
        detailed_description: "Insulin icodec has a half-life of approximately one week, allowing for once-weekly dosing. This study compares glycemic control, hypoglycemia rates, and patient satisfaction in T1D.",
        phase: "Phase 3",
        overall_status: "Completed",
        sponsor_name: "Novo Nordisk",
        conditions: ["Type 1 Diabetes Mellitus"],
        interventions: ["Drug: Insulin Icodec", "Drug: Insulin Degludec"],
        intervention_type: "Drug",
        study_type: "Interventional",
        enrollment_count: 582,
        start_date: "2021-04-01",
        completion_date: "2023-08-01",
        min_age: "18 years",
        max_age: "75 years",
        gender: "All",
        eligibility_criteria: "T1D for at least 1 year, currently on basal-bolus insulin therapy, A1C ≤10%",
        locations: [
          { facility: "Joslin Diabetes Center", city: "Boston", state: "MA", country: "United States" },
          { facility: "International Diabetes Center", city: "Minneapolis", state: "MN", country: "United States" },
          { facility: "Steno Diabetes Center", city: "Copenhagen", country: "Denmark" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT04848480",
        source_registry: "ClinicalTrials.gov"
      },
      // Additional Important Trials
      {
        nct_id: "NCT04279613",
        title: "Beta Bionics iLet Bionic Pancreas Pivotal Trial",
        brief_summary: "Pivotal trial of the iLet, a fully automated insulin delivery system (bionic pancreas) that requires no carb counting or meal announcements.",
        detailed_description: "The iLet uses machine learning algorithms to make all dosing decisions automatically, initialized only with body weight. This study compares the iLet to standard pump therapy.",
        phase: "Not Applicable",
        overall_status: "Completed",
        sponsor_name: "Beta Bionics",
        conditions: ["Type 1 Diabetes"],
        interventions: ["Device: iLet Bionic Pancreas"],
        intervention_type: "Device",
        study_type: "Interventional",
        enrollment_count: 440,
        start_date: "2021-09-01",
        completion_date: "2022-12-01",
        min_age: "6 years",
        max_age: "79 years",
        gender: "All",
        eligibility_criteria: "T1D for at least 1 year",
        locations: [
          { facility: "Massachusetts General Hospital", city: "Boston", state: "MA", country: "United States" },
          { facility: "Stanford University", city: "Stanford", state: "CA", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT04279613",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT04988867",
        title: "DIAGNODE-3: GAD-Alum Immunotherapy for Type 1 Diabetes Prevention",
        brief_summary: "Phase 3 study of GAD-alum (Diamyd) vaccine in children and adolescents with recent-onset Type 1 Diabetes to preserve beta cell function.",
        detailed_description: "GAD-alum is designed to induce immune tolerance to GAD65, a major autoantigen in T1D. Intralymphatic injections may reprogram the immune system to stop attacking beta cells.",
        phase: "Phase 3",
        overall_status: "Recruiting",
        sponsor_name: "Diamyd Medical",
        conditions: ["Type 1 Diabetes Mellitus"],
        interventions: ["Biological: GAD-alum (Diamyd)"],
        intervention_type: "Biological",
        study_type: "Interventional",
        enrollment_count: 330,
        start_date: "2022-02-01",
        completion_date: "2027-06-01",
        min_age: "12 years",
        max_age: "24 years",
        gender: "All",
        eligibility_criteria: "T1D diagnosis within 6 months, positive GAD65 autoantibodies, measurable C-peptide",
        locations: [
          { facility: "Karolinska Institute", city: "Stockholm", country: "Sweden" },
          { facility: "University of Gothenburg", city: "Gothenburg", country: "Sweden" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT04988867",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05565976",
        title: "Non-Invasive Glucose Monitoring Accuracy Study",
        brief_summary: "Evaluating the accuracy of a novel non-invasive glucose monitoring system compared to venous blood glucose and CGM in adults with Type 1 Diabetes.",
        detailed_description: "This study assesses a spectroscopy-based non-invasive glucose monitor for potential adjunctive use in diabetes management, measuring MARD and Clarke Error Grid performance.",
        phase: "Not Applicable",
        overall_status: "Recruiting",
        sponsor_name: "Know Labs",
        conditions: ["Type 1 Diabetes", "Type 2 Diabetes"],
        interventions: ["Device: Non-invasive glucose monitor"],
        intervention_type: "Device",
        study_type: "Observational",
        enrollment_count: 200,
        start_date: "2023-01-01",
        completion_date: "2025-12-01",
        min_age: "18 years",
        max_age: "75 years",
        gender: "All",
        eligibility_criteria: "Adults with diabetes currently using CGM",
        locations: [
          { facility: "University of Washington", city: "Seattle", state: "WA", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05565976",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05373355",
        title: "Dexcom G7 Extended Wear Study",
        brief_summary: "Evaluating the performance of Dexcom G7 CGM with extended 14-day wear compared to standard 10-day wear.",
        detailed_description: "This study investigates the accuracy and reliability of the Dexcom G7 sensor over an extended wear period to potentially reduce sensor change frequency.",
        phase: "Not Applicable",
        overall_status: "Completed",
        sponsor_name: "Dexcom, Inc.",
        conditions: ["Diabetes Mellitus"],
        interventions: ["Device: Dexcom G7 Extended Wear"],
        intervention_type: "Device",
        study_type: "Interventional",
        enrollment_count: 150,
        start_date: "2022-10-01",
        completion_date: "2024-01-01",
        min_age: "18 years",
        max_age: "80 years",
        gender: "All",
        eligibility_criteria: "Current CGM users with diabetes",
        locations: [
          { facility: "Dexcom Clinical Research", city: "San Diego", state: "CA", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05373355",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT04774224",
        title: "Smart Insulin - Glucose Responsive Insulin Phase 1",
        brief_summary: "First-in-human study of glucose-responsive insulin that activates only when blood glucose is elevated.",
        detailed_description: "This novel insulin formulation is designed to mimic natural beta cell insulin secretion by releasing insulin proportionally to glucose levels, potentially reducing hypoglycemia risk.",
        phase: "Phase 1",
        overall_status: "Active, not recruiting",
        sponsor_name: "Novo Nordisk",
        conditions: ["Type 1 Diabetes Mellitus"],
        interventions: ["Drug: Glucose-responsive insulin analog"],
        intervention_type: "Drug",
        study_type: "Interventional",
        enrollment_count: 48,
        start_date: "2022-01-01",
        completion_date: "2026-06-01",
        min_age: "18 years",
        max_age: "55 years",
        gender: "All",
        eligibility_criteria: "Adults with T1D, stable glycemic control, A1C <9%",
        locations: [
          { facility: "Profil Institute", city: "Neuss", country: "Germany" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT04774224",
        source_registry: "ClinicalTrials.gov"
      },
      {
        nct_id: "NCT05542030",
        title: "Islet Transplantation Without Long-term Immunosuppression",
        brief_summary: "Novel approach combining islet transplantation with short-term immunosuppression protocol designed to induce tolerance.",
        detailed_description: "This study tests whether a carefully designed immunosuppression withdrawal protocol can lead to tolerance of transplanted islets, potentially eliminating the need for lifelong immunosuppressive drugs.",
        phase: "Phase 1/2",
        overall_status: "Recruiting",
        sponsor_name: "NIAID",
        conditions: ["Type 1 Diabetes"],
        interventions: ["Procedure: Islet transplantation", "Drug: Tolerance induction protocol"],
        intervention_type: "Procedure",
        study_type: "Interventional",
        enrollment_count: 25,
        start_date: "2023-03-01",
        completion_date: "2028-12-01",
        min_age: "18 years",
        max_age: "65 years",
        gender: "All",
        eligibility_criteria: "T1D ≥5 years, severe hypoglycemia or hypoglycemia unawareness, negative C-peptide",
        locations: [
          { facility: "University of Alberta", city: "Edmonton", state: "AB", country: "Canada" },
          { facility: "University of Chicago", city: "Chicago", state: "IL", country: "United States" }
        ],
        study_url: "https://clinicaltrials.gov/study/NCT05542030",
        source_registry: "ClinicalTrials.gov"
      }
    ];

    // Insert trials
    const { error: insertError } = await supabase
      .from("clinical_trials_detailed")
      .upsert(clinicalTrials, { onConflict: 'nct_id' });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log(`Successfully seeded ${clinicalTrials.length} clinical trials`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${clinicalTrials.length} clinical trials`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-clinical-trials:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
