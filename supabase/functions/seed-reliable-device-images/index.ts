import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Updating device images with reliable sources...");

    // Use DuckDuckGo icons API which is more reliable than Clearbit
    // Format: https://icons.duckduckgo.com/ip3/{domain}.ico
    const deviceImages: Record<string, string> = {
      // Dexcom devices - use official domain
      "Dexcom G7": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      "Dexcom G6": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      "Dexcom ONE": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      "G7": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      "G6": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      
      // Abbott/FreeStyle devices
      "Freestyle Libre 3": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      "Freestyle Libre 2": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      "FreeStyle Libre": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      "Libre 3": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      "Libre 2": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      
      // Insulet/Omnipod devices
      "Omnipod 5": "https://icons.duckduckgo.com/ip3/omnipod.com.ico",
      "Omnipod DASH": "https://icons.duckduckgo.com/ip3/omnipod.com.ico",
      "Omnipod": "https://icons.duckduckgo.com/ip3/omnipod.com.ico",
      
      // Tandem devices
      "Tandem t:slim X2": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      "Tandem Mobi": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      "t:slim X2": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      "t:slim": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      "Mobi": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      
      // Medtronic devices
      "Medtronic 780G": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "Medtronic 770G": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "Medtronic 670G": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "Guardian 4": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "780G": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "770G": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      
      // Beta Bionics
      "Beta Bionics iLet": "https://icons.duckduckgo.com/ip3/betabionics.com.ico",
      "iLet Bionic Pancreas": "https://icons.duckduckgo.com/ip3/betabionics.com.ico",
      "iLet": "https://icons.duckduckgo.com/ip3/betabionics.com.ico",
      
      // Senseonics
      "Eversense E3": "https://icons.duckduckgo.com/ip3/senseonics.com.ico",
      "Eversense": "https://icons.duckduckgo.com/ip3/senseonics.com.ico",
      
      // Ypsomed
      "YpsoPump": "https://icons.duckduckgo.com/ip3/ypsomed.com.ico",
      "mylife Loop": "https://icons.duckduckgo.com/ip3/ypsomed.com.ico",
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
      "Dexcom": "https://icons.duckduckgo.com/ip3/dexcom.com.ico",
      "Abbott": "https://icons.duckduckgo.com/ip3/abbott.com.ico",
      "Insulet": "https://icons.duckduckgo.com/ip3/omnipod.com.ico",
      "Tandem": "https://icons.duckduckgo.com/ip3/tandemdiabetes.com.ico",
      "Medtronic": "https://icons.duckduckgo.com/ip3/medtronic.com.ico",
      "Beta Bionics": "https://icons.duckduckgo.com/ip3/betabionics.com.ico",
      "Senseonics": "https://icons.duckduckgo.com/ip3/senseonics.com.ico",
      "Ypsomed": "https://icons.duckduckgo.com/ip3/ypsomed.com.ico",
      "Roche": "https://icons.duckduckgo.com/ip3/roche.com.ico",
      "Ascensia": "https://icons.duckduckgo.com/ip3/ascensia.com.ico",
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
        message: `Updated ${updatedCount} device images with reliable sources`,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-reliable-device-images:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
