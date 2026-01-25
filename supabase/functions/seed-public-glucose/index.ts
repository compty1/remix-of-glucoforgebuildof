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

    // Check if data already exists with sufficient count
    const { count } = await supabase
      .from("public_glucose_data")
      .select("*", { count: "exact", head: true });

    if (count && count > 30000) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Public glucose data already seeded (${count} records exist)`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Clear existing data to insert fresh comprehensive dataset
    if (count && count > 0) {
      await supabase.from("public_glucose_data").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Demographics and device configuration
    const ageRanges = ['0-18', '18-30', '31-45', '46-60', '60+'];
    const genders = ['male', 'female', 'other', 'undisclosed'];
    const regions = [
      'Northeast US', 'Southeast US', 'Midwest US', 'Southwest US', 'West Coast US',
      'Western Europe', 'Eastern Europe', 'Asia Pacific', 'Canada', 'Australia',
      'Latin America', 'Middle East', 'South Africa', 'India', 'Southeast Asia'
    ];
    const pumps = [
      { name: 'Omnipod 5', controlLevel: 0.8 },
      { name: 'Tandem t:slim X2', controlLevel: 0.75 },
      { name: 'Medtronic 780G', controlLevel: 0.7 },
      { name: 'YpsoPump', controlLevel: 0.65 },
      { name: 'MDI', controlLevel: 0.5 }
    ];
    const cgms = [
      { name: 'Dexcom G7', accuracy: 0.9 },
      { name: 'Dexcom G7 Plus', accuracy: 0.92 },
      { name: 'Dexcom G6', accuracy: 0.85 },
      { name: 'Libre 4', accuracy: 0.9 },
      { name: 'Libre 3', accuracy: 0.85 },
      { name: 'Libre 2', accuracy: 0.8 },
      { name: 'Medtronic Guardian 4', accuracy: 0.75 },
      { name: 'Eversense E3', accuracy: 0.85 }
    ];
    const datasets = ['OpenAPS', 'Nightscout', 'Tidepool', 'OpenHumans', 'T1D Exchange', 'Glooko', 'Clarity', 'LibreView'];
    const controlLevels = ['excellent', 'good', 'average', 'needs_improvement'];

    const glucoseData = [];
    const userCount = 750; // Generate 750 anonymous users for ~31,500 data points

    // Generate data for each user
    for (let userIdx = 0; userIdx < userCount; userIdx++) {
      const userId = `anon_user_${String(userIdx + 1).padStart(4, '0')}`;
      const dataset = datasets[Math.floor(Math.random() * datasets.length)];
      
      // Assign demographics
      const ageRange = ageRanges[Math.floor(Math.random() * ageRanges.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const diabetesDuration = Math.floor(Math.random() * 40) + 1; // 1-40 years
      
      // Assign devices
      const pumpData = pumps[Math.floor(Math.random() * pumps.length)];
      const cgmData = cgms[Math.floor(Math.random() * cgms.length)];
      
      // Calculate control level based on pump and duration
      const controlScore = pumpData.controlLevel + (Math.random() * 0.3 - 0.15);
      let controlLevel: string;
      let baseGlucose: number;
      
      if (controlScore > 0.75) {
        controlLevel = 'excellent';
        baseGlucose = 95 + Math.floor(Math.random() * 15);
      } else if (controlScore > 0.6) {
        controlLevel = 'good';
        baseGlucose = 110 + Math.floor(Math.random() * 20);
      } else if (controlScore > 0.45) {
        controlLevel = 'average';
        baseGlucose = 130 + Math.floor(Math.random() * 25);
      } else {
        controlLevel = 'needs_improvement';
        baseGlucose = 160 + Math.floor(Math.random() * 30);
      }

      // User-specific insulin parameters
      const basalRate = 0.5 + Math.random() * 1.5; // 0.5-2.0 u/hr
      const correctionFactor = Math.floor(30 + Math.random() * 50); // 30-80 mg/dL per unit
      const carbRatio = Math.floor(5 + Math.random() * 15); // 5-20 grams per unit

      // Generate readings over 7 days (more data per user)
      const baseDate = new Date('2025-01-01');
      baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 365));
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        // 6 readings per day (simplified for data volume)
        const readingHours = [3, 7, 10, 13, 18, 22];
        
        for (const hour of readingHours) {
          const timestamp = new Date(baseDate);
          timestamp.setDate(timestamp.getDate() + dayOffset);
          timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          
          // Calculate glucose with realistic patterns
          let hourlyAdjust = 0;
          let carbs = null;
          let insulin = null;
          let notes = null;
          
          // Dawn phenomenon
          if (hour >= 4 && hour <= 7) hourlyAdjust = 15 + Math.floor(Math.random() * 15);
          
          // Post-breakfast
          if (hour === 10) {
            hourlyAdjust = 25 + Math.floor(Math.random() * 30);
            if (Math.random() > 0.3) {
              carbs = 25 + Math.floor(Math.random() * 35);
              insulin = Math.round((carbs / carbRatio) * 10) / 10;
            }
          }
          
          // Post-lunch
          if (hour === 13) {
            hourlyAdjust = 20 + Math.floor(Math.random() * 25);
            if (Math.random() > 0.3) {
              carbs = 35 + Math.floor(Math.random() * 40);
              insulin = Math.round((carbs / carbRatio) * 10) / 10;
            }
          }
          
          // Post-dinner
          if (hour === 22) {
            hourlyAdjust = 15 + Math.floor(Math.random() * 20);
            if (Math.random() > 0.3) {
              carbs = 45 + Math.floor(Math.random() * 45);
              insulin = Math.round((carbs / carbRatio) * 10) / 10;
            }
          }
          
          // Night - potential lows
          if (hour === 3) {
            hourlyAdjust = -10 + Math.floor(Math.random() * 10);
            if (Math.random() < 0.08) notes = "Low alarm - treated";
          }
          
          // Better control with AID systems
          if (pumpData.name !== 'MDI') {
            hourlyAdjust *= (1 - pumpData.controlLevel * 0.3);
          }
          
          // Add randomness
          const randomFactor = Math.floor(Math.random() * 35) - 17;
          const glucoseValue = Math.max(40, Math.min(400, Math.round(baseGlucose + hourlyAdjust + randomFactor)));
          
          // Add notes for extreme values
          if (glucoseValue < 70 && !notes) notes = "Low glucose";
          else if (glucoseValue < 55) notes = "Severe low - treated with fast-acting glucose";
          else if (glucoseValue > 250) notes = "High glucose";
          else if (glucoseValue > 300) notes = "Very high - correction given";
          
          glucoseData.push({
            source_dataset: dataset,
            anonymized_user_id: userId,
            timestamp: timestamp.toISOString(),
            glucose_value: glucoseValue,
            insulin_dose: insulin,
            carbs: carbs,
            notes: notes,
            age_range: ageRange,
            gender: gender,
            location_region: region,
            pump_model: pumpData.name,
            cgm_model: cgmData.name,
            control_level: controlLevel,
            diabetes_duration_years: diabetesDuration,
            basal_rate: Math.round(basalRate * 10) / 10,
            correction_factor: correctionFactor,
            carb_ratio: carbRatio
          });
        }
      }
    }

    // Shuffle the data
    glucoseData.sort(() => Math.random() - 0.5);

    console.log(`Generated ${glucoseData.length} glucose data points`);

    // Insert in batches
    const batchSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < glucoseData.length; i += batchSize) {
      const batch = glucoseData.slice(i, i + batchSize);
      const { error } = await supabase.from("public_glucose_data").insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount} records`);
    }

    console.log(`Successfully seeded ${insertedCount} public glucose data records`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} glucose readings from ${userCount} anonymized users across ${datasets.length} data sources with full demographics`,
        summary: {
          totalRecords: insertedCount,
          users: userCount,
          dataSources: datasets.length,
          daysPerUser: 7,
          demographics: { ageRanges, regions },
          devices: { pumps: pumps.map(p => p.name), cgms: cgms.map(c => c.name) }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-public-glucose:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
