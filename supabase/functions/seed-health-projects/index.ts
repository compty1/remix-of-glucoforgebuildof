import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const healthProjects = [
  {
    slug: "morning-nausea",
    title: "Morning Nausea in Type 1 Diabetes",
    description: "Many T1D patients experience unexplained nausea upon waking, often unrelated to blood sugar levels. This project compiles research on potential causes including gastroparesis, dawn phenomenon effects, and hormonal fluctuations.",
    symptoms: ["Morning nausea", "Early morning stomach discomfort", "Loss of appetite in AM", "Queasy feeling upon waking"],
    prevalence_percentage: 35,
    category: "Gastrointestinal",
    official_research_summary: "Research suggests morning nausea in T1D may be linked to autonomic neuropathy affecting gastric motility, cortisol awakening response variations, or subclinical gastroparesis. Studies show correlation with duration of diabetes and HbA1c variability.",
    community_insights_summary: "Community members report success with: eating small amounts before bed, adjusting basal rates, ginger supplements, staying hydrated, and timing breakfast insulin differently. Many note improvement when blood sugar is stable overnight.",
    status: "published",
    featured: true,
    // NEW ENHANCED FIELDS
    possible_causes: ["Gastroparesis (delayed stomach emptying)", "Dawn phenomenon hormonal effects", "Overnight hypoglycemia rebound", "Cortisol awakening response dysfunction", "Medication side effects (metformin)", "Dehydration from overnight hyperglycemia", "Autonomic neuropathy", "Anxiety/stress response"],
    search_volume_monthly: 12400,
    affected_population_estimate: 350000,
    condition_triggers: ["High overnight blood sugar", "Rapid BG fluctuations", "Skipping dinner", "Poor sleep quality", "Stress and anxiety", "Dehydration"],
    related_conditions: ["Gastroparesis", "Dawn Phenomenon", "Diabetic Neuropathy"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "6-18 months",
    commonly_misdiagnosed_as: ["General anxiety", "GERD/acid reflux", "Food poisoning", "Pregnancy", "Stomach virus"],
  },
  {
    slug: "unexplained-shakiness",
    title: "Unexplained Shakiness & Tremors",
    description: "Experiencing shakiness or tremors even when blood glucose is in range is a common but poorly understood phenomenon among diabetics. This project explores neurological, hormonal, and medication-related factors.",
    symptoms: ["Trembling hands", "Internal shakiness", "Jittery feeling", "Fine motor tremors", "Anxiety-like symptoms"],
    prevalence_percentage: 40,
    category: "Neurological",
    official_research_summary: "Research indicates that diabetics may experience pseudohypoglycemia - symptoms of low blood sugar at normal levels - due to rapid glucose drops, adrenaline sensitivity, or neuropathic changes. Autonomic dysfunction may also contribute.",
    community_insights_summary: "Community solutions include: reducing caffeine, managing rate of glucose change, ensuring adequate electrolytes (especially magnesium), stress management techniques, and discussing medication interactions with healthcare providers.",
    status: "published",
    featured: true,
    // NEW ENHANCED FIELDS
    possible_causes: ["Pseudohypoglycemia (symptoms at normal BG)", "Rapid glucose drops (even within range)", "Caffeine sensitivity", "Magnesium deficiency", "Adrenaline/cortisol sensitivity", "Autonomic neuropathy", "Medication side effects", "Anxiety disorders", "Thyroid dysfunction", "Low potassium levels"],
    search_volume_monthly: 18600,
    affected_population_estimate: 400000,
    condition_triggers: ["Rapid glucose decline", "Caffeine intake", "Stress/anxiety", "Sleep deprivation", "Skipped meals", "High-intensity exercise"],
    related_conditions: ["Hypoglycemia Unawareness", "Anxiety Disorders", "Autonomic Neuropathy", "Essential Tremor"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "3-12 months",
    commonly_misdiagnosed_as: ["Hypoglycemia", "Panic attacks", "Essential tremor", "Hyperthyroidism", "Caffeine overdose"],
  },
  {
    slug: "gastroparesis-management",
    title: "Gastroparesis & Delayed Digestion",
    description: "Diabetic gastroparesis affects stomach emptying rates, causing unpredictable blood sugar patterns and digestive discomfort. This project covers diagnosis, management strategies, and emerging treatments.",
    symptoms: ["Delayed stomach emptying", "Bloating after meals", "Early satiety", "Nausea after eating", "Unpredictable post-meal glucose"],
    prevalence_percentage: 20,
    category: "Gastrointestinal",
    official_research_summary: "Gastroparesis results from vagal nerve damage affecting gastric motility. Studies show it affects 20-40% of long-duration T1D patients. Treatment approaches include dietary modifications, prokinetic medications, and insulin timing adjustments.",
    community_insights_summary: "Community strategies: smaller frequent meals, low-fiber/low-fat diet during flares, pre-bolusing adjustments, using CGM to time insulin, ginger tea, and walking after meals. Some report success with extended/combo boluses.",
    status: "published",
    featured: true,
    // NEW ENHANCED FIELDS
    possible_causes: ["Vagal nerve damage", "Long-term hyperglycemia effects", "Autoimmune damage to gut nerves", "Inflammation of stomach lining", "Scleroderma overlap", "Post-viral gastroparesis", "Medication-induced (opioids)", "Diabetes duration (>10 years risk factor)"],
    search_volume_monthly: 27300,
    affected_population_estimate: 200000,
    condition_triggers: ["High-fiber meals", "Large meal portions", "High-fat foods", "Carbonated beverages", "Lying down after eating", "Poorly controlled blood sugars"],
    related_conditions: ["GERD", "Small Intestinal Bacterial Overgrowth (SIBO)", "Diabetic Neuropathy", "Cyclic Vomiting Syndrome"],
    management_difficulty: "severe",
    time_to_diagnosis_avg: "2-5 years",
    commonly_misdiagnosed_as: ["IBS", "GERD", "Food allergies", "Eating disorders", "Functional dyspepsia"],
  },
  {
    slug: "dawn-phenomenon",
    title: "Dawn Phenomenon Management",
    description: "The dawn phenomenon causes blood sugar spikes in early morning hours due to hormonal changes. This project examines the mechanisms and various management approaches.",
    symptoms: ["Early morning BG rise", "Elevated fasting glucose", "Wake-up hyperglycemia", "Resistant morning highs"],
    prevalence_percentage: 50,
    category: "Metabolic",
    official_research_summary: "The dawn phenomenon is driven by circadian-mediated cortisol and growth hormone surges that increase hepatic glucose output and reduce insulin sensitivity. Research shows it affects up to 75% of T1D patients to varying degrees.",
    community_insights_summary: "Management strategies include: adjusted basal patterns, closed-loop systems, protein snacks before bed, early morning basal increases, and some report success with metformin as an adjunct therapy.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Cortisol surge (3-8 AM)", "Growth hormone release during sleep", "Hepatic glucose output increase", "Natural circadian insulin resistance", "Waning overnight insulin action", "Insufficient overnight basal insulin"],
    search_volume_monthly: 33400,
    affected_population_estimate: 500000,
    condition_triggers: ["Late-night carbs", "Insufficient overnight basal", "High-protein dinner", "Exercise timing", "Poor sleep quality", "Stress hormones"],
    related_conditions: ["Somogyi Effect", "Insulin Resistance", "Sleep Disorders"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "1-3 months",
    commonly_misdiagnosed_as: ["Somogyi effect (rebound hyperglycemia)", "Insufficient evening insulin", "Snacking at night"],
  },
  {
    slug: "exercise-glucose-instability",
    title: "Exercise-Induced Glucose Instability",
    description: "Blood glucose behavior during and after exercise is highly variable and often frustrating for diabetics. This project covers different exercise types and their unique challenges.",
    symptoms: ["Exercise-induced hypoglycemia", "Post-workout hyperglycemia", "Delayed hypoglycemia", "Unpredictable exercise response"],
    prevalence_percentage: 65,
    category: "Metabolic",
    official_research_summary: "Research distinguishes between aerobic (tends to lower BG) and anaerobic (may raise BG) exercise effects. Factors include insulin on board, timing, intensity, duration, and starting glucose level. Post-exercise hypoglycemia can occur up to 24 hours later.",
    community_insights_summary: "Community approaches: reducing basal 1-2 hours before exercise, small carb intake during activity, protein-fat snacks post-workout, different strategies for different exercise types, and careful CGM monitoring.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Increased muscle glucose uptake", "Adrenaline response (raises BG)", "Insulin sensitivity changes", "Glycogen depletion", "Delayed muscle refueling", "Variable exercise intensity", "Time of day effects", "Insulin on board levels"],
    search_volume_monthly: 22100,
    affected_population_estimate: 650000,
    condition_triggers: ["High-intensity intervals", "Morning exercise", "Exercising with insulin on board", "Fasted exercise", "Hot weather exercise", "Competition stress"],
    related_conditions: ["Hypoglycemia", "Insulin Sensitivity", "Athletic Performance Optimization"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "Immediate (known issue)",
    commonly_misdiagnosed_as: ["Overtraining syndrome", "Electrolyte imbalance", "Dehydration"],
  },
  {
    slug: "sleep-glucose-control",
    title: "Sleep Quality & Glucose Control",
    description: "Poor sleep and blood glucose are bidirectionally linked. This project explores how diabetes affects sleep and how sleep quality impacts glucose management.",
    symptoms: ["Insomnia", "Frequent waking", "Poor sleep quality", "Daytime fatigue", "Overnight glucose variability"],
    prevalence_percentage: 45,
    category: "Sleep",
    official_research_summary: "Studies show diabetics experience higher rates of sleep disorders including sleep apnea, restless leg syndrome, and insomnia. Poor sleep increases insulin resistance and affects glucose regulation. CGM alarms may also disrupt sleep patterns.",
    community_insights_summary: "Community tips: optimizing CGM alarm settings, establishing consistent sleep schedules, managing overnight basal rates, reducing blue light exposure, and addressing anxiety about overnight BG levels.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Sleep apnea (higher incidence in T1D)", "CGM alarm disruptions", "Overnight hypoglycemia awakenings", "Hyperglycemia-induced urination", "Diabetes-related anxiety", "Restless leg syndrome", "Neuropathic pain at night", "Cortisol dysregulation"],
    search_volume_monthly: 14800,
    affected_population_estimate: 450000,
    condition_triggers: ["High evening blood sugars", "CGM alarms", "Anxiety about overnight lows", "Neuropathy symptoms", "Inconsistent bedtime", "Screen time before bed"],
    related_conditions: ["Sleep Apnea", "Restless Leg Syndrome", "Anxiety", "Diabetic Neuropathy"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "6-24 months",
    commonly_misdiagnosed_as: ["Primary insomnia", "Depression", "Chronic fatigue syndrome", "Sleep apnea alone"],
  },
  {
    slug: "stress-glucose-spikes",
    title: "Stress & Anxiety Glucose Spikes",
    description: "Mental stress and anxiety can cause significant blood glucose elevations independent of food intake. This project examines the mechanisms and management strategies.",
    symptoms: ["Stress-induced hyperglycemia", "Anxiety-related BG spikes", "Emotional eating effects", "Adrenaline responses"],
    prevalence_percentage: 55,
    category: "Psychological",
    official_research_summary: "Stress hormones (cortisol, adrenaline) trigger hepatic glucose release and reduce insulin sensitivity. Research shows psychological stress can raise BG by 20-100 mg/dL. Chronic stress may also worsen long-term glycemic control.",
    community_insights_summary: "Community solutions: stress management techniques (meditation, breathing exercises), correction boluses during stressful periods, identifying personal stress patterns, therapy/counseling, and some report success with adaptogens.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Cortisol release", "Adrenaline/epinephrine surge", "Hepatic glucose output", "Reduced insulin sensitivity", "Fight-or-flight response", "Chronic stress adaptation", "HPA axis dysregulation", "Inflammatory response to stress"],
    search_volume_monthly: 19200,
    affected_population_estimate: 550000,
    condition_triggers: ["Work deadlines", "Conflict situations", "Financial stress", "Health anxiety", "Major life changes", "Social situations", "Test-taking/performance"],
    related_conditions: ["Generalized Anxiety Disorder", "Depression", "Diabetes Distress", "PTSD"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "1-6 months",
    commonly_misdiagnosed_as: ["Insulin resistance", "Wrong I:C ratios", "Hidden carbs", "Pump malfunction"],
  },
  {
    slug: "menstrual-cycle-effects",
    title: "Menstrual Cycle Effects on Insulin",
    description: "Hormonal fluctuations throughout the menstrual cycle significantly impact insulin sensitivity and glucose patterns in women with T1D.",
    symptoms: ["Premenstrual insulin resistance", "Cycle-related BG variability", "PMS glucose spikes", "Menstrual hypoglycemia"],
    prevalence_percentage: 70,
    category: "Hormonal",
    official_research_summary: "Progesterone and estrogen fluctuations affect insulin sensitivity throughout the cycle. Research shows insulin requirements may increase 15-40% in the luteal phase. Understanding these patterns can improve glycemic control.",
    community_insights_summary: "Community strategies: tracking cycle alongside BG patterns, increasing basal/bolus during luteal phase, adjusting I:C ratios, communicating with endocrinologists about hormonal effects, and using cycle tracking apps.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Progesterone-induced insulin resistance", "Estrogen fluctuations", "Luteal phase hormonal changes", "Follicular phase sensitivity increase", "PMS-related stress hormones", "Food cravings and eating pattern changes", "Water retention effects on CGM"],
    search_volume_monthly: 8900,
    affected_population_estimate: 350000,
    condition_triggers: ["Luteal phase (days 15-28)", "Premenstrual week", "Ovulation day", "First day of menstruation", "Hormonal birth control changes", "Perimenopause"],
    related_conditions: ["PCOS", "Premenstrual Dysphoric Disorder", "Endometriosis", "Thyroid disorders"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "3-12 months",
    commonly_misdiagnosed_as: ["Random BG variability", "Stress-induced changes", "Diet inconsistency", "Site absorption issues"],
  },
  {
    slug: "temperature-weather-sensitivity",
    title: "Temperature & Weather Sensitivity",
    description: "Environmental temperature and weather changes can significantly affect insulin absorption, glucose levels, and overall diabetes management.",
    symptoms: ["Heat-induced hypoglycemia", "Cold weather insulin resistance", "Weather-related BG swings", "Seasonal pattern changes"],
    prevalence_percentage: 30,
    category: "Environmental",
    official_research_summary: "Heat increases insulin absorption rate and peripheral circulation, potentially causing faster BG drops. Cold can slow absorption and increase insulin resistance. Studies recommend adjusting doses during extreme temperatures.",
    community_insights_summary: "Community approaches: keeping insulin cool in summer, adjusting doses for seasonal changes, extra monitoring during weather extremes, and using insulated cases for devices.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Heat-accelerated insulin absorption", "Cold-slowed insulin action", "Vasodilation in heat", "Vasoconstriction in cold", "Activity level changes with weather", "Dehydration in heat", "Seasonal illness patterns", "Vitamin D fluctuations"],
    search_volume_monthly: 5400,
    affected_population_estimate: 300000,
    condition_triggers: ["Temperatures above 85°F/30°C", "Temperatures below 40°F/4°C", "Hot tubs/saunas", "Swimming", "Sunburn", "Air conditioning transitions"],
    related_conditions: ["Dehydration", "Heat Exhaustion", "Seasonal Affective Disorder"],
    management_difficulty: "mild",
    time_to_diagnosis_avg: "1-3 months",
    commonly_misdiagnosed_as: ["Random variability", "Incorrect bolusing", "Activity effects", "Food effects"],
  },
  {
    slug: "chronic-fatigue",
    title: "Chronic Fatigue Despite Good Control",
    description: "Many diabetics experience persistent fatigue even with well-managed blood sugars. This project explores potential causes beyond glycemic control.",
    symptoms: ["Persistent tiredness", "Low energy levels", "Brain fog", "Exercise intolerance", "Unexplained exhaustion"],
    prevalence_percentage: 40,
    category: "General",
    official_research_summary: "Research suggests fatigue in T1D may involve cellular energy metabolism differences, autoimmune inflammation, thyroid dysfunction (common comorbidity), sleep disorders, and the cognitive burden of constant disease management.",
    community_insights_summary: "Community findings: screening for thyroid issues, optimizing vitamin D and B12 levels, addressing sleep quality, pacing activities, and acknowledging the mental load of diabetes management.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Thyroid dysfunction (common T1D comorbidity)", "Celiac disease (autoimmune)", "Vitamin B12 deficiency", "Vitamin D deficiency", "Iron deficiency/anemia", "Sleep disorders", "Diabetes burnout", "Chronic inflammation", "Adrenal fatigue", "Depression"],
    search_volume_monthly: 16700,
    affected_population_estimate: 400000,
    condition_triggers: ["Glucose variability", "Poor sleep", "Overexertion", "Stress", "Illness", "Inadequate nutrition", "Dehydration"],
    related_conditions: ["Hypothyroidism", "Celiac Disease", "Depression", "Chronic Fatigue Syndrome", "Addison's Disease"],
    management_difficulty: "moderate",
    time_to_diagnosis_avg: "6-24 months",
    commonly_misdiagnosed_as: ["Laziness", "Depression", "Poor glucose control", "Normal aging", "Work stress"],
  },
  {
    slug: "injection-site-reactions",
    title: "Skin Reactions at Injection Sites",
    description: "Lipohypertrophy, lipoatrophy, and other skin reactions at insulin injection and infusion sites are common but often underdiagnosed issues.",
    symptoms: ["Lumps at injection sites", "Tissue changes", "Absorption variability", "Scarring", "Allergic reactions"],
    prevalence_percentage: 35,
    category: "Dermatological",
    official_research_summary: "Lipohypertrophy affects up to 50% of insulin users and significantly impacts absorption predictability. Research emphasizes site rotation, proper technique, and regular site examination to prevent and manage these issues.",
    community_insights_summary: "Community solutions: strict site rotation schedules, using site mapping apps, avoiding overused areas, gentle massage, and considering different needle lengths or infusion set types.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Repeated injection in same sites", "Insulin lipogenic effects", "Needle reuse", "Improper injection technique", "Allergic reactions to insulin", "Infusion set adhesive reactions", "Preservative sensitivity", "Cold insulin injections"],
    search_volume_monthly: 9100,
    affected_population_estimate: 350000,
    condition_triggers: ["Poor site rotation", "Using expired sites", "Needle reuse", "Incorrect needle length", "Injecting too quickly", "Not allowing alcohol to dry"],
    related_conditions: ["Lipohypertrophy", "Lipoatrophy", "Contact Dermatitis", "Insulin Allergy"],
    management_difficulty: "mild",
    time_to_diagnosis_avg: "1-6 months",
    commonly_misdiagnosed_as: ["Fat deposits", "Cysts", "Scar tissue", "Allergic reactions"],
  },
  {
    slug: "altitude-insulin-effects",
    title: "Altitude Effects on Insulin Needs",
    description: "Changes in altitude during travel or activities can unexpectedly affect blood glucose levels and insulin requirements.",
    symptoms: ["High altitude hyperglycemia", "Air travel BG effects", "Mountain activity glucose changes", "Pressure-related pump issues"],
    prevalence_percentage: 25,
    category: "Environmental",
    official_research_summary: "Research shows altitude affects glucose metabolism, oxygen availability, and stress hormone levels. Air pressure changes can affect insulin pump delivery. Studies recommend increased monitoring and dose adjustments during altitude changes.",
    community_insights_summary: "Community tips: increasing insulin at high altitude, protecting pumps during flights, accounting for increased activity levels, staying hydrated, and testing more frequently during altitude transitions.",
    status: "published",
    featured: false,
    // NEW ENHANCED FIELDS
    possible_causes: ["Reduced oxygen affecting metabolism", "Stress hormone release at altitude", "Air pressure effects on pump delivery", "Increased physical exertion", "Dehydration at altitude", "Temperature extremes", "Appetite changes", "Sleep disruption in new environments"],
    search_volume_monthly: 3200,
    affected_population_estimate: 250000,
    condition_triggers: ["Flying", "Mountain hiking", "Skiing", "Rapid altitude changes", "Pressurized cabin effects", "High altitude destinations (8000+ ft)"],
    related_conditions: ["Altitude Sickness", "Dehydration", "Jet Lag"],
    management_difficulty: "mild",
    time_to_diagnosis_avg: "Immediate (situational)",
    commonly_misdiagnosed_as: ["Altitude sickness", "Travel fatigue", "Food differences", "Activity effects"],
  },
];

