import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated realistic comments for community posts
const commentsData = [
  // CGM-related comments
  { parent_title: 'Dexcom', topic: 'cgm', comments: [
    { content: "I've found that using Skin Tac before applying helps the sensor stick for the full 10 days. Game changer for summer!", score: 45 },
    { content: "The G7 warm-up time is so much better than the G6. Only 30 minutes now instead of 2 hours.", score: 38 },
    { content: "Pro tip: if your sensor is reading high at night, make sure you're not sleeping on that arm. Compression lows are real!", score: 67 },
    { content: "I overlay the sensor with Simpatch and it survives swimming, showering, everything. Highly recommend.", score: 52 },
    { content: "Anyone else notice the first day readings are always a bit off? I usually wait until day 2 to fully trust it.", score: 41 },
    { content: "The urgent low soon alarm has literally saved me multiple times. Don't silence it!", score: 89 },
    { content: "My endo said to calibrate only when your blood sugar is stable, not when it's rising or falling. Made a big difference in accuracy.", score: 56 },
  ]},
  // Pump-related comments
  { parent_title: 'Omnipod', topic: 'pump', comments: [
    { content: "The Omnipod 5 algorithm takes about 2 weeks to really learn your patterns. Be patient!", score: 73 },
    { content: "I rotate between arms, stomach, and lower back. Absorption is definitely different in each spot.", score: 44 },
    { content: "If you're getting occlusions, try warming up your insulin before filling the pod. Room temp works better.", score: 61 },
    { content: "The phone app is way more reliable than the PDM now. I haven't touched my PDM in months.", score: 37 },
    { content: "Best adhesive combo: Skin Tac underneath and Tegaderm over the top. Survives anything.", score: 48 },
    { content: "I've found that Activity mode is essential for any exercise over 30 minutes. Prevents those delayed lows.", score: 55 },
  ]},
  // Low blood sugar comments
  { parent_title: 'low blood sugar', topic: 'hypo', comments: [
    { content: "15-15 rule changed my life. 15g carbs, wait 15 minutes. No more overcorrecting and going high!", score: 92 },
    { content: "Glucose tabs are more predictable than juice for me. Each tab is exactly 4g, easy to dose.", score: 67 },
    { content: "I keep a small bag of skittles in every jacket pocket, gym bag, and car. You never know!", score: 54 },
    { content: "For nighttime lows, I've found a small glass of milk works better than pure sugar - the protein helps it last.", score: 43 },
    { content: "If you're going low after exercise, try reducing basal 2 hours before, not just during.", score: 78 },
    { content: "Hypoglycemia unawareness is real and scary. Regular low-sugar free periods help restore awareness.", score: 85 },
    { content: "I treat at 80 now instead of waiting until I'm actually low. Prevention is easier than correction.", score: 49 },
    { content: "The shaky hands before a low are my body's early warning. Learned to trust those subtle signs.", score: 36 },
  ]},
  // High blood sugar comments
  { parent_title: 'high blood sugar', topic: 'hyper', comments: [
    { content: "Rage bolusing never works. Small corrections every 2-3 hours are way more effective.", score: 103 },
    { content: "Check for bubbles in your tubing! I had mysterious highs for a week before I spotted the air pocket.", score: 76 },
    { content: "Stress highs are real. I've started doing 5-minute breathing exercises and it actually helps my BG.", score: 58 },
    { content: "If you're high and don't come down with a correction, your site might be bad. Change it!", score: 81 },
    { content: "Walking for 15 minutes after a meal prevents so many spikes. I just do laps around my office now.", score: 94 },
    { content: "Dawn phenomenon hit me hard until I adjusted my basal between 4-7am. Worth the effort to fine-tune.", score: 65 },
  ]},
  // Exercise comments
  { parent_title: 'exercise', topic: 'exercise', comments: [
    { content: "Cardio drops me, weights raise me. I do weights first, then cardio, and it evens out.", score: 112 },
    { content: "A small snack (15g carbs) 30 minutes before a workout prevents the crash for me.", score: 57 },
    { content: "I've learned to check my CGM arrow before exercise. If I'm already trending down, I eat something first.", score: 48 },
    { content: "Post-exercise lows can hit 6-12 hours later. I reduce my overnight basal by 20% on gym days.", score: 86 },
    { content: "Swimming is tricky because you can't wear a CGM. I check before, eat a snack, and check immediately after.", score: 41 },
    { content: "I keep my pump on during yoga but disconnect for swimming. Everyone finds their own balance.", score: 33 },
    { content: "Hot yoga spikes my sugar because of the stress response. I've learned to pre-bolus for it.", score: 29 },
  ]},
  // Food and bolusing comments
  { parent_title: 'bolusing', topic: 'food', comments: [
    { content: "Pizza requires a dual wave bolus for me: 50% now, 50% over 3 hours. Works every time.", score: 98 },
    { content: "I pre-bolus 15-20 minutes for most meals. The spike reduction is incredible.", score: 77 },
    { content: "Protein and fat definitely raise blood sugar, just slowly. I add 50% of protein grams to my carb count.", score: 54 },
    { content: "Coffee raises my blood sugar even when it's black. I bolus 10 units for my morning cup.", score: 42 },
    { content: "Chinese food is my nemesis. Extended bolus for 4-5 hours is the only thing that works.", score: 63 },
    { content: "Ice cream is surprisingly manageable with the fat slowing absorption. Pizza is way harder.", score: 35 },
    { content: "I use the TAG method (total available glucose) for high-fat meals. Changed everything.", score: 71 },
    { content: "Learning carb counting was the best investment of time. I weigh everything now and my control improved 20%.", score: 88 },
  ]},
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, get existing parent posts to attach comments to
    const { data: parentPosts, error: fetchError } = await supabase
      .from('community_posts')
      .select('id, post_id, title, device_mentioned, topic_tags')
      .is('parent_post_id', null)
      .limit(100);

    if (fetchError) throw fetchError;

    const insertedComments: any[] = [];

    for (const topicGroup of commentsData) {
      // Find matching parent posts for this topic
      const matchingPosts = parentPosts?.filter(post => {
        const titleMatch = post.title?.toLowerCase().includes(topicGroup.parent_title.toLowerCase());
        const deviceMatch = post.device_mentioned?.toLowerCase().includes(topicGroup.topic.toLowerCase());
        const tagMatch = post.topic_tags?.some((tag: string) => tag.toLowerCase().includes(topicGroup.topic.toLowerCase()));
        return titleMatch || deviceMatch || tagMatch;
      }) || [];

      // If we found matching posts, add comments to them
      for (const parentPost of matchingPosts.slice(0, 3)) {
        for (const comment of topicGroup.comments) {
          const commentData = {
            source: 'reddit',
            post_id: `comment_${crypto.randomUUID().slice(0, 8)}`,
            title: 'Comment',
            content: comment.content,
            author_anonymous: `T1D_${['Warrior', 'Parent', 'Champion', 'Fighter', 'Survivor', 'Helper'][Math.floor(Math.random() * 6)]}_${Math.floor(Math.random() * 9999)}`,
            score: comment.score + Math.floor(Math.random() * 20) - 10,
            num_comments: 0,
            parent_post_id: parentPost.post_id,
            post_type: 'comment',
            is_solution: Math.random() > 0.7,
            topic_tags: parentPost.topic_tags || [topicGroup.topic],
            published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          };

          const { data, error } = await supabase
            .from('community_posts')
            .upsert(commentData, { onConflict: 'post_id' })
            .select()
            .single();

          if (!error && data) {
            insertedComments.push(data);
          }
        }
      }
    }

    // Also create some generic comments for posts without specific matches
    const genericComments = [
      "This is exactly what I needed to hear. Thank you for sharing!",
      "I've had the same experience. You're not alone in this.",
      "My endo recommended something similar. It really helped.",
      "Bookmarking this for later. Great advice!",
      "This worked for my daughter too. T1D parenting is tough but we figure it out together.",
      "I wish someone had told me this years ago. Better late than never!",
      "Following this thread for more tips. Great discussion everyone.",
      "I tried this and it made a noticeable difference within a week.",
    ];

    for (const post of parentPosts?.slice(0, 20) || []) {
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numComments; i++) {
        const commentData = {
          source: 'reddit',
          post_id: `generic_comment_${crypto.randomUUID().slice(0, 8)}`,
          title: 'Comment',
          content: genericComments[Math.floor(Math.random() * genericComments.length)],
          author_anonymous: `T1D_User_${Math.floor(Math.random() * 9999)}`,
          score: Math.floor(Math.random() * 50) + 5,
          num_comments: 0,
          parent_post_id: post.post_id,
          post_type: 'comment',
          is_solution: false,
          published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const { data, error } = await supabase
          .from('community_posts')
          .upsert(commentData, { onConflict: 'post_id' })
          .select()
          .single();

        if (!error && data) {
          insertedComments.push(data);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedComments.length} comments`,
        inserted: insertedComments.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error seeding comments:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
