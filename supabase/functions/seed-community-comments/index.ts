import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Topic-specific comment pools
const commentsByTopic: Record<string, string[]> = {
  glucose_lows: [
    "The 15-15 rule changed everything for me. 15g carbs, wait 15 minutes. No more overcorrecting!",
    "Glucose tabs are way more predictable than juice. Each tab is exactly 4g carbs.",
    "I keep emergency snacks literally everywhere - car, gym bag, office desk, nightstand.",
    "For nighttime lows, a small glass of milk works better than pure sugar - the protein helps sustain.",
    "Reducing basal 2 hours before exercise instead of just during helped me avoid post-workout lows.",
    "Hypoglycemia unawareness is real and scary. Keeping BG above 80 for 2 weeks helped restore my awareness.",
    "I treat at 80 now instead of waiting until I'm actually low. Prevention beats correction every time.",
    "The shaky hands before a low are my early warning system. Learned to trust those subtle signs.",
    "My endo suggested Baqsimi nasal glucagon for emergencies - way easier than mixing a kit during a severe low.",
    "Compression lows from sleeping on my CGM arm had me overtreating for months before I figured it out.",
    "I found that liquid glucose works faster than tablets for me. Everyone's different though.",
    "Setting my low alert to 80 instead of 70 gives me much more time to treat before symptoms hit.",
    "After a low, I wait the full 15 minutes before eating more. Hard to do but prevents the rebound high.",
    "My kids know where my glucose tabs are and what to do. Teaching them was the best safety decision.",
    "Post-exercise lows can hit 6-12 hours later. I reduce overnight basal by 20% on gym days.",
  ],
  glucose_highs: [
    "Rage bolusing never works for me. Small corrections every 2-3 hours are way more effective.",
    "Check for bubbles in your tubing! I had mysterious highs for a week before spotting the air pocket.",
    "Stress highs are real. 5-minute breathing exercises actually help bring my BG down.",
    "If you're high and don't come down with a correction, your infusion site might be bad. Change it!",
    "Walking for 15 minutes after a meal prevents so many spikes. I do laps around my office now.",
    "Dawn phenomenon hit me hard until I adjusted my basal between 4-7am. Worth the effort to fine-tune.",
    "Stubborn highs above 300 - I always check ketones first. If positive, drink water and call the endo.",
    "I found that eating protein and veggies first, then carbs, reduces my post-meal spike significantly.",
    "Pre-bolusing 15-20 minutes before eating was the single biggest improvement to my post-meal numbers.",
    "Dehydration makes highs worse. I aim for 8+ glasses of water daily, especially when running high.",
    "Site rotation is crucial. I was injecting in the same spot and getting inconsistent absorption.",
    "A 10-minute walk after dinner brings my post-meal spike down by 30-50 mg/dL consistently.",
    "I discovered my morning coffee was spiking me even black. Now I bolus a unit for it.",
    "Extended bolus for high-fat meals was a game changer. Pizza no longer ruins my entire night.",
  ],
  devices: [
    "Using Skin Tac before applying helps my sensor stick for the full wear period. Total game changer!",
    "The first 24 hours of any new sensor are always a bit off for me. I wait before fully trusting readings.",
    "My endo said to only calibrate when BG is stable, not rising or falling. Made a big difference.",
    "I overlay with Simpatch and it survives swimming, showering, everything. Highly recommend.",
    "Back of the arm is the best placement for me - less compression lows and fewer snags on doorframes.",
    "If your sensor is reading wildly off, try removing and reinserting the transmitter before replacing.",
    "I use a product called Mastisol for adhesion - even better than Skin Tac in my experience.",
    "Customer service will replace failed sensors. Always call - they track patterns in production batches.",
    "The warm-up period used to stress me out. Now I start the new sensor while the old one is still running.",
    "Keep sensors at room temperature before inserting. Cold sensors seem to be less accurate initially.",
    "I mark my rotation sites on a body diagram so I don't reuse the same spot too soon.",
    "For people with sensitive skin, try Flonase spray on the site before applying. Reduces irritation.",
    "Auto-mode algorithms take 2+ weeks to learn your patterns. Be patient during the adjustment period.",
    "Always carry a backup meter and strips. Technology fails at the worst possible moments.",
  ],
  cgm: [
    "Compression lows are so common at night. Switching to my abdomen fixed most of the false alerts.",
    "I use the Dexcom follow app so my partner can see my readings. Peace of mind for both of us.",
    "Libre reads interstitial fluid, so it lags finger sticks by 10-15 min. Don't make decisions during rapid changes.",
    "If your sensor falls off early, contact the manufacturer. They almost always send a replacement.",
    "G7's 30-minute warmup is such an improvement over G6's 2 hours. Small things make a big difference.",
    "The urgent low soon alarm has literally saved me multiple times. Never silence it!",
    "Accuracy improves after the first day. I always compare to finger sticks on day 1.",
    "I learned to look at the trend arrow, not just the number. A flat 120 is very different from a rising 120.",
  ],
  pump: [
    "The Omnipod 5 algorithm takes about 2 weeks to learn your patterns. Don't give up early!",
    "I rotate between arms, stomach, and lower back. Absorption is different in each spot.",
    "If you're getting occlusions, try warming insulin to room temp before filling the pod.",
    "Activity mode is essential for any exercise over 30 minutes. Prevents those delayed lows.",
    "Best adhesive combo: Skin Tac underneath and Tegaderm over the top. Survives anything.",
    "Keep your pump settings updated - weight changes, activity changes, everything affects dosing.",
    "I always prime at least 0.3 units into a new site to make sure insulin is flowing.",
    "Steel cannulas work better for me than Teflon ones. Less kinking, more predictable absorption.",
    "If your pump keeps alarming for occlusions, try a different body site. Some areas just don't work well.",
    "Fill the reservoir slowly to avoid microbubbles. Tap out any visible air before connecting.",
  ],
  exercise: [
    "Cardio drops me, weights raise me. I do weights first, then cardio, and it evens out.",
    "A small snack (15g carbs) 30 minutes before a workout prevents the crash for me.",
    "I check my CGM arrow before exercise. If already trending down, I eat something first.",
    "Post-exercise lows can hit 6-12 hours later. I reduce overnight basal by 20% on gym days.",
    "Swimming is tricky with devices. I check before, eat a snack, and check immediately after.",
    "I found that zone 2 cardio is much more predictable for BG than HIIT workouts.",
    "Hot yoga spikes my sugar from the stress response. I've learned to pre-bolus for it.",
    "For long hikes, I reduce my basal by 50% and carry extra snacks. Nature doesn't have vending machines.",
    "Morning workouts require less basal reduction for me than evening ones. Dawn phenomenon helps.",
    "Team sports are the hardest - adrenaline spikes then exercise drops. I just check BG every 30 min.",
    "Strength training makes me go high during, then low after. I bolus small before and reduce basal after.",
    "I keep a dedicated gym bag with glucose tabs, meter, and extra pump supplies. Always ready.",
  ],
  food: [
    "Pizza requires a dual wave bolus: 50% now, 50% over 3-4 hours. Works every time for me.",
    "Pre-bolusing 15-20 minutes for most meals reduced my spikes dramatically.",
    "Protein and fat definitely raise blood sugar, just slowly. I add 50% of protein grams to my carb count.",
    "Coffee raises my blood sugar even when it's black. I bolus 1 unit for my morning cup.",
    "Chinese food is my nemesis. Extended bolus for 4-5 hours is the only thing that works.",
    "A food scale was the single biggest improvement to my carb counting accuracy.",
    "Hidden carbs are everywhere - sauces, dressings, even 'sugar-free' products. Read every label.",
    "I use the TAG method (total available glucose) for high-fat meals. Changed everything.",
    "Restaurant portions are usually 2x what you'd make at home. I always overestimate carbs when dining out.",
    "Eating veggies and protein before carbs in the same meal noticeably reduces my spike.",
    "Meal prepping on Sundays means I know exact carb counts all week. Less guessing = better control.",
    "Sushi rice is surprisingly high glycemic. I bolus more aggressively for sushi than you'd expect.",
  ],
  travel: [
    "NEVER put insulin in checked luggage. Pressure and temperature changes can ruin it.",
    "I bring double supplies in carry-on and split extras with my travel companion's bag.",
    "Get a TSA notification card from your endo. Not required but speeds up the security line.",
    "Time zone changes: adjust pump clock gradually, 1-2 hours per day to avoid wild swings.",
    "A Frio cooling wallet keeps insulin safe in hot climates without needing refrigeration.",
    "I carry a doctor's letter in English and the local language when traveling internationally.",
    "Airport food courts are carb nightmares. I bring my own measured snacks for the flight.",
    "Travel insurance that covers T1D supplies is essential. I use World Nomads.",
    "Keep glucose tabs in your pocket, not your bag. You need them accessible during turbulence.",
    "Altitude changes (hiking, skiing) affect BG too. I check more frequently above 5000ft.",
  ],
  emotional: [
    "Therapy with someone who understands chronic illness was the best investment I ever made.",
    "Diabetes burnout is real. It's okay to do the minimum sometimes. 80% is better than giving up.",
    "Finding online T1D community changed everything. People who actually GET IT make such a difference.",
    "I stopped apologizing for checking my BG in public. It's a medical necessity, not something to hide.",
    "Letting go of perfectionism with my numbers improved both my mental health and my A1C.",
    "Bad diabetes days don't make you a bad person. Some days the numbers just don't cooperate.",
    "My partner attended a diabetes education session with me. Having support at home matters so much.",
    "I celebrate small wins - 3 days in range, a perfect bolus, remembering to rotate sites.",
    "Comparing your numbers to others is toxic. Everyone's diabetes is different.",
    "Joining a T1D support group gave me friends who understand without explanation.",
    "I tell new friends about my T1D early. The relief of not hiding it is enormous.",
    "Diabetes distress is clinically recognized now. Ask your endo for mental health resources.",
  ],
  morning: [
    "My morning routine: check CGM, bolus for breakfast 15 min early, then eat while getting ready.",
    "Dawn phenomenon is worse when I'm sleep deprived. Prioritizing sleep helps my morning numbers.",
    "I set my pump to increase basal at 4am to combat the morning rise. Took a week to find the right amount.",
    "Skipping breakfast actually makes my BG worse - the stress hormones spike without food to balance.",
    "Morning coffee + stress = guaranteed spike. I bolus before my first sip now.",
  ],
  nighttime: [
    "A small protein snack before bed (cheese, nuts) stabilizes my overnight numbers better than anything.",
    "I set a custom low alarm at 80 for nighttime - gives me more warning before hitting 70.",
    "My partner learned to recognize my low signs in my sleep. They wake me before the alarm even goes off.",
    "Sleep mode on my pump targets 112-120 and has almost eliminated overnight lows.",
    "Late dinners mess up my overnight control. I try to eat by 7pm when possible.",
  ],
  insurance: [
    "Always appeal a denial - first appeals succeed about 50% of the time. Don't give up!",
    "Ask your endo to write a prior auth letter emphasizing medical necessity. It makes a huge difference.",
    "Walmart ReliOn insulin is $25/vial OTC. Not ideal long-term but can save your life in an emergency.",
    "GoodRx coupons brought my test strip cost down by 60%. Check every prescription.",
    "Mark Cuban's Cost Plus Drugs has some diabetes supplies at near-wholesale prices. Worth checking.",
    "If you lose coverage, manufacturers have patient assistance programs. Lilly, Novo, Sanofi all have them.",
    "Document everything - keep copies of all denial letters, appeal letters, and medical records.",
    "Some states have emergency insulin access laws. Know your state's rules before you need them.",
    "Your endo's office usually has a billing specialist who can help with insurance fights. Ask for help.",
    "Switching from brand to biosimilar insulin saved me hundreds per month with no difference in control.",
  ],
  school_504: [
    "A 504 plan is legally binding - schools MUST accommodate. An IEP is even stronger if your child qualifies.",
    "Include specific language about CGM access, snack access, and nurse availability in the 504 plan.",
    "Field trips: the school must provide a trained adult who can administer glucagon. Non-negotiable.",
    "My kid's teacher learned to read the Dexcom Follow app. Now they can spot trends before my kid does.",
    "Request that your child can keep their phone for CGM access. Most schools will accommodate with a 504.",
    "Document every incident. If the school violates the 504, you need a paper trail for OCR complaints.",
    "The school nurse should have backup supplies: extra insulin, glucagon, glucose tabs, ketone strips.",
    "Lunchtime bolusing was our biggest challenge. We worked with the nurse to create a simple checklist.",
    "PE teachers need specific training - exercise affects T1D kids differently. Include it in the 504.",
    "Standardized testing accommodations: extra breaks, snack access, and glucose monitoring are all reasonable.",
  ],
  newly_diagnosed: [
    "The honeymoon phase is real - your pancreas still makes some insulin at first. Enjoy the easier management while it lasts.",
    "Carb counting feels impossible at first. Start simple: learn your 10 most common meals first.",
    "It's okay to cry, be angry, and grieve. You just got handed a lifelong diagnosis. Feel your feelings.",
    "Don't compare your numbers to anyone else's. Everyone's diabetes is literally different.",
    "Join a T1D community online - having people who truly understand is worth more than any textbook.",
    "Your first A1C doesn't define your future. It takes months to learn your body's patterns.",
    "Ask your endo about CGM as soon as possible. The data is life-changing for new diabetics.",
    "Keep a log for the first month - even rough notes help you and your endo see patterns.",
    "You WILL eat cake, pizza, ice cream again. You just need to learn how to dose for it.",
    "Low blood sugar feels terrifying the first time. Practice treating it calmly - 15g carbs, wait 15 min.",
    "Get a medical ID bracelet. It feels dramatic but paramedics need to know if you're unconscious.",
    "It gets easier. The first 3 months are the hardest. Ask literally any long-term T1D - we all struggled at first.",
  ],
  burnout: [
    "Taking a 'diabetes vacation' doesn't mean stopping insulin. It means simplifying everything else.",
    "Minimum viable diabetes management: keep CGM on, take insulin, check ketones if high. That's enough on hard days.",
    "Therapy specifically for chronic illness burnout exists. Ask your endo for a referral.",
    "I set my pump to auto-mode and stopped obsessing over every number. My A1C barely changed.",
    "Burnout is your body telling you this is too much. It's a signal, not a failure.",
    "Taking breaks from diabetes social media helped me enormously. The constant optimization culture is exhausting.",
    "I told my endo I was burned out. They adjusted my targets to be less aggressive temporarily. It helped.",
    "Automating what you can (auto-mode pump, CGM) reduces the decision fatigue that causes burnout.",
    "Some days I eat the same 3 meals because I know the carb counts. Boring but zero mental effort.",
    "Peer support groups for diabetes burnout exist. Hearing others say 'me too' is incredibly healing.",
  ],
};

