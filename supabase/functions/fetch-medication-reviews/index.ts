import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Drugs.com URL mappings for all 44 medications (must use .html extension)
const MEDICATION_URLS: Record<string, string> = {
  'humalog': 'https://www.drugs.com/comments/insulin-lispro/humalog.html',
  'novolog': 'https://www.drugs.com/comments/insulin-aspart/novolog.html',
  'lantus': 'https://www.drugs.com/comments/insulin-glargine/lantus.html',
  'tresiba': 'https://www.drugs.com/comments/insulin-degludec/tresiba.html',
  'fiasp': 'https://www.drugs.com/comments/insulin-aspart/fiasp.html',
  'lyumjev': 'https://www.drugs.com/comments/insulin-lispro/lyumjev.html',
  'basaglar': 'https://www.drugs.com/comments/insulin-glargine/basaglar.html',
  'toujeo': 'https://www.drugs.com/comments/insulin-glargine/toujeo.html',
  'levemir': 'https://www.drugs.com/comments/insulin-detemir/levemir.html',
  'ozempic': 'https://www.drugs.com/comments/semaglutide/ozempic.html',
  'metformin': 'https://www.drugs.com/comments/metformin.html',
  'jardiance': 'https://www.drugs.com/comments/empagliflozin/jardiance.html',
  'farxiga': 'https://www.drugs.com/comments/dapagliflozin/farxiga.html',
  'invokana': 'https://www.drugs.com/comments/canagliflozin/invokana.html',
  'januvia': 'https://www.drugs.com/comments/sitagliptin/januvia.html',
  'tradjenta': 'https://www.drugs.com/comments/linagliptin/tradjenta.html',
  'trulicity': 'https://www.drugs.com/comments/dulaglutide/trulicity.html',
  'victoza': 'https://www.drugs.com/comments/liraglutide/victoza.html',
  'mounjaro': 'https://www.drugs.com/comments/tirzepatide/mounjaro.html',
  'rybelsus': 'https://www.drugs.com/comments/semaglutide/rybelsus.html',
  'afrezza': 'https://www.drugs.com/comments/insulin-human/afrezza.html',
  'symlin': 'https://www.drugs.com/comments/pramlintide/symlin.html',
  'actos': 'https://www.drugs.com/comments/pioglitazone/actos.html',
  'glipizide': 'https://www.drugs.com/comments/glipizide.html',
  'glimepiride': 'https://www.drugs.com/comments/glimepiride.html',
  'onglyza': 'https://www.drugs.com/comments/saxagliptin/onglyza.html',
  'precose': 'https://www.drugs.com/comments/acarbose/precose.html',
  'prandin': 'https://www.drugs.com/comments/repaglinide/prandin.html',
  'admelog': 'https://www.drugs.com/comments/insulin-lispro/admelog.html',
  'apidra': 'https://www.drugs.com/comments/insulin-glulisine/apidra.html',
  'semglee': 'https://www.drugs.com/comments/insulin-glargine/semglee.html',
  'zepbound': 'https://www.drugs.com/comments/tirzepatide/zepbound.html',
  'soliqua': 'https://www.drugs.com/comments/insulin-glargine-lixisenatide/soliqua.html',
  'xultophy': 'https://www.drugs.com/comments/insulin-degludec-liraglutide/xultophy.html',
  'starlix': 'https://www.drugs.com/comments/nateglinide/starlix.html',
};

