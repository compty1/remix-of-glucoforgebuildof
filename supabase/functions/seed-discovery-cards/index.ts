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
    console.log('🌱 Seeding discovery cards for homepage...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const discoveryCards = [
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
