import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { checkRateLimit, rateLimitResponse, getClientIp } from '../_shared/rateLimiter.ts';

const FETCH_TIMEOUT_MS = 25_000;
function tfetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), FETCH_TIMEOUT_MS);
  return fetch(input, { ...init, signal: init.signal ?? c.signal }).finally(() => clearTimeout(t));
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    permalink: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

// C75: SHA-256 cryptographic hash (sync via subtle.digest) — collisions distribute uniformly.
async function anonymizeAuthor(author: string): Promise<string> {
  if (!author) return 'user_anon';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(author));
  return 'user_' + Array.from(new Uint8Array(buf)).slice(0, 4)
    .map(b => b.toString(16).padStart(2, '0')).join('');
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
    'dexcom': ['dexcom', 'g6', 'g7', 'stelo', 'dexcom one'],
    // C76: collapse insulet into omnipod (Insulet manufactures Omnipod)
    'omnipod': ['omnipod', 'pod 5', 'dash', 'omnipod 5', 'o5', 'insulet'],
    'tandem': ['tandem', 't:slim', 'tslim', 'control-iq', 'mobi', 'tandem mobi'],
    'medtronic': ['medtronic', '670g', '780g', 'minimed', '770g', 'guardian 4', 'guardian sensor', 'guardian'],
    'freestyle': ['freestyle', 'libre', 'libre 2', 'libre 3'],
    'eversense': ['eversense', 'implant sensor', 'senseonics'],
    'ilet': ['ilet', 'beta bionics', 'bionic pancreas'],
    'tidepool': ['tidepool', 'tidepool loop'],
    'ypsoloop': ['ypsopump', 'ypsoloop', 'ypsomed'],
    'inpen': ['inpen', 'companion medical', 'smart pen'],
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [device, keywords] of Object.entries(deviceKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return device;
    }
  }
  
  return null;
}

// C77: word-boundary sentiment with simple negation handling.
// Flips polarity of a sentiment word if preceded within 3 tokens by a negator.
const NEGATORS = new Set(['not', "don't", 'dont', 'never', 'no', 'cannot', "can't", 'cant', "won't", 'wont', "didn't", 'didnt', "doesn't", 'doesnt', "isn't", 'isnt', "wasn't", 'wasnt']);
const POS_WORDS = ['great','amazing','love','excellent','perfect','happy','good','best','awesome','solved','works','helped','success','recommend','wonderful','fantastic','reliable','smooth','accurate'];
const NEG_WORDS = ['terrible','awful','hate','worst','horrible','bad','disappointed','frustrated','angry','fail','broke','error','problem','issue','sucks','useless','unreliable','inaccurate','broken','crashed','defective'];

function analyzeSentiment(text: string): string {
  if (!text) return 'neutral';
  const tokens = text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
  let pos = 0, neg = 0;
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    const isPos = POS_WORDS.includes(word);
    const isNeg = NEG_WORDS.includes(word);
    if (!isPos && !isNeg) continue;
    // Look back up to 3 tokens for a negator
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (NEGATORS.has(tokens[j])) { negated = true; break; }
    }
    if (isPos) (negated ? neg : pos)++;
    if (isNeg) (negated ? pos : neg)++;
  }
  const total = pos + neg;
  if (total < 2) return 'neutral';
  if (pos > neg * 1.5) return 'positive';
  if (neg > pos * 1.5) return 'negative';
  return 'neutral';
}

