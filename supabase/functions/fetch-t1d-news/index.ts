import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  published_at: string | null;
  category: string;
  relevance_score: number;
  is_featured: boolean;
}

function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('research') || text.includes('study') || text.includes('trial') || text.includes('scientist')) {
    return 'research';
  }
  if (text.includes('cgm') || text.includes('pump') || text.includes('device') || text.includes('app') || text.includes('technology') || text.includes('monitor')) {
    return 'technology';
  }
  if (text.includes('treatment') || text.includes('therapy') || text.includes('drug') || text.includes('insulin') || text.includes('medication')) {
    return 'treatment';
  }
  if (text.includes('diet') || text.includes('exercise') || text.includes('lifestyle') || text.includes('living with') || text.includes('manage')) {
    return 'lifestyle';
  }
  if (text.includes('advocacy') || text.includes('community') || text.includes('awareness') || text.includes('support') || text.includes('fundrais')) {
    return 'advocacy';
  }
  return 'general';
}

function calculateRelevanceScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 50;
  
  // High relevance keywords
  if (text.includes('type 1 diabetes') || text.includes('t1d')) score += 30;
  if (text.includes('breakthrough') || text.includes('cure')) score += 20;
  if (text.includes('fda') || text.includes('approved')) score += 15;
  if (text.includes('clinical trial')) score += 10;
  
  return Math.min(score, 100);
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return 'Unknown';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Search queries for comprehensive T1D news coverage
    const searchQueries = [
      'type 1 diabetes news latest',
      'T1D treatment breakthrough',
      'diabetes technology CGM insulin pump',
      'juvenile diabetes research',
      'artificial pancreas closed loop',
    ];

    const allArticles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    console.log('Starting T1D news fetch with Firecrawl...');

    for (const query of searchQueries) {
      try {
        console.log(`Searching for: ${query}`);
        
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: 10,
            lang: 'en',
            tbs: 'qdr:w', // Last week
            scrapeOptions: {
              formats: ['markdown'],
            },
          }),
        });

        if (!response.ok) {
          console.error(`Firecrawl search failed for "${query}":`, response.status);
          continue;
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          for (const result of data.data) {
            if (seenUrls.has(result.url)) continue;
            seenUrls.add(result.url);

            const title = result.title || 'Untitled';
            const description = result.description || result.markdown?.substring(0, 300) || '';
            
            // Extract image from metadata or content
            let imageUrl = result.metadata?.ogImage || result.metadata?.image || null;
            
            // Try to find image in markdown content
            if (!imageUrl && result.markdown) {
              const imgMatch = result.markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
              if (imgMatch) {
                imageUrl = imgMatch[1];
              }
            }

            const article: NewsArticle = {
              title,
              description: description.substring(0, 500),
              content: result.markdown?.substring(0, 2000) || null,
              url: result.url,
              image_url: imageUrl,
              source_name: extractDomain(result.url),
              source_url: new URL(result.url).origin,
              author: result.metadata?.author || null,
              published_at: result.metadata?.publishedTime || null,
              category: categorizeArticle(title, description),
              relevance_score: calculateRelevanceScore(title, description),
              is_featured: false,
            };

            allArticles.push(article);
          }
        }
      } catch (err) {
        console.error(`Error searching for "${query}":`, err);
      }
    }

    console.log(`Found ${allArticles.length} unique articles`);

    // Sort by relevance and mark top 3 as featured
    allArticles.sort((a, b) => b.relevance_score - a.relevance_score);
    allArticles.slice(0, 3).forEach(article => {
      article.is_featured = true;
    });

    // Upsert articles to database
    if (allArticles.length > 0) {
      const { error: upsertError } = await supabase
        .from('t1d_news_articles')
        .upsert(allArticles, { 
          onConflict: 'url',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting articles:', upsertError);
        throw upsertError;
      }
    }

    // Fetch all articles from database
    const { data: newsData, error: fetchError } = await supabase
      .from('t1d_news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Returning ${newsData?.length || 0} articles`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: newsData,
        fetched: allArticles.length,
        message: `Successfully fetched ${allArticles.length} new articles`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-t1d-news:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
