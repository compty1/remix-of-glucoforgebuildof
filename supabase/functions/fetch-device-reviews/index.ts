import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { analyzeSentiment } from "../_shared/sentiment.ts";
import { isJunkContent, cleanMarkdown, deterministicId } from "../_shared/junkFilter.ts";

// Device-specific search queries for Firecrawl
const DEVICE_SEARCH_QUERIES: Record<string, { webQuery: string; redditQuery: string }> = {
  'Dexcom G7': {
    webQuery: '"dexcom g7" review experience accuracy CGM',
    redditQuery: 'site:reddit.com "dexcom g7" review experience',
  },
  'Dexcom G6': {
    webQuery: '"dexcom g6" review experience CGM sensor',
    redditQuery: 'site:reddit.com "dexcom g6" review experience',
  },
  'Omnipod 5': {
    webQuery: '"omnipod 5" review experience insulin pump',
    redditQuery: 'site:reddit.com "omnipod 5" review experience',
  },
  'Tandem t:slim X2': {
    webQuery: '"tandem tslim" OR "t:slim x2" review experience pump',
    redditQuery: 'site:reddit.com "tandem" "tslim" OR "t:slim" review',
  },
  'Medtronic 780G': {
    webQuery: '"medtronic 780g" review experience pump',
    redditQuery: 'site:reddit.com "medtronic 780g" review experience',
  },
  'Freestyle Libre 3': {
    webQuery: '"freestyle libre 3" review experience CGM',
    redditQuery: 'site:reddit.com "freestyle libre 3" review experience',
  },
  'Beta Bionics iLet Bionic Pancreas': {
    webQuery: '"ilet" OR "bionic pancreas" review experience pump',
    redditQuery: 'site:reddit.com "ilet" OR "bionic pancreas" review',
  },
  'Tandem Mobi': {
    webQuery: '"tandem mobi" review experience insulin pump',
    redditQuery: 'site:reddit.com "tandem mobi" review experience',
  },
};

function extractSource(url: string): string {
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('diatribe.org')) return 'diatribe';
  if (url.includes('healthline.com')) return 'healthline';
  if (url.includes('verywellhealth.com')) return 'verywellhealth';
  if (url.includes('endocrineweb.com')) return 'endocrineweb';
  if (url.includes('diabetesdaily.com')) return 'diabetesdaily';
  if (url.includes('beyondtype1.org')) return 'beyondtype1';
  if (url.includes('diabetesmine.com')) return 'diabetesmine';
  if (url.includes('asweetlife.org')) return 'asweetlife';
  if (url.includes('t1dexchange.org')) return 't1dexchange';
  if (url.includes('webmd.com')) return 'webmd';
  if (url.includes('drugs.com')) return 'drugs.com';
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'web';
  }
}

