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

    // Device IDs
    const deviceIds = {
      dexcomG7: "3ec1da2b-c459-4ee6-8918-24b4d3480ad5",
      libre3: "bc58fdd1-592e-4dce-806e-0c3e93edfb9a",
      omnipod5: "1be67c6c-2256-4f5a-90eb-a2ea983285cf",
      tslimX2: "9577913e-9e01-431e-a8a4-f37795537764",
      medtronic780G: "2a3398c0-7c74-4738-a7b8-60f52243fa94",
      dexcomG6: "2546de8e-5763-4d22-8c23-8b495288d861",
      tandemMobi: "8907e384-7243-4536-8080-2f493887375e",
      ilet: "0257756d-d218-4eee-92c1-3c7e34ee0e94",
    };

    // Check if data already exists
    const { count } = await supabase
      .from("device_improvements")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Device improvements already seeded (${count} records exist)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const deviceImprovements = [
      // Dexcom G7 Improvements
      {
        device_id: deviceIds.dexcomG7,
        improvement_title: "Improved Signal Stability Algorithm",
        description: "Firmware update v1.6.2 includes improved Bluetooth signal recovery, reducing data gaps during temporary signal loss. Automatic reconnection is now faster and more reliable.",
        release_date: "2024-08-15",
        version: "1.6.2",
        source_url: "https://www.dexcom.com/support",
      },
      {
        device_id: deviceIds.dexcomG7,
        improvement_title: "Extended Apple Watch Compatibility",
        description: "G7 app now supports direct-to-watch display without requiring iPhone nearby for compatible Apple Watch models (Series 7+).",
        release_date: "2024-06-20",
        version: "2.1.0",
        source_url: "https://www.dexcom.com/apps",
      },
      {
        device_id: deviceIds.dexcomG7,
        improvement_title: "Customizable Low Glucose Prediction",
        description: "Users can now customize the prediction window for low glucose alerts from 10 to 30 minutes in advance.",
        release_date: "2024-09-01",
        version: "2.2.0",
        source_url: "https://www.dexcom.com/g7-features",
      },
      // Freestyle Libre 3 Improvements
      {
        device_id: deviceIds.libre3,
        improvement_title: "Reduced Warm-Up Time",
        description: "New sensor algorithm reduces effective warm-up period to 45 minutes with improved first-day accuracy metrics.",
        release_date: "2024-07-10",
        version: "3.2.0",
        source_url: "https://www.freestylelibre.us",
      },
      {
        device_id: deviceIds.libre3,
        improvement_title: "LibreView Integration Enhancement",
        description: "Improved data synchronization with LibreView platform including real-time sharing with healthcare providers.",
        release_date: "2024-05-25",
        version: "3.1.5",
        source_url: "https://www.libreview.com",
      },
      {
        device_id: deviceIds.libre3,
        improvement_title: "Enhanced Adhesive Formula",
        description: "New sensor adhesive formulation provides better skin adherence in hot and humid conditions while maintaining comfort.",
        release_date: "2024-08-01",
        version: "Sensor Gen 2",
        source_url: "https://www.abbott.com/newsroom",
      },
      // Omnipod 5 Improvements
      {
        device_id: deviceIds.omnipod5,
        improvement_title: "Improved Auto Mode Recovery",
        description: "Algorithm update allows faster re-entry into automated mode after CGM signal restoration. Reduces manual intervention requirements.",
        release_date: "2024-06-15",
        version: "5.4.0",
        source_url: "https://www.omnipod.com/5",
      },
      {
        device_id: deviceIds.omnipod5,
        improvement_title: "Android Phone Compatibility Expansion",
        description: "Omnipod 5 controller functionality now available on additional Android devices including Samsung Galaxy S24 series and Google Pixel 8.",
        release_date: "2024-09-10",
        version: "5.5.0",
        source_url: "https://www.omnipod.com/compatibility",
      },
      {
        device_id: deviceIds.omnipod5,
        improvement_title: "Nighttime Algorithm Optimization",
        description: "Enhanced algorithm settings for overnight glucose management with smoother basal adjustments during sleep hours.",
        release_date: "2024-07-20",
        version: "5.4.5",
        source_url: "https://www.omnipod.com/updates",
      },
      // Tandem t:slim X2 Improvements
      {
        device_id: deviceIds.tslimX2,
        improvement_title: "Control-IQ v7.6 Algorithm Update",
        description: "New algorithm version includes more conservative correction bolus calculations and improved sleep activity detection.",
        release_date: "2024-05-01",
        version: "7.6.0",
        source_url: "https://www.tandemdiabetes.com/products/software",
      },
      {
        device_id: deviceIds.tslimX2,
        improvement_title: "Extended Battery Life Mode",
        description: "New power-saving mode extends battery life by up to 20% while maintaining full pump functionality.",
        release_date: "2024-08-25",
        version: "7.7.0",
        source_url: "https://www.tandemdiabetes.com/updates",
      },
      {
        device_id: deviceIds.tslimX2,
        improvement_title: "Improved Cold Weather Touchscreen",
        description: "Firmware update improves touchscreen responsiveness in temperatures down to 32°F with enhanced digitizer sensitivity.",
        release_date: "2024-10-15",
        version: "7.7.2",
        source_url: "https://www.tandemdiabetes.com/support",
      },
      // Medtronic 780G Improvements
      {
        device_id: deviceIds.medtronic780G,
        improvement_title: "SmartGuard Auto Mode Stability",
        description: "Algorithm update reduces frequency of unexpected auto mode exits and improves sensor communication reliability.",
        release_date: "2024-06-30",
        version: "4.1.0",
        source_url: "https://www.medtronicdiabetes.com/780g",
      },
      {
        device_id: deviceIds.medtronic780G,
        improvement_title: "Guardian 4 Sensor Accuracy Enhancement",
        description: "Improved sensor algorithm provides more accurate readings during rapid glucose changes with reduced lag time.",
        release_date: "2024-09-05",
        version: "Sensor v2.1",
        source_url: "https://www.medtronicdiabetes.com/guardian",
      },
      {
        device_id: deviceIds.medtronic780G,
        improvement_title: "Simplified App Data Sharing",
        description: "New mobile app features streamlined data sharing with caregivers and healthcare team through Medtronic CareLink.",
        release_date: "2024-07-15",
        version: "App 3.0",
        source_url: "https://www.carelink.minimed.com",
      },
      // Dexcom G6 Improvements
      {
        device_id: deviceIds.dexcomG6,
        improvement_title: "Extended Transmitter Warranty",
        description: "Updated transmitter firmware provides more accurate battery level reporting and extended operational life.",
        release_date: "2024-04-01",
        version: "1.9.0",
        source_url: "https://www.dexcom.com/g6-support",
      },
      // Tandem Mobi Improvements
      {
        device_id: deviceIds.tandemMobi,
        improvement_title: "Extended Bluetooth Range",
        description: "Firmware update improves Bluetooth connection stability and extends reliable communication range to 20+ feet.",
        release_date: "2024-09-20",
        version: "1.2.0",
        source_url: "https://www.tandemdiabetes.com/mobi",
      },
      {
        device_id: deviceIds.tandemMobi,
        improvement_title: "Quick Bolus Button Enhancement",
        description: "Improved physical button responsiveness and added haptic feedback for quick bolus delivery confirmation.",
        release_date: "2024-10-01",
        version: "1.2.5",
        source_url: "https://www.tandemdiabetes.com/mobi-features",
      },
      // iLet Improvements
      {
        device_id: deviceIds.ilet,
        improvement_title: "Accelerated Learning Mode Option",
        description: "New user option for faster algorithm adaptation during initial setup period, reducing time to optimal automation.",
        release_date: "2024-08-10",
        version: "2.0.0",
        source_url: "https://www.betabionics.com/ilet",
      },
      {
        device_id: deviceIds.ilet,
        improvement_title: "Meal Announcement Simplification",
        description: "Simplified meal input with three-size meal announcement (usual, more, less) for easier user interaction.",
        release_date: "2024-07-01",
        version: "1.5.0",
        source_url: "https://www.betabionics.com/updates",
      },
    ];

    // Insert device improvements
    const { error: improvementsError } = await supabase
      .from("device_improvements")
      .insert(deviceImprovements);

    if (improvementsError) {
      console.error("Error seeding device improvements:", improvementsError);
      throw improvementsError;
    }

    console.log(`Successfully seeded ${deviceImprovements.length} device improvements`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${deviceImprovements.length} device improvements`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-device-improvements:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
