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
    console.log('🌱 Seeding cure therapies with comprehensive data...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing data first
    await supabase.from('cure_milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cure_therapies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const therapies = [
      {
        name: "VX-880 (Zimislecel)",
        description: "Allogeneic stem-cell derived pancreatic islet replacement therapy that restores insulin production",
        category: "stem_cell",
        phase: "Phase 2/3 Pivotal",
        status: "Active",
        sponsor: "Vertex Pharmaceuticals",
        progress_percentage: 75,
        confidence_score: 85,
        estimated_completion: "2027-06-30",
        website_url: "https://www.vrtx.com/pipeline/vx-880",
        is_featured: true,
        approach_type: "Stem Cell Replacement",
        mechanism: "Manufactured islet cells infused to replace destroyed beta cells, restoring endogenous insulin secretion",
        advantages: [
          "Proven C-peptide restoration",
          "Insulin independence achieved in many patients",
          "Improved time-in-range",
          "Eliminates severe hypoglycemia"
        ],
        risks: [
          "Requires chronic immunosuppression",
          "Infection risk",
          "Limited manufacturing capacity initially",
          "High cost"
        ],
        current_status_text: "Ongoing enrollment in pivotal trials with strong Phase 1/2 results showing insulin independence",
        estimated_availability_text: "1-3 years for limited availability, 3-7 years for broader access",
        life_after_treatment: "Drastically reduced or eliminated insulin injections; CGM monitoring continues; long-term immunosuppression with regular lab work and infection precautions",
        requirements: [
          "Immunosuppression medication",
          "Regular clinic visits",
          "Infection prophylaxis"
        ],
        clinical_trial_ids: ["NCT04786262", "NCT05210530"]
      },
      {
        name: "Teplizumab (Tzield)",
        description: "FDA-approved anti-CD3 monoclonal antibody that delays the onset of Stage 3 T1D in at-risk individuals",
        category: "immunotherapy",
        phase: "Approved",
        status: "Active",
        sponsor: "Provention Bio / Sanofi",
        progress_percentage: 100,
        confidence_score: 98,
        estimated_completion: "2022-11-17",
        website_url: "https://www.tzield.com",
        is_featured: true,
        approach_type: "Immunotherapy",
        mechanism: "Anti-CD3 antibody modulates T-cell response to reduce autoimmune attack on beta cells, preserving remaining insulin production",
        advantages: [
          "First FDA-approved disease-modifying T1D therapy",
          "Delays Stage 3 T1D onset by median 2+ years",
          "14-day infusion course",
          "No chronic immunosuppression needed"
        ],
        risks: [
          "Cytokine release syndrome possible",
          "Temporary lymphopenia",
          "Infusion reactions",
          "Only effective in Stage 2 (pre-symptomatic)"
        ],
        current_status_text: "Commercially available in the US since January 2023; real-world evidence being collected",
        estimated_availability_text: "Available now for eligible Stage 2 T1D patients",
        life_after_treatment: "Continued monitoring of blood glucose and autoantibodies; may delay insulin dependence by years; no ongoing treatment required after 14-day course",
        requirements: [
          "Stage 2 T1D diagnosis (2+ autoantibodies)",
          "Age 8 years or older",
          "14-day infusion course at treatment center"
        ],
        clinical_trial_ids: ["NCT01030861", "NCT03875729"]
      },
      {
        name: "VX-264",
        description: "Encapsulated stem cell therapy using proprietary device to protect islet cells without immunosuppression",
        category: "stem_cell",
        phase: "Phase 1/2",
        status: "Active",
        sponsor: "Vertex Pharmaceuticals",
        progress_percentage: 45,
        confidence_score: 78,
        estimated_completion: "2028-12-31",
        website_url: "https://www.vrtx.com/pipeline",
        is_featured: false,
        approach_type: "Encapsulated Cell Therapy",
        mechanism: "Stem cell-derived islets encapsulated in an immunoprotective device that allows nutrient/insulin exchange while blocking immune cells",
        advantages: [
          "No immunosuppression required",
          "Same effective islet cells as VX-880",
          "Device is retrievable if needed",
          "Potentially broader patient eligibility"
        ],
        risks: [
          "Device may need periodic replacement",
          "Fibrosis around capsule possible",
          "Earlier stage of development",
          "Surgical implantation required"
        ],
        current_status_text: "Phase 1/2 trial ongoing with initial patients dosed; evaluating safety and cell survival",
        estimated_availability_text: "3-5 years for initial access if trials succeed, 5-8 years for broader access",
        life_after_treatment: "Significantly reduced or eliminated insulin needs; no immunosuppression; device monitoring and potential replacements over time",
        requirements: [
          "Surgical implantation procedure",
          "Regular device monitoring",
          "Potential device replacement every 3-5 years"
        ],
        clinical_trial_ids: ["NCT05791201"]
      },
      {
        name: "Donislecel (Lantidra)",
        description: "FDA-approved allogeneic deceased-donor islet cell therapy for severe hypoglycemia-prone T1D patients",
        category: "cell_therapy",
        phase: "Approved",
        status: "Active",
        sponsor: "CellTrans Inc.",
        progress_percentage: 100,
        confidence_score: 88,
        estimated_completion: "2023-06-28",
        website_url: "https://www.fda.gov/vaccines-blood-biologics/lantidra",
        is_featured: true,
        approach_type: "Islet Transplant",
        mechanism: "Purified allogeneic pancreatic islet cells from deceased donors infused into liver via portal vein to restore insulin production",
        advantages: [
          "FDA-approved therapy",
          "Proven to eliminate severe hypoglycemia",
          "Can achieve insulin independence",
          "Established procedure since 1990s"
        ],
        risks: [
          "Requires lifelong immunosuppression",
          "Limited donor supply",
          "May need multiple infusions",
          "Islet function may decline over years"
        ],
        current_status_text: "FDA approved June 2023; limited availability due to donor organ constraints",
        estimated_availability_text: "Available now at select transplant centers for qualifying patients",
        life_after_treatment: "Potential insulin independence; chronic immunosuppression required; regular monitoring of islet function and immune status",
        requirements: [
          "Severe hypoglycemia unawareness",
          "Failed other treatment options",
          "Ability to tolerate immunosuppression",
          "Access to specialized transplant center"
        ],
        clinical_trial_ids: ["NCT03791567"]
      },
      {
        name: "CRISPR Gene Editing",
        description: "Gene therapy approach to create universal donor cells or modify patient's own cells to evade autoimmune attack",
        category: "gene_therapy",
        phase: "Phase 1",
        status: "Active",
        sponsor: "CRISPR Therapeutics / Multiple",
        progress_percentage: 25,
        confidence_score: 65,
        estimated_completion: "2030-12-31",
        website_url: "https://crisprtx.com",
        is_featured: false,
        approach_type: "Gene Editing",
        mechanism: "CRISPR-Cas9 technology edits genes in stem cells or islets to remove immune-triggering markers, creating 'universal' cells that evade rejection",
        advantages: [
          "Could eliminate need for immunosuppression",
          "Potentially unlimited cell supply",
          "One-time treatment possible",
          "Applicable to stem cell approaches"
        ],
        risks: [
          "Off-target genetic effects",
          "Very early stage research",
          "Long-term safety unknown",
          "Complex manufacturing"
        ],
        current_status_text: "Multiple early-phase trials exploring different gene editing strategies; preclinical and Phase 1 studies",
        estimated_availability_text: "7-12 years for potential approval if current approaches succeed",
        life_after_treatment: "If successful, could mean functional cure with minimal ongoing treatment; long-term monitoring for any genetic effects",
        requirements: [
          "Participation in clinical trial",
          "Long-term follow-up monitoring",
          "Understanding of experimental nature"
        ],
        clinical_trial_ids: ["NCT05565248"]
      },
      {
        name: "Low-Dose IL-2 Therapy",
        description: "Cytokine therapy to expand regulatory T-cells and restore immune balance in T1D",
        category: "immunotherapy",
        phase: "Phase 2",
        status: "Active",
        sponsor: "Various Academic Centers",
        progress_percentage: 50,
        confidence_score: 62,
        estimated_completion: "2026-12-31",
        website_url: null,
        is_featured: false,
        approach_type: "Immunomodulation",
        mechanism: "Low doses of IL-2 preferentially expand regulatory T-cells (Tregs) which suppress autoimmune attack while sparing effector immunity",
        advantages: [
          "Simple subcutaneous injections",
          "Well-characterized drug",
          "Preserves normal immunity",
          "Potentially combinable with other therapies"
        ],
        risks: [
          "May not fully halt autoimmunity",
          "Requires ongoing treatment",
          "Optimal dosing still being determined",
          "Limited effect on established T1D"
        ],
        current_status_text: "Multiple Phase 2 trials ongoing in newly diagnosed and established T1D",
        estimated_availability_text: "3-5 years if Phase 3 trials initiated and succeed",
        life_after_treatment: "Ongoing low-dose injections likely required; may preserve remaining beta cells; potential combination with other approaches",
        requirements: [
          "Regular subcutaneous injections",
          "Periodic blood monitoring",
          "Clinic follow-up visits"
        ],
        clinical_trial_ids: ["NCT02411253", "NCT01862120"]
      },
      {
        name: "TOL-3021",
        description: "DNA plasmid vaccine encoding proinsulin to induce immune tolerance and preserve beta cell function",
        category: "vaccine",
        phase: "Phase 2",
        status: "Active",
        sponsor: "Tolerion",
        progress_percentage: 45,
        confidence_score: 58,
        estimated_completion: "2027-03-31",
        website_url: "https://tolerion.bio",
        is_featured: false,
        approach_type: "Tolerogenic Vaccine",
        mechanism: "DNA vaccine teaches immune system to tolerate proinsulin, reducing autoimmune attack on insulin-producing beta cells",
        advantages: [
          "Targets root cause of autoimmunity",
          "Simple intramuscular injection",
          "No systemic immunosuppression",
          "Antigen-specific tolerance"
        ],
        risks: [
          "May only work in early disease",
          "Efficacy in humans still unproven",
          "May require combination therapy",
          "Long development timeline"
        ],
        current_status_text: "Phase 2 trial showing C-peptide preservation signals; additional trials planned",
        estimated_availability_text: "5-8 years if current trials show efficacy",
        life_after_treatment: "Periodic booster vaccinations may be needed; potential to preserve or restore partial beta cell function",
        requirements: [
          "Intramuscular injections",
          "Regular monitoring of C-peptide and autoantibodies",
          "Early intervention preferred"
        ],
        clinical_trial_ids: ["NCT02081326", "NCT04279613"]
      },
      {
        name: "CAR-Treg Therapy",
        description: "Chimeric antigen receptor regulatory T-cells engineered to suppress autoimmune attack on beta cells",
        category: "cell_therapy",
        phase: "Phase 1",
        status: "Active",
        sponsor: "Multiple Academic Centers",
        progress_percentage: 20,
        confidence_score: 55,
        estimated_completion: "2029-06-30",
        website_url: null,
        is_featured: false,
        approach_type: "Engineered Cell Therapy",
        mechanism: "Patient's own regulatory T-cells are extracted, engineered with CAR targeting islets, expanded, and reinfused to protect beta cells",
        advantages: [
          "Uses patient's own cells",
          "Targeted immune modulation",
          "One-time infusion potential",
          "Preserves general immunity"
        ],
        risks: [
          "Complex manufacturing for each patient",
          "Very early stage",
          "Manufacturing variability",
          "High cost per patient"
        ],
        current_status_text: "Early Phase 1 trials at academic centers; proof-of-concept studies ongoing",
        estimated_availability_text: "8-12 years for potential approval",
        life_after_treatment: "If successful, could provide long-lasting immune tolerance; monitoring for Treg persistence; potential need for repeat infusions",
        requirements: [
          "Leukapheresis procedure",
          "Specialized treatment center access",
          "Long-term follow-up studies"
        ],
        clinical_trial_ids: ["NCT05680584"]
      }
    ];

    console.log(`✨ Inserting ${therapies.length} cure therapies with comprehensive data...`);

    const { data: therapyData, error: therapyError } = await supabase
      .from('cure_therapies')
      .insert(therapies)
      .select();

    if (therapyError) {
      console.error('❌ Error inserting therapies:', therapyError);
      throw therapyError;
    }

    console.log(`✅ Inserted ${therapyData?.length || 0} therapies`);

    // Create milestones for each therapy
    const milestones: Array<{
      therapy_id: string;
      title: string;
      description: string;
      status: string;
      target_date: string | null;
      completed_date: string | null;
    }> = [];

    for (const therapy of therapyData || []) {
      if (therapy.name === "VX-880 (Zimislecel)") {
        milestones.push(
          { therapy_id: therapy.id, title: "Phase 1/2 Enrollment Complete", description: "Initial patient cohorts enrolled and dosed", status: "completed", target_date: "2022-06-01", completed_date: "2022-03-15" },
          { therapy_id: therapy.id, title: "Phase 1/2 Efficacy Data", description: "12-month data showing insulin independence in majority of patients", status: "completed", target_date: "2023-06-01", completed_date: "2023-06-19" },
          { therapy_id: therapy.id, title: "Pivotal Trial Initiation", description: "Phase 2/3 registrational trial begins enrollment", status: "completed", target_date: "2024-01-01", completed_date: "2024-02-15" },
          { therapy_id: therapy.id, title: "Pivotal Trial Enrollment Complete", description: "Full enrollment in registrational study", status: "in_progress", target_date: "2025-12-01", completed_date: null },
          { therapy_id: therapy.id, title: "BLA Submission", description: "Biologics License Application to FDA", status: "pending", target_date: "2027-01-01", completed_date: null }
        );
      } else if (therapy.name === "Teplizumab (Tzield)") {
        milestones.push(
          { therapy_id: therapy.id, title: "FDA Approval", description: "First disease-modifying T1D therapy approved by FDA", status: "completed", target_date: "2022-11-01", completed_date: "2022-11-17" },
          { therapy_id: therapy.id, title: "Commercial Launch", description: "Tzield available for prescription in the US", status: "completed", target_date: "2023-01-01", completed_date: "2023-01-09" },
          { therapy_id: therapy.id, title: "Real-World Evidence Collection", description: "Post-marketing surveillance and outcomes data", status: "in_progress", target_date: "2025-12-01", completed_date: null },
          { therapy_id: therapy.id, title: "European Approval", description: "EMA regulatory decision", status: "pending", target_date: "2025-06-01", completed_date: null }
        );
      } else if (therapy.name === "VX-264") {
        milestones.push(
          { therapy_id: therapy.id, title: "IND Approval", description: "FDA clearance to begin human trials", status: "completed", target_date: "2023-06-01", completed_date: "2023-05-22" },
          { therapy_id: therapy.id, title: "First Patient Dosed", description: "Initial safety cohort treated", status: "completed", target_date: "2023-12-01", completed_date: "2023-10-16" },
          { therapy_id: therapy.id, title: "Cell Survival Readout", description: "Evidence of encapsulated cell function", status: "in_progress", target_date: "2025-06-01", completed_date: null },
          { therapy_id: therapy.id, title: "Phase 2 Expansion", description: "Expanded efficacy cohorts", status: "pending", target_date: "2026-06-01", completed_date: null }
        );
      } else if (therapy.name === "Donislecel (Lantidra)") {
        milestones.push(
          { therapy_id: therapy.id, title: "FDA Approval", description: "First cellular therapy for T1D approved", status: "completed", target_date: "2023-06-01", completed_date: "2023-06-28" },
          { therapy_id: therapy.id, title: "Center Qualification", description: "Transplant centers trained and qualified", status: "in_progress", target_date: "2024-12-01", completed_date: null },
          { therapy_id: therapy.id, title: "Insurance Coverage Decisions", description: "Major payer coverage determinations", status: "pending", target_date: "2025-06-01", completed_date: null }
        );
      }
    }

    if (milestones.length > 0) {
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('cure_milestones')
        .insert(milestones)
        .select();

      if (milestoneError) {
        console.error('❌ Error inserting milestones:', milestoneError);
        throw milestoneError;
      }

      console.log(`✅ Inserted ${milestoneData?.length || 0} milestones`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        therapies_created: therapyData?.length || 0,
        milestones_created: milestones.length,
        categories: {
          stem_cell: therapies.filter(t => t.category === 'stem_cell').length,
          immunotherapy: therapies.filter(t => t.category === 'immunotherapy').length,
          vaccine: therapies.filter(t => t.category === 'vaccine').length,
          cell_therapy: therapies.filter(t => t.category === 'cell_therapy').length,
          gene_therapy: therapies.filter(t => t.category === 'gene_therapy').length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
