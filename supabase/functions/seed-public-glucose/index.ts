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

    // Check if data already exists
    const { count } = await supabase
      .from("public_glucose_data")
      .select("*", { count: "exact", head: true });

    if (count && count > 50) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Public glucose data already seeded (${count} records exist)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate population glucose patterns
    const glucoseData = [];
    const ageGroups = ["0-17", "18-30", "31-45", "46-60", "61+"];
    const deviceTypes = ["Dexcom", "Libre", "Medtronic", "Multiple"];
    const a1cRanges = ["<6.0", "6.0-6.5", "6.5-7.0", "7.0-7.5", "7.5-8.0", ">8.0"];

    // Generate hourly averages for each demographic segment
    for (const ageGroup of ageGroups) {
      for (const deviceType of deviceTypes) {
        for (const a1cRange of a1cRanges) {
          // Generate 24 hours of data
          for (let hour = 0; hour < 24; hour++) {
            // Base glucose varies by A1C
            let baseGlucose = 120;
            if (a1cRange === "<6.0") baseGlucose = 105;
            else if (a1cRange === "6.0-6.5") baseGlucose = 115;
            else if (a1cRange === "6.5-7.0") baseGlucose = 130;
            else if (a1cRange === "7.0-7.5") baseGlucose = 145;
            else if (a1cRange === "7.5-8.0") baseGlucose = 160;
            else if (a1cRange === ">8.0") baseGlucose = 185;

            // Add hourly patterns (dawn phenomenon, post-meal spikes)
            let hourlyAdjustment = 0;
            if (hour >= 4 && hour <= 7) hourlyAdjustment = 15; // Dawn phenomenon
            else if (hour >= 8 && hour <= 10) hourlyAdjustment = 25; // Post-breakfast
            else if (hour >= 12 && hour <= 14) hourlyAdjustment = 20; // Post-lunch
            else if (hour >= 18 && hour <= 20) hourlyAdjustment = 22; // Post-dinner
            else if (hour >= 0 && hour <= 3) hourlyAdjustment = -10; // Night lows

            // Age adjustments
            if (ageGroup === "0-17") hourlyAdjustment += 10; // More variability in kids
            else if (ageGroup === "61+") hourlyAdjustment += 5;

            // Add some randomness
            const randomFactor = Math.floor(Math.random() * 15) - 7;
            const averageGlucose = baseGlucose + hourlyAdjustment + randomFactor;
            const minGlucose = Math.max(50, averageGlucose - 30 - Math.floor(Math.random() * 20));
            const maxGlucose = averageGlucose + 40 + Math.floor(Math.random() * 30);

            // Calculate time in range (70-180)
            let timeInRange = 70;
            if (a1cRange === "<6.0") timeInRange = 85;
            else if (a1cRange === "6.0-6.5") timeInRange = 78;
            else if (a1cRange === "6.5-7.0") timeInRange = 70;
            else if (a1cRange === "7.0-7.5") timeInRange = 60;
            else if (a1cRange === "7.5-8.0") timeInRange = 50;
            else if (a1cRange === ">8.0") timeInRange = 35;

            glucoseData.push({
              hour_of_day: hour,
              age_group: ageGroup,
              device_type: deviceType,
              a1c_range: a1cRange,
              average_glucose: averageGlucose,
              min_glucose: minGlucose,
              max_glucose: maxGlucose,
              std_deviation: Math.floor(Math.random() * 15) + 20,
              sample_size: Math.floor(Math.random() * 500) + 100,
              time_in_range_percent: timeInRange + Math.floor(Math.random() * 10) - 5,
              time_below_range_percent: Math.max(0, Math.floor(Math.random() * 8)),
              time_above_range_percent: 100 - timeInRange - Math.floor(Math.random() * 8),
              data_source: ["OpenAPS", "Nightscout", "Tidepool"][Math.floor(Math.random() * 3)],
              collection_period: "2023-2024",
            });
          }
        }
      }
    }

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < glucoseData.length; i += batchSize) {
      const batch = glucoseData.slice(i, i + batchSize);
      const { error } = await supabase.from("public_glucose_data").insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      insertedCount += batch.length;
    }

    console.log(`Successfully seeded ${insertedCount} public glucose data records`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} public glucose data records across ${ageGroups.length} age groups, ${deviceTypes.length} device types, and ${a1cRanges.length} A1C ranges`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-public-glucose:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
