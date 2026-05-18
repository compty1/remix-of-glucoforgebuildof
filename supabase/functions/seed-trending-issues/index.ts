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

    // Dynamically fetch device IDs by name
    const { data: devices, error: devicesError } = await supabase
      .from("devices")
      .select("id, name");

    if (devicesError) {
      console.error("Error fetching devices:", devicesError);
      throw devicesError;
    }

    // Create lookup map by device name (case-insensitive partial match)
    const getDeviceId = (searchName: string): string | null => {
      const device = devices?.find(d => 
        d.name.toLowerCase().includes(searchName.toLowerCase())
      );
      return device?.id || null;
    };

    const deviceIds = {
      dexcomG7: getDeviceId("Dexcom G7"),
      libre3: getDeviceId("Libre 3"),
      omnipod5: getDeviceId("Omnipod 5"),
      tslimX2: getDeviceId("t:slim X2"),
      medtronic780G: getDeviceId("780G"),
      dexcomG6: getDeviceId("Dexcom G6"),
      tandemMobi: getDeviceId("Mobi"),
      ilet: getDeviceId("iLet"),
    };

    console.log("Resolved device IDs:", deviceIds);

    // Delete existing data first to allow re-seeding
    const { error: deleteError } = await supabase
      .from("trending_device_issues")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Error deleting existing data:", deleteError);
    }

    const trendingIssues = [
      // Dexcom G7 Issues
      {
        device_id: deviceIds.dexcomG7,
        issue_title: "Signal Loss During Sleep",
        issue_description: "G7 sensor loses connection with phone/receiver during sleep, causing gaps in glucose data. Commonly occurs when phone is across room or when sleeping on sensor side.",
        affected_users_estimate: 12500,
        first_reported: "2023-06-15",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "dexcom_forums", "facebook_groups"],
      },
      {
        device_id: deviceIds.dexcomG7,
        issue_title: "Compression Lows - False Low Readings",
        issue_description: "Sensor reports falsely low glucose readings when pressure is applied to sensor site (e.g., sleeping on arm). Can trigger unnecessary alarms and insulin corrections.",
        affected_users_estimate: 18000,
        first_reported: "2023-04-20",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "medical_forums", "dexcom_support"],
      },
      {
        device_id: deviceIds.dexcomG7,
        issue_title: "Sensor Failure Within First 24 Hours",
        issue_description: "New G7 sensors fail to calibrate or stop working within the first day of application. Dexcom typically replaces these under warranty.",
        affected_users_estimate: 8200,
        first_reported: "2023-03-10",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "dexcom_support"],
      },
      {
        device_id: deviceIds.dexcomG7,
        issue_title: "Bluetooth Pairing Issues After Phone Update",
        issue_description: "G7 loses Bluetooth connection after iOS/Android updates and refuses to reconnect. Requires app reinstallation or sensor replacement in some cases.",
        affected_users_estimate: 6800,
        first_reported: "2023-08-01",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "apple_forums", "android_forums"],
      },
      // Freestyle Libre 3 Issues
      {
        device_id: deviceIds.libre3,
        issue_title: "Reader Connection Failures",
        issue_description: "Libre 3 sensor fails to connect with dedicated reader device. Phone app works but reader shows 'Sensor Not Found' error repeatedly.",
        affected_users_estimate: 9500,
        first_reported: "2023-05-22",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "abbott_support", "diabetes_forums"],
      },
      {
        device_id: deviceIds.libre3,
        issue_title: "Warm-Up Period Reading Inaccuracies",
        issue_description: "First 24 hours after sensor insertion shows significant variance from actual blood glucose. Many users report readings being 20-40 mg/dL off during this period.",
        affected_users_estimate: 14200,
        first_reported: "2023-02-15",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "medical_studies", "user_reports"],
      },
      {
        device_id: deviceIds.libre3,
        issue_title: "Adhesive Failure in Hot Weather",
        issue_description: "Sensor adhesive weakens significantly in temperatures above 85°F or during exercise, causing sensor to fall off before 14-day wear period.",
        affected_users_estimate: 11000,
        first_reported: "2023-06-01",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "facebook_groups"],
      },
      // Omnipod 5 Issues
      {
        device_id: deviceIds.omnipod5,
        issue_title: "Pod Screaming/Alarm After Deactivation",
        issue_description: "Deactivated pods continue to emit high-pitched alarm sound. Requires physical destruction of pod or waiting 8+ hours for battery to die.",
        affected_users_estimate: 7800,
        first_reported: "2023-01-20",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "insulet_support", "tudiabetes"],
      },
      {
        device_id: deviceIds.omnipod5,
        issue_title: "Automated Mode Exits Due to CGM Loss",
        issue_description: "Omnipod 5 frequently exits automated mode when Dexcom CGM signal is temporarily lost, requiring manual intervention to restart automation.",
        affected_users_estimate: 15600,
        first_reported: "2023-03-05",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "insulet_forums", "diabetes_tech_community"],
      },
      {
        device_id: deviceIds.omnipod5,
        issue_title: "Cannula Occlusion Without Alarm",
        issue_description: "Pod cannula becomes blocked but no occlusion alarm is triggered, leading to unexplained high blood sugars until pod is manually changed.",
        affected_users_estimate: 5400,
        first_reported: "2023-04-12",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "endocrinology_forums"],
      },
      // Tandem t:slim X2 Issues
      {
        device_id: deviceIds.tslimX2,
        issue_title: "Control-IQ Aggressive Correction Boluses",
        issue_description: "Control-IQ algorithm delivers automatic correction boluses that some users find too aggressive, leading to stacking and hypoglycemia.",
        affected_users_estimate: 8900,
        first_reported: "2022-11-15",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "tandem_forums", "endocrinology_studies"],
      },
      {
        device_id: deviceIds.tslimX2,
        issue_title: "Touchscreen Unresponsive in Cold Weather",
        issue_description: "t:slim X2 touchscreen becomes sluggish or completely unresponsive in temperatures below 40°F, requiring body heat to warm device.",
        affected_users_estimate: 4200,
        first_reported: "2022-12-01",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "outdoor_diabetes_groups"],
      },
      {
        device_id: deviceIds.tslimX2,
        issue_title: "USB-C Charging Port Corrosion",
        issue_description: "Charging port develops corrosion over time, especially in humid environments, leading to intermittent or failed charging.",
        affected_users_estimate: 3800,
        first_reported: "2023-02-20",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "tandem_support"],
      },
      // Medtronic 780G Issues
      {
        device_id: deviceIds.medtronic780G,
        issue_title: "SmartGuard Exits Without Clear Reason",
        issue_description: "780G exits SmartGuard auto mode frequently without clear indication of cause, requiring manual BG calibration to restart.",
        affected_users_estimate: 11200,
        first_reported: "2023-01-10",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "medtronic_forums", "diabetes_daily"],
      },
      {
        device_id: deviceIds.medtronic780G,
        issue_title: "Guardian 4 Sensor Accuracy Issues",
        issue_description: "Guardian 4 sensors show significant variance from fingerstick readings, particularly during rapid glucose changes.",
        affected_users_estimate: 9800,
        first_reported: "2023-03-25",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "medical_forums", "user_studies"],
      },
      {
        device_id: deviceIds.medtronic780G,
        issue_title: "Reservoir Bubble Formation",
        issue_description: "Air bubbles form in reservoir during normal use, affecting insulin delivery accuracy and requiring frequent reservoir changes.",
        affected_users_estimate: 6500,
        first_reported: "2023-04-08",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "medtronic_support"],
      },
      // Dexcom G6 Issues
      {
        device_id: deviceIds.dexcomG6,
        issue_title: "Transmitter Battery Failure Before Expiry",
        issue_description: "G6 transmitters stop working before their 90-day warranty period, showing 'Transmitter Battery Low' warning prematurely.",
        affected_users_estimate: 7200,
        first_reported: "2022-08-15",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "dexcom_support"],
      },
      // Tandem Mobi Issues
      {
        device_id: deviceIds.tandemMobi,
        issue_title: "Bluetooth Range Limitations",
        issue_description: "Mobi pump loses connection with phone app when device is more than 10 feet away, more restrictive than advertised range.",
        affected_users_estimate: 3200,
        first_reported: "2024-02-01",
        last_reported: new Date().toISOString(),
        status: "active",
        sources: ["reddit", "tandem_community"],
      },
      // iLet Issues
      {
        device_id: deviceIds.ilet,
        issue_title: "Learning Algorithm Initial Period Challenges",
        issue_description: "iLet's self-learning algorithm can be overly aggressive during first 1-2 weeks while adapting to user's insulin needs.",
        affected_users_estimate: 2800,
        first_reported: "2024-01-15",
        last_reported: new Date().toISOString(),
        status: "investigating",
        sources: ["reddit", "beta_bionics_community"],
      },
    ];

    // Insert trending issues
    const { error: issuesError } = await supabase
      .from("trending_device_issues")
      .insert(trendingIssues);

    if (issuesError) {
      console.error("Error seeding trending issues:", issuesError);
      throw issuesError;
    }

    console.log(`Successfully seeded ${trendingIssues.length} trending device issues`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${trendingIssues.length} trending device issues`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-trending-issues:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