// Reddit search terms for all medications
const MEDICATION_REDDIT_TERMS: Record<string, { query: string; subreddits: string[] }> = {
  'humalog': { query: 'humalog insulin review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'novolog': { query: 'novolog novorapid review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'lantus': { query: 'lantus insulin review', subreddits: ['diabetes_t1', 'diabetes'] },
  'tresiba': { query: 'tresiba review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'fiasp': { query: 'fiasp review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'lyumjev': { query: 'lyumjev review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'basaglar': { query: 'basaglar review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'toujeo': { query: 'toujeo review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'levemir': { query: 'levemir review experience', subreddits: ['diabetes_t1', 'diabetes'] },
  'ozempic': { query: 'ozempic review experience', subreddits: ['diabetes', 'Ozempic'] },
  'metformin': { query: 'metformin review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'jardiance': { query: 'jardiance review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'farxiga': { query: 'farxiga dapagliflozin review', subreddits: ['diabetes', 'diabetes_t2'] },
  'invokana': { query: 'invokana canagliflozin review', subreddits: ['diabetes', 'diabetes_t2'] },
  'januvia': { query: 'januvia sitagliptin review', subreddits: ['diabetes', 'diabetes_t2'] },
  'tradjenta': { query: 'tradjenta linagliptin review', subreddits: ['diabetes', 'diabetes_t2'] },
  'trulicity': { query: 'trulicity review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'victoza': { query: 'victoza liraglutide review', subreddits: ['diabetes', 'diabetes_t2'] },
  'mounjaro': { query: 'mounjaro tirzepatide review', subreddits: ['diabetes', 'Mounjaro'] },
  'rybelsus': { query: 'rybelsus oral semaglutide review', subreddits: ['diabetes', 'diabetes_t2'] },
  'afrezza': { query: 'afrezza inhaled insulin review', subreddits: ['diabetes_t1', 'diabetes'] },
  'symlin': { query: 'symlin pramlintide review', subreddits: ['diabetes_t1', 'diabetes'] },
  'actos': { query: 'actos pioglitazone review', subreddits: ['diabetes', 'diabetes_t2'] },
  'glipizide': { query: 'glipizide review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'glimepiride': { query: 'glimepiride review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'onglyza': { query: 'onglyza saxagliptin review', subreddits: ['diabetes', 'diabetes_t2'] },
  'admelog': { query: 'admelog insulin review', subreddits: ['diabetes_t1', 'diabetes'] },
  'apidra': { query: 'apidra insulin review', subreddits: ['diabetes_t1', 'diabetes'] },
  'semglee': { query: 'semglee biosimilar review', subreddits: ['diabetes_t1', 'diabetes'] },
  'zepbound': { query: 'zepbound tirzepatide review', subreddits: ['diabetes', 'Mounjaro'] },
  'soliqua': { query: 'soliqua review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'xultophy': { query: 'xultophy review experience', subreddits: ['diabetes', 'diabetes_t2'] },
  'baqsimi': { query: 'baqsimi glucagon nasal review', subreddits: ['diabetes_t1', 'diabetes'] },
  'gvoke': { query: 'gvoke glucagon review', subreddits: ['diabetes_t1', 'diabetes'] },
};

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['love', 'amazing', 'great', 'excellent', 'works', 'helped', 'better', 'recommend', 'effective', 'game changer', 'life changing', 'wonderful', 'fantastic', 'improved', 'perfect', 'happy'];
  const negativeWords = ['hate', 'terrible', 'horrible', 'useless', 'failed', 'side effects', 'nausea', 'problem', 'issue', 'stopped working', 'awful', 'worst', 'pain', 'dangerous', 'disappointed', 'frustrated'];
  
  const lowerText = text.toLowerCase();
  let pos = 0, neg = 0;
  positiveWords.forEach(w => { if (lowerText.includes(w)) pos++; });
  negativeWords.forEach(w => { if (lowerText.includes(w)) neg++; });
  
  if (pos > neg + 1) return 'positive';
  if (neg > pos + 1) return 'negative';
  return 'neutral';
}

// Scrape Drugs.com reviews using Firecrawl markdown + regex parsing
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
        waitFor: 3000,
      }),
    });
    
    if (!response.ok) {
      console.error(`Firecrawl error for ${medicationName}: ${response.status}`);
      const errText = await response.text();
      console.error('Details:', errText);
      return [];
    }
    
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    console.log(`Got ${markdown.length} chars of markdown for ${medicationName}`);
    if (markdown.length < 100) {
      console.log('Markdown too short, likely blocked. Preview:', markdown.substring(0, 200));
      return [];
    }
    
    // Parse reviews from Drugs.com markdown format:
    // **For [Condition]** "[review text]"
    // X / 10
    const reviews: any[] = [];
    
    // Match pattern: **For Condition** "review text" followed by X / 10
    const reviewRegex = /\*\*For\s+(.+?)\*\*\s*"(.+?)"\s*\n\s*\n\s*(\d{1,2})\s*\/\s*10/gs;
    let match;
    
    while ((match = reviewRegex.exec(markdown)) !== null) {
      const condition = match[1].trim();
      const content = match[2].trim();
      const rating10 = parseInt(match[3]);
      
      if (content.length < 30 || rating10 < 1 || rating10 > 10) continue;
      
      const lower = content.toLowerCase();
      if (lower.includes('skip to') || lower.includes('cookie') || lower.includes('advertisement')) continue;
      
      const rating5 = Math.max(1, Math.min(5, Math.round((rating10 / 2))));
      const sentiment = rating10 >= 7 ? 'positive' : rating10 >= 4 ? 'neutral' : 'negative';
      
      // Try to extract date from context above the review
      const beforeMatch = markdown.substring(Math.max(0, match.index - 200), match.index);
      const dateMatch = beforeMatch.match(/([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/);
      
      reviews.push({
        title: `${medicationName} for ${condition}`,
        content: content.substring(0, 1000),
        rating: rating5,
        sentiment,
        source_url: url,
        source: 'drugs.com',
        author: 'Anonymous',
        published_at: dateMatch ? new Date(dateMatch[1]).toISOString() : null,
      });
    }
    
    console.log(`Parsed ${reviews.length} reviews for ${medicationName}`);
    return reviews.slice(0, 10);
  } catch (error) {
    console.error(`Error scraping Drugs.com for ${medicationName}:`, error);
    return [];
  }
}

// Fetch Reddit posts
async function fetchRedditPosts(subreddit: string, query: string, limit = 5): Promise<any[]> {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Support batch processing
    let startIndex = 0;
    let batchSize = 20;
    try {
      const body = await req.json();
      if (body.startIndex !== undefined) startIndex = body.startIndex;
      if (body.batchSize !== undefined) batchSize = Math.min(body.batchSize, 25);
    } catch {
      // No body, use defaults
    }

    console.log(`Starting medication reviews fetch (start: ${startIndex}, batch: ${batchSize})...`);

    const { data: medications, error: medsError } = await supabase
      .from('medications')
      .select('id, name, generic_name')
      .range(startIndex, startIndex + batchSize - 1);

    if (medsError) throw new Error(`Failed to fetch medications: ${medsError.message}`);
    console.log(`Processing ${medications?.length || 0} medications`);

    const platformReviews: any[] = [];
    const communityBuzz: any[] = [];
    let processedMeds = 0;

    for (const medication of medications || []) {
      const medNameLower = medication.name.toLowerCase();
      const genericLower = medication.generic_name?.toLowerCase() || '';

      // --- Drugs.com (platform reviews) ---
      let drugsComUrl: string | null = null;
      for (const [key, url] of Object.entries(MEDICATION_URLS)) {
        if (medNameLower.includes(key) || key.includes(medNameLower)) {
          drugsComUrl = url;
          break;
        }
      }

      if (drugsComUrl) {
        console.log(`Scraping Drugs.com for: ${medication.name}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const drugsReviews = await scrapeDrugsComReviews(medication.name, drugsComUrl);
        for (const review of drugsReviews) {
          platformReviews.push({
            medication_id: medication.id,
            source: 'drugs.com',
            external_id: `drugs_${medication.id}_${Math.random().toString(36).substr(2, 9)}`,
            author_anonymous: review.author || 'Anonymous User',
            title: review.title,
            content: review.content,
            // rating not in schema, skip
            sentiment: review.sentiment,
            helpful_count: 0,
            published_at: review.published_at || new Date().toISOString(),
            source_url: review.source_url,
          });
        }
      }

      // --- Reddit (community buzz) ---
      let redditConfig: { query: string; subreddits: string[] } | null = null;
      for (const [key, config] of Object.entries(MEDICATION_REDDIT_TERMS)) {
        if (medNameLower.includes(key) || key.includes(medNameLower)) {
          redditConfig = config;
          break;
        }
      }

      if (redditConfig) {
        console.log(`Fetching Reddit buzz for: ${medication.name}`);
        // Only search first subreddit to save time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const posts = await fetchRedditPosts(redditConfig.subreddits[0], redditConfig.query, 5);
        
        for (const post of posts) {
          const sentiment = analyzeSentiment(post.title + ' ' + post.content);
          
          // Reddit goes to community buzz table
          communityBuzz.push({
            medication_id: medication.id,
            source_platform: 'reddit',
            content: `${post.title}\n\n${post.content.substring(0, 800)}`,
            sentiment,
            source_url: post.permalink,
            upvotes: post.upvotes || 0,
            author_anonymous: post.author !== '[deleted]' ? `u/${post.author}` : 'Anonymous',
            published_at: new Date(post.created_utc * 1000).toISOString(),
          });
          
          // Also add to external_medication_reviews for backwards compatibility
          platformReviews.push({
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

      processedMeds++;
    }

    console.log(`Collected ${platformReviews.length} platform reviews, ${communityBuzz.length} community buzz`);

    // Insert platform reviews
    let insertedReviews = 0;
    const uniqueReviews = Array.from(new Map(platformReviews.map(r => [r.external_id, r])).values());
    for (const review of uniqueReviews) {
      const { error: insertError } = await supabase
        .from('external_medication_reviews')
        .insert(review);
      if (!insertError) insertedReviews++;
      else if (!insertError.message.includes('duplicate')) {
        console.error('Insert review error:', insertError.message);
      }
    }

    // Insert community buzz
    let insertedBuzz = 0;
    for (const buzz of communityBuzz) {
      const { error: insertError } = await supabase
        .from('medication_community_buzz')
        .insert(buzz);
      if (!insertError) insertedBuzz++;
      else if (!insertError.message.includes('duplicate')) {
        console.error('Insert buzz error:', insertError.message);
      }
    }

    console.log(`Inserted ${insertedReviews} reviews, ${insertedBuzz} buzz entries`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedMeds} medications: ${insertedReviews} reviews, ${insertedBuzz} buzz`,
        medicationsProcessed: processedMeds,
        reviewsInserted: insertedReviews,
        buzzInserted: insertedBuzz,
        nextStartIndex: startIndex + processedMeds,
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
