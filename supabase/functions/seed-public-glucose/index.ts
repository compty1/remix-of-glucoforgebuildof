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

    // Generate realistic glucose readings matching actual schema:
    // id, source_dataset, anonymized_user_id, timestamp, glucose_value, insulin_dose, carbs, notes
    const glucoseData = [];
    const datasets = ["OpenAPS", "Nightscout", "Tidepool", "OpenHumans"];
    const userCount = 20; // Simulated anonymous users
    
    // Generate data for each user
    for (let userIdx = 0; userIdx < userCount; userIdx++) {
      const userId = `anon_user_${String(userIdx + 1).padStart(3, '0')}`;
      const dataset = datasets[Math.floor(Math.random() * datasets.length)];
      
      // Each user gets ~50 readings over 3 days
      const baseDate = new Date('2024-01-15');
      baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 30)); // Random start date
      
      // User's baseline glucose (varies by "control level")
      const controlLevel = Math.random();
      let baseGlucose = 120;
      if (controlLevel < 0.2) baseGlucose = 95;  // Excellent control
      else if (controlLevel < 0.4) baseGlucose = 110; // Good control
      else if (controlLevel < 0.6) baseGlucose = 130; // Average
      else if (controlLevel < 0.8) baseGlucose = 150; // Needs improvement
      else baseGlucose = 170; // Poor control
      
      for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
        // Readings throughout the day
        const readingHours = [0, 3, 6, 7, 8, 10, 12, 14, 17, 18, 20, 22];
        
        for (const hour of readingHours) {
          const timestamp = new Date(baseDate);
          timestamp.setDate(timestamp.getDate() + dayOffset);
          timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          
          // Hourly glucose patterns
          let hourlyAdjust = 0;
          let carbs = null;
          let insulin = null;
          let notes = null;
          
          // Dawn phenomenon (4-7 AM rise)
          if (hour >= 4 && hour <= 7) hourlyAdjust = 20;
          
          // Post-breakfast spike
          if (hour === 8 || hour === 10) {
            hourlyAdjust = 35 + Math.floor(Math.random() * 20);
          }
          if (hour === 8) { carbs = 30 + Math.floor(Math.random() * 30); insulin = 3 + Math.random() * 4; }
          
          // Post-lunch
          if (hour === 12 || hour === 14) {
            hourlyAdjust = 25 + Math.floor(Math.random() * 15);
          }
          if (hour === 12) { carbs = 40 + Math.floor(Math.random() * 25); insulin = 4 + Math.random() * 3; }
          
          // Post-dinner
          if (hour === 18 || hour === 20) {
            hourlyAdjust = 30 + Math.floor(Math.random() * 20);
          }
          if (hour === 18) { carbs = 50 + Math.floor(Math.random() * 30); insulin = 5 + Math.random() * 4; }
          
          // Night lows
          if (hour >= 0 && hour <= 3) {
            hourlyAdjust = -15;
            if (Math.random() < 0.1) notes = "Low alarm";
          }
          
          // Add randomness
          const randomFactor = Math.floor(Math.random() * 30) - 15;
          const glucoseValue = Math.max(45, Math.min(350, baseGlucose + hourlyAdjust + randomFactor));
          
          // Add notes for extreme values
          if (glucoseValue < 70 && !notes) notes = "Low glucose alert";
          else if (glucoseValue > 250) notes = "High glucose alert";
          
          glucoseData.push({
            source_dataset: dataset,
            anonymized_user_id: userId,
            timestamp: timestamp.toISOString(),
            glucose_value: glucoseValue,
            insulin_dose: insulin ? Math.round(insulin * 10) / 10 : null,
            carbs: carbs,
            notes: notes,
          });
        }
      }
    }

    // Shuffle the data to mix users
    glucoseData.sort(() => Math.random() - 0.5);

    // Insert in batches
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
        message: `Seeded ${insertedCount} public glucose readings from ${userCount} anonymized users across ${datasets.length} data sources`,
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