async function fetchWebReviews(deviceName: string, searchQuery: string, limit = 20): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  try {
    console.log(`Firecrawl web search for "${deviceName}": ${searchQuery}`);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit,
        scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl search error: ${response.status}`);
      await response.text();
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    console.log(`Firecrawl returned ${results.length} web results for ${deviceName}`);

    return results
      .filter((r: any) => {
        const content = r.markdown || r.description || '';
        return !isJunkContent(content) && content.length > 100;
      })
      .map((r: any) => {
        const rawContent = r.markdown || r.description || '';
        const cleaned = cleanMarkdown(rawContent).substring(0, 1200);
        const url = r.url || '';
        const source = extractSource(url);
        const sentiment = analyzeSentiment(cleaned);
        const title = (r.title || '').replace(/ - .+$/, '').replace(/ \| .+$/, '').substring(0, 200)
          || `${deviceName} Review`;

        return {
          title,
          content: cleaned.substring(0, 1000),
          source,
          source_url: url,
          sentiment,
          author: source === 'reddit' ? 'Reddit User' : `${source} reviewer`,
          subreddit: source === 'reddit' ? (url.match(/reddit\.com\/r\/([^/]+)/) || [])[1] || 'diabetes' : null,
        };
      });
  } catch (error) {
    console.error(`Firecrawl web search error for ${deviceName}:`, error);
    return [];
  }
}

async function fetchRedditBuzz(deviceName: string, searchQuery: string, limit = 10): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  try {
    console.log(`Firecrawl Reddit search for "${deviceName}": ${searchQuery}`);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit,
        scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl Reddit search error: ${response.status}`);
      await response.text();
      return [];
    }

    const data = await response.json();
    const results = data.data || [];
    console.log(`Firecrawl returned ${results.length} Reddit results for ${deviceName}`);

    return results
      .filter((r: any) => {
        const url = r.url || '';
        const content = r.markdown || r.description || '';
        return url.includes('reddit.com') && !isJunkContent(content);
      })
      .map((r: any) => {
        const rawContent = r.markdown || r.description || '';
        const cleaned = cleanMarkdown(rawContent).substring(0, 1000);
        const url = r.url || '';
        const subreddit = (url.match(/reddit\.com\/r\/([^/]+)/) || [])[1] || 'diabetes';
        const title = (r.title || '').replace(/ : .+$/, '').replace(/ - .+$/, '').substring(0, 200);

        return {
          title,
          content: cleaned.substring(0, 800),
          source_url: url,
          subreddit,
          sentiment: analyzeSentiment(title + ' ' + cleaned),
          author: 'Reddit User',
        };
      });
  } catch (error) {
    console.error(`Firecrawl Reddit search error for ${deviceName}:`, error);
    return [];
  }
}

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let startIndex = 0;
    let batchSize = 8;
    try {
      const body = await req.json();
      if (body.startIndex !== undefined) startIndex = body.startIndex;
      if (body.batchSize !== undefined) batchSize = Math.min(body.batchSize, 8);
    } catch {
      // No body, use defaults
    }

    console.log(`Starting device reviews fetch (start: ${startIndex}, batch: ${batchSize})...`);

    const { data: devices, error: devError } = await supabase
      .from('devices')
      .select('id, name')
      .range(startIndex, startIndex + batchSize - 1);

    if (devError) throw new Error(`Failed to fetch devices: ${devError.message}`);
    console.log(`Processing ${devices?.length || 0} devices`);

    let totalInserted = 0;

    for (const device of devices || []) {
      const config = DEVICE_SEARCH_QUERIES[device.name];
      const webQuery = config?.webQuery || `"${device.name}" review experience`;
      const redditQuery = config?.redditQuery || `site:reddit.com "${device.name}" review experience`;

      const webReviews1 = await fetchWebReviews(device.name, webQuery, 20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery2 = `${device.name} user review diabetes experience site:reddit.com OR site:diatribe.org OR site:healthline.com`;
      const webReviews2 = await fetchWebReviews(device.name, webQuery2, 20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery3 = `"${device.name}" diabetes user feedback forum opinion`;
      const webReviews3 = await fetchWebReviews(device.name, webQuery3, 15);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery4 = `"${device.name}" pros cons comparison 2024 2025 diabetes`;
      const webReviews4 = await fetchWebReviews(device.name, webQuery4, 15);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery5 = `"${device.name}" long term review experience months years diabetes`;
      const webReviews5 = await fetchWebReviews(device.name, webQuery5, 15);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery6 = `"${device.name}" review experience site:diabetesdaily.com OR site:tudiabetes.org OR site:beyondtype1.org`;
      const webReviews6 = await fetchWebReviews(device.name, webQuery6, 15);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webQuery7 = `"${device.name}" review diabetes site:youtube.com`;
      const webReviews7 = await fetchWebReviews(device.name, webQuery7, 10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const redditQuery2 = `site:reddit.com "${device.name}" diabetes OR type1 OR insulin pump OR CGM`;
      const redditPosts2 = await fetchRedditBuzz(device.name, redditQuery2, 10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const redditPosts = await fetchRedditBuzz(device.name, redditQuery, 10);

      const allResults = [...webReviews1, ...webReviews2, ...webReviews3, ...webReviews4, ...webReviews5, ...webReviews6, ...webReviews7, ...redditPosts, ...redditPosts2];
      const uniqueByUrl = Array.from(new Map(allResults.map(r => [r.source_url, r])).values());

      console.log(`${device.name}: ${uniqueByUrl.length} unique results (from ${allResults.length} total)`);

      for (const result of uniqueByUrl) {
        // Deterministic ID from source + URL to prevent duplicates
        const externalId = deterministicId(result.source || 'web', result.source_url, result.content);

        const record = {
          device_id: device.id,
          source: result.source || 'web',
          external_id: externalId,
          author_anonymous: result.author || 'Anonymous',
          rating: null,
          title: result.title || `${device.name} Review`,
          content: result.content,
          sentiment: result.sentiment || 'neutral',
          helpful_count: 0,
          published_at: null, // BUG 6 fix: don't fake dates for scraped content
          source_url: result.source_url || null,
          device_mentioned: device.name,
          verified_purchase: false,
          subreddit: result.subreddit || null,
        };

        const { error: insertError } = await supabase
          .from('external_device_reviews')
          .upsert(record, { onConflict: 'source,external_id', ignoreDuplicates: true });

        if (!insertError) {
          totalInserted++;
        } else if (!insertError.message.includes('duplicate')) {
          console.error(`Insert error for ${device.name}:`, insertError.message);
        }
      }

      console.log(`Finished ${device.name}: ${totalInserted} total inserted so far`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return jsonResponse({
      success: true,
      devicesProcessed: devices?.length || 0,
      totalInserted,
      startIndex,
      batchSize,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-device-reviews:', error);
    return errorResponse(errorMessage, 500);
  }
});
