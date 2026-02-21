import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Medication name to Drugs.com URL mapping
const MEDICATION_URLS: Record<string, string> = {
  'humalog': 'https://www.drugs.com/comments/insulin-lispro/humalog/',
  'novolog': 'https://www.drugs.com/comments/insulin-aspart/novolog/',
  'lantus': 'https://www.drugs.com/comments/insulin-glargine/lantus/',
  'tresiba': 'https://www.drugs.com/comments/insulin-degludec/tresiba/',
  'fiasp': 'https://www.drugs.com/comments/insulin-aspart/fiasp/',
  'lyumjev': 'https://www.drugs.com/comments/insulin-lispro/lyumjev/',
  'basaglar': 'https://www.drugs.com/comments/insulin-glargine/basaglar/',
  'toujeo': 'https://www.drugs.com/comments/insulin-glargine/toujeo/',
  'levemir': 'https://www.drugs.com/comments/insulin-detemir/levemir/',
  'ozempic': 'https://www.drugs.com/comments/semaglutide/ozempic/',
  'metformin': 'https://www.drugs.com/comments/metformin/',
};

// Medication to Reddit search mapping
const MEDICATION_REDDIT_TERMS: Record<string, { query: string; subreddits: string[] }> = {
  'humalog': { query: 'humalog OR lispro', subreddits: ['diabetes_t1', 'diabetes'] },
  'novolog': { query: 'novolog OR novorapid', subreddits: ['diabetes_t1', 'diabetes'] },
  'lantus': { query: 'lantus', subreddits: ['diabetes_t1', 'diabetes'] },
  'tresiba': { query: 'tresiba', subreddits: ['diabetes_t1', 'diabetes'] },
  'fiasp': { query: 'fiasp', subreddits: ['diabetes_t1', 'diabetes'] },
  'lyumjev': { query: 'lyumjev', subreddits: ['diabetes_t1', 'diabetes'] },
  'omnipod': { query: 'omnipod insulin', subreddits: ['diabetes_t1', 'Omnipod'] },
  'ozempic': { query: 'ozempic', subreddits: ['diabetes_t1', 'diabetes'] },
  'metformin': { query: 'metformin', subreddits: ['diabetes_t1', 'diabetes'] },
};

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'works', 'helped', 'better', 'recommend', 'effective', 'game changer', 'life changing'];
  const negativeWords = ['hate', 'terrible', 'horrible', 'useless', 'failed', 'side effects', 'nausea', 'problem', 'issue', 'stopped working'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => { if (lowerText.includes(word)) positiveScore++; });
  negativeWords.forEach(word => { if (lowerText.includes(word)) negativeScore++; });
  
  if (positiveScore > negativeScore + 1) return 'positive';
  if (negativeScore > positiveScore + 1) return 'negative';
  return 'neutral';
}

// Fetch Reddit posts
async function fetchRedditPosts(subreddit: string, query: string, limit = 8): Promise<any[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=top&t=year&limit=${limit}&restrict_sr=1`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'GlucoForge/1.0 (Diabetes community app)' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (!data.data?.children) return [];
    
    return data.data.children
      .filter((child: any) => child.data?.selftext && child.data.selftext.length > 50)
      .map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        content: child.data.selftext?.substring(0, 1000) || '',
        author: child.data.author,
        upvotes: child.data.ups,
        permalink: `https://reddit.com${child.data.permalink}`,
        subreddit: child.data.subreddit,
        created_utc: child.data.created_utc,
      }));
  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error);
    return [];
  }
}

