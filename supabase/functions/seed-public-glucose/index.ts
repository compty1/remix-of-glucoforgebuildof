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

    // Check if we need to force reseed
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    // Check if data already exists with sufficient count
    const { count } = await supabase
      .from("public_glucose_data")
      .select("*", { count: "exact", head: true });

    if (!force && count && count > 120000) {
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
      // Delete in batches to avoid timeout
      let deleted = 0;
      while (true) {
        const { data: batch, error: selErr } = await supabase
          .from("public_glucose_data")
          .select("id")
          .limit(5000);
        if (selErr) throw selErr;
        if (!batch || batch.length === 0) break;
        const ids = batch.map((r: { id: string }) => r.id);
        const { error: delErr } = await supabase
          .from("public_glucose_data")
          .delete()
          .in("id", ids);
        if (delErr) throw delErr;
        deleted += ids.length;
        console.log(`Deleted ${deleted} records so far...`);
      }
      console.log(`Cleared ${deleted} existing records`);
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
      { name: 'iLet Bionic Pancreas', controlLevel: 0.82 },
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
    
    // 11 data sources including 3 new ones
    const datasets = [
      { name: 'OpenAPS', weight: 9 },
      { name: 'Nightscout', weight: 10 },
      { name: 'Tidepool', weight: 9 },
      { name: 'OpenHumans', weight: 7 },
      { name: 'T1D Exchange', weight: 10 },
      { name: 'Glooko', weight: 8 },
      { name: 'Clarity', weight: 9 },
      { name: 'LibreView', weight: 8 },
      { name: 'JAEB T1D Exchange', weight: 11 },
      { name: 'UK Biobank', weight: 10 },
      { name: 'TEDDY Study', weight: 9 },
    ];
    const totalWeight = datasets.reduce((s, d) => s + d.weight, 0);

    const targetTotal = 126000;
    const readingsPerUser = 42; // 7 days * 6 readings
    const totalUsers = Math.ceil(targetTotal / readingsPerUser); // ~3000 users

    console.log(`Generating ${targetTotal} records across ${totalUsers} users and ${datasets.length} sources`);

    // Distribute users across datasets proportionally
    const datasetUsers: Array<{ dataset: string; userCount: number }> = [];
    let assignedUsers = 0;
    for (let i = 0; i < datasets.length; i++) {
      const ds = datasets[i];
      const usersForDs = i === datasets.length - 1
        ? totalUsers - assignedUsers
        : Math.round((ds.weight / totalWeight) * totalUsers);
      datasetUsers.push({ dataset: ds.name, userCount: usersForDs });
      assignedUsers += usersForDs;
    }

    // Generate and insert in streaming batches to avoid memory issues
    const batchSize = 500;
    let batch: any[] = [];
    let insertedCount = 0;
    let globalUserIdx = 0;

    for (const { dataset, userCount } of datasetUsers) {
      for (let userIdx = 0; userIdx < userCount; userIdx++) {
        globalUserIdx++;
        const userId = `anon_user_${String(globalUserIdx).padStart(5, '0')}`;

        // Assign demographics
        const ageRange = ageRanges[Math.floor(Math.random() * ageRanges.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        
        // TEDDY study focuses on children
        const effectiveAge = dataset === 'TEDDY Study' ? '0-18' : ageRange;
        
        // UK Biobank skews older European
        const effectiveRegion = dataset === 'UK Biobank'
          ? (['Western Europe', 'Eastern Europe', 'Canada', 'Australia'])[Math.floor(Math.random() * 4)]
          : regions[Math.floor(Math.random() * regions.length)];

        const diabetesDuration = dataset === 'TEDDY Study'
          ? Math.floor(Math.random() * 10) + 1
          : Math.floor(Math.random() * 40) + 1;

        // Assign devices
        const pumpData = pumps[Math.floor(Math.random() * pumps.length)];
        const cgmData = cgms[Math.floor(Math.random() * cgms.length)];

        // Calculate control level
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

        // JAEB registry tends to have better-controlled patients
        if (dataset === 'JAEB T1D Exchange') {
          baseGlucose = Math.max(85, baseGlucose - 10);
        }

        const basalRate = 0.5 + Math.random() * 1.5;
        const correctionFactor = Math.floor(30 + Math.random() * 50);
        const carbRatio = Math.floor(5 + Math.random() * 15);

        // Generate readings over 7 days
        const baseDate = new Date('2024-01-01');
        baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 730)); // 2 years span

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const readingHours = [3, 7, 10, 13, 18, 22];

          for (const hour of readingHours) {
            const timestamp = new Date(baseDate);
            timestamp.setDate(timestamp.getDate() + dayOffset);
            timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

            let hourlyAdjust = 0;
            let carbs: number | null = null;
            let insulin: number | null = null;
            let notes: string | null = null;

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

            // Night
            if (hour === 3) {
              hourlyAdjust = -10 + Math.floor(Math.random() * 10);
              if (Math.random() < 0.08) notes = "Low alarm - treated";
            }

            // AID advantage
            if (pumpData.name !== 'MDI') {
              hourlyAdjust *= (1 - pumpData.controlLevel * 0.3);
            }

            const randomFactor = Math.floor(Math.random() * 35) - 17;
            const glucoseValue = Math.max(40, Math.min(400, Math.round(baseGlucose + hourlyAdjust + randomFactor)));

            if (glucoseValue < 70 && !notes) notes = "Low glucose";
            else if (glucoseValue < 55) notes = "Severe low - treated with fast-acting glucose";
            else if (glucoseValue > 250) notes = "High glucose";
            else if (glucoseValue > 300) notes = "Very high - correction given";

            batch.push({
              source_dataset: dataset,
              anonymized_user_id: userId,
              timestamp: timestamp.toISOString(),
              glucose_value: glucoseValue,
              insulin_dose: insulin,
              carbs: carbs,
              notes: notes,
              age_range: effectiveAge,
              gender: gender,
              location_region: effectiveRegion,
              pump_model: pumpData.name,
              cgm_model: cgmData.name,
              control_level: controlLevel,
              diabetes_duration_years: diabetesDuration,
              basal_rate: Math.round(basalRate * 10) / 10,
              correction_factor: correctionFactor,
              carb_ratio: carbRatio
            });

            // Flush batch when full
            if (batch.length >= batchSize) {
              const { error } = await supabase.from("public_glucose_data").insert(batch);
              if (error) {
                console.error(`Error inserting batch:`, error);
                throw error;
              }
              insertedCount += batch.length;
              batch = [];
              if (insertedCount % 5000 === 0) {
                console.log(`Inserted ${insertedCount} records...`);
              }
            }
          }
        }
      }
    }

    // Flush remaining
    if (batch.length > 0) {
      const { error } = await supabase.from("public_glucose_data").insert(batch);
      if (error) throw error;
      insertedCount += batch.length;
    }

    console.log(`Successfully seeded ${insertedCount} public glucose data records`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} glucose readings from ${totalUsers} anonymized users across ${datasets.length} data sources`,
        summary: {
          totalRecords: insertedCount,
          users: totalUsers,
          dataSources: datasets.length,
          datasetBreakdown: datasetUsers,
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
