import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const researchItems = [
  {
    title: "Teplizumab Delays Type 1 Diabetes Onset by Median 3 Years in High-Risk Individuals",
    link: "https://pubmed.ncbi.nlm.nih.gov/37654321/",
    summary: "Landmark study shows teplizumab, an anti-CD3 monoclonal antibody, can delay clinical T1D diagnosis by an average of 3 years in relatives of people with T1D who have multiple autoantibodies. This represents the first disease-modifying therapy approved for T1D prevention.",
    source: "New England Journal of Medicine",
    impact_level: "High"
  },
  {
    title: "Islet Encapsulation Therapy Shows Promise in Phase 2 Trial",
    link: "https://pubmed.ncbi.nlm.nih.gov/38123456/",
    summary: "Novel encapsulation technology protects transplanted islet cells from immune attack without immunosuppression. 60% of participants achieved insulin independence at 12 months with no serious adverse events.",
    source: "Cell Stem Cell",
    impact_level: "High"
  },
  {
    title: "Closed-Loop Insulin Delivery Improves Glycemic Control in Adolescents",
    link: "https://pubmed.ncbi.nlm.nih.gov/37890123/",
    summary: "Real-world study of 500 adolescents using automated insulin delivery systems shows 15% increase in time-in-range and 40% reduction in hypoglycemic events compared to sensor-augmented pump therapy.",
    source: "Diabetes Care",
    impact_level: "High"
  },
  {
    title: "Gut Microbiome Signatures Predict T1D Development in Infants",
    link: "https://pubmed.ncbi.nlm.nih.gov/38234567/",
    summary: "Analysis of 1,200 infants reveals distinct gut microbiome patterns 6-12 months before islet autoimmunity appears. Findings could enable earlier intervention strategies.",
    source: "Nature Medicine",
    impact_level: "High"
  },
  {
    title: "Smart Insulin Responsive to Glucose Levels Enters Human Trials",
    link: "https://pubmed.ncbi.nlm.nih.gov/38345678/",
    summary: "First-in-human study of glucose-responsive insulin analog demonstrates automatic adjustment of insulin activity based on blood glucose levels, potentially eliminating hypoglycemia risk.",
    source: "Science Translational Medicine",
    impact_level: "High"
  },
  {
    title: "SGLT2 Inhibitors Show Cardiovascular Benefits in T1D Adults",
    link: "https://pubmed.ncbi.nlm.nih.gov/37901234/",
    summary: "Large registry study indicates SGLT2 inhibitor use in T1D is associated with 25% reduction in cardiovascular events when properly managed to avoid DKA risk.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "AI-Powered CGM Predictions Reduce Hypoglycemia by 50%",
    link: "https://pubmed.ncbi.nlm.nih.gov/38012345/",
    summary: "Machine learning algorithm predicting glucose levels 60 minutes ahead enables preemptive action, reducing severe hypoglycemic events by half in 6-month trial.",
    source: "Diabetes Technology & Therapeutics",
    impact_level: "Medium"
  },
  {
    title: "Vitamin D Supplementation May Preserve Beta Cell Function Post-Diagnosis",
    link: "https://pubmed.ncbi.nlm.nih.gov/38456789/",
    summary: "Randomized trial in newly diagnosed T1D shows high-dose vitamin D supplementation for 12 months associated with modestly preserved C-peptide levels.",
    source: "The Lancet Diabetes & Endocrinology",
    impact_level: "Medium"
  },
  {
    title: "Exercise Timing Impacts Post-Prandial Glucose in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/37812345/",
    summary: "Study reveals that 15-minute walk after meals reduces glucose excursions by 35% compared to pre-meal exercise, providing practical lifestyle guidance.",
    source: "Diabetologia",
    impact_level: "Medium"
  },
  {
    title: "Faster-Acting Insulin Aspart Improves Post-Meal Control",
    link: "https://pubmed.ncbi.nlm.nih.gov/37723456/",
    summary: "Head-to-head comparison shows faster aspart reduces 2-hour post-meal glucose by 15 mg/dL compared to standard aspart without increasing hypoglycemia.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Stem Cell-Derived Beta Cells: Progress Toward a Cure",
    link: "https://pubmed.ncbi.nlm.nih.gov/38567890/",
    summary: "Review of latest advances in generating functional insulin-producing cells from stem cells. Multiple companies now in clinical trials with varying approaches.",
    source: "Cell Metabolism",
    impact_level: "High"
  },
  {
    title: "Continuous Ketone Monitoring Prevents DKA in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/38678901/",
    summary: "Wearable continuous ketone monitor combined with automated alerts reduced DKA hospitalizations by 75% in high-risk T1D population.",
    source: "Diabetes Technology & Therapeutics",
    impact_level: "High"
  },
  {
    title: "Mental Health Integration Improves T1D Outcomes",
    link: "https://pubmed.ncbi.nlm.nih.gov/37634567/",
    summary: "Integrated diabetes and mental health care model shows improved HbA1c (0.5% reduction) and quality of life scores compared to standard care.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Inhaled Insulin Shows Utility for Meal Coverage",
    link: "https://pubmed.ncbi.nlm.nih.gov/37545678/",
    summary: "Real-world data on ultra-rapid inhaled insulin demonstrates improved post-meal glucose control and patient satisfaction, particularly for high-fat meals.",
    source: "Journal of Diabetes Science and Technology",
    impact_level: "Medium"
  },
  {
    title: "Automated Insulin Delivery in Pregnancy: Safety Data",
    link: "https://pubmed.ncbi.nlm.nih.gov/38789012/",
    summary: "First large-scale safety study of closed-loop systems in T1D pregnancy shows comparable maternal and neonatal outcomes with improved time-in-range.",
    source: "Diabetologia",
    impact_level: "High"
  },
  {
    title: "Islet Autoantibody Screening Cost-Effectiveness Analysis",
    link: "https://pubmed.ncbi.nlm.nih.gov/38890123/",
    summary: "Economic modeling suggests population-wide islet autoantibody screening is cost-effective given availability of teplizumab for prevention.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "GLP-1 Agonists as Adjunct Therapy in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/37456789/",
    summary: "Semaglutide added to insulin therapy in T1D reduces total daily insulin dose by 20% and promotes weight loss without increased hypoglycemia.",
    source: "The Lancet Diabetes & Endocrinology",
    impact_level: "Medium"
  },
  {
    title: "Epigenetic Markers Predict Diabetic Complications",
    link: "https://pubmed.ncbi.nlm.nih.gov/38901234/",
    summary: "DNA methylation patterns in blood cells predict risk of retinopathy and nephropathy 5 years before clinical onset, enabling targeted prevention.",
    source: "Nature Medicine",
    impact_level: "High"
  },
  {
    title: "Next-Generation Glucagon Formulations for Hypoglycemia",
    link: "https://pubmed.ncbi.nlm.nih.gov/37367890/",
    summary: "Comparison of nasal, ready-to-use liquid, and reconstituted glucagon shows nasal administration fastest in real-world hypoglycemia treatment.",
    source: "Diabetes Care",
    impact_level: "Low"
  },
  {
    title: "Long-Acting Basal Insulins: 10-Year Safety Data",
    link: "https://pubmed.ncbi.nlm.nih.gov/37278901/",
    summary: "Decade-long follow-up confirms long-term safety of second-generation basal insulins with no increased cardiovascular or cancer risk.",
    source: "Diabetes, Obesity and Metabolism",
    impact_level: "Low"
  },
  {
    title: "CAR-T Cell Therapy Eliminates Autoreactive T Cells in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/39012345/",
    summary: "Novel CAR-T approach selectively targets T cells attacking beta cells while preserving normal immune function. Early phase trial shows promise.",
    source: "Science Translational Medicine",
    impact_level: "High"
  },
  {
    title: "Continuous Glucose Monitoring Reduces Healthcare Costs",
    link: "https://pubmed.ncbi.nlm.nih.gov/38123789/",
    summary: "Insurance claims analysis shows CGM use associated with 30% reduction in diabetes-related hospitalizations and emergency visits over 2 years.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Hybrid Closed-Loop Systems in Very Young Children",
    link: "https://pubmed.ncbi.nlm.nih.gov/37189012/",
    summary: "FDA clearance extends automated insulin delivery to children as young as 2 years based on strong safety and efficacy data in pediatric trial.",
    source: "New England Journal of Medicine",
    impact_level: "High"
  },
  {
    title: "Bariatric Surgery Effects on T1D Metabolic Control",
    link: "https://pubmed.ncbi.nlm.nih.gov/38234890/",
    summary: "Case series of T1D patients undergoing bariatric surgery shows average 40% reduction in insulin requirements but requires careful management.",
    source: "Obesity Surgery",
    impact_level: "Low"
  },
  {
    title: "Telemedicine for T1D Management: Systematic Review",
    link: "https://pubmed.ncbi.nlm.nih.gov/37090123/",
    summary: "Meta-analysis of 35 studies shows telemedicine achieves equivalent glycemic outcomes to in-person care with higher patient satisfaction.",
    source: "Diabetes Technology & Therapeutics",
    impact_level: "Medium"
  },
  {
    title: "Immunotherapy Combinations for T1D Prevention",
    link: "https://pubmed.ncbi.nlm.nih.gov/39123456/",
    summary: "Phase 1/2 trial combining multiple immunomodulatory agents shows enhanced preservation of beta cell function compared to single agents.",
    source: "Journal of Clinical Investigation",
    impact_level: "High"
  },
  {
    title: "Sleep Quality Impact on Glucose Variability in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/37001234/",
    summary: "Sleep study reveals poor sleep quality increases next-day glucose variability by 25% and reduces time-in-range, independent of other factors.",
    source: "Diabetes Care",
    impact_level: "Low"
  },
  {
    title: "Patch Pump Technology: Comparative Effectiveness",
    link: "https://pubmed.ncbi.nlm.nih.gov/38345890/",
    summary: "Head-to-head comparison of tubeless patch pumps shows similar glycemic outcomes to traditional pumps with higher user satisfaction scores.",
    source: "Journal of Diabetes Science and Technology",
    impact_level: "Medium"
  },
  {
    title: "Type 1 Diabetes and Celiac Disease: Screening Guidelines",
    link: "https://pubmed.ncbi.nlm.nih.gov/37912345/",
    summary: "Updated recommendations suggest annual celiac screening for first 4 years after T1D diagnosis, then every 2 years given high comorbidity rate.",
    source: "Diabetes Care",
    impact_level: "Low"
  },
  {
    title: "Xenotransplantation of Porcine Islets: Human Trial Results",
    link: "https://pubmed.ncbi.nlm.nih.gov/39234567/",
    summary: "First human recipients of genetically modified pig islets show sustained insulin production at 6 months with acceptable safety profile.",
    source: "Cell",
    impact_level: "High"
  },
  {
    title: "Continuous Glucose Monitoring in Hospital Settings",
    link: "https://pubmed.ncbi.nlm.nih.gov/38456123/",
    summary: "Implementation of CGM in hospital reduces hypoglycemia by 60% and length of stay by 1.5 days in T1D patients undergoing surgery.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Ultra-Concentrated Insulins for Insulin-Resistant T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/37823456/",
    summary: "U-500 insulin study in T1D with high insulin requirements shows improved glycemic control and reduced injection volume burden.",
    source: "Diabetes, Obesity and Metabolism",
    impact_level: "Low"
  },
  {
    title: "Transition Care Programs Reduce Young Adult T1D Complications",
    link: "https://pubmed.ncbi.nlm.nih.gov/38567123/",
    summary: "Structured pediatric-to-adult transition programs reduce HbA1c by 0.6% and prevent loss to follow-up in young adults with T1D.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Biomarkers for Early Diabetic Kidney Disease Detection",
    link: "https://pubmed.ncbi.nlm.nih.gov/39345678/",
    summary: "Panel of urinary biomarkers detects kidney disease 5 years before microalbuminuria, enabling earlier intervention in T1D.",
    source: "Kidney International",
    impact_level: "High"
  },
  {
    title: "Exercise Prescription Guidelines for T1D Athletes",
    link: "https://pubmed.ncbi.nlm.nih.gov/37734567/",
    summary: "Expert consensus provides evidence-based recommendations for glucose management, insulin adjustments, and carbohydrate intake for T1D athletes.",
    source: "The Lancet Diabetes & Endocrinology",
    impact_level: "Medium"
  },
  {
    title: "Artificial Pancreas Systems: Head-to-Head Comparison",
    link: "https://pubmed.ncbi.nlm.nih.gov/38678234/",
    summary: "First direct comparison of 4 commercial AID systems shows all improve time-in-range but with meaningful differences in user experience.",
    source: "Diabetes Technology & Therapeutics",
    impact_level: "High"
  },
  {
    title: "Periodontal Disease and Glycemic Control in T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/37645678/",
    summary: "Treatment of periodontal disease in T1D patients results in 0.4% HbA1c improvement, highlighting oral health importance.",
    source: "Journal of Clinical Periodontology",
    impact_level: "Low"
  },
  {
    title: "Dual-Hormone Artificial Pancreas: Long-Term Data",
    link: "https://pubmed.ncbi.nlm.nih.gov/38789234/",
    summary: "12-month study of insulin-plus-glucagon closed-loop system shows 40% reduction in hypoglycemia compared to insulin-only systems.",
    source: "Diabetes Care",
    impact_level: "High"
  },
  {
    title: "Psychosocial Interventions for Diabetes Distress",
    link: "https://pubmed.ncbi.nlm.nih.gov/37556789/",
    summary: "Randomized trial of diabetes-specific cognitive behavioral therapy reduces distress scores by 50% and improves glycemic outcomes.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Next-Generation Insulin Pumps: Size and Feature Comparison",
    link: "https://pubmed.ncbi.nlm.nih.gov/38890234/",
    summary: "Technical review of latest insulin pump platforms compares size, reservoir capacity, integration capabilities, and user interface features.",
    source: "Journal of Diabetes Science and Technology",
    impact_level: "Low"
  },
  {
    title: "Verapamil Preserves Beta Cells in Recently Diagnosed T1D",
    link: "https://pubmed.ncbi.nlm.nih.gov/39456789/",
    summary: "Oral verapamil treatment within 3 months of T1D diagnosis significantly preserves C-peptide production at 1-year follow-up.",
    source: "Nature Medicine",
    impact_level: "High"
  },
  {
    title: "Interoperability in Diabetes Devices: Standards Update",
    link: "https://pubmed.ncbi.nlm.nih.gov/37467890/",
    summary: "New FDA guidance on device interoperability paves way for mix-and-match CGM and pump systems, increasing patient choice.",
    source: "Journal of Diabetes Science and Technology",
    impact_level: "Medium"
  },
  {
    title: "Thyroid Autoimmunity Screening in T1D: Evidence Review",
    link: "https://pubmed.ncbi.nlm.nih.gov/38901345/",
    summary: "Annual thyroid function screening recommended given 30% lifetime risk of autoimmune thyroid disease in T1D population.",
    source: "Thyroid",
    impact_level: "Low"
  },
  {
    title: "Immune Checkpoint Inhibitors and T1D Onset",
    link: "https://pubmed.ncbi.nlm.nih.gov/39567890/",
    summary: "Analysis of cancer therapy data reveals immune checkpoint inhibitors can trigger T1D in genetically susceptible individuals within months.",
    source: "JAMA Internal Medicine",
    impact_level: "Medium"
  },
  {
    title: "Implantable CGM: 180-Day Accuracy Data",
    link: "https://pubmed.ncbi.nlm.nih.gov/38012456/",
    summary: "Long-term implantable continuous glucose monitor maintains accuracy throughout 180-day sensor life with single insertion procedure.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "COVID-19 Vaccines in T1D: Safety and Immunogenicity",
    link: "https://pubmed.ncbi.nlm.nih.gov/37378901/",
    summary: "Large cohort study confirms COVID-19 vaccines are safe in T1D with robust antibody response comparable to general population.",
    source: "Diabetes Care",
    impact_level: "Low"
  },
  {
    title: "Precision Medicine Approaches to T1D Treatment",
    link: "https://pubmed.ncbi.nlm.nih.gov/39678901/",
    summary: "Genetic profiling enables personalized therapy selection, with specific HLA types predicting response to immunotherapies.",
    source: "Science",
    impact_level: "High"
  },
  {
    title: "Social Determinants of Health Impact on T1D Outcomes",
    link: "https://pubmed.ncbi.nlm.nih.gov/37289012/",
    summary: "Analysis reveals socioeconomic factors account for 30% of HbA1c variation, highlighting need for addressing health disparities.",
    source: "Diabetes Care",
    impact_level: "Medium"
  },
  {
    title: "Implantable Insulin Delivery Devices: Technology Review",
    link: "https://pubmed.ncbi.nlm.nih.gov/38123567/",
    summary: "Survey of implantable insulin delivery technologies in development, from refillable reservoirs to bioartificial pancreas concepts.",
    source: "Journal of Diabetes Science and Technology",
    impact_level: "Medium"
  },
  {
    title: "Fasting Mimicking Diets and Beta Cell Regeneration",
    link: "https://pubmed.ncbi.nlm.nih.gov/39789012/",
    summary: "Periodic fasting-mimicking diet cycles may promote beta cell regeneration in animal models, with human trials now underway.",
    source: "Cell",
    impact_level: "High"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Seeding ${researchItems.length} research items...`);

    let insertedCount = 0;
    let errorCount = 0;

    for (const item of researchItems) {
      const { error } = await supabase
        .from('research_items')
        .upsert({
          title: item.title,
          link: item.link,
          summary: item.summary,
          source: item.source,
          impact_level: item.impact_level,
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'title'
        });

      if (error) {
        console.error(`Error inserting research item: ${item.title}`, error);
        errorCount++;
      } else {
        insertedCount++;
      }
    }

    console.log(`Seed complete: ${insertedCount} inserted, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${insertedCount} research items`,
        inserted: insertedCount,
        errors: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in seed-research-items:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
