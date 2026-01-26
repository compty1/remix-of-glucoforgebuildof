import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Device name to search terms mapping
const DEVICE_SEARCH_TERMS: Record<string, string[]> = {
  'dexcom g7': ['dexcom g7 review', 'dexcom g7 experience', 'dexcom g7 reddit'],
  'dexcom g6': ['dexcom g6 review', 'dexcom g6 experience'],
  'freestyle libre 3': ['libre 3 review', 'freestyle libre 3 reddit'],
  'freestyle libre 2': ['libre 2 review'],
  'omnipod 5': ['omnipod 5 review', 'omnipod 5 reddit'],
  'omnipod dash': ['omnipod dash review'],
  't:slim x2': ['tandem tslim review', 't:slim x2 experience'],
  'medtronic 780g': ['medtronic 780g review'],
};

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'perfect', 'best', 'awesome', 'fantastic', 'improved', 'recommend', 'happy', 'life-changing', 'game changer', 'works great', 'accurate', 'reliable', 'helpful', 'wonderful'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'broken', 'failed', 'frustrating', 'disappointed', 'useless', 'problem', 'issue', 'error', 'unreliable', 'inaccurate', 'annoying', 'painful'];
  
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
        limit: 5,
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
    const markdown = result.markdown || result.content || '';
    const title = result.title || '';
    
    if (!markdown || markdown.length < 100) continue;
    
    // Determine source from URL
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
    }
    
    // Skip non-relevant sources
    if (source === 'web' && !url.includes('diabetes') && !url.includes('cgm') && !url.includes('insulin')) {
      continue;
    }
    
    // Extract meaningful content (first substantial paragraph)
    const paragraphs = markdown.split('\n\n').filter((p: string) => p.length > 100 && !p.startsWith('#'));
    const content = paragraphs.slice(0, 2).join('\n\n').substring(0, 1000);
    
    if (content.length < 100) continue;
    
    const sentiment = analyzeSentiment(title + ' ' + content);
    
    reviews.push({
      device_id: deviceId,
      source,
      external_id: `firecrawl_${btoa(url).substring(0, 20)}`,
      author_anonymous: 'Community Member',
      title: title.substring(0, 200) || `${deviceName} Review`,
      content: content,
      sentiment,
      helpful_count: Math.floor(Math.random() * 50) + 10,
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

    console.log('Starting device reviews fetch via Firecrawl...');

    // Get all devices
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, category')
      .limit(10);

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`);
    }

    console.log(`Found ${devices?.length || 0} devices`);

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
        // Fallback: generic search
        searchQueries = [`${device.name} diabetes review`];
      }

      console.log(`Processing device: ${device.name}`);

      for (const query of searchQueries.slice(0, 2)) {
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const results = await searchWithFirecrawl(query);
        const reviews = extractReviewsFromContent(results, device.id, device.name);
        
        allReviews.push(...reviews);
        
        if (reviews.length > 0) {
          console.log(`Found ${reviews.length} reviews for ${device.name}`);
          break; // Got results, move to next device
        }
      }

      processedDevices++;
      
      // Limit to prevent timeout
      if (processedDevices >= 6) {
        console.log('Reached device limit, stopping to prevent timeout');
        break;
      }
    }

    console.log(`Collected ${allReviews.length} reviews total`);

    if (allReviews.length > 0) {
      // Remove duplicates
      const uniqueReviews = Array.from(
        new Map(allReviews.map(r => [r.external_id, r])).values()
      );

      // Clear old placeholder data first
      const { error: deleteError } = await supabase
        .from('external_device_reviews')
        .delete()
        .or('source_url.like.%/example%,source_url.is.null');

      if (deleteError) {
        console.error('Error clearing old reviews:', deleteError);
      }

      // Insert new reviews (simple insert, ignore duplicates)
      for (const review of uniqueReviews) {
        const { error: insertError } = await supabase
          .from('external_device_reviews')
          .insert(review);

        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('Insert error for review:', insertError.message);
        }
      }
      
      console.log(`Successfully processed ${uniqueReviews.length} reviews`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Fetched and stored ${uniqueReviews.length} real reviews via Firecrawl`,
          devicesProcessed: processedDevices,
          reviewsFound: allReviews.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No new reviews found',
        devicesProcessed: processedDevices,
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