// C78: word-boundary topic detection (was substring matching — 'low' caught 'follow', 'plow', etc.)
function escRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
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
    // NEW CATEGORIES
    'parenting': ['parent', 'child', 'kid', 'pediatric', 'school', 'daycare', 'caregiver', 'babysitter', 'son', 'daughter', 'teen', 'toddler', 'school nurse'],
    'athletics': ['athlete', 'marathon', 'triathlon', 'swimming', 'competition', 'race', 'training', 'ironman', 'crossfit', 'soccer', 'basketball', 'football'],
    'keto': ['keto', 'ketogenic', 'low carb', 'carnivore', 'paleo', 'fasting', 'intermittent fasting', 'bernstein', 'carb restriction'],
    'burnout': ['burnout', 'exhausted', 'overwhelmed', 'giving up', 'tired of diabetes', 'mental load', 'chronic illness fatigue', 'diabetes distress'],
    'regional': ['nhs', 'medicare', 'ndss', 'bulk bill', 'insulin cap', 'healthcare system', 'universal healthcare', 'canadian pharmacy', 'uk healthcare'],
    'college': ['college', 'university', 'dorm', 'freshman', 'roommate', 'campus', 'dining hall', 'student health'],
    'workplace': ['work', 'job', 'office', 'employer', 'hr', 'disability', 'accommodations', 'desk job', 'coworker'],
    'dating': ['dating', 'relationship', 'partner', 'spouse', 'marriage', 'intimacy', 'telling someone', 'first date'],
  };

  const lowerText = text.toLowerCase();
  const detectedTopics: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const hit = keywords.some(k => {
      // For multi-word phrases keep substring; for single short tokens require word boundary.
      if (k.includes(' ') || k.length <= 2) return lowerText.includes(k);
      return new RegExp(`\\b${escRe(k)}\\b`, 'i').test(lowerText);
    });
    if (hit) detectedTopics.push(topic);
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
      const response = await tfetch(url, { headers });
      
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
      const response = await tfetch(url, { headers });
      
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

    // Focused subreddit list - active T1D communities only (avoids rate limiting from 60+ subs)
    const subreddits = [
      // Core T1D Communities (high-traffic, reliable)
      'diabetes',
      'dexcom',
      'omnipod',
      'diabetes_t1',
      'Type1Diabetes',
      'InsulinPumps',
      'cgm',
      'tandemdiabetes',
      'FreeStyleLibre',
      'T1D',
      // Device & Tech
      'diabetes_tech',
      'loopkit',
      'AndroidAPS',
      // Support
      'diabetes_t2',
      'lada',
    ];
    
    const allPosts: any[] = [];
    const allReplies: any[] = [];
    // C79: hoist seenIds across all subreddits so cross-posts (same id in multiple subs) only ingest once.
    const seenIds = new Set<string>();

    // Fetch new and top posts from each subreddit
    for (const subreddit of subreddits) {
      const newPosts = await fetchRedditPosts(subreddit, 25, 'new');
      const topPosts = await fetchRedditPosts(subreddit, 15, 'top');
      // Skip hot - mostly overlaps with top/new
      const hotPosts: RedditPost[] = [];
      
      const combinedPosts = [...newPosts, ...topPosts, ...hotPosts];
      
      for (const post of combinedPosts) {
        const postData = post.data;
        
        // Skip duplicates
        if (seenIds.has(postData.id)) continue;
        seenIds.add(postData.id);
        
        // Extended: Accept posts up to 30 days old
        const postAge = Date.now() / 1000 - postData.created_utc;
        if (postAge > 30 * 24 * 60 * 60) continue;
        
        if (!postData.title && !postData.selftext) continue;
        
        const fullText = `${postData.title} ${postData.selftext}`;
        const cleanedTitle = stripPII(postData.title);
        const cleanedContent = stripPII(postData.selftext);
        const anonymizedAuthor = await anonymizeAuthor(postData.author);
        const deviceMentioned = detectDeviceMention(fullText);
        const sentiment = analyzeSentiment(fullText);
        const topics = detectTopics(fullText);
        const isSolution = isSolutionPost(fullText);
        
        // Build the URL for the original post
        const postUrl = postData.permalink 
          ? `https://www.reddit.com${postData.permalink}`
          : `https://www.reddit.com/r/${subreddit}/comments/${postData.id}`;
        
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
          url: postUrl,
        };
        
        allPosts.push(processedPost);
        
        // Fetch comments for high-engagement posts
        if (postData.num_comments > 10 && postData.score > 20) {
          const comments = await fetchTopComments(subreddit, postData.id, 3);
          
          for (const comment of comments) {
            const commentFullText = comment.body;
            const commentTopics = detectTopics(commentFullText);
            const commentIsSolution = isSolutionPost(commentFullText);
            
            // Build the URL for the comment
            const commentUrl = postData.permalink 
              ? `https://www.reddit.com${postData.permalink}${comment.id}`
              : `https://www.reddit.com/r/${subreddit}/comments/${postData.id}/_/${comment.id}`;
            
            const processedReply = {
              source: `r/${subreddit}`,
              post_id: `${postData.id}_${comment.id}`,
              title: `Re: ${cleanedTitle.substring(0, 100)}`,
              content: stripPII(comment.body),
              author_anonymous: await anonymizeAuthor(comment.author),
              score: comment.score,
              num_comments: 0,
              device_mentioned: detectDeviceMention(commentFullText),
              sentiment: analyzeSentiment(commentFullText),
              published_at: new Date(comment.created_utc * 1000).toISOString(),
              topic_tags: commentTopics,
              is_solution: commentIsSolution,
              post_type: 'reply',
              parent_post_id: postData.id,
              url: commentUrl,
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

    // Extended retention: Clean up old posts (older than 60 days)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .lt('published_at', sixtyDaysAgo);

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
