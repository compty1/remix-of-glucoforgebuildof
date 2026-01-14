import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting config
const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60000;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    subreddit: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

function anonymizeAuthor(author: string): string {
  // Create a simple hash of the author name for anonymization
  let hash = 0;
  for (let i = 0; i < author.length; i++) {
    const char = author.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `user_${Math.abs(hash)}`;
}

function stripPII(text: string): string {
  if (!text) return '';
  
  // Remove potential PII patterns
  let cleaned = text
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    // Remove phone numbers (various formats)
    .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone]')
    // Remove social security numbers
    .replace(/\d{3}-\d{2}-\d{4}/g, '[ssn]')
    // Remove potential usernames starting with @
    .replace(/@[a-zA-Z0-9_]+/g, '[username]')
    // Remove URLs (keep domain for context but remove full paths)
    .replace(/https?:\/\/[^\s]+/g, '[url]');
    
  return cleaned;
}

function detectDeviceMention(text: string): string | null {
  const deviceKeywords = {
    'dexcom': ['dexcom', 'g6', 'g7', 'cgm'],
    'omnipod': ['omnipod', 'pod', 'tubeless'],
    'tandem': ['tandem', 't:slim', 'tslim', 'control-iq'],
    'medtronic': ['medtronic', '670g', '780g', 'minimed'],
    'freestyle': ['freestyle', 'libre', 'abbott']
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [device, keywords] of Object.entries(deviceKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return device;
    }
  }
  
  return null;
}

function analyzeSentiment(text: string): string {
  const positiveWords = ['great', 'amazing', 'love', 'excellent', 'perfect', 'happy', 'good', 'best', 'awesome'];
  const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'horrible', 'bad', 'disappointed', 'frustrated', 'angry'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

async function fetchRedditPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
  try {
    console.log(`Fetching posts from r/${subreddit}`);
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`, {
      headers: {
        'User-Agent': 'GlucoForge/1.0.0 (Diabetes Community Research Tool)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
    }
    
    const data: RedditResponse = await response.json();
    console.log(`Successfully fetched ${data.data.children.length} posts from r/${subreddit}`);
    return data.data.children;
  } catch (error) {
    console.error(`Error fetching from r/${subreddit}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting community feed fetch process');

    // Define subreddits to monitor - Enhanced with more sources
    const subreddits = [
      'diabetes', 
      'dexcom', 
      'omnipod', 
      'diabetes_t1', 
      'diabetes_t2',
      'Type1Diabetes',
      'InsulinPumps',
      'cgm',
      'tandemdiabetes',
      'medtronicdiabetes'
    ];
    const allPosts: any[] = [];

    // Fetch posts from each subreddit
    for (const subreddit of subreddits) {
      const posts = await fetchRedditPosts(subreddit, 50);
      
      for (const post of posts) {
        const postData = post.data;
        
        // Skip posts that are too old (older than 7 days)
        const postAge = Date.now() / 1000 - postData.created_utc;
        if (postAge > 7 * 24 * 60 * 60) continue;
        
        // Skip posts without meaningful content
        if (!postData.title && !postData.selftext) continue;
        
        // Process and clean the post data
        const cleanedTitle = stripPII(postData.title);
        const cleanedContent = stripPII(postData.selftext);
        const anonymizedAuthor = anonymizeAuthor(postData.author);
        const deviceMentioned = detectDeviceMention(`${postData.title} ${postData.selftext}`);
        const sentiment = analyzeSentiment(`${postData.title} ${postData.selftext}`);
        
        const processedPost = {
          source: `r/${subreddit}`,
          post_id: postData.id,
          title: cleanedTitle,
          content: cleanedContent || null,
          author_anonymous: anonymizedAuthor,
          score: postData.score,
          num_comments: postData.num_comments,
          device_mentioned: deviceMentioned,
          sentiment: sentiment,
          published_at: new Date(postData.created_utc * 1000).toISOString(),
        };
        
        allPosts.push(processedPost);
      }
    }

    console.log(`Processing ${allPosts.length} posts for database insertion`);

    // Insert or update posts in the database
    let insertedCount = 0;
    let skippedCount = 0;

    for (const post of allPosts) {
      const { error } = await supabase
        .from('community_posts')
        .upsert(post, { onConflict: 'source,post_id' });

      if (error) {
        console.error('Error inserting post:', error);
        skippedCount++;
      } else {
        insertedCount++;
      }
    }

    // Clean up old posts (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .lt('published_at', thirtyDaysAgo);

    if (deleteError) {
      console.error('Error cleaning up old posts:', deleteError);
    }

    const result = {
      success: true,
      message: `Processed ${allPosts.length} posts`,
      inserted: insertedCount,
      skipped: skippedCount,
      subreddits_monitored: subreddits,
      timestamp: new Date().toISOString(),
    };

    console.log('Community feed fetch completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in community-feed function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
