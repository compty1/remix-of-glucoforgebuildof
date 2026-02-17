import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Device name to search terms mapping - includes Reddit-specific searches
const DEVICE_SEARCH_TERMS: Record<string, string[]> = {
  'dexcom g7': [
    'site:reddit.com dexcom g7 review',
    'dexcom g7 experience diabetes review',
    'site:reddit.com/r/dexcom g7',
  ],
  'dexcom g6': [
    'site:reddit.com dexcom g6 review',
    'dexcom g6 experience diabetes',
  ],
  'freestyle libre 3': [
    'site:reddit.com freestyle libre 3',
    'abbott libre 3 review diabetes',
    'site:reddit.com/r/diabetes libre 3',
  ],
  'freestyle libre 2': [
    'site:reddit.com freestyle libre 2',
    'libre 2 review diabetes',
  ],
  'omnipod 5': [
    'site:reddit.com omnipod 5 review',
    'omnipod 5 closed loop experience',
    'site:reddit.com/r/Omnipod',
  ],
  'omnipod dash': [
    'site:reddit.com omnipod dash review',
    'omnipod dash experience',
  ],
  't:slim x2': [
    'site:reddit.com tandem t:slim x2',
    'tslim x2 control iq review',
    'site:reddit.com/r/diabetes tandem',
  ],
  'medtronic 780g': [
    'site:reddit.com medtronic 780g review',
    'medtronic 780g guardian sensor',
  ],
  'medtronic 770g': [
    'site:reddit.com medtronic 770g',
    'medtronic 770g experience',
  ],
  'eversense e3': [
    'eversense e3 implant review',
    'site:reddit.com eversense',
  ],
};

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'perfect', 'best', 'awesome', 'fantastic', 'improved', 'recommend', 'happy', 'life-changing', 'game changer', 'works great', 'accurate', 'reliable', 'helpful', 'wonderful', 'smooth', 'easy', 'better'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'broken', 'failed', 'frustrating', 'disappointed', 'useless', 'problem', 'issue', 'error', 'unreliable', 'inaccurate', 'annoying', 'painful', 'difficult', 'worse', 'bad'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore + 1) return 'positive';
  if (negativeScore > positiveScore + 1) return 'negative';
  return 'neutral';
}

// Clean markdown content
function cleanContent(content: string): string {
  return content
    // Remove markdown images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/#{1,6}\s/g, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract source from URL
function getSourceFromUrl(url: string): { source: string; subreddit: string | null } {
  let source = 'web';
  let subreddit = null;
  
  if (url.includes('reddit.com')) {
    source = 'reddit';
    const subredditMatch = url.match(/reddit\.com\/r\/([^\/]+)/);
    if (subredditMatch) {
      subreddit = `r/${subredditMatch[1]}`;
    }
  } else if (url.includes('drugs.com')) {
    source = 'drugs.com';
  } else if (url.includes('diabetesdaily.com')) {
    source = 'diabetesdaily';
  } else if (url.includes('beyondtype1.org')) {
    source = 'beyond type 1';
  } else if (url.includes('diatribe.org')) {
    source = 'diatribe';
  } else if (url.includes('healthline.com')) {
    source = 'healthline';
  } else if (url.includes('integrateddiabetes.com')) {
    source = 'integrated diabetes';
  } else if (url.includes('thediabeteslink.org')) {
    source = 'the diabetes link';
  } else if (url.includes('diabetech.com')) {
    source = 'diabetech';
  } else if (url.includes('cnbc.com')) {
    source = 'cnbc';
  } else if (url.includes('webmd.com')) {
    source = 'webmd';
  } else if (url.includes('asweetlife.org')) {
    source = 'a sweet life';
  } else if (url.includes('mysugr.com')) {
    source = 'mysugr';
  } else if (url.includes('diapedia.org')) {
    source = 'diapedia';
  } else {
    // Fallback: use domain name
    try {
      const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
      if (domain && domain.length > 2) {
        source = domain;
      }
    } catch {
      // Keep 'web' as fallback
    }
  }
  
  return { source, subreddit };
}

// Use Firecrawl to search and scrape
async function searchWithFirecrawl(query: string): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlKey) {
    console.log('Firecrawl API key not available');
    return [];
  }

  try {
    console.log(`Searching Firecrawl for: ${query}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        limit: 10, // Increased from 5
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });
    
    if (!response.ok) {
      console.error(`Firecrawl search error: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return [];
    }
    
    const data = await response.json();
    console.log(`Firecrawl returned ${data.data?.length || 0} results`);
    
    return data.data || [];
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return [];
  }
}

