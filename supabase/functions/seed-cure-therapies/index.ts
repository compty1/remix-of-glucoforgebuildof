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
    console.log('🌱 Seeding cure therapies and milestones...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing data first
    await supabase.from('cure_milestones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cure_therapies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const therapies = [
      {
        name: "VX-880 (Vertex)",
        description: "Allogeneic stem cell-derived, fully differentiated pancreatic islet cells for T1D patients with impaired hypoglycemic awareness and severe hypoglycemia.",
        category: "stem_cell",
        phase: "Phase 1/2",
        status: "active",
        sponsor: "Vertex Pharmaceuticals",
        progress_percentage: 65,
        confidence_score: 92,
        estimated_completion: "2027-06-30",
        website_url: "https://www.vrtx.com/pipeline/vx-880"
      },
      {
        name: "Teplizumab (Tzield)",
        description: "FDA-approved anti-CD3 monoclonal antibody that delays the onset of Stage 3 T1D in adults and pediatric patients 8 years and older.",
        category: "immunotherapy",
        phase: "Approved",
        status: "active",
        sponsor: "Provention Bio / Sanofi",
        progress_percentage: 100,
        confidence_score: 98,
        estimated_completion: "2022-11-17",
        website_url: "https://www.tzield.com"
      },
      {
        name: "VX-264 (Vertex)",
        description: "Encapsulated cell therapy using proprietary device to protect islet cells without immunosuppression.",
        category: "stem_cell",
        phase: "Phase 1/2",
        status: "active",
        sponsor: "Vertex Pharmaceuticals",
        progress_percentage: 40,
        confidence_score: 78,
        estimated_completion: "2028-12-31",
        website_url: "https://www.vrtx.com/pipeline"
      },
      {
        name: "VC-02 (ViaCyte/Vertex)",
        description: "PEC-Direct device delivering pancreatic endoderm cells for direct vascularization and insulin production.",
        category: "stem_cell",
        phase: "Phase 2",
        status: "active",
        sponsor: "Vertex Pharmaceuticals",
        progress_percentage: 55,
        confidence_score: 75,
        estimated_completion: "2027-12-31",
        website_url: "https://www.vrtx.com"
      },
      {
        name: "Golimumab (Simponi)",
        description: "TNF-alpha inhibitor being studied for preservation of beta cell function in newly diagnosed T1D patients.",
        category: "immunotherapy",
        phase: "Phase 2",
        status: "active",
        sponsor: "Janssen",
        progress_percentage: 70,
        confidence_score: 72,
        estimated_completion: "2026-09-30",
        website_url: "https://www.simponi.com"
      },
      {
        name: "TOL-3021 (Tolerion)",
        description: "DNA plasmid vaccine encoding proinsulin designed to induce immune tolerance and preserve beta cell function.",
        category: "vaccine",
        phase: "Phase 2",
        status: "active",
        sponsor: "Tolerion",
        progress_percentage: 45,
        confidence_score: 68,
        estimated_completion: "2027-03-31",
        website_url: "https://tolerion.bio"
      },
      {
        name: "CAR-Treg Therapy",
        description: "Chimeric antigen receptor regulatory T-cells engineered to suppress autoimmune attack on beta cells.",
        category: "cell_therapy",
        phase: "Phase 1",
        status: "active",
        sponsor: "Multiple Academic Centers",
        progress_percentage: 25,
        confidence_score: 60,
        estimated_completion: "2029-06-30",
        website_url: null
      },
      {
        name: "Low-dose IL-2 Therapy",
        description: "Low-dose interleukin-2 to expand regulatory T-cells and restore immune balance in T1D.",
        category: "immunotherapy",
        phase: "Phase 2",
        status: "active",
        sponsor: "Various",
        progress_percentage: 50,
        confidence_score: 65,
        estimated_completion: "2026-12-31",
        website_url: null
      }
    ];

    console.log(`✨ Inserting ${therapies.length} cure therapies...`);

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
      if (therapy.name === "VX-880 (Vertex)") {
        milestones.push(
          { therapy_id: therapy.id, title: "Phase 1 Enrollment Complete", description: "First cohort of 3 patients enrolled", status: "completed", target_date: "2022-06-01", completed_date: "2022-03-15" },
          { therapy_id: therapy.id, title: "Phase 1 Safety Data", description: "12-month safety data from Part A", status: "completed", target_date: "2023-06-01", completed_date: "2023-06-19" },
          { therapy_id: therapy.id, title: "Phase 2 Expansion", description: "Expanded enrollment to 17 patients", status: "completed", target_date: "2024-01-01", completed_date: "2024-01-15" },
          { therapy_id: therapy.id, title: "Pivotal Trial Design", description: "FDA agreement on Phase 3 design", status: "in_progress", target_date: "2025-06-01", completed_date: null },
          { therapy_id: therapy.id, title: "BLA Submission", description: "Biologics License Application", status: "pending", target_date: "2027-01-01", completed_date: null }
        );
      } else if (therapy.name === "Teplizumab (Tzield)") {
        milestones.push(
          { therapy_id: therapy.id, title: "FDA Approval", description: "First disease-modifying T1D therapy approved", status: "completed", target_date: "2022-11-01", completed_date: "2022-11-17" },
          { therapy_id: therapy.id, title: "Commercial Launch", description: "Tzield available in US", status: "completed", target_date: "2023-01-01", completed_date: "2023-01-09" },
          { therapy_id: therapy.id, title: "Real-World Evidence", description: "Post-marketing surveillance data", status: "in_progress", target_date: "2025-12-01", completed_date: null }
        );
      } else if (therapy.name === "VX-264 (Vertex)") {
        milestones.push(
          { therapy_id: therapy.id, title: "IND Approval", description: "FDA clearance to begin human trials", status: "completed", target_date: "2023-06-01", completed_date: "2023-05-22" },
          { therapy_id: therapy.id, title: "First Patient Dosed", description: "Initial safety cohort", status: "completed", target_date: "2023-12-01", completed_date: "2023-10-16" },
          { therapy_id: therapy.id, title: "Dose Escalation", description: "Evaluate higher cell doses", status: "in_progress", target_date: "2025-06-01", completed_date: null },
          { therapy_id: therapy.id, title: "Efficacy Readout", description: "Primary endpoint data", status: "pending", target_date: "2027-01-01", completed_date: null }
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
          cell_therapy: therapies.filter(t => t.category === 'cell_therapy').length
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
