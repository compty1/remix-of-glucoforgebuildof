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

// Scrape Drugs.com reviews - now supports pagination (pages 1-5)
async function scrapeDrugsComReviews(medicationName: string, baseUrl: string, maxPages = 5): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];
  
  const allReviews: any[] = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      // Drugs.com pagination: ?page=2, ?page=3, etc.
      const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
      console.log(`Scraping Drugs.com page ${page} for ${medicationName}: ${url}`);
      
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
        console.error(`Firecrawl error for ${medicationName} page ${page}: ${response.status}`);
        await response.text();
        break; // Stop pagination on error
      }
      
      const data = await response.json();
      const markdown = data.data?.markdown || data.markdown || '';
      if (markdown.length < 100) {
        console.log(`Page ${page} too short for ${medicationName}, stopping pagination`);
        break;
      }
      
      const reviewRegex = /\*\*For\s+(.+?)\*\*\s*"(.+?)"\s*\n\s*\n\s*(\d{1,2})\s*\/\s*10/gs;
      let match;
      let pageCount = 0;
      
      while ((match = reviewRegex.exec(markdown)) !== null) {
        const condition = match[1].trim();
        const content = match[2].trim();
        const rating10 = parseInt(match[3]);
        
        if (content.length < 30 || rating10 < 1 || rating10 > 10) continue;
        const lower = content.toLowerCase();
        if (lower.includes('skip to') || lower.includes('cookie') || lower.includes('advertisement')) continue;
        
        const rating5 = Math.max(1, Math.min(5, Math.round((rating10 / 2))));
        const sentiment = rating10 >= 7 ? 'positive' : rating10 >= 4 ? 'neutral' : 'negative';
        
        const beforeMatch = markdown.substring(Math.max(0, match.index - 200), match.index);
        const dateMatch = beforeMatch.match(/([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/);
        
        allReviews.push({
          title: `${medicationName} for ${condition}`,
          content: content.substring(0, 1000),
          rating: rating5,
          sentiment,
          source_url: url,
          source: 'drugs.com',
          author: 'Anonymous',
          published_at: dateMatch ? new Date(dateMatch[1]).toISOString() : null,
        });
        pageCount++;
      }
      
      console.log(`Page ${page}: parsed ${pageCount} reviews for ${medicationName}`);
      if (pageCount === 0) break; // No more reviews on this page
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping page ${page} for ${medicationName}:`, error);
      break;
    }
  }
  
  console.log(`Total Drugs.com reviews for ${medicationName}: ${allReviews.length}`);
  return allReviews;
}

// Fetch Reddit posts via Firecrawl search
async function fetchRedditPosts(query: string, limit = 8): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  try {
    const searchQuery = `site:reddit.com ${query}`;
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

    const REDDIT_JUNK = [
      'skip to main content', 'skip to navigation', 'cookie policy',
      'go to main content', 'javascript is disabled', 'accept cookies',
      'privacy policy', 'terms of service', 'advertisement',
    ];

    return results
      .filter((r: any) => {
        const url = r.url || '';
        const content = r.markdown || r.description || '';
        if (!url.includes('reddit.com') || content.length < 80) return false;
        const lower = content.substring(0, 500).toLowerCase();
        return !REDDIT_JUNK.some(m => lower.includes(m));
      })
      .map((r: any) => {
        let content = (r.markdown || r.description || '').substring(0, 1000);
        content = content.replace(/^.*?(Skip to|Go to).*?\n/gi, '');
        const cleaned = content
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/#{1,6}\s*/g, '')
          .replace(/\*{1,3}/g, '')
          .trim();

        return {
          id: r.url?.split('/').filter(Boolean).pop() || Math.random().toString(36).substr(2, 9),
          title: (r.title || '').replace(/ : .+$/, '').substring(0, 200),
          content: cleaned.substring(0, 800),
          author: 'Reddit User',
          upvotes: 0,
          permalink: r.url || '',
          subreddit: (r.url?.match(/reddit\.com\/r\/([^/]+)/) || [])[1] || 'diabetes',
        };
      });
  } catch (error) {
    console.error('Firecrawl Reddit search error:', error);
    return [];
  }
}

// Web search for additional consumer review sources (WebMD, Healthline, etc.)
async function fetchWebConsumerReviews(medicationName: string, limit = 10): Promise<any[]> {
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlKey) return [];

  try {
    const searchQuery = `"${medicationName}" review experience diabetes site:webmd.com OR site:healthline.com OR site:verywellhealth.com OR site:everydayhealth.com`;
    console.log(`Web consumer search for ${medicationName}`);

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
      await response.text();
      return [];
    }

    const data = await response.json();
    const results = data.data || [];

    return results
      .filter((r: any) => {
        const content = r.markdown || r.description || '';
        return content.length > 100;
      })
      .map((r: any) => {
        const rawContent = r.markdown || r.description || '';
        const cleaned = rawContent
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/#{1,6}\s*/g, '')
          .replace(/\*{1,3}/g, '')
          .trim()
          .substring(0, 1000);
        const url = r.url || '';
        let source = 'web';
        if (url.includes('webmd.com')) source = 'webmd';
        else if (url.includes('healthline.com')) source = 'healthline';
        else if (url.includes('verywellhealth.com')) source = 'verywellhealth';
        else if (url.includes('everydayhealth.com')) source = 'everydayhealth';

        return {
          title: (r.title || '').replace(/ - .+$/, '').replace(/ \| .+$/, '').substring(0, 200) || `${medicationName} Review`,
          content: cleaned,
          sentiment: analyzeSentiment(cleaned),
          source_url: url,
          source,
          author: `${source} reviewer`,
        };
      });
  } catch (error) {
    console.error(`Web consumer search error for ${medicationName}:`, error);
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

      // --- Drugs.com (platform reviews) with pagination ---
      let drugsComUrl: string | null = null;
      for (const [key, url] of Object.entries(MEDICATION_URLS)) {
        if (medNameLower.includes(key) || key.includes(medNameLower)) {
          drugsComUrl = url;
          break;
        }
      }

      if (drugsComUrl) {
        console.log(`Scraping Drugs.com (pages 1-5) for: ${medication.name}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const drugsReviews = await scrapeDrugsComReviews(medication.name, drugsComUrl, 5);
        for (const review of drugsReviews) {
          platformReviews.push({
            medication_id: medication.id,
            source: 'drugs.com',
            external_id: `drugs_${medication.id}_${Math.random().toString(36).substr(2, 9)}`,
            author_anonymous: review.author || 'Anonymous User',
            title: review.title,
            content: review.content,
            sentiment: review.sentiment,
            helpful_count: 0,
            published_at: review.published_at || new Date().toISOString(),
            source_url: review.source_url,
          });
        }
      }

      // --- Web consumer reviews (WebMD, Healthline, etc.) ---
      await new Promise(resolve => setTimeout(resolve, 1000));
      const webReviews = await fetchWebConsumerReviews(medication.name, 10);
      for (const review of webReviews) {
        platformReviews.push({
          medication_id: medication.id,
          source: review.source,
          external_id: `web_${medication.id}_${review.source}_${Math.random().toString(36).substr(2, 9)}`,
          author_anonymous: review.author || 'Anonymous',
          title: review.title,
          content: review.content,
          sentiment: review.sentiment,
          helpful_count: 0,
          published_at: new Date().toISOString(),
          source_url: review.source_url,
        });
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        const posts = await fetchRedditPosts(redditConfig.query, 8);
        
        for (const post of posts) {
          const sentiment = analyzeSentiment(post.title + ' ' + post.content);
          const now = new Date().toISOString();
          
          communityBuzz.push({
            medication_id: medication.id,
            source: 'reddit',
            post_content: `${post.title}\n\n${post.content.substring(0, 800)}`,
            sentiment,
            post_url: post.permalink,
            engagement_score: post.upvotes || 0,
            author_handle: post.author || 'Reddit User',
            post_date: now,
          });
          
          platformReviews.push({
            medication_id: medication.id,
            source: 'reddit',
            external_id: `reddit_${post.id}`,
            author_anonymous: post.author || 'Reddit User',
            title: post.title.substring(0, 200),
            content: post.content.substring(0, 1000),
            sentiment,
            helpful_count: post.upvotes || 0,
            published_at: now,
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