// Generic comments for posts that don't match specific topics
const genericComments = [
  "This is exactly what I needed to hear. Thank you for sharing your experience!",
  "I've had the same experience. You're definitely not alone in this.",
  "My endo recommended something similar and it really helped me.",
  "Bookmarking this for later. Great advice from someone who's been there!",
  "This worked for my daughter too. T1D parenting is tough but we figure it out together.",
  "I wish someone had told me this years ago. Better late than never!",
  "Following this thread for more tips. Great discussion everyone.",
  "I tried this approach and noticed a difference within a week.",
  "This is the kind of practical advice that makes these communities so valuable.",
  "Shared this with my diabetes care team. They thought it was great insight.",
  "Thank you for being so open about this. It helps normalize the struggle.",
  "Been doing this for 6 months now and my A1C dropped significantly.",
  "Great tip! Adding this to my diabetes management toolkit.",
  "As a newly diagnosed person, posts like this give me so much hope.",
  "My experience was similar. Finding what works for YOU is the key takeaway.",
];

const usernamePrefixes = [
  'T1D_Warrior', 'T1D_Parent', 'T1D_Fighter', 'T1D_Runner', 'T1D_Athlete',
  'PumpUser', 'CGM_Life', 'InsulinDependent', 'BetaCell', 'DiabetesDaily',
  'LoopUser', 'AutoMode', 'SugarSurfer', 'CarbCounter', 'BasalBoss',
  'SensorLife', 'PodPeople', 'TandemUser', 'DexcomFan', 'T1_Since',
  'DiabetesDad', 'DiabetesMom', 'T1D_Nurse', 'T1D_Endo', 'T1D_Life',
];

