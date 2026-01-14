import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌱 Seeding devices, metrics, and issues...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing data first
    await supabase.from('device_issues').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('device_metrics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('devices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const devices = [
      {
        name: "Dexcom G7",
        manufacturer: "Dexcom",
        model_number: "G7",
        category: "cgm",
        description: "Latest generation continuous glucose monitor with 60% smaller design, 30-minute warmup, and direct smartphone connection.",
        key_features: ["10.5-day wear", "30-min warmup", "No fingersticks", "12-hour grace period", "MARD 8.2%"],
        pros: ["Most accurate CGM", "Fast warmup", "Small size", "Excellent app"],
        cons: ["Expensive", "Adhesive issues for some", "Compression lows"],
        retail_price_usd: 349,
        website_url: "https://www.dexcom.com/g7"
      },
      {
        name: "Freestyle Libre 3",
        manufacturer: "Abbott",
        model_number: "Libre 3",
        category: "cgm",
        description: "World's smallest, thinnest glucose sensor with real-time readings every minute and smartphone connectivity.",
        key_features: ["14-day wear", "1-min readings", "No fingersticks", "70% smaller than Libre 2", "MARD 7.9%"],
        pros: ["Affordable", "Long wear time", "Tiny sensor", "Real-time alerts"],
        cons: ["No receiver option", "Less durable adhesive", "Accuracy lag"],
        retail_price_usd: 75,
        website_url: "https://www.freestyle.abbott/us-en/products/freestyle-libre-3.html"
      },
      {
        name: "Omnipod 5",
        manufacturer: "Insulet",
        category: "pump",
        model_number: "OP5",
        description: "First tubeless automated insulin delivery system that integrates with Dexcom G6/G7 for closed-loop control.",
        key_features: ["Tubeless design", "SmartAdjust algorithm", "3-day wear", "Dexcom integration", "Smartphone control"],
        pros: ["No tubing", "Automated delivery", "Waterproof", "Easy pod changes"],
        cons: ["Pod failures", "Limited customization", "Adhesive reactions"],
        retail_price_usd: 850,
        website_url: "https://www.omnipod.com/omnipod-5"
      },
      {
        name: "Tandem t:slim X2",
        manufacturer: "Tandem Diabetes Care",
        model_number: "t:slim X2",
        category: "pump",
        description: "Touchscreen insulin pump with Control-IQ technology for automated insulin delivery and smartphone integration.",
        key_features: ["Control-IQ algorithm", "Touchscreen", "Dexcom integration", "Updatable software", "300-unit reservoir"],
        pros: ["Excellent algorithm", "Modern interface", "Good customer support"],
        cons: ["Tubing required", "Charging needed", "Bulkier than pods"],
        retail_price_usd: 799,
        website_url: "https://www.tandemdiabetes.com/products/t-slim-x2-insulin-pump"
      },
      {
        name: "Medtronic 780G",
        manufacturer: "Medtronic",
        model_number: "780G",
        category: "pump",
        description: "Advanced hybrid closed-loop system with Guardian 4 sensor integration and auto-correction boluses.",
        key_features: ["SmartGuard technology", "Auto-correction", "Guardian 4 sensor", "Bluetooth connectivity", "CareLink app"],
        pros: ["Automatic corrections", "Long track record", "Good insurance coverage"],
        cons: ["Requires calibrations", "Larger infusion sets", "Complex setup"],
        retail_price_usd: 899,
        website_url: "https://www.medtronicdiabetes.com/products/minimed-780g-system"
      },
      {
        name: "Dexcom G6",
        manufacturer: "Dexcom",
        model_number: "G6",
        category: "cgm",
        description: "Previous generation CGM still widely used, with proven accuracy and broad pump integration.",
        key_features: ["10-day wear", "2-hour warmup", "No fingersticks", "Share feature", "MARD 9.0%"],
        pros: ["Proven reliability", "Wide compatibility", "Share feature"],
        cons: ["Larger than G7", "Longer warmup", "Being phased out"],
        retail_price_usd: 299,
        website_url: "https://www.dexcom.com/g6-cgm-system"
      }
    ];

    console.log(`✨ Inserting ${devices.length} devices...`);

    const { data: deviceData, error: deviceError } = await supabase
      .from('devices')
      .insert(devices)
      .select();

    if (deviceError) {
      console.error('❌ Error inserting devices:', deviceError);
      throw deviceError;
    }

    console.log(`✅ Inserted ${deviceData?.length || 0} devices`);

    // Create metrics for each device
    const metrics = (deviceData || []).map(device => ({
      device_id: device.id,
      reliability_score: device.category === 'cgm' 
        ? (device.name.includes('G7') ? 94 : device.name.includes('Libre') ? 91 : 89)
        : (device.name.includes('Omnipod') ? 88 : device.name.includes('Tandem') ? 92 : 87),
      social_setting_score: device.category === 'cgm'
        ? (device.name.includes('Libre') ? 95 : 92)
        : (device.name.includes('Omnipod') ? 96 : 82),
      total_reviews: Math.floor(Math.random() * 2000) + 500
    }));

    const { data: metricsData, error: metricsError } = await supabase
      .from('device_metrics')
      .insert(metrics)
      .select();

    if (metricsError) {
      console.error('❌ Error inserting metrics:', metricsError);
      throw metricsError;
    }

    console.log(`✅ Inserted ${metricsData?.length || 0} device metrics`);

    // Create common issues for devices
    const issues: Array<{
      device_id: string;
      issue_title: string;
      description: string;
      severity: string;
      frequency_percentage: number;
      community_reports: number;
      workaround: string;
      solution: string;
    }> = [];

    for (const device of deviceData || []) {
      if (device.name === "Dexcom G7") {
        issues.push(
          { device_id: device.id, issue_title: "Compression Lows", description: "False low readings when lying on sensor", severity: "medium", frequency_percentage: 15, community_reports: 487, workaround: "Rotate sensor placement, avoid sleeping on sensor side", solution: "Use alternative sensor sites on arm or abdomen" },
          { device_id: device.id, issue_title: "Adhesive Failure", description: "Sensor falls off before 10-day wear period", severity: "low", frequency_percentage: 8, community_reports: 234, workaround: "Use additional tape or overlay patches", solution: "Apply Skin-Tac or similar adhesive enhancer before insertion" }
        );
      } else if (device.name === "Freestyle Libre 3") {
        issues.push(
          { device_id: device.id, issue_title: "Signal Loss", description: "Bluetooth connection drops intermittently", severity: "medium", frequency_percentage: 12, community_reports: 356, workaround: "Keep phone within 20 feet, restart Bluetooth", solution: "Update LibreLink app and phone OS to latest versions" },
          { device_id: device.id, issue_title: "Inaccurate First Day", description: "Readings unreliable during first 24 hours", severity: "low", frequency_percentage: 20, community_reports: 567, workaround: "Compare with fingerstick readings first day", solution: "Start sensor in evening for accurate morning readings" }
        );
      } else if (device.name === "Omnipod 5") {
        issues.push(
          { device_id: device.id, issue_title: "Pod Failures", description: "Pod alarm/failure before 3-day wear complete", severity: "high", frequency_percentage: 5, community_reports: 412, workaround: "Keep spare pods available", solution: "Contact Insulet for replacement, check insertion technique" },
          { device_id: device.id, issue_title: "Skin Irritation", description: "Redness, itching, or rash under adhesive", severity: "medium", frequency_percentage: 18, community_reports: 312, workaround: "Use barrier wipes or sprays before application", solution: "Rotate sites frequently, try hypoallergenic barriers" }
        );
      } else if (device.name === "Tandem t:slim X2") {
        issues.push(
          { device_id: device.id, issue_title: "Occlusion Alarms", description: "Frequent blockage alerts requiring set change", severity: "medium", frequency_percentage: 10, community_reports: 278, workaround: "Prime thoroughly, check insertion angle", solution: "Use steel cannula sets or change sites more frequently" }
        );
      }
    }

    if (issues.length > 0) {
      const { data: issuesData, error: issuesError } = await supabase
        .from('device_issues')
        .insert(issues)
        .select();

      if (issuesError) {
        console.error('❌ Error inserting issues:', issuesError);
        throw issuesError;
      }

      console.log(`✅ Inserted ${issuesData?.length || 0} device issues`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        devices_created: deviceData?.length || 0,
        metrics_created: metricsData?.length || 0,
        issues_created: issues.length,
        categories: {
          cgm: devices.filter(d => d.category === 'cgm').length,
          pump: devices.filter(d => d.category === 'pump').length
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
