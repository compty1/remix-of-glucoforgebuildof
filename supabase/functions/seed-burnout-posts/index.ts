import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const burnoutPosts = [
  {
    title: "How I recovered from 6 months of complete diabetes burnout",
    content: "I stopped checking my blood sugar entirely for about 6 months. My A1C went from 6.8 to 9.2. What finally helped was my endo suggesting I just check twice a day — wake up and bedtime. No corrections, no logging, just two checks. After a few weeks I naturally started checking more because the pressure was gone. The key was removing the perfectionism. My endo said 'any data is better than no data' and that changed everything for me.",
    author_anonymous: "t1d_warrior_22",
    score: 847,
    num_comments: 12,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=diabetes+burnout+recovery+checking&type=link",
    burnout_category: "Taking a Break",
    topic_tags: ["burnout-recovery", "a1c", "mental-health"],
    sentiment: "hopeful",
    published_at: "2025-11-15T14:30:00Z",
  },
  {
    title: "Switching to a closed loop system literally saved my mental health",
    content: "I was so burned out from MDI that I was rage bolusing and then eating candy to correct lows. It was a terrible cycle. Getting on the Omnipod 5 with Dexcom G7 changed everything. I went from making 30+ diabetes decisions a day to maybe 5. My time in range went from 40% to 72% and I barely think about it now. If you're burned out and still on MDI, please look into AID systems. The automation removes so much of the mental burden.",
    author_anonymous: "loop_convert_2024",
    score: 623,
    num_comments: 9,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=closed+loop+system+burnout+omnipod+dexcom&type=link",
    burnout_category: "Automation Saved Me",
    topic_tags: ["closed-loop", "omnipod", "dexcom", "automation"],
    sentiment: "positive",
    published_at: "2025-10-22T09:15:00Z",
  },
  {
    title: "Therapy specifically for diabetes distress was a game changer",
    content: "I finally found a therapist who specializes in chronic illness management. She understood that diabetes burnout isn't just 'being lazy' — it's decision fatigue from making 100+ health decisions every single day. She taught me about 'diabetes distress' vs clinical depression and helped me develop a 'minimum viable diabetes' plan for bad days. If you can, look for therapists who list chronic illness or diabetes on their specialties. The Psychology Today directory lets you filter by specialty.",
    author_anonymous: "therapy_helped_me",
    score: 512,
    num_comments: 8,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=diabetes+therapist+burnout+chronic+illness&type=link",
    burnout_category: "Therapy That Worked",
    topic_tags: ["therapy", "mental-health", "diabetes-distress"],
    sentiment: "positive",
    published_at: "2025-09-18T16:45:00Z",
  },
  {
    title: "My 'good enough' diabetes management plan that got me through burnout",
    content: "When I hit burnout hard, my CDE helped me create a 'good enough' plan: 1) Take your long-acting insulin no matter what. 2) Bolus for meals, even if it's a guess. 3) Check CGM when you feel weird. 4) That's it. No logging, no carb counting, no corrections unless you're over 300. This plan kept me safe while I recovered mentally. After about 3 months of 'good enough' I naturally started caring more again. Perfection is the enemy of good diabetes management.",
    author_anonymous: "good_enough_t1d",
    score: 489,
    num_comments: 11,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=good+enough+diabetes+management+burnout&type=link",
    burnout_category: "Simplifying Management",
    topic_tags: ["simplification", "management", "cde"],
    sentiment: "hopeful",
    published_at: "2025-12-03T11:20:00Z",
  },
  {
    title: "CGM alarm fatigue nearly made me quit diabetes management entirely",
    content: "The constant beeping from my Dexcom was driving me insane. High alarm, low alarm, signal loss, urgent low — I was getting 20+ alerts a day. I started ignoring ALL of them which defeated the purpose. What saved me: I widened my alert range to 55-250 (from 70-180), turned off the rise/fall alerts entirely, and set to vibrate only. My A1C went up slightly but my mental health improved dramatically. Sometimes you need to give yourself permission to loosen the reins.",
    author_anonymous: "alarm_fatigue_real",
    score: 734,
    num_comments: 14,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=cgm+alarm+fatigue+dexcom+burnout&type=link",
    burnout_category: "CGM Burnout",
    topic_tags: ["cgm", "alarm-fatigue", "dexcom", "alerts"],
    sentiment: "mixed",
    published_at: "2025-08-27T20:10:00Z",
  },
  {
    title: "Taking a 'diabetes vacation' with my endo's blessing",
    content: "My endocrinologist actually suggested I take a structured break. For two weeks I only: took basal insulin, wore my CGM but hid the phone app, and bolused a flat dose for meals without counting carbs. No logging, no reviewing data, no guilt. After those two weeks, I felt like I could breathe again. I came back to full management gradually over a month. If your endo doesn't understand burnout, find one who does.",
    author_anonymous: "vacation_from_d",
    score: 391,
    num_comments: 7,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=diabetes+vacation+break+endocrinologist&type=link",
    burnout_category: "Taking a Break",
    topic_tags: ["break", "endo", "basal-only"],
    sentiment: "positive",
    published_at: "2025-07-14T13:00:00Z",
  },
  {
    title: "Vitamin D deficiency was making my burnout 10x worse",
    content: "I was exhausted, depressed, my muscles ached, and I had zero motivation to manage my diabetes. My endo tested my vitamin D and it was at 11 ng/mL (should be 30-50). Apparently T1Ds are way more likely to be deficient because of the autoimmune connection. Started on 5000 IU daily and within 6 weeks I felt like a different person. The fatigue lifted, my mood improved, and I actually had energy to care about my blood sugars again. Get your levels checked, especially in winter.",
    author_anonymous: "vitamin_d_changed_me",
    score: 567,
    num_comments: 10,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=type+1+diabetes+vitamin+d+deficiency+fatigue&type=link",
    burnout_category: "Simplifying Management",
    topic_tags: ["vitamin-d", "deficiency", "supplements", "fatigue"],
    sentiment: "positive",
    published_at: "2026-01-08T10:30:00Z",
  },
  {
    title: "How I explained diabetes burnout to my non-diabetic partner",
    content: "My partner kept saying 'just check your blood sugar, it takes 5 seconds.' They didn't understand that it's not about the 5 seconds — it's about the mental weight of every single number meaning something about your future health. I finally explained it like this: 'Imagine every time you ate anything, you had to solve a math problem, and if you got it wrong, you might end up in the hospital. Now do that 6 times a day for 20 years.' That finally clicked. We developed a system where they help remind me gently instead of nagging.",
    author_anonymous: "partner_gets_it_now",
    score: 923,
    num_comments: 15,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=explaining+diabetes+burnout+partner+family&type=link",
    burnout_category: "Taking a Break",
    topic_tags: ["relationships", "communication", "support"],
    sentiment: "hopeful",
    published_at: "2025-11-28T08:45:00Z",
  },
  {
    title: "Magnesium supplementation helped my anxiety AND my blood sugars",
    content: "My anxiety around diabetes was through the roof. Constant worry about lows, about complications, about my A1C. My naturopath suggested magnesium glycinate 400mg before bed. Within 2 weeks my anxiety decreased noticeably, I was sleeping better, and weirdly my blood sugars became more stable too. Turns out magnesium plays a role in insulin sensitivity. It's not a cure-all but combined with therapy it made a real difference. Check with your endo first obviously.",
    author_anonymous: "mag_for_anxiety",
    score: 345,
    num_comments: 6,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=type+1+diabetes+magnesium+anxiety+supplement&type=link",
    burnout_category: "Simplifying Management",
    topic_tags: ["magnesium", "anxiety", "supplements", "sleep"],
    sentiment: "positive",
    published_at: "2025-10-05T19:00:00Z",
  },
  {
    title: "I automated everything possible and my burnout improved dramatically",
    content: "Here's what I automated: 1) Closed-loop pump system handles basal and corrections. 2) Auto-reorder supplies through my pharmacy app. 3) Set up auto-refill reminders for prescriptions. 4) Use a pill organizer for supplements so I don't have to think about it. 5) Pre-programmed my pump with common meal boluses. 6) Set up automatic endo appointments every 3 months. Every decision you remove from the pile helps. Diabetes is death by a thousand paper cuts — automate the paper cuts.",
    author_anonymous: "automate_everything",
    score: 678,
    num_comments: 13,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=automate+diabetes+management+burnout+pump&type=link",
    burnout_category: "Automation Saved Me",
    topic_tags: ["automation", "pump", "supplies", "decision-fatigue"],
    sentiment: "positive",
    published_at: "2025-09-30T14:20:00Z",
  },
  {
    title: "SSRIs helped me manage diabetes again - my experience with Lexapro",
    content: "I was resistant to medication for a long time but my burnout spiraled into full depression. My psychiatrist prescribed Lexapro (escitalopram) 10mg. Important note for T1Ds: SSRIs can slightly affect blood sugar in the first few weeks — I noticed I went a bit lower than usual so I reduced my basal by about 10% temporarily. After the adjustment period, managing diabetes felt possible again. The combination of medication + a diabetes-specialized therapist was what finally broke the burnout cycle for me.",
    author_anonymous: "lexapro_helped_t1d",
    score: 412,
    num_comments: 9,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=type+1+diabetes+SSRI+lexapro+depression+burnout&type=link",
    burnout_category: "Therapy That Worked",
    topic_tags: ["ssri", "lexapro", "depression", "medication"],
    sentiment: "positive",
    published_at: "2025-12-19T17:30:00Z",
  },
  {
    title: "Finding my diabetes community online saved me from isolation burnout",
    content: "The loneliest part of T1D burnout is feeling like nobody understands. I joined a few Discord servers and Reddit communities specifically for T1D adults and it changed everything. Seeing other people admit they had an A1C of 9+ and weren't failures, hearing that rage bolusing is common, knowing that other people also cry in their cars after bad endo appointments — it normalized everything. You're not failing at diabetes. Diabetes is just really, really hard. Communities: r/diabetes_t1d, Beyond Type 1 app, T1D Exchange.",
    author_anonymous: "community_saved_me",
    score: 556,
    num_comments: 8,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=type+1+diabetes+community+support+burnout+isolation&type=link",
    burnout_category: "Taking a Break",
    topic_tags: ["community", "support", "isolation", "online"],
    sentiment: "hopeful",
    published_at: "2025-08-11T12:00:00Z",
  },
  {
    title: "The 'bare minimum diabetes' checklist that kept me alive during burnout",
    content: "When I was deep in burnout, my nurse practitioner gave me a 'bare minimum' card to keep in my wallet: ✅ Take long-acting insulin ✅ Eat something every few hours ✅ Keep glucose tabs nearby ✅ If you feel bad, check blood sugar ✅ If over 350 or vomiting, go to ER. That's it. Everything else is bonus. This kept me out of DKA during the worst of my burnout. You can always add complexity back later. Safety first, perfection never.",
    author_anonymous: "bare_minimum_alive",
    score: 891,
    num_comments: 16,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=bare+minimum+diabetes+management+DKA+safety&type=link",
    burnout_category: "Simplifying Management",
    topic_tags: ["safety", "minimum", "dka-prevention", "checklist"],
    sentiment: "supportive",
    published_at: "2026-01-22T09:00:00Z",
  },
  {
    title: "Exercise was the unexpected burnout cure — but not what you think",
    content: "I'm not talking about exercising to lower blood sugar (which adds MORE mental load). I started walking 20 minutes a day with NO diabetes goals attached. No checking how it affected my numbers, no adjusting insulin around it, just walking to feel human. The endorphins helped, the fresh air helped, and gradually I started naturally wanting to manage my diabetes better because I was investing in myself. The key was removing diabetes from the equation — it was exercise for my MIND, not my blood sugar.",
    author_anonymous: "walking_for_brain",
    score: 434,
    num_comments: 7,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=type+1+diabetes+exercise+mental+health+walking&type=link",
    burnout_category: "Therapy That Worked",
    topic_tags: ["exercise", "walking", "mental-health", "self-care"],
    sentiment: "positive",
    published_at: "2025-10-14T15:30:00Z",
  },
  {
    title: "How Loop/DIY APS reduced my diabetes decisions from 50/day to under 10",
    content: "Before Loop, I was making an insane number of decisions: when to bolus, how much, should I correct, am I going low, should I eat, should I adjust basal, etc. After switching to DIY Loop (now iAPS), the algorithm handles most of it. I still bolus for meals but the constant micro-adjustments are automated. My decision fatigue dropped by 80% and my A1C actually improved from 7.4 to 6.7. If your burnout is from decision fatigue specifically, AID/APS systems are the single best intervention IMO.",
    author_anonymous: "diy_loop_freedom",
    score: 523,
    num_comments: 11,
    source: "reddit",
    source_url: "https://www.reddit.com/search/?q=loop+iaps+DIY+artificial+pancreas+decision+fatigue&type=link",
    burnout_category: "Automation Saved Me",
    topic_tags: ["loop", "iaps", "diy", "decision-fatigue", "aid"],
    sentiment: "positive",
    published_at: "2025-11-02T22:00:00Z",
  },
];