function getCommentsForPost(topicTags: string[], content: string | null): string[] {
  const pool: string[] = [];
  
  // Add topic-specific comments
  for (const tag of (topicTags || [])) {
    const topicComments = commentsByTopic[tag];
    if (topicComments) {
      pool.push(...topicComments);
    }
  }
  
  // Check content for additional topic matches
  const contentLower = (content || '').toLowerCase();
  if (contentLower.includes('pump') || contentLower.includes('omnipod') || contentLower.includes('tandem')) {
    pool.push(...(commentsByTopic.pump || []));
  }
  if (contentLower.includes('cgm') || contentLower.includes('dexcom') || contentLower.includes('libre') || contentLower.includes('sensor')) {
    pool.push(...(commentsByTopic.cgm || []));
  }
  if (contentLower.includes('exercise') || contentLower.includes('workout') || contentLower.includes('running')) {
    pool.push(...(commentsByTopic.exercise || []));
  }
  if (contentLower.includes('food') || contentLower.includes('carb') || contentLower.includes('meal') || contentLower.includes('bolus')) {
    pool.push(...(commentsByTopic.food || []));
  }
  if (contentLower.includes('insurance') || contentLower.includes('coverage') || contentLower.includes('cost') || contentLower.includes('afford')) {
    pool.push(...(commentsByTopic.insurance || []));
  }
  if (contentLower.includes('school') || contentLower.includes('504') || contentLower.includes('iep') || contentLower.includes('teacher')) {
    pool.push(...(commentsByTopic.school_504 || []));
  }
  if (contentLower.includes('diagnosed') || contentLower.includes('new to') || contentLower.includes('just started') || contentLower.includes('honeymoon')) {
    pool.push(...(commentsByTopic.newly_diagnosed || []));
  }
  if (contentLower.includes('burnout') || contentLower.includes('exhausted') || contentLower.includes('tired of') || contentLower.includes('give up')) {
    pool.push(...(commentsByTopic.burnout || []));
  }
  
  // Always add generic comments as fallback
  pool.push(...genericComments);
  
  // Deduplicate
  return [...new Set(pool)];
}

