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

    console.log("Updating medication manufacturer logos...");

    // Medication to manufacturer logo mappings
    const medicationLogos: Record<string, string> = {
      // Eli Lilly products
      "Humalog": "https://logo.clearbit.com/lilly.com",
      "Humulin": "https://logo.clearbit.com/lilly.com",
      "Basaglar": "https://logo.clearbit.com/lilly.com",
      "Lyumjev": "https://logo.clearbit.com/lilly.com",
      "Trulicity": "https://logo.clearbit.com/lilly.com",
      "Mounjaro": "https://logo.clearbit.com/lilly.com",
      "Zepbound": "https://logo.clearbit.com/lilly.com",
      
      // Novo Nordisk products
      "Novolog": "https://logo.clearbit.com/novonordisk.com",
      "NovoLog": "https://logo.clearbit.com/novonordisk.com",
      "Fiasp": "https://logo.clearbit.com/novonordisk.com",
      "Tresiba": "https://logo.clearbit.com/novonordisk.com",
      "Levemir": "https://logo.clearbit.com/novonordisk.com",
      "Ozempic": "https://logo.clearbit.com/novonordisk.com",
      "Wegovy": "https://logo.clearbit.com/novonordisk.com",
      "Victoza": "https://logo.clearbit.com/novonordisk.com",
      "Rybelsus": "https://logo.clearbit.com/novonordisk.com",
      "NovoRapid": "https://logo.clearbit.com/novonordisk.com",
      "Saxenda": "https://logo.clearbit.com/novonordisk.com",
      
      // Sanofi products
      "Lantus": "https://logo.clearbit.com/sanofi.com",
      "Toujeo": "https://logo.clearbit.com/sanofi.com",
      "Apidra": "https://logo.clearbit.com/sanofi.com",
      "Admelog": "https://logo.clearbit.com/sanofi.com",
      "Soliqua": "https://logo.clearbit.com/sanofi.com",
      
      // AstraZeneca products
      "Farxiga": "https://logo.clearbit.com/astrazeneca.com",
      "Forxiga": "https://logo.clearbit.com/astrazeneca.com",
      "Bydureon": "https://logo.clearbit.com/astrazeneca.com",
      "Byetta": "https://logo.clearbit.com/astrazeneca.com",
      
      // Boehringer Ingelheim products
      "Jardiance": "https://logo.clearbit.com/boehringer-ingelheim.com",
      "Tradjenta": "https://logo.clearbit.com/boehringer-ingelheim.com",
      "Synjardy": "https://logo.clearbit.com/boehringer-ingelheim.com",
      "Glyxambi": "https://logo.clearbit.com/boehringer-ingelheim.com",
      
      // Merck products
      "Januvia": "https://logo.clearbit.com/merck.com",
      "Janumet": "https://logo.clearbit.com/merck.com",
      "Steglatro": "https://logo.clearbit.com/merck.com",
      
      // Takeda products
      "Nesina": "https://logo.clearbit.com/takeda.com",
      "Kazano": "https://logo.clearbit.com/takeda.com",
      
      // Bristol-Myers Squibb
      "Glucophage": "https://logo.clearbit.com/bms.com",
      
      // Xeris
      "Gvoke": "https://logo.clearbit.com/xerispharma.com",
      "Ogluo": "https://logo.clearbit.com/xerispharma.com",
      
      // Zealand Pharma / Novo (Zegalogue)
      "Zegalogue": "https://logo.clearbit.com/zealandpharma.com",
      
      // Amgen
      "Symlin": "https://logo.clearbit.com/amgen.com",
      
      // Generics - use generic medicine icon
      "Metformin": "https://logo.clearbit.com/teva.com",
      "Glipizide": "https://logo.clearbit.com/teva.com",
      "Glyburide": "https://logo.clearbit.com/teva.com",
      "Glimepiride": "https://logo.clearbit.com/teva.com",
    };

    let updatedCount = 0;
    const errors: string[] = [];

    for (const [medicationName, logoUrl] of Object.entries(medicationLogos)) {
      const { error, count } = await supabase
        .from("medications")
        .update({ logo_url: logoUrl })
        .ilike("name", `%${medicationName}%`);

      if (error) {
        errors.push(`${medicationName}: ${error.message}`);
      } else {
        updatedCount++;
      }
    }

    // Also update by manufacturer name
    const manufacturerLogos: Record<string, string> = {
      "Eli Lilly": "https://logo.clearbit.com/lilly.com",
      "Lilly": "https://logo.clearbit.com/lilly.com",
      "Novo Nordisk": "https://logo.clearbit.com/novonordisk.com",
      "Sanofi": "https://logo.clearbit.com/sanofi.com",
      "AstraZeneca": "https://logo.clearbit.com/astrazeneca.com",
      "Boehringer Ingelheim": "https://logo.clearbit.com/boehringer-ingelheim.com",
      "Merck": "https://logo.clearbit.com/merck.com",
      "Takeda": "https://logo.clearbit.com/takeda.com",
      "Xeris": "https://logo.clearbit.com/xerispharma.com",
      "Zealand": "https://logo.clearbit.com/zealandpharma.com",
    };

    for (const [manufacturer, logoUrl] of Object.entries(manufacturerLogos)) {
      await supabase
        .from("medications")
        .update({ logo_url: logoUrl })
        .ilike("manufacturer", `%${manufacturer}%`)
        .is("logo_url", null);
    }

    console.log(`Successfully updated ${updatedCount} medication logos`);
    if (errors.length > 0) {
      console.log("Some errors occurred:", errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} medication logos`,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-medication-logos:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