// Generate comments for each post
const commentsMap: Record<number, Array<{content: string; author_anonymous: string; score: number}>> = {
  0: [
    { content: "This is exactly what my endo suggested too. The 'two checks only' approach removed all the guilt. After a month I was back to checking 5-6 times naturally.", author_anonymous: "similar_journey", score: 234 },
    { content: "6.8 to 9.2 is scary but I've been there. The important thing is you came back. A temporary high A1C is better than giving up entirely.", author_anonymous: "been_there_t1d", score: 189 },
    { content: "I needed to hear 'any data is better than no data.' I've been in complete avoidance mode for 3 months.", author_anonymous: "avoidance_mode", score: 156 },
    { content: "The perfectionism thing is so real. My therapist calls it 'all or nothing thinking' and it's incredibly common in diabetes management.", author_anonymous: "therapy_perspective", score: 142 },
  ],
  1: [
    { content: "Went from MDI to Tandem t:slim with Control-IQ and same experience. Went from thinking about diabetes constantly to maybe 3 times a day.", author_anonymous: "tandem_convert", score: 201 },
    { content: "The jump from 40% to 72% TIR is incredible. I'm still on MDI and this is convincing me to finally make the switch.", author_anonymous: "considering_pump", score: 178 },
    { content: "Insurance was the barrier for me but my endo wrote a letter documenting my burnout and history of DKA. Got approved.", author_anonymous: "insurance_fight", score: 145 },
  ],
  2: [
    { content: "Psychology Today filter for 'chronic illness' is a great tip. Found my current therapist that way. She specializes in autoimmune conditions.", author_anonymous: "pt_filter_works", score: 167 },
    { content: "The distinction between diabetes distress and clinical depression was huge for me. They require different approaches.", author_anonymous: "distress_not_depression", score: 134 },
    { content: "My therapist helped me realize I was grieving the life I would have had without diabetes. That reframe was powerful.", author_anonymous: "grieving_normal", score: 198 },
  ],
  3: [
    { content: "The 'no corrections unless over 300' rule is so freeing. I used to stress about every number above 180.", author_anonymous: "freedom_from_300", score: 156 },
    { content: "My CDE created a similar plan. She called it 'survival mode diabetes' and said it's totally valid for as long as you need it.", author_anonymous: "survival_mode", score: 189 },
    { content: "Perfection IS the enemy. I spent 25 years trying to be perfect and all it got me was burnout and an eating disorder.", author_anonymous: "25_years_lesson", score: 234 },
    { content: "This plan kept my son safe when he hit burnout at 16. Sometimes good enough really is good enough.", author_anonymous: "t1d_parent", score: 145 },
  ],
  4: [
    { content: "I did the same thing — widened to 60-250 and vibrate only. A1C went from 6.5 to 7.1 but I'm actually WEARING my CGM now instead of ripping it off.", author_anonymous: "wider_range_better", score: 267 },
    { content: "20+ alerts a day is torture. The default ranges are designed for perfect control, not real life. Customize aggressively.", author_anonymous: "customize_alerts", score: 198 },
    { content: "Pro tip: Dexcom lets you set different alert schedules for sleep vs awake. I only get urgent low alerts at night.", author_anonymous: "sleep_schedule_tip", score: 223 },
    { content: "I turned off ALL predictive alerts and only keep urgent low. My stress dropped 80%. Still have a great A1C.", author_anonymous: "predictive_off", score: 189 },
  ],
  5: [
    { content: "My endo suggested the same — she called it a 'management reset.' The key is keeping basal insulin going no matter what.", author_anonymous: "endo_approved_break", score: 134 },
    { content: "Hiding the CGM app was genius. I still had safety net (urgent lows) but wasn't obsessing over every fluctuation.", author_anonymous: "hide_app_trick", score: 167 },
  ],
  6: [
    { content: "Mine was at 8 ng/mL! Doctor said it was one of the lowest she'd seen. 4000 IU daily for 3 months brought it to 42. Felt like night and day.", author_anonymous: "extremely_low_d", score: 201 },
    { content: "The autoimmune connection is real. My rheumatologist said all her autoimmune patients tend to be vitamin D deficient.", author_anonymous: "autoimmune_link", score: 156 },
    { content: "Winter in northern states + T1D = almost guaranteed deficiency. I now take 5000 IU Oct-April every year.", author_anonymous: "seasonal_routine", score: 189 },
    { content: "I had no idea vitamin D could affect mood this much. Thought I was just depressed but it was mostly deficiency.", author_anonymous: "mood_surprise", score: 145 },
  ],
  7: [
    { content: "The math problem analogy is perfect. I'm going to use this with my family. They mean well but the nagging makes burnout worse.", author_anonymous: "using_this_analogy", score: 312 },
    { content: "My wife and I developed a 'gentle reminder' system too. She asks 'need anything?' instead of 'did you check your sugar?' It works.", author_anonymous: "gentle_system", score: 245 },
    { content: "After 20 years of T1D, explaining this to a new partner is exhausting. This analogy is going in my back pocket.", author_anonymous: "new_partner_explain", score: 198 },
  ],
  8: [
    { content: "Magnesium glycinate specifically was key for me too. Other forms gave me stomach issues. The glycinate form is much gentler.", author_anonymous: "glycinate_specific", score: 134 },
    { content: "My endo actually confirmed the insulin sensitivity connection. She now recommends magnesium to many of her T1D patients.", author_anonymous: "endo_confirmed", score: 156 },
  ],
  9: [
    { content: "The 'death by a thousand paper cuts' description is the most accurate thing I've ever read about diabetes management.", author_anonymous: "paper_cuts_truth", score: 234 },
    { content: "Auto-reorder supplies is underrated. Running out of test strips at midnight used to send me into panic mode.", author_anonymous: "supply_anxiety", score: 189 },
    { content: "Pre-programmed meal boluses are huge. I have 'coffee', 'lunch', 'dinner' presets and just press a button.", author_anonymous: "preset_boluses", score: 167 },
  ],
  10: [
    { content: "SSRIs and blood sugar — this is so important to mention. My doctor didn't warn me and I had lows for the first 2 weeks.", author_anonymous: "ssri_low_warning", score: 198 },
    { content: "Lexapro + therapy was my combo too. Neither alone was enough but together they broke the cycle.", author_anonymous: "combo_approach", score: 167 },
    { content: "For anyone nervous about SSRIs: the blood sugar effects stabilize after 2-3 weeks. Just monitor more closely at first.", author_anonymous: "stabilizes_quickly", score: 145 },
  ],
  11: [
    { content: "r/diabetes_t1d is genuinely one of the most supportive communities I've found online. No judgment, just understanding.", author_anonymous: "love_the_sub", score: 189 },
    { content: "The Beyond Type 1 app has a great matching feature where you can connect with someone your age with similar experiences.", author_anonymous: "bt1_matching", score: 156 },
    { content: "Crying in cars after endo appointments is so specific and so true. Knowing others do this too helped more than anything.", author_anonymous: "car_crier_too", score: 267 },
  ],
  12: [
    { content: "I laminated this list and keep it on my fridge. On bad days I just need to do these 5 things. Everything else is optional.", author_anonymous: "laminated_list", score: 289 },
    { content: "The ER threshold is important. So many people in burnout ignore DKA symptoms. This checklist saves lives.", author_anonymous: "dka_awareness", score: 234 },
    { content: "Showed this to my teenager with T1D. She actually liked having a 'bad day plan' — made her feel less guilty about struggling.", author_anonymous: "teen_t1d_parent", score: 201 },
    { content: "Safety first, perfection never. I want this on a t-shirt.", author_anonymous: "tshirt_worthy", score: 178 },
  ],
  13: [
    { content: "Exercise for your MIND not your blood sugar — this reframe is everything. I was avoiding exercise because it complicated my diabetes.", author_anonymous: "exercise_reframe", score: 189 },
    { content: "I started swimming with no CGM tracking and it was the first time exercise felt like self-care instead of another diabetes task.", author_anonymous: "swimming_freedom", score: 156 },
  ],
  14: [
    { content: "Went from 50 decisions/day to under 10 is life-changing. iAPS has given me back mental bandwidth I forgot I had.", author_anonymous: "iaps_freedom", score: 198 },
    { content: "The improvement in A1C while making FEWER decisions is the best argument for AID systems. Less effort, better results.", author_anonymous: "less_is_more", score: 178 },
    { content: "For anyone interested, r/iAPS and r/OpenAPS have great getting-started guides. The community is incredibly helpful.", author_anonymous: "diy_community", score: 145 },
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already seeded
    const { count } = await supabase
      .from("burnout_community_posts")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({ message: `Already seeded with ${count} posts` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert posts
    const { data: insertedPosts, error: postsError } = await supabase
      .from("burnout_community_posts")
      .insert(burnoutPosts)
      .select();

    if (postsError) throw postsError;

    // Insert comments
    let totalComments = 0;
    for (let i = 0; i < insertedPosts.length; i++) {
      const postComments = commentsMap[i];
      if (postComments) {
        const commentsToInsert = postComments.map((c) => ({
          post_id: insertedPosts[i].id,
          content: c.content,
          author_anonymous: c.author_anonymous,
          score: c.score,
        }));

        const { error: commentsError } = await supabase
          .from("burnout_comments")
          .insert(commentsToInsert);

        if (commentsError) throw commentsError;
        totalComments += commentsToInsert.length;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Seeded ${insertedPosts.length} posts and ${totalComments} comments`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
