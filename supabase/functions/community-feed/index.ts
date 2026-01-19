import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
  let hash = 0;
  for (let i = 0; i < author.length; i++) {
    const char = author.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash)}`;
}

function stripPII(text: string): string {
  if (!text) return '';
  
  let cleaned = text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone]')
    .replace(/\d{3}-\d{2}-\d{4}/g, '[ssn]')
    .replace(/@[a-zA-Z0-9_]+/g, '[username]')
    .replace(/https?:\/\/[^\s]+/g, '[url]');
    
  return cleaned;
}

function detectDeviceMention(text: string): string | null {
  const deviceKeywords = {
    'dexcom': ['dexcom', 'g6', 'g7'],
    'omnipod': ['omnipod', 'pod 5', 'dash'],
    'tandem': ['tandem', 't:slim', 'tslim', 'control-iq', 'mobi'],
    'medtronic': ['medtronic', '670g', '780g', 'minimed'],
    'freestyle': ['freestyle', 'libre', 'libre 2', 'libre 3'],
    'guardian': ['guardian', 'guardian 4'],
    'eversense': ['eversense', 'implant sensor'],
    'insulet': ['insulet'],
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
  const positiveWords = ['great', 'amazing', 'love', 'excellent', 'perfect', 'happy', 'good', 'best', 'awesome', 'finally', 'solved', 'works', 'helped', 'success', 'recommend', 'wonderful', 'fantastic', 'reliable'];
  const negativeWords = ['terrible', 'awful', 'hate', 'worst', 'horrible', 'bad', 'disappointed', 'frustrated', 'angry', 'fail', 'broke', 'error', 'problem', 'issue', 'sucks', 'useless', 'unreliable', 'inaccurate'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Enhanced topic detection
function detectTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'glucose_lows': ['low', 'hypo', 'hypoglycemia', 'crash', 'dropping', 'shaking', 'sweating', 'below 70', 'below 80'],
    'glucose_highs': ['high', 'spike', 'hyperglycemia', 'stubborn', 'correction', 'resistant', 'above 200', 'above 300', 'stuck high'],
    'morning': ['morning', 'dawn', 'dawn phenomenon', 'wake', 'overnight', 'fasting', '6am', '7am', 'feet on floor'],
    'exercise': ['exercise', 'workout', 'gym', 'running', 'walk', 'sport', 'cardio', 'weight', 'active', 'swimming', 'cycling', 'hiking'],
    'food': ['carb', 'carbs', 'food', 'meal', 'pizza', 'bolus', 'eating', 'protein', 'fat', 'fiber', 'restaurant', 'snack'],
    'devices': ['sensor', 'pump', 'cgm', 'site', 'insertion', 'calibration', 'reading', 'accuracy', 'adhesive', 'patch'],
    'travel': ['travel', 'fly', 'flying', 'airport', 'tsa', 'vacation', 'time zone', 'supplies', 'packing'],
    'emotional': ['burnout', 'frustrated', 'tired', 'anxiety', 'mental', 'stress', 'overwhelming', 'exhausted', 'depression', 'support'],
    'nighttime': ['night', 'nighttime', 'sleep', 'sleeping', 'overnight', 'alarm', '3am', 'bedtime', 'basal'],
    'tech': ['loop', 'diy', 'openaps', 'nightscout', 'xdrip', 'aaps', 'algorithm', 'closed loop', 'automated'],
    'insurance': ['insurance', 'coverage', 'cost', 'expensive', 'affordable', 'prior auth', 'pharmacy', 'supplies'],
    'pregnancy': ['pregnancy', 'pregnant', 'baby', 'gestational', 'fertility', 'a1c goal'],
  };
  
  const lowerText = text.toLowerCase();
  const detectedTopics: string[] = [];
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(k => lowerText.includes(k))) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics;
}

// Detect if post contains a solution
function isSolutionPost(text: string): boolean {
  const solutionIndicators = [
    'finally solved', 'what worked', 'here\'s how', 'fixed it', 'solution was',
    'i found that', 'trick is', 'my advice', 'pro tip', 'game changer',
    'what helped me', 'this worked', 'try this', 'figured out', 'the answer',
    'resolved by', 'fixed by', 'helped me', 'success with', 'recommend'
  ];
  
  const lowerText = text.toLowerCase();
  return solutionIndicators.some(indicator => lowerText.includes(indicator));
}

async function fetchRedditPosts(subreddit: string, limit: number = 50, sort: string = 'new'): Promise<RedditPost[]> {
  // Enhanced headers to mimic browser requests
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };

  // Try multiple endpoints - old.reddit.com is often less restrictive
  const urls = [
    `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
    `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`,
  ];

  for (const url of urls) {
    try {
      console.log(`Trying to fetch from: ${url}`);
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data: RedditResponse = await response.json();
        console.log(`Successfully fetched ${data.data.children.length} posts from r/${subreddit}`);
        return data.data.children;
      }
      console.log(`${url} returned ${response.status}, trying next...`);
    } catch (error) {
      console.log(`Failed with ${url}, trying next...`);
    }
  }
  
  console.error(`All endpoints failed for r/${subreddit}`);
  return [];
}