const researchLinksData = [
  {
    project_slug: "morning-nausea",
    links: [
      {
        research_type: "study",
        title: "Gastrointestinal Symptoms in Diabetes Mellitus",
        authors: "Bytzer P, Talley NJ, et al.",
        publication: "Diabetes Care",
        publication_date: "2021-03-15",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
        key_findings: "GI symptoms are significantly more common in diabetics, with morning symptoms correlating with autonomic neuropathy severity.",
        relevance_score: 85,
      },
      {
        research_type: "paper",
        title: "Dawn Phenomenon and Morning Glucose Patterns",
        authors: "Monnier L, Colette C",
        publication: "Diabetes & Metabolism",
        publication_date: "2020-06-01",
        key_findings: "Hormonal fluctuations in early morning hours affect multiple body systems beyond glucose regulation.",
        relevance_score: 70,
      },
    ],
  },
  {
    project_slug: "unexplained-shakiness",
    links: [
      {
        research_type: "study",
        title: "Pseudohypoglycemia: A Clinical Overview",
        authors: "McAulay V, Deary IJ, Frier BM",
        publication: "Diabetes Care",
        publication_date: "2019-09-01",
        key_findings: "Symptoms of hypoglycemia can occur at normal glucose levels due to rapid rate of fall or altered symptom thresholds.",
        relevance_score: 90,
      },
    ],
  },
  {
    project_slug: "gastroparesis-management",
    links: [
      {
        research_type: "clinical_trial",
        title: "Gastric Electrical Stimulation for Gastroparesis",
        authors: "Abell T, McCallum R, et al.",
        publication: "Neurogastroenterology & Motility",
        publication_date: "2022-01-15",
        key_findings: "Gastric electrical stimulation shows promise for refractory diabetic gastroparesis, with 70% symptom improvement.",
        relevance_score: 75,
      },
      {
        research_type: "meta_analysis",
        title: "Prokinetic Agents in Diabetic Gastroparesis",
        authors: "Camilleri M, Parkman HP",
        publication: "American Journal of Gastroenterology",
        publication_date: "2021-11-01",
        key_findings: "Meta-analysis of prokinetic treatments shows moderate efficacy with metoclopramide and erythromycin as first-line options.",
        relevance_score: 80,
      },
    ],
  },
];

