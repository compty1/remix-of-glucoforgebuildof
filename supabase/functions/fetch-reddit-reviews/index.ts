import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Device name to search terms mapping
const DEVICE_SEARCH_TERMS: Record<string, string[]> = {
  'dexcom g7': ['site:reddit.com dexcom g7 review', 'dexcom g7 experience diabetes review'],
  'dexcom g6': ['site:reddit.com dexcom g6 review', 'dexcom g6 experience diabetes'],
  'freestyle libre 3': ['site:reddit.com freestyle libre 3', 'abbott libre 3 review diabetes'],
  'freestyle libre 2': ['site:reddit.com freestyle libre 2', 'libre 2 review diabetes'],
  'omnipod 5': ['site:reddit.com omnipod 5 review', 'omnipod 5 closed loop experience'],
  'omnipod dash': ['site:reddit.com omnipod dash review', 'omnipod dash experience'],
  't:slim x2': ['site:reddit.com tandem t:slim x2', 'tslim x2 control iq review'],
  'medtronic 780g': ['site:reddit.com medtronic 780g review', 'medtronic 780g guardian sensor'],
  'medtronic 770g': ['site:reddit.com medtronic 770g', 'medtronic 770g experience'],
  'eversense e3': ['eversense e3 implant review', 'site:reddit.com eversense'],
};

// Junk markers — content with these is navigation/promotional, not reviews
const JUNK_MARKERS = [
  'skip to main content', 'keyboard shortcuts', 'save up to',
  'a-z list of drugs', 'a-z list', 'pill identifier',
  'page you were looking', 'find treatment options',
  'skip to fda search', 'skip to footer links', 'skip to in this section',
  'in this section:', 'drug interaction checker', 'cookie policy',
  'sign up for', 'advertisement', 'check for [drug interactions]',
  'latest drug news', 'start over on our', 'complete sitemap',
  'home page](https://', 'clipboard, search history',
  'sale sold out in stock', 'filter your search',
  'we are updating our terms', 'find a journal', 'publish with us',
  'track your research', 'automated to help more patients',
];

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'perfect', 'best', 'awesome', 'fantastic', 'improved', 'recommend', 'happy', 'life-changing', 'game changer', 'works great', 'accurate', 'reliable', 'helpful', 'wonderful', 'smooth', 'easy', 'better'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'broken', 'failed', 'frustrating', 'disappointed', 'useless', 'problem', 'issue', 'error', 'unreliable', 'inaccurate', 'annoying', 'painful', 'difficult', 'worse', 'bad'];
  
  const lowerText = text.toLowerCase();
  let pos = 0, neg = 0;
  positiveWords.forEach(w => { if (lowerText.includes(w)) pos++; });
  negativeWords.forEach(w => { if (lowerText.includes(w)) neg++; });
  
  if (pos > neg + 1) return 'positive';
  if (neg > pos + 1) return 'negative';
  return 'neutral';
}

// Enhanced content cleaning
function cleanContent(content: string): string {
  return content
    // Remove empty markdown links [](url)
    .replace(/\[]\([^)]*\)/g, '')
    // Remove markdown images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/#{1,6}\s/g, '')
    // Remove social share icons patterns
    .replace(/\[]\([^)]*#(?:twitter|facebook|linkedin|email)[^)]*\)/g, '')
    // Remove bullet markers at start
    .replace(/^[-*•]\s+/gm, '')
    // Remove excessive emoji at start of lines
    .replace(/^(?:[^\w\s]{1,3}\s*){3,}/gm, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Check if content is valid (not junk)
function isValidContent(content: string): boolean {
  if (!content || content.length < 80) return false;
  const lower = content.substring(0, 500).toLowerCase();
  if (JUNK_MARKERS.some(marker => lower.includes(marker))) return false;
  
  // Quality scoring: count links vs text ratio
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  const wordCount = content.split(/\s+/).length;
  if (linkCount > 0 && linkCount / wordCount > 0.15) return false; // Too many links
  
  return true;
}

function getSourceFromUrl(url: string): { source: string; subreddit: string | null } {
  let source = 'web';
  let subreddit = null;
  
  if (url.includes('reddit.com')) {
    source = 'reddit';
    const match = url.match(/reddit\.com\/r\/([^\/]+)/);
    if (match) subreddit = `r/${match[1]}`;
  } else if (url.includes('drugs.com')) source = 'drugs.com';
  else if (url.includes('diabetesdaily.com')) source = 'diabetesdaily';
  else if (url.includes('beyondtype1.org')) source = 'beyond type 1';
  else if (url.includes('diatribe.org')) source = 'diatribe';
  else if (url.includes('healthline.com')) source = 'healthline';
  else if (url.includes('webmd.com')) source = 'webmd';
  else if (url.includes('integrateddiabetes.com')) source = 'integrated diabetes';
  else if (url.includes('thediabeteslink.org')) source = 'the diabetes link';
  else if (url.includes('diabetech.com')) source = 'diabetech';
  else if (url.includes('cnbc.com')) source = 'cnbc';
  else if (url.includes('asweetlife.org')) source = 'a sweet life';
  else if (url.includes('mysugr.com')) source = 'mysugr';
  else {
    try {
      const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
      if (domain && domain.length > 2) source = domain;
    } catch { /* keep web */ }
  }
  
  return { source, subreddit };
}

async function searchWithFirecrawl(query: string): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  try {
    console.log(`Searching Firecrawl for: ${query}`);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] },
      }),
    });
    
    if (!response.ok) {
      console.error(`Firecrawl search error: ${response.status}`);
      await response.text();
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return [];
  }
}