// Extract reviews from scraped content
function extractReviewsFromContent(results: any[], deviceId: string, deviceName: string): any[] {
  const reviews: any[] = [];
  
  for (const result of results) {
    const url = result.url || '';
    const rawMarkdown = result.markdown || result.content || '';
    const title = result.title || '';
    
    // Lower threshold for content length
    if (!rawMarkdown || rawMarkdown.length < 50) continue;
    
    const { source, subreddit } = getSourceFromUrl(url);
    
    // Clean the content
    const cleanedMarkdown = cleanContent(rawMarkdown);
    
    // Extract meaningful content (first substantial paragraphs)
    const paragraphs = cleanedMarkdown.split('\n\n').filter((p: string) => p.length > 50 && !p.startsWith('#'));
    const content = paragraphs.slice(0, 3).join('\n\n').substring(0, 1200);
    
    if (content.length < 50) continue;
    
    const sentiment = analyzeSentiment(title + ' ' + content);
    
    reviews.push({
      device_id: deviceId,
      source,
      external_id: `firecrawl_${btoa(url).substring(0, 20)}`,
      author_anonymous: subreddit ? `${subreddit} user` : 'Community Member',
      title: title.substring(0, 200) || `${deviceName} Review`,
      content: content,
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

    // Support for batch processing
    let startIndex = 0;
    let batchSize = 8; // Increased from 6
    
    try {
      const body = await req.json();
      if (body.startIndex !== undefined) startIndex = body.startIndex;
      if (body.batchSize !== undefined) batchSize = Math.min(body.batchSize, 15);
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`Starting device reviews fetch via Firecrawl (start: ${startIndex}, batch: ${batchSize})...`);

    // Get devices with pagination
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, category')
      .range(startIndex, startIndex + batchSize - 1);

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    }

    console.log(`Found ${devices?.length || 0} devices to process`);

    const allReviews: any[] = [];
    let processedDevices = 0;

    for (const device of devices || []) {
      const deviceNameLower = device.name.toLowerCase();
      
      // Find search terms for this device
      let searchQueries: string[] = [];
      for (const [key, queries] of Object.entries(DEVICE_SEARCH_TERMS)) {
        if (deviceNameLower.includes(key) || key.includes(deviceNameLower.split(' ')[0])) {
          searchQueries = queries;
          break;
        }
      }

      if (searchQueries.length === 0) {
        // Fallback: generate generic search terms including Reddit
        searchQueries = [
          `site:reddit.com ${device.name} review`,
          `${device.name} diabetes review experience`,
        ];
      }

      console.log(`Processing device: ${device.name} with ${searchQueries.length} queries`);

      for (const query of searchQueries.slice(0, 3)) { // Process up to 3 queries per device
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const results = await searchWithFirecrawl(query);
        const reviews = extractReviewsFromContent(results, device.id, device.name);
        
        allReviews.push(...reviews);
        
        if (reviews.length >= 3) {
          console.log(`Found ${reviews.length} reviews for ${device.name}, moving to next device`);
          break; // Got enough results, move to next device
        }
      }

      processedDevices++;
    }

    console.log(`Collected ${allReviews.length} reviews total from ${processedDevices} devices`);

    if (allReviews.length > 0) {
      // Remove duplicates
      const uniqueReviews = Array.from(
        new Map(allReviews.map(r => [r.external_id, r])).values()
      );

      // Clear old placeholder data first (only on first batch)
      if (startIndex === 0) {
        const { error: deleteError } = await supabase
          .from('external_device_reviews')
          .delete()
          .or('source_url.like.%/example%,source_url.is.null');

        if (deleteError) {
          console.error('Error clearing old reviews:', deleteError);
        }
      }

      // Insert new reviews (simple insert, ignore duplicates)
      let insertedCount = 0;
      for (const review of uniqueReviews) {
        const { error: insertError } = await supabase
          .from('external_device_reviews')
          .insert(review);

        if (!insertError) {
          insertedCount++;
        } else if (!insertError.message.includes('duplicate')) {
          console.error('Insert error for review:', insertError.message);
        }
      }
      
      console.log(`Successfully inserted ${insertedCount} reviews`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Fetched and stored ${insertedCount} real reviews via Firecrawl`,
          devicesProcessed: processedDevices,
          reviewsFound: allReviews.length,
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
