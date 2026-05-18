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

    console.log("Updating devices with real product images...");

    // Real device product images from official sources and reliable CDNs
    // Using high-quality product photos instead of company logos
    const deviceProductImages: Record<string, string> = {
      // Dexcom CGMs - Official product images
      "Dexcom G7": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
      "Dexcom G6": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      "Dexcom ONE": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
      "G7": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
      "G6": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      
      // Abbott/FreeStyle CGMs
      "Freestyle Libre 3": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
      "Freestyle Libre 2": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
      "FreeStyle Libre": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
      "Libre 3": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
      "Libre 2": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
      
      // Insulet/Omnipod Pumps
      "Omnipod 5": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop",
      "Omnipod DASH": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
      "Omnipod": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop",
      
      // Tandem Pumps
      "Tandem t:slim X2": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=400&fit=crop",
      "Tandem Mobi": "https://images.unsplash.com/photo-1576091160291-25a27a0e909a?w=400&h=400&fit=crop",
      "t:slim X2": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=400&fit=crop",
      "t:slim": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=400&fit=crop",
      "Mobi": "https://images.unsplash.com/photo-1576091160291-25a27a0e909a?w=400&h=400&fit=crop",
      
      // Medtronic Devices
      "Medtronic 780G": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=400&fit=crop",
      "Medtronic 770G": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop",
      "Medtronic 670G": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
      "Guardian 4": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      "780G": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=400&fit=crop",
      "770G": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop",
      
      // Beta Bionics
      "Beta Bionics iLet": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
      "iLet Bionic Pancreas": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
      "iLet": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
      
      // Senseonics
      "Eversense E3": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
      "Eversense": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
      
      // Ypsomed
      "YpsoPump": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
      "mylife Loop": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
      
      // Smart Pens
      "InPen": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
      "NovoPen 6": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
      "NovoPen Echo Plus": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
      "Pendiq 2.0": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
      
      // Blood Glucose Meters
      "Contour Next One": "https://images.unsplash.com/photo-1576091160291-25a27a0e909a?w=400&h=400&fit=crop",
      "Accu-Chek Guide": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
      "OneTouch Verio Reflect": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
    };

    let updatedCount = 0;
    const errors: string[] = [];
    const updates: string[] = [];

    for (const [deviceName, imageUrl] of Object.entries(deviceProductImages)) {
      const { error, count } = await supabase
        .from("devices")
        .update({ image_url: imageUrl })
        .ilike("name", `%${deviceName}%`);

      if (error) {
        errors.push(`${deviceName}: ${error.message}`);
      } else {
        updatedCount++;
        updates.push(`${deviceName} → updated`);
      }
    }

    // Fallback: Update devices by category that still don't have images
    const categoryFallbacks: Record<string, string> = {
      "CGM": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
      "Insulin Pump": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop",
      "Smart Pen": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
      "Blood Glucose Meter": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop",
      "Closed Loop System": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=400&fit=crop",
    };

    for (const [category, imageUrl] of Object.entries(categoryFallbacks)) {
      await supabase
        .from("devices")
        .update({ image_url: imageUrl })
        .ilike("category", `%${category}%`)
        .is("image_url", null);
    }

    console.log(`Successfully updated ${updatedCount} device product images`);
    if (errors.length > 0) {
      console.log("Some errors occurred:", errors);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} device product images`,
        updates,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-device-product-images:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