function extractReviewsFromContent(results: any[], deviceId: string, deviceName: string): any[] {
  const reviews: any[] = [];
  
  for (const result of results) {
    const url = result.url || '';
    const rawMarkdown = result.markdown || result.content || '';
    const title = result.title || '';
    
    if (!rawMarkdown || rawMarkdown.length < 50) continue;
    
    const { source, subreddit } = getSourceFromUrl(url);
    const cleanedMarkdown = cleanContent(rawMarkdown);
    
    // Validate content quality
    if (!isValidContent(cleanedMarkdown)) {
      console.log(`Skipping junk content from ${source}: ${url}`);
      continue;
    }
    
    const paragraphs = cleanedMarkdown.split('\n\n').filter((p: string) => p.length > 50 && !p.startsWith('#'));
    const content = paragraphs.slice(0, 3).join('\n\n').substring(0, 1200);
    
    if (content.length < 80) continue;
    
    const sentiment = analyzeSentiment(title + ' ' + content);
    
    reviews.push({
      device_id: deviceId,
      source, // Always lowercase
      external_id: `firecrawl_${btoa(url).substring(0, 20)}`,
      author_anonymous: subreddit ? `${subreddit} user` : 'Community Member',
      title: title.substring(0, 200) || `${deviceName} Review`,
      content,
      sentiment,
      helpful_count: 0,
      published_at: new Date().toISOString(),
      source_url: url,
      device_mentioned: deviceName,
      verified_purchase: false,
      subreddit,
      fetched_at: new Date().toISOString(),
    });
  }
  
  return reviews;
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
      if (body.batchSize !== undefined) batchSize = Math.min(body.batchSize, 15);
    } catch { /* defaults */ }

    console.log(`Starting device reviews fetch (start: ${startIndex}, batch: ${batchSize})...`);

    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, category')
      .range(startIndex, startIndex + batchSize - 1);

    if (devicesError) throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    console.log(`Found ${devices?.length || 0} devices`);

    const allReviews: any[] = [];
    let processedDevices = 0;

    for (const device of devices || []) {
      const deviceNameLower = device.name.toLowerCase();
      
      let searchQueries: string[] = [];
      for (const [key, queries] of Object.entries(DEVICE_SEARCH_TERMS)) {
        if (deviceNameLower.includes(key) || key.includes(deviceNameLower.split(' ')[0])) {
          searchQueries = queries;
          break;
        }
      }

      if (searchQueries.length === 0) {
        searchQueries = [
          `site:reddit.com ${device.name} review`,
          `${device.name} diabetes review experience`,
        ];
      }

      console.log(`Processing: ${device.name}`);

      for (const query of searchQueries.slice(0, 3)) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const results = await searchWithFirecrawl(query);
        const reviews = extractReviewsFromContent(results, device.id, device.name);
        allReviews.push(...reviews);
        
        if (reviews.length >= 3) break;
      }

      processedDevices++;
    }

    console.log(`Collected ${allReviews.length} reviews from ${processedDevices} devices`);

    if (allReviews.length > 0) {
      const uniqueReviews = Array.from(new Map(allReviews.map(r => [r.external_id, r])).values());

      let insertedCount = 0;
      for (const review of uniqueReviews) {
        const { error: insertError } = await supabase
          .from('external_device_reviews')
          .insert(review);
        if (!insertError) insertedCount++;
        else if (!insertError.message.includes('duplicate')) {
          console.error('Insert error:', insertError.message);
        }
      }
      
      console.log(`Inserted ${insertedCount} reviews`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Stored ${insertedCount} reviews`,
          devicesProcessed: processedDevices,
          reviewsInserted: insertedCount,
          nextStartIndex: startIndex + processedDevices,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No new reviews found',
        devicesProcessed: processedDevices,
        nextStartIndex: startIndex + processedDevices,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-reddit-reviews:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
