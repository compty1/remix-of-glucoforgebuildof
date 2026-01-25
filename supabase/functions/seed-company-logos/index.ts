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

    console.log("Updating T1D company logos...");

    // Company logo mappings using Clearbit Logo API and official URLs
    const companyLogos: Record<string, string> = {
      // Device Manufacturers
      "Dexcom": "https://logo.clearbit.com/dexcom.com",
      "Abbott": "https://logo.clearbit.com/abbott.com",
      "Medtronic": "https://logo.clearbit.com/medtronic.com",
      "Tandem Diabetes Care": "https://logo.clearbit.com/tandemdiabetes.com",
      "Insulet": "https://logo.clearbit.com/omnipod.com",
      "Insulet Corporation": "https://logo.clearbit.com/omnipod.com",
      "Beta Bionics": "https://logo.clearbit.com/betabionics.com",
      "Ypsomed": "https://logo.clearbit.com/ypsomed.com",
      "Roche": "https://logo.clearbit.com/roche.com",
      "Senseonics": "https://logo.clearbit.com/senseonics.com",
      "Ascensia": "https://logo.clearbit.com/ascensia.com",
      
      // Pharmaceutical Companies
      "Novo Nordisk": "https://logo.clearbit.com/novonordisk.com",
      "Eli Lilly": "https://logo.clearbit.com/lilly.com",
      "Sanofi": "https://logo.clearbit.com/sanofi.com",
      "Vertex Pharmaceuticals": "https://logo.clearbit.com/vrtx.com",
      "Provention Bio": "https://logo.clearbit.com/proventionbio.com",
      "Zealand Pharma": "https://logo.clearbit.com/zealandpharma.com",
      "Diamyd Medical": "https://logo.clearbit.com/diamyd.com",
      "Xeris": "https://logo.clearbit.com/xerispharma.com",
      "Xeris Biopharma": "https://logo.clearbit.com/xerispharma.com",
      "Biocon": "https://logo.clearbit.com/biocon.com",
      "Wockhardt": "https://logo.clearbit.com/wockhardt.com",
      "Gan & Lee": "https://logo.clearbit.com/ganlee.com",
      "Tonghua Dongbao": "https://logo.clearbit.com/dongbaotech.com",
      
      // Research & Biotech
      "CRISPR Therapeutics": "https://logo.clearbit.com/crisprtx.com",
      "ViaCyte": "https://logo.clearbit.com/viacyte.com",
      "Sigilon": "https://logo.clearbit.com/sigilon.com",
      "Sernova": "https://logo.clearbit.com/sernova.com",
      "Imcyse": "https://logo.clearbit.com/imcyse.com",
      "Precigen": "https://logo.clearbit.com/precigen.com",
      "Oramed": "https://logo.clearbit.com/oramed.com",
      "Encellin": "https://logo.clearbit.com/encellin.com",
      "Anelixis": "https://logo.clearbit.com/anelixis.com",
      
      // Technology & Digital Health
      "Tidepool": "https://logo.clearbit.com/tidepool.org",
      "Glooko": "https://logo.clearbit.com/glooko.com",
      "Livongo": "https://logo.clearbit.com/livongo.com",
      "One Drop": "https://logo.clearbit.com/onedrop.today",
      "MySugr": "https://logo.clearbit.com/mysugr.com",
      "Bigfoot Biomedical": "https://logo.clearbit.com/bigfootbiomedical.com",
      "Diabeloop": "https://logo.clearbit.com/diabeloop.com",
      "TypeZero": "https://logo.clearbit.com/typezero.com",
      "Know Labs": "https://logo.clearbit.com/knowlabs.co",
      "Glucowise": "https://logo.clearbit.com/glucowise.com",
      "Noom": "https://logo.clearbit.com/noom.com",
      "Virta Health": "https://logo.clearbit.com/virtahealth.com",
      "Omada Health": "https://logo.clearbit.com/omadahealth.com",
      "Teladoc": "https://logo.clearbit.com/teladoc.com",
      "DarioHealth": "https://logo.clearbit.com/dariohealth.com",
      "Companion Medical": "https://logo.clearbit.com/companionmedical.com",
      
      // Advocacy & Research Organizations
      "JDRF": "https://logo.clearbit.com/jdrf.org",
      "Breakthrough T1D": "https://logo.clearbit.com/breakthrought1d.org",
      "American Diabetes Association": "https://logo.clearbit.com/diabetes.org",
      "Diabetes UK": "https://logo.clearbit.com/diabetes.org.uk",
      "Beyond Type 1": "https://logo.clearbit.com/beyondtype1.org",
      "DiabetesMine": "https://logo.clearbit.com/diabetesmine.com",
      "diaTribe": "https://logo.clearbit.com/diatribe.org",
      "College Diabetes Network": "https://logo.clearbit.com/collegediabetesnetwork.org",
      "Children with Diabetes": "https://logo.clearbit.com/childrenwithdiabetes.com",
      "Diabetes Research Institute": "https://logo.clearbit.com/diabetesresearch.org",
      
      // Additional Companies
      "Insitro": "https://logo.clearbit.com/insitro.com",
      "Verily": "https://logo.clearbit.com/verily.com",
      "Onduo": "https://logo.clearbit.com/onduo.com",
      "CeQur": "https://logo.clearbit.com/cequr.com",
      "PharmaCyte": "https://logo.clearbit.com/pharmacyte.com",
      "Islet Sciences": "https://logo.clearbit.com/isletsciences.com",
    };

    let updatedCount = 0;
    const errors: string[] = [];

    for (const [companyName, logoUrl] of Object.entries(companyLogos)) {
      const { error } = await supabase
        .from("t1d_companies")
        .update({ logo_url: logoUrl })
        .ilike("name", `%${companyName}%`);

      if (error) {
        errors.push(`${companyName}: ${error.message}`);
      } else {
        updatedCount++;
      }
    }

    // Also try exact matches for companies not caught by ilike
    const exactMatches = [
      { name: "Dexcom, Inc.", logo: "https://logo.clearbit.com/dexcom.com" },
      { name: "Abbott Laboratories", logo: "https://logo.clearbit.com/abbott.com" },
      { name: "Eli Lilly and Company", logo: "https://logo.clearbit.com/lilly.com" },
    ];

    for (const match of exactMatches) {
      await supabase
        .from("t1d_companies")
        .update({ logo_url: match.logo })
        .eq("name", match.name);
    }

    console.log(`Successfully updated ${updatedCount} company logos`);
    if (errors.length > 0) {
      console.log("Some errors occurred:", errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} company logos`,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-company-logos:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