// Scrape Drugs.com reviews using Firecrawl
async function scrapeDrugsComReviews(medicationName: string, url: string): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (!firecrawlKey) {
    console.log('Firecrawl API key not available, skipping Drugs.com scraping');
    return [];
  }
  
  try {
    console.log(`Scraping Drugs.com for ${medicationName}: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });
    
    if (!response.ok) {
      console.error(`Firecrawl error for ${medicationName}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    
    if (!markdown) {
      console.log(`No content scraped for ${medicationName}`);
      return [];
    }
    
    // Parse reviews from markdown - look for rating patterns and review text
    const reviews: any[] = [];
    const reviewPattern = /(?:Rating|★|stars?)[:\s]*(\d+(?:\.\d+)?)[^\n]*\n([^]*?)(?=Rating|★|stars?|$)/gi;
    const simplePattern = /(?:^|\n)(?:###?\s*)?(?:Review|User|Patient)[:\s]*([^\n]+)\n([^]*?)(?=\n###?|\n(?:Review|User|Patient)|$)/gi;
    
    // Try to extract any structured content
    const lines: string[] = markdown.split('\n').filter((l: string) => l.trim().length > 50);
    
    // Content quality filter — skip scraped navigation/junk
    const JUNK_MARKERS = [
      'skip to main content', 'a-z list', 'a-z list of drugs', 'pill identifier',
      'page you were looking', 'find treatment options',
      'keyboard shortcuts', 'save up to', 'drug interaction checker',
      'sign up for', 'advertisement', 'cookie policy',
      'skip to fda search', 'skip to footer links', 'skip to in this section',
      'in this section:',
    ];
    
    // Take first 5 substantial paragraphs as reviews, filtering junk
    lines.slice(0, 10).forEach((line: string) => {
      const lower = line.toLowerCase();
      const isJunk = JUNK_MARKERS.some(marker => lower.includes(marker));
      if (isJunk || line.length < 100) return;
      if (reviews.length >= 5) return;
      
      const sentiment = analyzeSentiment(line);
      reviews.push({
        title: `User review of ${medicationName}`,
        content: line.substring(0, 800),
        rating: sentiment === 'positive' ? 5 : sentiment === 'negative' ? 2 : 3,
        sentiment,
        source_url: url,
        source: 'drugs.com',
      });
    });
    
    return reviews;
  } catch (error) {
    console.error(`Error scraping Drugs.com for ${medicationName}:`, error);
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

    console.log('Starting medication reviews fetch...');

    // Get all medications
    const { data: medications, error: medsError } = await supabase
      .from('medications')
      .select('id, name, generic_name');

    if (medsError) {
      throw new Error(`Failed to fetch medications: ${medsError.message}`);
    }

    console.log(`Found ${medications?.length || 0} medications`);

    const allReviews: any[] = [];
    let processedMeds = 0;

    for (const medication of medications || []) {
      const medNameLower = medication.name.toLowerCase();
      const genericLower = medication.generic_name?.toLowerCase() || '';
      
      // Find Reddit search config
      let redditConfig = null;
      for (const [key, config] of Object.entries(MEDICATION_REDDIT_TERMS)) {
        if (medNameLower.includes(key) || genericLower.includes(key)) {
          redditConfig = config;
          break;
        }
      }

      if (redditConfig) {
        console.log(`Fetching Reddit reviews for: ${medication.name}`);
        
        for (const subreddit of redditConfig.subreddits) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
          
          const posts = await fetchRedditPosts(subreddit, redditConfig.query, 5);
          
          for (const post of posts) {
            const sentiment = analyzeSentiment(post.title + ' ' + post.content);
            
            allReviews.push({
              medication_id: medication.id,
              source: 'reddit',
              external_id: `reddit_${post.id}`,
              author_anonymous: post.author !== '[deleted]' ? `u/${post.author}` : 'Anonymous',
              title: post.title.substring(0, 200),
              content: post.content.substring(0, 1000),
              sentiment,
              helpful_count: post.upvotes || 0,
              published_at: new Date(post.created_utc * 1000).toISOString(),
              source_url: post.permalink,
              subreddit: `r/${post.subreddit}`,
            });
          }
        }
      }

      // Check for Drugs.com URL
      let drugsComUrl = null;
      for (const [key, url] of Object.entries(MEDICATION_URLS)) {
        if (medNameLower.includes(key) || genericLower.includes(key)) {
          drugsComUrl = url;
          break;
        }
      }

      if (drugsComUrl) {
        console.log(`Scraping Drugs.com for: ${medication.name}`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limit
        
        const drugsReviews = await scrapeDrugsComReviews(medication.name, drugsComUrl);
        
        for (const review of drugsReviews) {
          allReviews.push({
            medication_id: medication.id,
            source: 'drugs.com',
            external_id: `drugs_${medication.id}_${Math.random().toString(36).substr(2, 9)}`,
            author_anonymous: 'Anonymous User',
            title: review.title,
            content: review.content,
            sentiment: review.sentiment,
            helpful_count: 0,
            published_at: new Date().toISOString(),
            source_url: review.source_url,
          });
        }
      }

      processedMeds++;
      
      if (processedMeds >= 8) {
        console.log('Reached medication limit, stopping to prevent timeout');
        break;
      }
    }

    console.log(`Collected ${allReviews.length} medication reviews`);

    if (allReviews.length > 0) {
      // Store in external_medication_reviews table if it exists, otherwise use a generic approach
      // First check if table exists by trying to insert
      
      // For now, we'll store these in a structured way that the UI can display
      // The medication_reviews table is for user-submitted reviews
      // External reviews need their own table
      
      // Let's create entries in external_medication_reviews if that table exists
      const { error: checkError } = await supabase
        .from('external_medication_reviews')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.log('external_medication_reviews table does not exist, storing in medication_community_buzz');
        
        // Fallback: store in medication_community_buzz
        const buzzEntries = allReviews.map(review => ({
          medication_id: review.medication_id,
          source_platform: review.source,
          content: `${review.title}\n\n${review.content}`,
          sentiment: review.sentiment,
          source_url: review.source_url,
          upvotes: review.helpful_count,
          author_anonymous: review.author_anonymous,
          published_at: review.published_at,
        }));
        
        const { error: insertError } = await supabase
          .from('medication_community_buzz')
          .upsert(buzzEntries.slice(0, 50), { 
            onConflict: 'id',
            ignoreDuplicates: true 
          });
        
        if (insertError) {
          console.error('Error inserting into medication_community_buzz:', insertError);
        }
      } else {
        // Insert into external_medication_reviews one by one to avoid upsert issues
        const uniqueReviews = Array.from(
          new Map(allReviews.map(r => [r.external_id, r])).values()
        );
        
        let insertedCount = 0;
        for (const review of uniqueReviews.slice(0, 50)) {
          const { error: insertError } = await supabase
            .from('external_medication_reviews')
            .insert(review);
          
          if (!insertError) {
            insertedCount++;
          } else if (!insertError.message.includes('duplicate')) {
            console.error('Error inserting review:', insertError.message);
          }
        }
        console.log(`Inserted ${insertedCount} medication reviews`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Fetched ${allReviews.length} real medication reviews`,
          medicationsProcessed: processedMeds,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'No reviews found',
        medicationsProcessed: processedMeds,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-medication-reviews:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
