import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createLogger, generateRequestId } from "../_shared/logging.ts";
import { handleHealthCheck } from "../_shared/health.ts";
import { withRetry } from "../_shared/health.ts";
import { processBatch } from "../_shared/batch.ts";

interface FDADeviceEvent {
  fda_event_id: string;
  event_type: string;
  device_name?: string;
  manufacturer_name?: string;
  event_date?: string;
  event_description?: string;
  severity_level?: string;
  source_url?: string;
  raw_data: any;
}

// FDA API endpoints
const FDA_ENDPOINTS = {
  recalls: 'https://api.fda.gov/device/enforcement.json',
  clearances: 'https://api.fda.gov/device/510k.json',
  pma: 'https://api.fda.gov/device/pma.json',
  adverse_events: 'https://api.fda.gov/device/event.json',
  drug_approvals: 'https://api.fda.gov/drug/drugsfda.json'
};

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  const reqId = generateRequestId();
  const log = createLogger('fda-data-feed', reqId);

  const healthResp = handleHealthCheck(req, 'fda-data-feed');
  if (healthResp) return healthResp;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    log.info('Starting FDA data feed fetch process');

    const allEvents: FDADeviceEvent[] = [];

    // Fetch device recalls
    try {
      console.log('Fetching FDA device recalls');
      const recallsResponse = await fetch(`${FDA_ENDPOINTS.recalls}?search=product_description:"diabetes"+OR+"glucose"+OR+"insulin"&limit=100`);
      
      if (recallsResponse.ok) {
        const recallsData = await recallsResponse.json();
        
        if (recallsData.results) {
          for (const recall of recallsData.results) {
            allEvents.push({
              fda_event_id: recall.recall_number || `recall_${Date.now()}_${Math.random()}`,
              event_type: 'recall',
              device_name: recall.product_description,
              manufacturer_name: recall.recalling_firm,
              event_date: recall.recall_initiation_date,
              event_description: recall.reason_for_recall,
              severity_level: recall.classification,
              source_url: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
              raw_data: recall
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching FDA recalls:', error);
    }

    // Fetch 510(k) clearances
    try {
      console.log('Fetching FDA 510(k) clearances');
      const clearancesResponse = await fetch(`${FDA_ENDPOINTS.clearances}?search=device_name:"diabetes"+OR+"glucose"+OR+"insulin"&limit=50`);
      
      if (clearancesResponse.ok) {
        const clearancesData = await clearancesResponse.json();
        
        if (clearancesData.results) {
          for (const clearance of clearancesData.results) {
            allEvents.push({
              fda_event_id: clearance.k_number || `clearance_${Date.now()}_${Math.random()}`,
              event_type: '510k_clearance',
              device_name: clearance.device_name,
              manufacturer_name: clearance.applicant,
              event_date: clearance.date_received,
              event_description: clearance.statement_or_summary,
              source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm?ID=${clearance.k_number}`,
              raw_data: clearance
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching FDA 510(k) clearances:', error);
    }

    // Fetch PMA approvals
    try {
      console.log('Fetching FDA PMA approvals');
      const pmaResponse = await fetch(`${FDA_ENDPOINTS.pma}?search=device_name:"diabetes"+OR+"glucose"+OR+"insulin"&limit=50`);
      
      if (pmaResponse.ok) {
        const pmaData = await pmaResponse.json();
        
        if (pmaData.results) {
          for (const pma of pmaData.results) {
            allEvents.push({
              fda_event_id: pma.pma_number || `pma_${Date.now()}_${Math.random()}`,
              event_type: 'pma_approval',
              device_name: pma.device_name,
              manufacturer_name: pma.applicant_full_name,
              event_date: pma.date_received,
              event_description: pma.generic_name,
              source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMA/pma.cfm?ID=${pma.pma_number}`,
              raw_data: pma
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching FDA PMA approvals:', error);
    }

    // Fetch adverse events
    try {
      console.log('Fetching FDA adverse events');
      const eventsResponse = await fetch(`${FDA_ENDPOINTS.adverse_events}?search=device.generic_name:"diabetes"+OR+"glucose"+OR+"insulin"&limit=100`);
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        
        if (eventsData.results) {
          for (const event of eventsData.results) {
            const deviceName = event.device?.[0]?.generic_name || event.device?.[0]?.brand_name;
            const manufacturerName = event.device?.[0]?.manufacturer_g1_name;
            
            allEvents.push({
              fda_event_id: event.mdr_report_key || `adverse_${Date.now()}_${Math.random()}`,
              event_type: 'adverse_event',
              device_name: deviceName,
              manufacturer_name: manufacturerName,
              event_date: event.date_of_event,
              event_description: event.event_description?.[0]?.event_description,
              source_url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm',
              raw_data: event
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching FDA adverse events:', error);
    }

    console.log(`Processing ${allEvents.length} FDA events for database insertion`);

    // Insert events into database
    let insertedCount = 0;
    let skippedCount = 0;

    if (allEvents.length > 0) {
      const { data, error } = await supabase
        .from('fda_device_events')
        .upsert(allEvents, { 
          onConflict: 'fda_event_id',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Database insertion error:', error);
      } else {
        insertedCount = allEvents.length;
        console.log(`Successfully processed ${insertedCount} FDA events`);
      }
    }

    // Get latest events from database
    const { data: latestEvents } = await supabase
      .from('fda_device_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const result = {
      success: true,
      message: `Processed ${insertedCount} FDA events`,
      inserted: insertedCount,
      skipped: skippedCount,
      total_in_db: latestEvents?.length || 0,
      categories_monitored: ['device_recalls', '510k_clearances', 'pma_approvals', 'adverse_events'],
      timestamp: new Date().toISOString(),
      data: latestEvents
    };

    console.log('FDA data feed completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in FDA data feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});