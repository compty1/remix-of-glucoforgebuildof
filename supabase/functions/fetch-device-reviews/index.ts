import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

// Junk content markers to filter out navigation/boilerplate
const JUNK_MARKERS = [
  'skip to main content', 'skip to navigation', 'skip to footer',
  'skip to fda search', 'skip to in this section',
  'a-z list', 'cookie policy', 'advertisement',
  'sign up for', 'subscribe to', 'privacy policy', 'terms of service',
  'accept cookies', 'we use cookies', 'javascript is disabled',
  'go to main content', 'visit website', 'error 403', 'error 404',
  'claimed profile', 'trustscore', 'share - facebook',
  'logoproducts', 'dexcom logo', 'products patients',
  'save up to', 'pill identifier', 'find treatment options',
  'drug interaction checker', 'check for [drug interactions]',
  'latest drug news', 'complete sitemap', 'clipboard, search history',
  'sale sold out in stock', 'filter your search',
  'we are updating our terms', 'find a journal', 'publish with us',
  'track your research', 'automated to help more patients',
  'page you were looking', 'in this section:',
  'start over on our', 'home page](https://',
];

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'works', 'helped', 'better', 'recommend', 'effective', 'game changer', 'life changing', 'wonderful', 'fantastic', 'improved', 'perfect', 'happy', 'accurate', 'reliable', 'comfortable', 'easy'];
  const negativeWords = ['hate', 'terrible', 'horrible', 'useless', 'failed', 'side effects', 'problem', 'issue', 'stopped working', 'awful', 'worst', 'pain', 'dangerous', 'disappointed', 'frustrated', 'inaccurate', 'unreliable', 'uncomfortable', 'annoying', 'defective'];

  const lowerText = text.toLowerCase();
  let pos = 0, neg = 0;
  positiveWords.forEach(w => { if (lowerText.includes(w)) pos++; });
  negativeWords.forEach(w => { if (lowerText.includes(w)) neg++; });

  if (pos > neg + 1) return 'positive';
  if (neg > pos + 1) return 'negative';
  return 'neutral';
}

function isJunkContent(text: string): boolean {
  const lower = text.toLowerCase().substring(0, 500);
  return JUNK_MARKERS.some(marker => lower.includes(marker));
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*{1,3}/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'web';
  }
}

// Fetch web reviews via Firecrawl search with scrape
async function fetchWebReviews(deviceName: string, searchQuery: string, limit = 10): Promise<any[]> {
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
        return content.length > 100 && !isJunkContent(content);
      })
      .map((r: any) => {
        const rawContent = r.markdown || r.description || '';
        const cleaned = cleanMarkdown(rawContent).substring(0, 1200);
        const url = r.url || '';
        const source = extractSource(url);
        const sentiment = analyzeSentiment(cleaned);

        // Try to extract a meaningful title
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

// Fetch Reddit community posts via Firecrawl search
async function fetchRedditBuzz(deviceName: string, searchQuery: string, limit = 8): Promise<any[]> {
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
        return url.includes('reddit.com') && content.length > 80 && !isJunkContent(content);
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Fetch devices
    const { data: devices, error: devError } = await supabase
      .from('devices')
      .select('id, name')
      .range(startIndex, startIndex + batchSize - 1);

    if (devError) throw new Error(`Failed to fetch devices: ${devError.message}`);
    console.log(`Processing ${devices?.length || 0} devices`);

    let totalInserted = 0;

    for (const device of devices || []) {
      const config = DEVICE_SEARCH_QUERIES[device.name];
      if (!config) {
        console.log(`No search config for device: ${device.name}, using generic`);
      }

      const webQuery = config?.webQuery || `"${device.name}" review experience`;
      const redditQuery = config?.redditQuery || `site:reddit.com "${device.name}" review experience`;

      // Fetch web reviews (2 searches to stay within timeout)
      const webReviews1 = await fetchWebReviews(device.name, webQuery, 10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Second search with different angle
      const webQuery2 = `${device.name} user review diabetes experience site:reddit.com OR site:diatribe.org OR site:healthline.com`;
      const webReviews2 = await fetchWebReviews(device.name, webQuery2, 10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Third search: forum/feedback angle
      const webQuery3 = `"${device.name}" diabetes user feedback forum opinion`;
      const webReviews3 = await fetchWebReviews(device.name, webQuery3, 8);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reddit community buzz
      const redditPosts = await fetchRedditBuzz(device.name, redditQuery, 10);

      // Combine all results, deduplicate by URL
      const allResults = [...webReviews1, ...webReviews2, ...webReviews3, ...redditPosts];
      const uniqueByUrl = Array.from(new Map(allResults.map(r => [r.source_url, r])).values());

      console.log(`${device.name}: ${uniqueByUrl.length} unique results (from ${allResults.length} total)`);

      // Insert into external_device_reviews
      for (const result of uniqueByUrl) {
        const externalId = `fc_${device.id}_${result.source}_${Math.random().toString(36).substr(2, 9)}`;

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
          published_at: new Date().toISOString(),
          source_url: result.source_url || null,
          device_mentioned: device.name,
          verified_purchase: false,
          subreddit: result.subreddit || null,
        };

        const { error: insertError } = await supabase
          .from('external_device_reviews')
          .insert(record);

        if (!insertError) {
          totalInserted++;
        } else if (!insertError.message.includes('duplicate')) {
          console.error(`Insert error for ${device.name}:`, insertError.message);
        }
      }

      console.log(`Finished ${device.name}: ${totalInserted} total inserted so far`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const summary = {
      success: true,
      devicesProcessed: devices?.length || 0,
      totalInserted,
      startIndex,
      batchSize,
    };

    console.log('Summary:', JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-device-reviews:', error);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