// Fetch top comments from a post
async function fetchTopComments(subreddit: string, postId: string, limit: number = 5): Promise<any[]> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  const urls = [
    `https://old.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`,
    `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (!data[1]?.data?.children) continue;
      
      return data[1].data.children
        .filter((c: any) => c.kind === 't1' && c.data.body && c.data.score > 5)
        .slice(0, limit)
        .map((c: any) => ({
          id: c.data.id,
          body: c.data.body,
          score: c.data.score,
          author: c.data.author,
          created_utc: c.data.created_utc,
        }));
    } catch (error) {
      continue;
    }
  }
  
  return [];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log('Starting enhanced community feed fetch process');

    // Expanded subreddit list
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
      'medtronicdiabetes',
      'lada',
      'FreeStyleLibre',
      'loopkit',
      'AndroidAPS',
      'Nightscout'
    ];
    
    const allPosts: any[] = [];
    const allReplies: any[] = [];

    // Fetch both new and top posts from each subreddit
    for (const subreddit of subreddits) {
      // Fetch new posts
      const newPosts = await fetchRedditPosts(subreddit, 30, 'new');
      // Fetch top posts from past week
      const topPosts = await fetchRedditPosts(subreddit, 20, 'top');
      
      const combinedPosts = [...newPosts, ...topPosts];
      const seenIds = new Set<string>();
      
      for (const post of combinedPosts) {
        const postData = post.data;
        
        // Skip duplicates
        if (seenIds.has(postData.id)) continue;
        seenIds.add(postData.id);
        
        // Skip posts older than 14 days
        const postAge = Date.now() / 1000 - postData.created_utc;
        if (postAge > 14 * 24 * 60 * 60) continue;
        
        if (!postData.title && !postData.selftext) continue;
        
        const fullText = `${postData.title} ${postData.selftext}`;
        const cleanedTitle = stripPII(postData.title);
        const cleanedContent = stripPII(postData.selftext);
        const anonymizedAuthor = anonymizeAuthor(postData.author);
        const deviceMentioned = detectDeviceMention(fullText);
        const sentiment = analyzeSentiment(fullText);
        const topics = detectTopics(fullText);
        const isSolution = isSolutionPost(fullText);
        
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
          topic_tags: topics,
          is_solution: isSolution,
          post_type: 'post',
          parent_post_id: null,
        };
        
        allPosts.push(processedPost);
        
        // Fetch comments for high-engagement posts
        if (postData.num_comments > 10 && postData.score > 20) {
          const comments = await fetchTopComments(subreddit, postData.id, 3);
          
          for (const comment of comments) {
            const commentFullText = comment.body;
            const commentTopics = detectTopics(commentFullText);
            const commentIsSolution = isSolutionPost(commentFullText);
            
            const processedReply = {
              source: `r/${subreddit}`,
              post_id: `${postData.id}_${comment.id}`,
              title: `Re: ${cleanedTitle.substring(0, 100)}`,
              content: stripPII(comment.body),
              author_anonymous: anonymizeAuthor(comment.author),
              score: comment.score,
              num_comments: 0,
              device_mentioned: detectDeviceMention(commentFullText),
              sentiment: analyzeSentiment(commentFullText),
              published_at: new Date(comment.created_utc * 1000).toISOString(),
              topic_tags: commentTopics,
              is_solution: commentIsSolution,
              post_type: 'reply',
              parent_post_id: postData.id,
            };
            
            allReplies.push(processedReply);
          }
        }
      }
      
      // Small delay between subreddits to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Processing ${allPosts.length} posts and ${allReplies.length} replies for database insertion`);

    // Combine posts and replies
    const allItems = [...allPosts, ...allReplies];
    
    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of allItems) {
      const { error } = await supabase
        .from('community_posts')
        .upsert(item, { onConflict: 'source,post_id' });

      if (error) {
        console.error('Error inserting item:', error);
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
      message: `Processed ${allItems.length} items (${allPosts.length} posts, ${allReplies.length} replies)`,
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