const communitySolutionsData = [
  {
    project_slug: "morning-nausea",
    solutions: [
      {
        solution_title: "Small Protein Snack Before Bed",
        solution_description: "Having a small protein-rich snack (cheese, nuts, or peanut butter) about 30 minutes before bed helps stabilize overnight glucose and reduces morning nausea for many people.",
        source: "Reddit r/diabetes_t1",
        upvotes: 156,
        effectiveness_rating: 4.2,
      },
      {
        solution_title: "Ginger Tea First Thing",
        solution_description: "Drinking ginger tea or taking ginger capsules first thing in the morning, before eating anything else, can significantly reduce nausea symptoms.",
        source: "Reddit r/diabetes",
        upvotes: 89,
        effectiveness_rating: 3.8,
      },
    ],
  },
  {
    project_slug: "unexplained-shakiness",
    solutions: [
      {
        solution_title: "Magnesium Supplementation",
        solution_description: "Many diabetics are magnesium deficient. Supplementing with magnesium glycinate (300-400mg daily) has helped reduce unexplained shakiness and tremors.",
        source: "Reddit r/diabetes_t1",
        upvotes: 234,
        effectiveness_rating: 4.1,
      },
      {
        solution_title: "Reduce Rate of Glucose Change",
        solution_description: "Using CGM to identify and prevent rapid glucose drops (even within range) can reduce shakiness symptoms. Focus on stable glucose rather than just in-range.",
        source: "Community Forum",
        upvotes: 178,
        effectiveness_rating: 4.4,
      },
    ],
  },
  {
    project_slug: "gastroparesis-management",
    solutions: [
      {
        solution_title: "Extended Bolus Strategy",
        solution_description: "Using extended or combo boluses (60% upfront, 40% over 2-3 hours) better matches delayed food absorption and prevents post-meal spikes and later lows.",
        source: "Reddit r/diabetes_t1",
        upvotes: 312,
        effectiveness_rating: 4.5,
      },
      {
        solution_title: "Walking After Meals",
        solution_description: "A 10-15 minute gentle walk after meals helps stimulate gastric motility and improves digestion timing. Works better than lying down.",
        source: "Reddit r/diabetes",
        upvotes: 198,
        effectiveness_rating: 4.0,
      },
    ],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert health projects
    const { data: insertedProjects, error: projectsError } = await supabaseClient
      .from("diabetic_health_projects")
      .upsert(healthProjects, { onConflict: "slug" })
      .select();

    if (projectsError) {
      throw new Error(`Failed to insert projects: ${projectsError.message}`);
    }

    // Create a map of slug to id
    const slugToId = new Map(insertedProjects?.map(p => [p.slug, p.id]) || []);

    // Insert research links
    for (const projectLinks of researchLinksData) {
      const projectId = slugToId.get(projectLinks.project_slug);
      if (projectId) {
        const linksWithProjectId = projectLinks.links.map(link => ({
          ...link,
          project_id: projectId,
        }));
        
        await supabaseClient
          .from("project_research_links")
          .upsert(linksWithProjectId, { 
            onConflict: "id",
            ignoreDuplicates: false 
          });
      }
    }

    // Insert community solutions
    for (const projectSolutions of communitySolutionsData) {
      const projectId = slugToId.get(projectSolutions.project_slug);
      if (projectId) {
        const solutionsWithProjectId = projectSolutions.solutions.map(solution => ({
          ...solution,
          project_id: projectId,
        }));
        
        await supabaseClient
          .from("project_community_solutions")
          .upsert(solutionsWithProjectId, { 
            onConflict: "id",
            ignoreDuplicates: false 
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedProjects?.length || 0} health projects with research links and community solutions`,
        projects: insertedProjects?.map(p => p.title),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error seeding health projects:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
