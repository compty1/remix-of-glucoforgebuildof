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

    console.log("Updating device images with manufacturer logos...");

    // Device to manufacturer logo mappings
    const deviceImages: Record<string, string> = {
      // Dexcom devices
      "Dexcom G7": "https://logo.clearbit.com/dexcom.com",
      "Dexcom G6": "https://logo.clearbit.com/dexcom.com",
      "Dexcom ONE": "https://logo.clearbit.com/dexcom.com",
      "G7": "https://logo.clearbit.com/dexcom.com",
      "G6": "https://logo.clearbit.com/dexcom.com",
      
      // Abbott/FreeStyle devices
      "Freestyle Libre 3": "https://logo.clearbit.com/abbott.com",
      "Freestyle Libre 2": "https://logo.clearbit.com/abbott.com",
      "FreeStyle Libre": "https://logo.clearbit.com/abbott.com",
      "Libre 3": "https://logo.clearbit.com/abbott.com",
      "Libre 2": "https://logo.clearbit.com/abbott.com",
      
      // Insulet/Omnipod devices
      "Omnipod 5": "https://logo.clearbit.com/omnipod.com",
      "Omnipod DASH": "https://logo.clearbit.com/omnipod.com",
      "Omnipod": "https://logo.clearbit.com/omnipod.com",
      
      // Tandem devices
      "Tandem t:slim X2": "https://logo.clearbit.com/tandemdiabetes.com",
      "Tandem Mobi": "https://logo.clearbit.com/tandemdiabetes.com",
      "t:slim X2": "https://logo.clearbit.com/tandemdiabetes.com",
      "t:slim": "https://logo.clearbit.com/tandemdiabetes.com",
      "Mobi": "https://logo.clearbit.com/tandemdiabetes.com",
      
      // Medtronic devices
      "Medtronic 780G": "https://logo.clearbit.com/medtronic.com",
      "Medtronic 770G": "https://logo.clearbit.com/medtronic.com",
      "Medtronic 670G": "https://logo.clearbit.com/medtronic.com",
      "Guardian 4": "https://logo.clearbit.com/medtronic.com",
      "780G": "https://logo.clearbit.com/medtronic.com",
      "770G": "https://logo.clearbit.com/medtronic.com",
      
      // Beta Bionics
      "Beta Bionics iLet": "https://logo.clearbit.com/betabionics.com",
      "iLet Bionic Pancreas": "https://logo.clearbit.com/betabionics.com",
      "iLet": "https://logo.clearbit.com/betabionics.com",
      
      // Senseonics
      "Eversense E3": "https://logo.clearbit.com/senseonics.com",
      "Eversense": "https://logo.clearbit.com/senseonics.com",
      
      // Ypsomed
      "YpsoPump": "https://logo.clearbit.com/ypsomed.com",
      "mylife Loop": "https://logo.clearbit.com/ypsomed.com",
    };

    let updatedCount = 0;
    const errors: string[] = [];

    for (const [deviceName, imageUrl] of Object.entries(deviceImages)) {
      const { error, count } = await supabase
        .from("devices")
        .update({ image_url: imageUrl })
        .ilike("name", `%${deviceName}%`);

      if (error) {
        errors.push(`${deviceName}: ${error.message}`);
      } else {
        updatedCount++;
      }
    }

    // Also update by manufacturer name for any devices without images
    const manufacturerImages: Record<string, string> = {
      "Dexcom": "https://logo.clearbit.com/dexcom.com",
      "Abbott": "https://logo.clearbit.com/abbott.com",
      "Insulet": "https://logo.clearbit.com/omnipod.com",
      "Tandem": "https://logo.clearbit.com/tandemdiabetes.com",
      "Medtronic": "https://logo.clearbit.com/medtronic.com",
      "Beta Bionics": "https://logo.clearbit.com/betabionics.com",
      "Senseonics": "https://logo.clearbit.com/senseonics.com",
      "Ypsomed": "https://logo.clearbit.com/ypsomed.com",
      "Roche": "https://logo.clearbit.com/roche.com",
      "Ascensia": "https://logo.clearbit.com/ascensia.com",
    };

    for (const [manufacturer, imageUrl] of Object.entries(manufacturerImages)) {
      await supabase
        .from("devices")
        .update({ image_url: imageUrl })
        .ilike("manufacturer", `%${manufacturer}%`)
        .is("image_url", null);
    }

    console.log(`Successfully updated ${updatedCount} device images`);
    if (errors.length > 0) {
      console.log("Some errors occurred:", errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} device images`,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-device-images:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
