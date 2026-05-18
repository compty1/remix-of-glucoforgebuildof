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
    console.log('🌱 Seeding discovery cards for homepage...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const discoveryCards = [
      // CURE BREAKTHROUGHS
      {
        title: "VX-880 Stem Cell Therapy Achieves 91% Insulin Independence",
        snippet: "Vertex Pharmaceuticals reports breakthrough results in Phase 1/2 trial. 11 of 12 participants no longer need insulin injections after receiving stem cell-derived islet cells.",
        icon_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Stem cell-derived pancreatic islet cells are transplanted to replace destroyed beta cells, restoring natural insulin production.",
        sources: JSON.stringify([
          { title: "ClinicalTrials.gov - VX-880 Study", url: "https://clinicaltrials.gov/study/NCT04786262" },
          { title: "Vertex Pharmaceuticals Press Release", url: "https://www.vrtx.com" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      {
        title: "CRISPR Gene Editing Protects Beta Cells from Immune Attack",
        snippet: "Preclinical success: gene-edited beta cells survive 6+ months in mice without immunosuppression while maintaining insulin production. Human trials planned 2026.",
        icon_url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "CRISPR-Cas9 removes HLA genes from beta cells, making them invisible to T-cells while preserving glucose-sensing and insulin-secreting functions.",
        sources: JSON.stringify([
          { title: "Cell Stem Cell", url: "https://www.cell.com/cell-stem-cell" },
          { title: "UCSF Diabetes Center", url: "https://diabetes.ucsf.edu/" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      {
        title: "Islet Encapsulation Technology Advances to Phase 2 Trials",
        snippet: "New biocompatible capsules protect transplanted islet cells from immune attack without systemic immunosuppression. Six-month data shows sustained insulin production.",
        icon_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Semi-permeable polymer capsules allow glucose and insulin to pass through while blocking immune cells, creating an immune-privileged microenvironment for transplanted beta cells.",
        sources: JSON.stringify([
          { title: "Nature Biotechnology", url: "https://www.nature.com/nbt/" },
          { title: "Sigilon Therapeutics", url: "https://www.sigilon.com" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      {
        title: "ViaCyte/CRISPR Therapeutics Partnership Shows Promising Results",
        snippet: "VCTX210 gene-edited cells demonstrate durable insulin production in 8 of 10 patients at 12 months. No immunosuppression required.",
        icon_url: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "CRISPR-edited stem cells are differentiated into insulin-producing cells that evade immune detection through genetic modifications.",
        sources: JSON.stringify([
          { title: "ViaCyte Clinical Data", url: "https://viacyte.com" },
          { title: "CRISPR Therapeutics Pipeline", url: "https://crisprtx.com" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      {
        title: "CAR-T Cell Therapy Shows Promise for Resetting Autoimmunity",
        snippet: "Early trials demonstrate that CAR-T cells targeting autoreactive T-cells can halt beta cell destruction. Three patients remain off insulin at 18 months.",
        icon_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Chimeric antigen receptor T-cells are engineered to selectively eliminate the immune cells responsible for attacking pancreatic beta cells.",
        sources: JSON.stringify([
          { title: "Science Translational Medicine", url: "https://www.science.org/journal/stm" },
          { title: "University of Pennsylvania CAR-T Research", url: "https://www.pennmedicine.org" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      {
        title: "Regulatory T-Cell Therapy Preserves Beta Cell Function in Newly Diagnosed",
        snippet: "Infusion of expanded Tregs within 3 months of diagnosis maintains C-peptide levels and reduces insulin requirements by 40% at 2-year follow-up.",
        icon_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Expanded regulatory T-cells suppress the autoimmune attack, creating tolerance and protecting remaining beta cells from destruction.",
        sources: JSON.stringify([
          { title: "JAMA - Treg Therapy Trial", url: "https://jamanetwork.com/journals/jama" },
          { title: "NIH Clinical Trials Database", url: "https://clinicaltrials.gov" }
        ]),
        category: "cure_breakthrough",
        status: "active"
      },
      
      // MEDICATIONS
      {
        title: "FDA Approves Teplizumab: First Disease-Modifying T1D Therapy",
        snippet: "Tzield (teplizumab) delays clinical T1D onset by an average of 3 years in high-risk individuals. First approved treatment targeting the autoimmune process.",
        icon_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Anti-CD3 monoclonal antibody modulates T-cell response, reducing autoimmune destruction of pancreatic beta cells.",
        sources: JSON.stringify([
          { title: "FDA Approval Announcement", url: "https://www.fda.gov/news-events/press-announcements" },
          { title: "New England Journal of Medicine", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1902226" }
        ]),
        category: "medication",
        status: "active"
      },
      {
        title: "GLP-1 Agonists Show Unexpected Benefits in Type 1 Diabetes",
        snippet: "Real-world data from 5,000 T1D patients using adjunct GLP-1 therapy shows 0.5% A1C reduction, 8% weight loss, and 25% decrease in insulin requirements.",
        icon_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "GLP-1 receptor agonists slow gastric emptying, suppress glucagon, and may have direct protective effects on remaining beta cells.",
        sources: JSON.stringify([
          { title: "Diabetes Care Meta-Analysis", url: "https://diabetesjournals.org/care" },
          { title: "T1D Exchange Registry Data", url: "https://t1dexchange.org" }
        ]),
        category: "medication",
        status: "active"
      },
      {
        title: "Glucose Responsive Insulin Development Enters Phase 3",
        snippet: "Smart insulin that activates only when glucose is high completes Phase 2 with zero severe hypoglycemia events. Phase 3 trials enrolling now.",
        icon_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Glucose-sensing molecules attached to insulin trigger release only when blood glucose exceeds threshold, mimicking healthy beta cell function.",
        sources: JSON.stringify([
          { title: "Thermalin Diabetes Pipeline", url: "https://www.thermalin.com" },
          { title: "Nature Chemical Biology", url: "https://www.nature.com/nchembio/" }
        ]),
        category: "medication",
        status: "active"
      },
      {
        title: "Low-Dose ATG/GCSF Combination Preserves Beta Cell Function",
        snippet: "Two-year follow-up shows patients treated with low-dose ATG and GCSF maintain 60% higher C-peptide levels compared to placebo.",
        icon_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Anti-thymocyte globulin depletes autoreactive T-cells while GCSF promotes regulatory T-cell expansion, creating lasting immune tolerance.",
        sources: JSON.stringify([
          { title: "The Lancet Diabetes & Endocrinology", url: "https://www.thelancet.com/journals/landia" },
          { title: "JDRF Research Summary", url: "https://www.jdrf.org/research" }
        ]),
        category: "medication",
        status: "active"
      },
      
      // DEVICES
      {
        title: "Dexcom G7 Shows Superior Accuracy in Head-to-Head Trial",
        snippet: "Real-world study of 500 patients shows G7 achieves 93.7% accuracy with MARD of 8.2%, outperforming competitors in variable glucose conditions.",
        icon_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Continuous glucose monitoring uses enzymatic sensors to measure interstitial glucose every 5 minutes.",
        sources: JSON.stringify([
          { title: "Diabetes Technology & Therapeutics", url: "https://www.liebertpub.com/journal/dia" },
          { title: "Dexcom Clinical Studies", url: "https://www.dexcom.com/clinical-studies" }
        ]),
        category: "device",
        status: "active"
      },
      {
        title: "Hybrid Closed-Loop Systems Reduce HbA1c by 1.2% on Average",
        snippet: "Meta-analysis of 15 trials shows automated insulin delivery systems significantly improve glycemic control while reducing hypoglycemia events by 40%.",
        icon_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Algorithm-controlled insulin pumps adjust basal rates and deliver correction boluses based on real-time CGM data.",
        sources: JSON.stringify([
          { title: "Diabetes Care", url: "https://diabetesjournals.org/care" },
          { title: "Cochrane Database of Systematic Reviews", url: "https://www.cochranelibrary.com/" }
        ]),
        category: "device",
        status: "active"
      },
      {
        title: "Omnipod 5 Real-World Data Shows 74% Time in Range Achievement",
        snippet: "12-month outcomes from 25,000 users demonstrate average TIR of 74% with only 1.8% time below 70 mg/dL. Strongest results in consistent users.",
        icon_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Tubeless patch pump with integrated CGM uses SmartAdjust algorithm to automate basal delivery and predict glucose trends.",
        sources: JSON.stringify([
          { title: "Insulet Corporate Data", url: "https://investor.insulet.com" },
          { title: "ATTD Conference Presentation", url: "https://attd.kenes.com" }
        ]),
        category: "device",
        status: "active"
      },
      {
        title: "Implantable CGMs: Eversense E3 Shows 6-Month Wear Without Replacement",
        snippet: "Extended-wear implantable sensor maintains MARD below 9% through full 180-day wear period with zero sensor failures in pivotal trial.",
        icon_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "Fluorescence-based sensor implanted subcutaneously measures glucose through chemical reaction, transmitting data to external transmitter.",
        sources: JSON.stringify([
          { title: "Senseonics PROMISE Trial", url: "https://www.senseonics.com" },
          { title: "FDA Approval Documentation", url: "https://www.fda.gov/medical-devices" }
        ]),
        category: "device",
        status: "active"
      },
      {
        title: "Tandem Mobi Launch: Smallest Pump with Full Control-IQ Features",
        snippet: "Early adopter reports show 50% prefer Mobi over t:slim X2 for discreetness while maintaining equivalent glycemic outcomes in first 3 months.",
        icon_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Compact tubeless design with Bluetooth connectivity delivers same Control-IQ algorithm as larger t:slim X2 pump.",
        sources: JSON.stringify([
          { title: "Tandem Diabetes Care", url: "https://www.tandemdiabetes.com" },
          { title: "DiabetesMine Product Review", url: "https://www.healthline.com/diabetesmine" }
        ]),
        category: "device",
        status: "active"
      },
      
      // RESEARCH
      {
        title: "Gut Microbiome Changes Predict T1D 2 Years Before Onset",
        snippet: "Longitudinal study identifies specific bacterial patterns that appear up to 24 months before autoantibody development, opening new prevention strategies.",
        icon_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Alterations in gut bacteria may trigger or accelerate the autoimmune cascade leading to beta cell destruction.",
        sources: JSON.stringify([
          { title: "Nature Medicine", url: "https://www.nature.com/nm/" },
          { title: "TEDDY Study Results", url: "https://teddy.epi.usf.edu/" }
        ]),
        category: "research",
        status: "active"
      },
      {
        title: "Vitamin D Supplementation Linked to Reduced T1D Risk in Children",
        snippet: "Meta-analysis of 8 studies shows children with adequate vitamin D levels have 30% lower risk of developing T1D. Optimal levels identified as 40-60 ng/mL.",
        icon_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Vitamin D modulates immune function and may protect beta cells from autoimmune destruction through immunoregulatory effects.",
        sources: JSON.stringify([
          { title: "Diabetes Care Systematic Review", url: "https://diabetesjournals.org/care" },
          { title: "Journal of Clinical Endocrinology", url: "https://academic.oup.com/jcem" }
        ]),
        category: "research",
        status: "active"
      },
      {
        title: "Time in Range vs A1C: New Research Validates TIR as Primary Outcome",
        snippet: "Landmark study confirms 70%+ TIR correlates with A1C below 7% and significantly reduced complication risk. TIR now endorsed as clinical endpoint.",
        icon_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop",
        credibility: "High",
        mechanism: "CGM-derived time in range (70-180 mg/dL) captures glucose variability missed by A1C, providing more actionable glycemic insights.",
        sources: JSON.stringify([
          { title: "Diabetes Care Consensus Report", url: "https://diabetesjournals.org/care" },
          { title: "International Consensus on TIR", url: "https://www.liebertpub.com/journal/dia" }
        ]),
        category: "research",
        status: "active"
      },
      {
        title: "Microbiome Interventions for T1D Prevention Enter Clinical Trials",
        snippet: "Probiotic cocktail designed to restore gut barrier function shows promise in at-risk children, with Phase 2 trial enrolling 500 participants.",
        icon_url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Targeted probiotics may reduce intestinal permeability and modulate immune responses to prevent autoimmune beta cell destruction.",
        sources: JSON.stringify([
          { title: "Gut Microbiome Research Institute", url: "https://gut.bmj.com" },
          { title: "ClinicalTrials.gov", url: "https://clinicaltrials.gov" }
        ]),
        category: "research",
        status: "active"
      },
      
      // TECHNOLOGY
      {
        title: "AI Predicts T1D Complications 5 Years Ahead with 89% Accuracy",
        snippet: "Machine learning model analyzing CGM patterns, labs, and genetics identifies patients at high risk for retinopathy, nephropathy, and neuropathy.",
        icon_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Deep learning algorithms identify subtle patterns in glucose variability and metabolic markers that precede clinical complications.",
        sources: JSON.stringify([
          { title: "JAMA Network Open", url: "https://jamanetwork.com/journals/jamanetworkopen" },
          { title: "Diabetes AI Research Consortium", url: "https://diabetesai.org" }
        ]),
        category: "technology",
        status: "active"
      },
      {
        title: "Machine Learning Predicts Meal Impact on Glucose with 85% Accuracy",
        snippet: "AI-powered app learns individual meal responses and predicts post-prandial glucose curves, enabling optimized bolus timing and dosing.",
        icon_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Neural networks analyze historical CGM, meal, and activity data to predict personalized glycemic responses to foods.",
        sources: JSON.stringify([
          { title: "Nature Medicine - Personalized Nutrition", url: "https://www.nature.com/nm/" },
          { title: "Cell - Personalized Glucose Prediction", url: "https://www.cell.com" }
        ]),
        category: "technology",
        status: "active"
      },
      {
        title: "Artificial Pancreas Algorithm Comparisons: OpenAPS vs Commercial Systems",
        snippet: "Head-to-head analysis shows DIY systems achieve comparable TIR to commercial options, with some users reporting superior customization benefits.",
        icon_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Open-source algorithms allow user customization of insulin delivery parameters, enabling fine-tuned control for individual physiology.",
        sources: JSON.stringify([
          { title: "OpenAPS Outcomes Data", url: "https://openaps.org/outcomes" },
          { title: "Loop Community Reports", url: "https://loopkit.github.io/loopdocs/" }
        ]),
        category: "technology",
        status: "active"
      },
      
      // COMMUNITY
      {
        title: "Community Pattern: 487 Reports of 'Compression Lows' Validated",
        snippet: "Community reports of false low readings when lying on CGM sensors now correlated with 23 FDA MAUDE reports citing pressure sensitivity issues.",
        icon_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Physical pressure on sensor site compresses interstitial fluid, causing artificially low glucose readings not reflecting blood glucose.",
        sources: JSON.stringify([
          { title: "FDA MAUDE Database", url: "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm" },
          { title: "Reddit r/diabetes_t1d", url: "https://reddit.com/r/diabetes_t1d" }
        ]),
        category: "community",
        status: "active"
      },
      {
        title: "T1D Community Discovers Exercise Timing Impact on Glucose",
        snippet: "Analysis of 2,000+ community reports reveals morning exercise causes more hypoglycemia while evening workouts trigger delayed hyperglycemia patterns.",
        icon_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Circadian variations in insulin sensitivity and counter-regulatory hormones affect glucose response to exercise differently throughout the day.",
        sources: JSON.stringify([
          { title: "r/diabetes Community Analysis", url: "https://reddit.com/r/diabetes" },
          { title: "Beyond Type 1 Survey", url: "https://beyondtype1.org" }
        ]),
        category: "community",
        status: "active"
      },
      {
        title: "DIY Closed Loop vs Commercial: User Satisfaction Reports",
        snippet: "Survey of 1,500 AID users shows 78% of DIY users report 'very satisfied' vs 62% of commercial system users. Customization cited as key differentiator.",
        icon_url: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "DIY systems allow adjustment of safety limits, insulin activity curves, and algorithm aggressiveness that commercial systems restrict.",
        sources: JSON.stringify([
          { title: "Looped Facebook Group Survey", url: "https://www.facebook.com/groups/TheLoopedGroup" },
          { title: "T1D Exchange Community Data", url: "https://t1dexchange.org" }
        ]),
        category: "community",
        status: "active"
      },
      {
        title: "Community Reports: Afrezza Usage Patterns and Real-World Outcomes",
        snippet: "Compiled experiences from 300+ Afrezza users show best results when combined with long-acting insulin and CGM, with 65% reporting improved post-meal control.",
        icon_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100&h=100&fit=crop",
        credibility: "Medium",
        mechanism: "Inhaled insulin reaches bloodstream within 12-15 minutes, mimicking first-phase insulin response for faster post-meal glucose control.",
        sources: JSON.stringify([
          { title: "Afrezza Users Facebook Group", url: "https://www.facebook.com/groups/AfrezzaUsers" },
          { title: "r/diabetes Afrezza Threads", url: "https://reddit.com/r/diabetes" }
        ]),
        category: "community",
        status: "active"
      }
    ];

    console.log(`✨ Inserting ${discoveryCards.length} discovery cards...`);

    // Clear existing cards first
    await supabase.from('discovery_cards').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
      .from('discovery_cards')
      .insert(discoveryCards)
      .select();

    if (error) {
      console.error('❌ Error inserting discovery cards:', error);
      throw error;
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} discovery cards`);

    return new Response(
      JSON.stringify({
        success: true,
        cards_created: data?.length || 0,
        categories: {
          cure_breakthrough: discoveryCards.filter(c => c.category === 'cure_breakthrough').length,
          medication: discoveryCards.filter(c => c.category === 'medication').length,
          device: discoveryCards.filter(c => c.category === 'device').length,
          research: discoveryCards.filter(c => c.category === 'research').length,
          technology: discoveryCards.filter(c => c.category === 'technology').length,
          community: discoveryCards.filter(c => c.category === 'community').length
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