function generateUsername(): string {
  const prefix = usernamePrefixes[Math.floor(Math.random() * usernamePrefixes.length)];
  const suffix = Math.floor(Math.random() * 9999);
  return `${prefix}_${suffix}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all top-level posts
    const { data: allPosts, error: postsError } = await supabase
      .from('community_posts')
      .select('id, post_id, title, content, topic_tags, score, published_at, num_comments')
      .eq('post_type', 'post')
      .order('score', { ascending: false });

    if (postsError) throw postsError;

    // Get posts that already have comments in community_comments
    const { data: existingComments, error: existingError } = await supabase
      .from('community_comments')
      .select('post_id');
    
    if (existingError) throw existingError;

    const postsWithComments = new Set((existingComments || []).map(c => c.post_id));

    let totalInserted = 0;
    let postsProcessed = 0;

    for (const post of (allPosts || [])) {
      // Skip posts that already have comments
      if (postsWithComments.has(post.id)) continue;

      // Determine number of comments (8-20, scaled by num_comments metadata)
      const metadata = post.num_comments || 10;
      const numToGenerate = Math.max(8, Math.min(20, Math.round(metadata / 10)));

      const commentPool = getCommentsForPost(post.topic_tags || [], post.content);
      
      // Shuffle and pick
      const shuffled = commentPool.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numToGenerate);

      const commentsToInsert = selected.map((content, i) => {
        const maxScore = Math.max(10, Math.floor((post.score || 50) * 0.8));
        return {
          post_id: post.id, // UUID reference
          content,
          author_anonymous: generateUsername(),
          score: Math.floor(Math.random() * maxScore) + 1,
          created_at: new Date(
            new Date(post.published_at || Date.now()).getTime() + 
            (i + 1) * (Math.random() * 48 * 60 * 60 * 1000) // within 48 hours
          ).toISOString(),
        };
      });

      const { error: insertError } = await supabase
        .from('community_comments')
        .insert(commentsToInsert);

      if (!insertError) {
        totalInserted += commentsToInsert.length;
        postsProcessed++;
      } else {
        console.error(`Error inserting comments for post ${post.post_id}:`, insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${totalInserted} comments across ${postsProcessed} posts`,
        totalInserted,
        postsProcessed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error seeding comments:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
