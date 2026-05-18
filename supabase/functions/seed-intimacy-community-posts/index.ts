import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommunityPost {
  source: string;
  post_id: string;
  title: string;
  content: string;
  author_anonymous: string;
  score: number;
  num_comments: number;
  device_mentioned: string | null;
  sentiment: string;
  published_at: string;
  topic_tags: string[];
  is_solution: boolean;
  post_type: string;
  url: string;
}

interface CommunityComment {
  post_id: string;
  author_anonymous: string;
  content: string;
  score: number;
  parent_comment_id: string | null;
  created_at: string;
}

const generatePastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const intimacyPosts: CommunityPost[] = [
  // CGM Placement During Sex (5 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_cgm_positions_001',
    title: "Best positions when wearing a CGM on your stomach - honest discussion needed",
    content: `Been T1D for 8 years and this is something no one talks about openly. 

I wear my Dexcom G7 on my stomach (only place that works well for me accuracy-wise) and certain positions are just... awkward. My partner accidentally pressed on it hard once and it hurt like hell and almost ripped it off. Now I'm paranoid every time.

I tried back-of-arm but it catches on bedsheets constantly and the readings are way off for me there.

For those comfortable sharing - where do you wear your CGM and how do you make intimacy work without constantly worrying about it? Looking for practical advice, not judgment.

Edit: Wow, didn't expect so many responses. You all are amazing. This community is the best.`,
    author_anonymous: 'IntimacyT1D_throwaway',
    score: 342,
    num_comments: 67,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    published_at: generatePastDate(12),
    topic_tags: ['intimacy', 'cgm', 'devices', 'lifestyle'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example1'
  },
  {
    source: 'r/dexcom',
    post_id: 'intimacy_cgm_ripped_002',
    title: "My G7 got ripped off during sex last night - prevention tips?",
    content: `Super embarrassing but I need to vent and get advice. My Dexcom G7 on my upper arm got caught on the sheets during... vigorous activity... and completely ripped off. Blood everywhere, mood completely killed, and I lost a sensor that still had 6 days left.

This is the second time this has happened in 3 months. I use the standard Dexcom overpatch but clearly it's not enough.

What do you all use for extra adhesion? I've heard of SkinTac, Simpatch, even KT tape. What actually works for active situations?

Also - where do you wear yours to avoid this? I'm thinking maybe thigh but worried about accuracy.`,
    author_anonymous: 'CGM_casualties',
    score: 287,
    num_comments: 54,
    device_mentioned: 'dexcom',
    sentiment: 'negative',
    published_at: generatePastDate(8),
    topic_tags: ['intimacy', 'cgm', 'devices', 'adhesive'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/dexcom/comments/example2'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_thigh_placement_003',
    title: "Back of thigh CGM placement - absolute game changer for my intimate life",
    content: `After years of struggling with stomach and arm placements during intimacy, I finally tried upper back of thigh (like where your jeans pocket would be but on the back).

GAME. CHANGER.

It's completely out of the way for literally every position. My partner doesn't bump into it. It doesn't catch on sheets. And bonus - my readings are actually more stable there than my arm ever was.

The only downside is insertion is a bit tricky solo (I use a mirror) and sometimes sitting for long periods can be uncomfortable the first day.

Wanted to share in case anyone else is struggling with this. We deserve to have normal intimate lives without constantly worrying about our tech!`,
    author_anonymous: 'ThighPlacementConvert',
    score: 456,
    num_comments: 78,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(23),
    topic_tags: ['intimacy', 'cgm', 'devices', 'lifestyle', 'tips'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example3'
  },
  {
    source: 'r/Libre',
    post_id: 'intimacy_libre_fell_004',
    title: "Libre sensor fell off during a romantic weekend away - ruined the whole trip",
    content: `Planned this whole romantic getaway with my husband. First night, things are getting heated, and I feel my Libre 3 just... pop off. It had been on for 10 days, so maybe the adhesive was already weak, but still.

No backup sensor because I'm an idiot. Had to finger stick the whole weekend which completely took me out of the moment every time. Plus the anxiety of not knowing my levels continuously made me way less relaxed than I should have been.

Lessons learned:
1. ALWAYS bring backup sensors
2. Maybe change to a fresh sensor before special occasions
3. Consider extra adhesive patches

Anyone else have horror stories? I need to feel less alone here lol`,
    author_anonymous: 'RomanticWeekendFail',
    score: 198,
    num_comments: 43,
    device_mentioned: 'libre',
    sentiment: 'negative',
    published_at: generatePastDate(31),
    topic_tags: ['intimacy', 'cgm', 'devices', 'travel', 'adhesive'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/Libre/comments/example4'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_overlay_patches_005',
    title: "Using overlay patches specifically for 'active nights' - my system",
    content: `Okay so I've developed a whole system for making sure my CGM stays put during intimacy and I figured I'd share:

1. Regular days: Just the standard Dexcom overpatch
2. Date nights/weekends: Add a Simpatch or ExpressionMed patch on top
3. Extra active situations: SkinTac underneath + Simpatch on top + I tape down the edges with medical tape

Is it overkill? Maybe. Have I lost a sensor during sex since I started this? Nope.

The Simpatch ones come in cute designs too so it doesn't look so medical. My girlfriend actually thinks the galaxy print ones are cool.

Pro tip: Apply the extra patch like 30 mins before so the adhesive really sets. Don't wait until you're already in the moment lol.`,
    author_anonymous: 'PreparedT1D',
    score: 312,
    num_comments: 56,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(15),
    topic_tags: ['intimacy', 'cgm', 'devices', 'adhesive', 'tips'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example5'
  },

  // Partner Reactions & Communication (5 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_partner_reaction_006',
    title: "How my new girlfriend reacted to seeing my pump and CGM for the first time - positive story",
    content: `Just wanted to share a positive experience because I know a lot of us stress about this.

Been dating this girl for about a month. We hadn't been intimate yet and I was DREADING the moment she'd see all my diabetes tech. I have a Tandem t:slim and Dexcom G6 so there's a lot going on.

Last night was the night. When I took my shirt off, she paused and said "Oh, what are those?" I explained briefly - insulin pump, glucose monitor. She asked if they hurt, I said not really. Then she said "That's actually really cool, like you're part cyborg" and just... continued like it was nothing.

I almost cried tbh. After years of feeling like a robot, having someone react so casually and even positively meant everything.

For anyone stressing about this - the right person won't care. And some will even think it's cool.`,
    author_anonymous: 'CyborgBoyfriend',
    score: 892,
    num_comments: 134,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    published_at: generatePastDate(5),
    topic_tags: ['intimacy', 'dating', 'emotional', 'pump', 'cgm'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example6'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_partner_cgm_question_007',
    title: "My partner asked about my CGM during our first night together - the conversation",
    content: `So I've been seeing this guy for a few weeks. We finally went back to his place and as things progressed, he noticed my Dexcom on my arm and asked "Is that a nicotine patch?"

I laughed and said no, it monitors my blood sugar because I have Type 1 diabetes. He got quiet for a second (which made my heart DROP) and then asked "Does it hurt? Can I touch it?"

I let him look at it, showed him the app on my phone, explained how it works. He was genuinely fascinated. Asked questions about lows and highs, if I needed to do anything special before/during sex.

It turned into this really intimate conversation about my health that I didn't expect. By the end he said "Thanks for trusting me enough to explain all that" and honestly it made us closer.

Don't be afraid of the conversation. The curious ones who ask questions are keepers.`,
    author_anonymous: 'FirstNightTalk',
    score: 567,
    num_comments: 89,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(19),
    topic_tags: ['intimacy', 'dating', 'cgm', 'communication'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example7'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_fully_naked_008',
    title: "Partner's reaction to seeing me fully naked with pump site and CGM - mixed feelings",
    content: `Okay so I need to process this. Been with my boyfriend for 2 months, finally got intimate last weekend.

When I was fully undressed, he looked at my body (pump site on stomach, CGM on arm) and said "Wow, you really do have a lot going on huh."

I don't think he meant it badly? But it made me feel SO self-conscious. Like I'm some kind of science experiment. He could tell I got quiet and asked if he said something wrong.

I explained that I'm sensitive about all the tech on my body and he apologized, said he was just surprised, that he thinks I'm beautiful regardless.

We continued and it was fine but I can't stop thinking about that comment. Am I overreacting? How do you all deal with comments like this even when they're not meant to be hurtful?`,
    author_anonymous: 'SensitiveAboutTech',
    score: 423,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'neutral',
    published_at: generatePastDate(27),
    topic_tags: ['intimacy', 'dating', 'emotional', 'body_image', 'pump', 'cgm'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example8'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_when_to_tell_009',
    title: "When do you tell someone you're dating about your devices? Before getting physical?",
    content: `Starting to date again after a long relationship and I'm rusty on the whole disclosure thing.

When do you bring up the diabetes/devices topic? I feel like there are a few options:

1. On the first date (seems too early, too much info)
2. After a few dates but before getting physical (my current plan)
3. Let them discover it naturally when clothes come off (feels dishonest?)
4. Only if they ask

I wear an Omnipod and Dexcom G7 so it's pretty noticeable once clothes are off. The Omnipod especially since it's on my stomach.

What's your approach? I don't want to make it a huge deal but I also don't want someone to be caught off guard and react badly in the moment.`,
    author_anonymous: 'DatingAgainT1D',
    score: 345,
    num_comments: 112,
    device_mentioned: 'omnipod',
    sentiment: 'neutral',
    published_at: generatePastDate(9),
    topic_tags: ['intimacy', 'dating', 'communication', 'pump', 'cgm'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example9'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_bf_remove_cgm_010',
    title: "My boyfriend asked if he could 'take off' my CGM during sex - facepalm moment",
    content: `I can't stop laughing about this so I had to share.

My boyfriend (non-diabetic, obviously) was getting a little too enthusiastic and my Dexcom was in his way. He literally asked "Can I just take this off for a bit?"

Sir. SIR. It's attached to my body with a needle. It's not a bandaid. 

I had to explain that no, it doesn't just peel off, and even if it did, I'd lose the sensor and be out $100+.

He was so embarrassed but honestly it was kind of cute how clueless he was. We've been together 4 months and he's still learning diabetes 101.

Anyone else have partners say hilariously clueless things about their devices?`,
    author_anonymous: 'CGMisNotABandaid',
    score: 678,
    num_comments: 145,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(3),
    topic_tags: ['intimacy', 'dating', 'cgm', 'funny', 'partners'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example10'
  },

  // Pump & Tubing Management (4 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_pump_disconnect_011',
    title: "Disconnecting pump during sex - how long is actually safe?",
    content: `Okay so I've seen conflicting info on this. I have a Medtronic 780G and I usually disconnect during sex because the tubing is just... a lot to deal with.

My endo said up to an hour is fine, but I've read online that some people say 30 mins max. Our sessions sometimes go longer than that (not bragging, just being real) and I start getting anxious about my BG.

What's everyone's actual experience? How long do you disconnect for and do you bolus to cover the missed basal or just let it ride?

Also, do you check your BG before/after or just trust the CGM trend?`,
    author_anonymous: 'DisconnectAnxiety',
    score: 234,
    num_comments: 76,
    device_mentioned: 'medtronic',
    sentiment: 'neutral',
    published_at: generatePastDate(14),
    topic_tags: ['intimacy', 'pump', 'devices', 'basal'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example11'
  },
  {
    source: 'r/insulinpump',
    post_id: 'intimacy_tubing_tangled_012',
    title: "Tubing gets tangled in EVERYTHING during intimacy - solutions?",
    content: `I swear my Tandem tubing has a mind of its own. During sex it tangles in sheets, gets caught on body parts, wraps around things. It's like wrestling an octopus while trying to be romantic.

I've tried:
- Clipping it to my underwear (but then I'm wearing underwear which defeats the purpose)
- Tucking it into a leg band (uncomfortable and it still escapes)
- Disconnecting (but then I forget to reconnect and wake up high)
- Shorter tubing (still tangles, just less dramatically)

This is honestly one of my biggest frustrations with tubed pumps. The Omnipod is looking more and more appealing for this reason alone.

What do you all do? Is there some secret I'm missing?`,
    author_anonymous: 'TubingNightmare',
    score: 189,
    num_comments: 67,
    device_mentioned: 'tandem',
    sentiment: 'negative',
    published_at: generatePastDate(21),
    topic_tags: ['intimacy', 'pump', 'devices', 'tubing'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/insulinpump/comments/example12'
  },
  {
    source: 'r/Omnipod',
    post_id: 'intimacy_omnipod_placement_013',
    title: "Omnipod placement for intimacy - what sites work best? (Honest discussion)",
    content: `Switched to Omnipod 5 partly because I was tired of tubing during sex. But now I'm realizing placement still matters for intimate situations.

Current rotation:
- Stomach: Gets bumped during missionary, pressed into during spooning
- Upper arm: Good but limits some positions where weight is on arms
- Lower back: My favorite so far but partner has bumped it from behind
- Thigh: Haven't tried yet, worried about occlusions

For those with active intimate lives, where do you find the pod stays most out of the way? And do you ever time your pod changes around date nights so you have a fresh site that's less likely to get knocked off?

Sorry if this is TMI but we all deal with it and I need real-world advice!`,
    author_anonymous: 'OmnipodNewbie2024',
    score: 267,
    num_comments: 83,
    device_mentioned: 'omnipod',
    sentiment: 'neutral',
    published_at: generatePastDate(7),
    topic_tags: ['intimacy', 'pump', 'omnipod', 'devices', 'site_rotation'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/Omnipod/comments/example13'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_pump_where_put_014',
    title: "Where do you actually PUT your pump during sex? Practical solutions needed",
    content: `Okay this is embarrassing but I've been T1D for 15 years and still haven't figured this out.

When I'm intimate with my wife, my pump (Tandem with 23" tubing) ends up:
- Under my back (uncomfortable, worried about damaging it)
- Flopping around on the bed (distracting, tubing pulls)
- In my hand (one less hand to use lol)
- Clipped to pillowcase (kinda works but still awkward)

There has to be a better solution. Do people buy special pump belts? Just disconnect every time? What's the actual practical answer here?

And please don't say "switch to Omnipod" - I've tried tubeless and it doesn't work for my body.`,
    author_anonymous: 'PumpPlacementPuzzle',
    score: 198,
    num_comments: 71,
    device_mentioned: 'tandem',
    sentiment: 'neutral',
    published_at: generatePastDate(33),
    topic_tags: ['intimacy', 'pump', 'devices', 'practical'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example14'
  },

  // Low Blood Sugar During Intimacy (4 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_low_during_015',
    title: "Went severely low during sex - scared both of us. How do you handle this?",
    content: `Last night I had one of the scariest experiences of my diabetic life. Was being intimate with my partner, really into it, and suddenly I just... crashed. Felt the adrenaline, started sweating profusely, couldn't think straight.

I had to stop everything, stumble to the kitchen, and down a juice box while my partner stood there terrified asking if they should call 911.

My CGM showed I dropped from 120 to 48 in like 20 minutes. I'm guessing the physical activity plus... other factors... just tanked my glucose.

Now I'm anxious about it happening again. My partner is too - they keep asking if sex is "safe" for me.

How do you all prevent this? Pre-sex snacks? Suspend pump? Lower basal beforehand? I need a game plan.`,
    author_anonymous: 'ScaryLowDuringSex',
    score: 534,
    num_comments: 121,
    device_mentioned: null,
    sentiment: 'negative',
    published_at: generatePastDate(11),
    topic_tags: ['intimacy', 'glucose_lows', 'safety', 'lifestyle'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example15'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_pre_glucose_016',
    title: "Pre-intimacy glucose targets - what number do you aim for?",
    content: `Curious what everyone's strategy is for blood sugar before sex.

I've learned the hard way that starting at 100 means I'll probably go low during. But starting at 200 means I feel like crap and my performance is affected.

Currently I try to be around 140-160 with a flat or slightly rising trend before initiating anything. I'll have a small snack (usually glucose tabs or a few crackers) about 15-20 mins before if I'm trending down.

Is this overcomplicated? What's your magic number/strategy?

Also - do you factor in time of day? I definitely drop faster during morning activities vs evening.`,
    author_anonymous: 'PreSexGlucosePlanning',
    score: 287,
    num_comments: 94,
    device_mentioned: null,
    sentiment: 'neutral',
    published_at: generatePastDate(18),
    topic_tags: ['intimacy', 'glucose', 'lifestyle', 'tips'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example16'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_partner_checks_cgm_017',
    title: "Partner now checks my CGM before we start anything - is that weird or sweet?",
    content: `After I went low during sex a few months ago, my partner got really worried. Now, every time we're about to be intimate, she glances at my Dexcom app on her phone (I shared Follow access with her) and says something like "You're at 135 with a flat arrow, we're good to go."

Part of me finds this incredibly sweet and caring. She's looking out for my safety.

But another part of me feels like it kills the spontaneity? Like we can't just get swept up in the moment without a glucose check.

Has anyone else's partner become hyper-vigilant about BG during intimacy? How do you balance safety with keeping things natural and romantic?`,
    author_anonymous: 'PartnerChecksBG',
    score: 412,
    num_comments: 88,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    published_at: generatePastDate(25),
    topic_tags: ['intimacy', 'cgm', 'partners', 'relationships'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example17'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_glucose_tabs_nightstand_018',
    title: "The 'romantic glucose tabs on nightstand' approach - anyone else?",
    content: `Just realized how not normal this is and needed to share with people who get it.

My nightstand has:
- Glucose tabs (tube of 10)
- Juice box
- Small bag of gummy bears
- My Dexcom receiver as backup

My partner calls it my "passion prevention kit" (jokingly) because nothing kills the mood like having to run to the kitchen for sugar.

Does everyone keep low supplies bedside? What's your setup? I'm curious if I'm being overly prepared or if this is just standard T1D life.`,
    author_anonymous: 'RomanticGlucoseTabs',
    score: 567,
    num_comments: 102,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(4),
    topic_tags: ['intimacy', 'glucose_lows', 'lifestyle', 'funny', 'tips'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example18'
  },

  // Mental & Emotional Aspects (4 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_cyborg_feeling_019',
    title: "Feeling like a cyborg - dealing with body image when you're covered in tech",
    content: `I've been struggling with this for years and therapy isn't really helping because my therapist doesn't understand the T1D experience.

I have an Omnipod on my stomach, Dexcom on my arm, and Libre on my other arm (I wear both CGMs for data comparison). When I look at myself naked in the mirror, I see more medical devices than skin in some areas.

During intimacy, I can't stop thinking about what my partner sees. Do they see me or do they see a pincushion? A robot? A science experiment?

I know logically these devices keep me alive and I should be grateful. But emotionally, I mourn the pre-diagnosis body I once had.

Does anyone else struggle with this? How do you accept your tech-covered body as beautiful and desirable?`,
    author_anonymous: 'CyborgSadness',
    score: 678,
    num_comments: 156,
    device_mentioned: 'omnipod',
    sentiment: 'negative',
    published_at: generatePastDate(29),
    topic_tags: ['intimacy', 'mental_health', 'body_image', 'emotional', 'devices'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example19'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_self_conscious_020',
    title: "How to stop being self-conscious about naked body with devices - need mental shift",
    content: `I've been single for 2 years partly because I'm terrified of intimacy with my devices. I wear a pump site on my stomach and CGM on my arm. Not that much tech, but enough that I feel like a medical patient, not a desirable person.

I've turned down second/third dates because I knew where things were heading and couldn't face the "reveal" moment.

This is affecting my life. I want a relationship. I want intimacy. But I can't get past my own mental block.

Has anyone overcome this? What clicked for you? I need some kind of mental shift and I don't know how to get there.`,
    author_anonymous: 'SingleAndScared',
    score: 445,
    num_comments: 118,
    device_mentioned: null,
    sentiment: 'negative',
    published_at: generatePastDate(16),
    topic_tags: ['intimacy', 'mental_health', 'body_image', 'dating', 'emotional'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example20'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_devices_less_sexy_021',
    title: "My devices make me feel less sexy - how to reframe this mentally?",
    content: `Just need to vent and maybe get some advice.

I used to feel attractive. Before diagnosis (T1D at 25, now 32), I was confident in my body. I wore crop tops, bikinis without a second thought.

Now I have pump sites and CGM sensors creating bumps under my clothes. In intimate moments, I'm hyper-aware of every piece of tech on me. I don't feel like a sexy partner - I feel like a patient.

My husband says he doesn't care, that he thinks I'm beautiful. But I don't believe him? Like how can scars and adhesive and plastic be attractive?

How do I reframe this? How do I see my devices as neutral or even positive instead of ugly?`,
    author_anonymous: 'FeelLessSexy',
    score: 389,
    num_comments: 95,
    device_mentioned: null,
    sentiment: 'negative',
    published_at: generatePastDate(22),
    topic_tags: ['intimacy', 'mental_health', 'body_image', 'emotional', 'marriage'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example21'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_partner_says_cool_022',
    title: "Partner says my devices are 'cool' and I'm 'bionic' - still feel insecure. Why?",
    content: `My girlfriend is incredibly supportive. She calls my pump site my "port" like I'm charging. She thinks my CGM is "cool tech" and has asked multiple times to watch me insert a new sensor because she finds it fascinating.

Objectively, I have a partner who not only accepts my devices but actively thinks they're interesting.

So why do I STILL feel insecure? Why can't I just accept that she genuinely doesn't mind? Every time we're intimate, there's a voice in my head saying "she's just being nice, she actually thinks it's gross."

Has anyone else dealt with not being able to accept a partner's acceptance? How do I shut up that inner critic?`,
    author_anonymous: 'CantAcceptAcceptance',
    score: 356,
    num_comments: 87,
    device_mentioned: null,
    sentiment: 'neutral',
    published_at: generatePastDate(13),
    topic_tags: ['intimacy', 'mental_health', 'emotional', 'relationships', 'partners'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example22'
  },

  // Alarms & Interruptions (3 posts)
  {
    source: 'r/dexcom',
    post_id: 'intimacy_alarm_ruined_023',
    title: "CGM alarm ruined the mood at the worst possible moment - how to handle gracefully?",
    content: `So there I was, things were getting really intense with my partner, like REALLY getting there, and BEEEEP BEEEEP BEEEEP. My Dexcom urgent low alarm went off.

I was at 62 with a down arrow. Had to completely stop, get sugar, wait 15-20 mins for it to come back up while lying there feeling like a mood-killing robot.

My partner was understanding but I could tell they were frustrated (not at me, just at the situation).

How do you all handle alarm interruptions gracefully? Do you:
1. Immediately stop and treat no matter what (safest but kills vibe)
2. Quickly treat and try to continue (risky?)
3. Set wider alarm ranges for these times (risky?)
4. Something else?

I'm tired of my CGM cockblocking me honestly.`,
    author_anonymous: 'AlarmCockblock',
    score: 445,
    num_comments: 98,
    device_mentioned: 'dexcom',
    sentiment: 'negative',
    published_at: generatePastDate(6),
    topic_tags: ['intimacy', 'cgm', 'alarms', 'glucose_lows'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/dexcom/comments/example23'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_dnd_settings_024',
    title: "Setting up 'do not disturb' schedules for intimate times - my strategy",
    content: `After one too many alarm interruptions during sex, I developed a strategy for managing my CGM alerts during intimate moments.

Dexcom settings I use:
- Created a custom "Activity" alert profile with wider ranges (70-250)
- Set to vibrate only, no sound
- Keep urgent low at 55 because safety first

Before date night:
- Switch to Activity profile
- Make sure I'm in a good range (130-160 ideal)
- Have fast sugar within arm's reach

After:
- Switch back to normal profile
- Check BG to make sure I didn't miss anything

Some people think this is risky but I'd rather have slightly wider ranges for an hour than have my intimate life constantly interrupted. The urgent low alarm is still there for true emergencies.

What's everyone else's approach to alarm management during intimacy?`,
    author_anonymous: 'DNDStrategist',
    score: 378,
    num_comments: 76,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(17),
    topic_tags: ['intimacy', 'cgm', 'alarms', 'tips', 'settings'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example24'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_low_scream_025',
    title: "My Dexcom literally SCREAMED during sex - we both jumped out of our skin",
    content: `Okay I have to share this story because it's simultaneously mortifying and hilarious.

Was with my partner, things were really heating up, we were both completely in the moment, when my Dexcom urgent low alarm went off at FULL VOLUME. You know the one - the one that sounds like the world is ending.

We both literally screamed and jumped apart. I frantically grabbed my phone thinking something was seriously wrong. I was at 54 with double arrows down.

Had to eat glucose tabs while my partner's heart rate came back down from the scare. They said it sounded like an air raid siren.

The mood was thoroughly killed but at least we can laugh about it now. Anyone else have their CGM alarm scare the life out of them at the worst moment?`,
    author_anonymous: 'CGMAirRaid',
    score: 612,
    num_comments: 132,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    published_at: generatePastDate(2),
    topic_tags: ['intimacy', 'cgm', 'alarms', 'funny', 'glucose_lows'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example25'
  },

  // Specific Scenarios (4 posts)
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_first_time_after_026',
    title: "First time being intimate after diagnosis - what I wish I'd known",
    content: `Got diagnosed T1D 6 months ago at age 28. Just had my first intimate experience post-diagnosis last week. Here's what I wish someone had told me:

1. Have the conversation BEFORE clothes come off. Trying to explain a pump site while already naked is awkward.

2. Check your BG beforehand. I was at 180 and honestly felt a bit off the whole time. Should have waited for it to come down.

3. Put low supplies within reach. I didn't go low but I was anxious about it the whole time because I had nothing nearby.

4. The reveal isn't as big a deal as you think. My partner looked at my CGM, asked one question, and moved on. All that anxiety for nothing.

5. Physical activity drops BG fast. I went from 180 to 110 during a 30-min session. Something to remember for next time.

6. It's okay to pause and check. I stopped once to look at my CGM and my partner didn't care at all.

Sharing because I wish I'd found posts like this when I was googling "sex with diabetes" in a panic a month ago.`,
    author_anonymous: 'NewDiabeticDating',
    score: 534,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    published_at: generatePastDate(10),
    topic_tags: ['intimacy', 'newly_diagnosed', 'tips', 'dating', 'lifestyle'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example26'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_new_partner_honeymoon_027',
    title: "New relationship honeymoon phase with T1D - intimacy happening a lot, BG is chaos",
    content: `Just started dating someone new and we're in that phase where we can't keep our hands off each other. Which is great! Except my blood sugars are absolutely chaotic.

Multiple times a day of... activity... means I'm constantly going low. I've halved my basal during the day on weekends when we're together and I still trend down.

On top of that, I'm sleeping less, eating at weird times, and my whole routine is disrupted.

Any tips for managing T1D during the crazy honeymoon phase of a new relationship? I know it'll calm down eventually but right now I feel like I'm on a glucose rollercoaster.`,
    author_anonymous: 'HoneymoonPhaseChaos',
    score: 298,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'neutral',
    published_at: generatePastDate(20),
    topic_tags: ['intimacy', 'dating', 'glucose', 'lifestyle', 'relationships'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example27'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_long_term_couple_028',
    title: "Long-term couples: how has diabetes/devices affected your sex life over years?",
    content: `Been with my wife for 12 years, T1D for 10 of them. Curious how other long-term couples navigate this.

For us, it's become completely routine. She knows to check my CGM trend before initiating. She knows where my glucose tabs are. She knows to let me finish treating a low before getting back to it.

The devices have become background noise - neither of us even notices them anymore during intimacy.

But I remember early on it was so awkward. She was afraid to touch my pump site. I was self-conscious constantly.

For those in long-term relationships: how has your intimate life with T1D evolved? What advice would you give newlywed couples where one partner has T1D?`,
    author_anonymous: 'LongTermT1DCouple',
    score: 423,
    num_comments: 94,
    device_mentioned: null,
    sentiment: 'positive',
    published_at: generatePastDate(28),
    topic_tags: ['intimacy', 'marriage', 'relationships', 'lifestyle', 'long_term'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example28'
  },
  {
    source: 'r/diabetes',
    post_id: 'intimacy_one_night_stands_029',
    title: "One night stands with T1D - the awkward device conversation",
    content: `Okay this might be controversial but I need advice for casual situations.

When you're having a one night stand or casual hookup, how do you handle the device reveal? It feels weird to launch into a diabetes education session with someone you just met at a bar.

Do you:
1. Give a minimal explanation ("medical device, don't worry about it")
2. Explain fully (feels too personal for a casual thing)
3. Hope they don't ask (they always ask)
4. Preemptively mention it ("just so you know, I have some medical stuff")

I've had a few awkward experiences where my hookup got concerned seeing the pump site and thought something was wrong with me. One person thought I was on some kind of drug delivery system (??).

How do you handle casual situations where you don't want to share your whole medical history but need to address the visible tech?`,
    author_anonymous: 'CasualEncounterT1D',
    score: 267,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'neutral',
    published_at: generatePastDate(24),
    topic_tags: ['intimacy', 'dating', 'casual', 'communication', 'lifestyle'],
    is_solution: false,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes/comments/example29'
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'intimacy_positions_that_work_030',
    title: "Let's get practical: Specific positions that work best with pump/CGM sites",
    content: `Alright let's have an adult conversation because this info is impossible to find anywhere else.

I'll start by sharing what works and doesn't work for me:

**My setup**: Omnipod on stomach, Dexcom G7 on back of arm

**Positions that work well**:
- Spooning (nothing gets pressed)
- Partner on top (I can control my body position)
- Side by side (minimal contact with device areas)

**Positions that are tricky**:
- Missionary (pod gets pressed into, uncomfortable)
- Anything where I'm face down (pressure on stomach)

**Solutions I've found**:
- Slightly angle my body to keep pod from getting direct pressure
- Pillow under my hips to shift pod away from contact zone
- Switch pod to lower back for "special occasion" pod changes

Would love to hear what works for others. This is practical info we all need but no one talks about!`,
    author_anonymous: 'PracticalPositionTalk',
    score: 567,
    num_comments: 143,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    published_at: generatePastDate(1),
    topic_tags: ['intimacy', 'devices', 'pump', 'cgm', 'practical', 'tips'],
    is_solution: true,
    post_type: 'post',
    url: 'https://reddit.com/r/diabetes_t1/comments/example30'
  }
];

// Generate comments for each post
const generateCommentsForPost = (post: CommunityPost): CommunityComment[] => {
  const commentTemplates: Record<string, CommunityComment[]> = {
    'intimacy_cgm_positions_001': [
      { post_id: '', author_anonymous: 'BackOfArmGang', content: `Back of arm is absolutely the way to go. Been doing it for 2 years now and it stays out of the way for everything. The only downside is sleeping on that side sometimes, but for intimacy it's perfect. Never had it get in the way or fall off during anything. Also the accuracy is great for me there, maybe slightly delayed compared to stomach but totally worth it.`, score: 156, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ThighTerritory', content: `Upper outer thigh is my go-to. Started doing it when I realized my arm was getting in the way during cuddling and more. The thigh placement means nothing touches it during most activities. Takes a bit to get used to inserting there but so worth it.`, score: 134, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'StomachStruggles', content: `I'm stuck on stomach because my accuracy is terrible everywhere else. What I've done is moved to the far side of my stomach, almost on my hip. It's still not perfect but way better than center stomach placement. At least it doesn't get direct pressure in most positions now.`, score: 89, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ReplyingToOP', content: `Pro tip: wherever you wear it, add an extra adhesive patch on date nights. I use Simpatch and haven't had one come off during activities in over a year. The peace of mind is worth the extra cost.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PartnerOfT1D', content: `Partner of a T1D here - honestly from our perspective, we don't care where the sensor is. We're just happy you're healthy. Don't overthink it. If we bump it, we'll adjust and move on. It's really not a big deal for us.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'BackOfArmGang', content: `Replying to myself to add: I also use the back of arm because it's easier to show off. Sounds weird but I've had partners think it's cool tech rather than something to be embarrassed about. The arm placement makes it more visible and less "hidden medical thing."`, score: 67, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'LowerBackLife', content: `Lower back works great for me. Like right above where your jeans waistband would sit but on the back. Nothing touches it during intimacy unless you're doing some very specific things, and even then you can angle yourself to avoid it.`, score: 98, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ChestOption', content: `Anyone tried upper chest? I've been curious. I'm a smaller-chested woman so I have some real estate there but worried about accuracy and bra interference.`, score: 45, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ReplyToChest', content: `@ChestOption I tried it and accuracy was okay but it was uncomfortable during intimate moments. Also visible in lower neckline tops which I didn't love. Went back to arm.`, score: 52, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PracticalAdvice', content: `My advice: try a few different spots with sensors you've already gotten good wear from (so if they fail it's not a total waste). Find what works for YOUR body and YOUR activities. Everyone's different. What works for me (inner arm near armpit) might not work for you.`, score: 87, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_cgm_ripped_002': [
      { post_id: '', author_anonymous: 'SkinTacEvangelist', content: `SkinTac is absolutely essential. I apply it in a circle around where the sensor will go, let it dry for 60 seconds, then insert. My sensors last the full 10 days now even with very active... activities. Can't recommend it enough.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SimplePatchUser', content: `I use Simpatch. They're specifically designed for Dexcom and they WORK. I've done everything from swimming to marathon sex sessions (tmi but relevant) and nothing has fallen off. They also come in cute patterns if you want to make it less medical looking.`, score: 187, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'MedicalTapeHack', content: `Cheap solution that works: 3M Tegaderm or even just medical tape around all the edges of your regular overpatch. I do this on day 1 when I insert and my sensor stays bulletproof for the whole session. Costs like $0.50 per sensor.`, score: 145, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ThighConvert', content: `I switched to thigh specifically because of this. Arms and sheets are a bad combo. On my upper thigh nothing catches on anything because my thigh isn't rubbing on sheets during activities. Problem solved.`, score: 112, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'DoubleDownMethod', content: `My method: SkinTac underneath + standard Dexcom overpatch + additional Simpatch on top + medical tape on any edges that curl. Is it overkill? Maybe. Have I lost a sensor since I started this? Nope. Worth every second of prep.`, score: 167, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'DexcomWillReplace', content: `PSA: if your sensor fails within the 10 day window, Dexcom will replace it for free. I've done this a few times when sensors got ripped off. Just call or use the app to request a replacement. They don't ask for details about HOW it came off lol.`, score: 198, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PreventionTip', content: `The best prevention is placement. I put mine on my inner arm near my armpit. There's no way sheets can catch it there because it's in a protected zone. Plus no one sees it casually so it's more private.`, score: 76, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'BackOfArm', content: `Back of arm, not outer arm. Game changer. The outer arm catches on everything. Back of arm stays protected against your body during most activities.`, score: 89, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_thigh_placement_003': [
      { post_id: '', author_anonymous: 'ThighConvert2', content: `OMG I've been struggling with this for years and never thought to try thigh! Going to try it with my next sensor. Which part of the thigh exactly - front, side, back?`, score: 67, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ThighPlacementConvert', content: `@ThighConvert2 Back of thigh, upper area. Like if you put your hand on the back of your thigh where you'd sit on it, go up a few inches from there. It's protected by your body when you're on your back and doesn't get contact when you're on top either.`, score: 89, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'TriedItWorked', content: `Just tried this after seeing your post. You're 100% right. Total game changer. My partner didn't bump into it once and we were... thorough. Only downside is I can feel it when I sit certain ways but a small price to pay.`, score: 123, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'AccuracyConcerns', content: `How's your accuracy on thigh? I've always heard it's not as accurate as stomach or arm. I'd hate to trade intimacy convenience for bad readings.`, score: 56, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ThighPlacementConvert', content: `@AccuracyConcerns For me the accuracy is actually better than arm was. Slightly slower than stomach but I'm talking like 5-10 min lag, not significant. Everyone's different though - maybe try it with an expiring sensor so if it doesn't work you didn't waste a fresh one.`, score: 78, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'InsertionTrick', content: `For anyone trying this: use a mirror for insertion. Or have your partner help! My girlfriend inserts my thigh sensors now and it's kind of a bonding thing for us. She's gotten really good at it.`, score: 145, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SideSleeper', content: `My only concern with thigh is sleeping on my side. Do you ever roll onto it? I sleep on my side and worry I'd put pressure on it all night.`, score: 34, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SideSleepSolution', content: `@SideSleeper I sleep on my side too. I put the sensor on whichever thigh is on top when I sleep. So if I sleep on my left side, sensor goes on right thigh. Never roll onto it.`, score: 67, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_partner_reaction_006': [
      { post_id: '', author_anonymous: 'SameExperience', content: `This gives me so much hope. I've been putting off dating because I'm terrified of this exact moment. Maybe I'm overthinking it.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'CyborgBoyfriend', content: `@SameExperience You are 100% overthinking it. Most people are curious at most. And the ones who are jerks about it? You dodged a bullet by finding out early. Go date!`, score: 187, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PartnerPerspective', content: `Non-T1D partner here. When my now-husband first took off his shirt and I saw his pump, my first thought was literally "oh cool, tech." My second thought was appreciating other things lol. It's really not the big deal you think it is.`, score: 345, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SimilarStory', content: `My boyfriend also used the cyborg comparison! He said he's "dating a cyborg" and seems genuinely proud of it. He's more interested in my tech than I am at this point. Asks how my numbers are, wants to see the graphs. Found a keeper.`, score: 156, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ReliefPostDiagnosis', content: `I was diagnosed at 30 and my biggest fear was dating with devices. 2 years later I'm engaged to someone who doesn't bat an eye at any of it. The right person truly will not care.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'FlipSide', content: `Not to be a downer but I did have someone react negatively once. Ghosted me after seeing my pump. But you know what? Better to find out then than months later. Most people are like the OP's girlfriend - curious and then moving on.`, score: 89, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'DeviceConfidence', content: `I've started owning it. Like when I know clothes are about to come off, I'll casually say "just FYI, I've got some cool diabetes tech going on" and give a quick explanation. Taking control of the reveal has made me way less anxious about it.`, score: 134, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'LateNightThoughts', content: `Reading this thread at 2am because I have a third date tomorrow that might lead to staying over and I'm so nervous. Thank you all for making me feel better. We're not freaks. We're just humans with some extra accessories.`, score: 167, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_low_during_015': [
      { post_id: '', author_anonymous: 'SameHappened', content: `This happened to me too. Nothing kills the mood faster than shaking, sweating, and going cross-eyed from a low. My partner was terrified. Now I always check before and have glucose tabs on the nightstand.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PreSexSnack', content: `I have a small snack about 15-20 minutes before if I'm trending down at all. Even if I'm at 120, if I have a down arrow, I'll have a few crackers. It's preventative but has saved me from interrupted sessions multiple times.`, score: 189, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'TempBasalMethod', content: `If you're on a pump, set a temp basal to like 50% about 30 mins before. Or if you have Control-IQ/similar, switch to exercise mode. Your BG will stay higher during physical activity and you won't crash.`, score: 256, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'GlucoseTabletsOnNightstand', content: `Glucose tabs on the nightstand, always. It's not romantic but it's practical. If I start feeling low, I can quickly pop 2 tabs without leaving the bed and usually that's enough to keep going without a major interruption.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'LowAnxiety', content: `The anxiety about it happening again is almost worse than the actual low. I've started telling my partner when I'm in a good range and giving her permission to check my CGM app if I seem off. It takes the pressure off me watching it.`, score: 123, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SafetyFirst', content: `Sex IS safe for you, but you need a game plan. Make sure your partner knows the signs of a low and knows where your sugar is. Make them a partner in your safety, not just a bystander who's scared when something happens.`, score: 145, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'MedicalTip', content: `PSA: if you're on insulin that peaks (like Humalog/Novolog), try not to get intimate during the peak time after a meal bolus. That 1-3 hour window after eating is when you're most likely to crash with added activity.`, score: 167, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'CalmnessHelps', content: `Something that helps me: I've accepted that stopping for a low is just part of my life and not a failure or embarrassment. Once I stopped being ashamed of it, the whole experience became less stressful. My partner and I can pause, treat, wait 10 minutes, and continue. It's fine.`, score: 89, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_cyborg_feeling_019': [
      { post_id: '', author_anonymous: 'BodyImageStruggle', content: `I feel this so deeply. Some days I look at my body and all I see is adhesive residue, scars from old sites, and plastic attached to me. It's hard to feel desirable when you feel like a medical experiment.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'TherapyRecommendation', content: `Have you looked for a therapist who specializes in chronic illness? Generic therapists often don't understand the specific body image issues that come with visible medical devices. The T1D community sometimes has recommendations for specialists who get it.`, score: 187, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ReframingHelped', content: `What helped me was reframing: these devices don't make me look sick, they make me look like someone who is managing a serious condition and living fully. They're evidence of my strength, not my weakness.`, score: 267, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PartnerPerspective2', content: `Partner of a T1D here: I genuinely don't see the devices. When I look at my girlfriend, I see HER. The sensors and pump site are as invisible to me as a freckle or a scar. You are so much more than your medical equipment.`, score: 345, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'CyborgIsPositive', content: `I actually try to embrace the cyborg thing. We ARE part human, part machine. And that's kind of badass? Like yes, I have technology integrated into my body that keeps me alive. I'm basically a sci-fi character.`, score: 156, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'GriefIsValid', content: `It's okay to grieve your pre-diagnosis body. That grief is valid. But also try to find moments of appreciation for your current body - the one that is working SO hard to keep you here, with the help of some pretty impressive technology.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'MirrorExercise', content: `Something my therapist had me do: spend 5 minutes looking at myself in the mirror and naming things I appreciate about my body that have nothing to do with diabetes. My eyes, my hands, whatever. It's slowly helping me see myself as a whole person, not just a collection of medical sites.`, score: 134, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'TwoSensors', content: `Wait you wear TWO CGMs at once? I'm curious about that. Is it for backup or comparison? That sounds expensive but thorough.`, score: 45, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'CyborgSadness', content: `@TwoSensors It's for data comparison - I'm in a study and I track both to give feedback on the newer system. Insurance covers one, the study covers the other. So yes, I have even more tech on me than usual, hence the extra body image issues.`, score: 67, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'BeKind', content: `Be gentle with yourself. Body image issues are hard for anyone, and we have extra layers to deal with. You're not alone in this struggle. Sending virtual hugs.`, score: 198, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_alarm_ruined_023': [
      { post_id: '', author_anonymous: 'SameExperience2', content: `The Dexcom urgent low sound is DESIGNED to be impossible to ignore. Great for safety, terrible for romance. I've learned to have sugar ready so I can treat fast and get back to things with minimal interruption.`, score: 187, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'QuickTreatMethod', content: `My strategy: glucose tabs on nightstand, grab 4 tabs, chew while continuing (if safe to do so). Yeah it's not ideal but sometimes I can keep the momentum going while treating. Only works if you're not dangerously low though.`, score: 134, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'WiderRanges', content: `I use the Activity setting on Dexcom with wider ranges (70-250) during intimate times. Keeps the non-urgent alerts away. Urgent low is still there for real emergencies but the regular "you're 75" alerts don't interrupt.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'VibrateOnly', content: `Can you set it to vibrate only for those times? I know the urgent low overrides this but regular lows can be vibrate only. It's less jarring for both of you.`, score: 89, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SafetyOverMood', content: `Honestly? Safety comes first. Yes it kills the mood but a bad low can be dangerous. I'd rather pause, treat, and pick up again than push through and end up in a bad situation. Partners who care will understand.`, score: 234, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PreventionBest', content: `Best solution is prevention. Check your BG before starting, have a small snack if you're trending down, reduce basal if you're on a pump. The goal is to never get to the alarm point in the first place.`, score: 156, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'HumorHelps', content: `My partner and I have learned to laugh about it. The alarm goes off, we both dramatically sigh, I chug some juice, we wait 10 mins chatting or cuddling, then continue. Making it light-hearted has helped a lot.`, score: 167, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PartnerTrust', content: `I've given my partner Follow access so she can see my trend. If she sees I'm dropping, she'll sometimes pause things before the alarm even goes off. It's actually made us more connected in a weird way.`, score: 145, parent_comment_id: null, created_at: '' },
    ],
    'intimacy_positions_that_work_030': [
      { post_id: '', author_anonymous: 'StomachPodUser', content: `With pod on stomach, I find that straddling (me on top) is the best because I can position my body to keep the pod from direct contact. Missionary is definitely the worst - direct pressure on the pod every time.`, score: 156, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'SideLying', content: `Side-lying positions are great for devices on arms or stomach. Nothing gets crushed, you're both comfortable, and you can easily reach over to check a CGM if needed. Also very romantic and intimate.`, score: 134, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'PillowTrick2', content: `The pillow trick is real! A pillow under the hips changes the angle enough to take pressure off a stomach device. We keep an extra firm pillow just for this purpose lol.`, score: 178, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'LowerBackPod', content: `I switched my pod to lower back specifically for intimacy reasons. Now it's out of the way for nearly everything. The only position where it's an issue is prone positions but we just avoid those or I put a pillow under my hips.`, score: 123, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'Communication', content: `Honestly the best "position" is good communication. "Hey can we adjust, my pump is getting pressed." A good partner will move without making it weird. We've gotten pretty good at quick adjustments mid-activity.`, score: 267, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ThighPodWorks', content: `Outer thigh pod placement has been amazing for me. It's never in the contact zone for any position we do. Only downside is clothes can sometimes catch on it but we're usually not wearing clothes by that point anyway.`, score: 89, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'StandingOptions', content: `Has anyone tried standing positions? Seems like everything would be out of the way. We've tried and it works but it's tiring lol. Maybe I need to add leg day to my routine.`, score: 67, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'ChairOption', content: `Chair positions work really well with devices on stomach or arms. Nothing gets pressed against a surface, full control over body position, and honestly it's fun to change things up from the bed.`, score: 78, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'FromBehind', content: `Positions from behind work great if your devices are on your front (stomach, arm fronts). Nothing gets contacted at all. We've incorporated more of these into rotation specifically for this reason.`, score: 112, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'AdaptAndOvercome', content: `The key is being willing to adapt. Some positions that worked before diagnosis don't work as well now, and that's okay. We've found new favorites that work with my devices. It's about quality of connection, not specific positions.`, score: 145, parent_comment_id: null, created_at: '' },
      { post_id: '', author_anonymous: 'GratefulForThread', content: `Thank you for starting this thread. I've been embarrassed to ask these questions but this is EXACTLY the practical info we need. Going to try the pillow trick tonight.`, score: 198, parent_comment_id: null, created_at: '' },
    ],
  };

  const defaultComments: CommunityComment[] = [
    { post_id: '', author_anonymous: 'SupportiveT1D', content: `Thanks for sharing this. It's so important that we talk openly about these things. We deserve to have fulfilling intimate lives despite our condition.`, score: 45, parent_comment_id: null, created_at: '' },
    { post_id: '', author_anonymous: 'MeToo123', content: `I can totally relate to this. You're not alone!`, score: 34, parent_comment_id: null, created_at: '' },
    { post_id: '', author_anonymous: 'PracticalAdvice2', content: `What's worked for me is communication with my partner and just not overthinking it. Easier said than done but it gets better with time.`, score: 67, parent_comment_id: null, created_at: '' },
    { post_id: '', author_anonymous: 'NewDiabetic2024', content: `I'm newly diagnosed and so grateful for posts like this. Helps me feel less alone in figuring all this stuff out.`, score: 56, parent_comment_id: null, created_at: '' },
    { post_id: '', author_anonymous: 'LongTimerT1D', content: `20 years T1D here. It does get easier. Promise. The devices become background noise eventually.`, score: 78, parent_comment_id: null, created_at: '' },
  ];

  let comments = commentTemplates[post.post_id] || defaultComments;
  
  // Add timestamps and post_id to each comment
  return comments.map((comment, index) => ({
    ...comment,
    post_id: post.post_id,
    created_at: generatePastDate(Math.max(1, 5) + index),
  }));
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    console.log('Starting intimacy community posts seeding...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check existing posts with intimacy topic tags
    const { data: existingPosts, error: checkError } = await supabase
      .from('community_posts')
      .select('post_id')
      .contains('topic_tags', ['intimacy'])
      .limit(5);

    if (checkError) {
      console.error('Error checking existing posts:', checkError);
      throw checkError;
    }

    console.log(`Found ${existingPosts?.length || 0} existing intimacy posts`);

    // If we already have intimacy posts, skip seeding
    if (existingPosts && existingPosts.length >= 5) {
      console.log('Intimacy posts already seeded, skipping...');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Intimacy posts already exist',
          existing_count: existingPosts.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert posts
    let insertedPosts = 0;
    let insertedComments = 0;
    const postIdMap: Record<string, string> = {};

    for (const post of intimacyPosts) {
      const { data: insertedPost, error: postError } = await supabase
        .from('community_posts')
        .insert({
          source: post.source,
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          author_anonymous: post.author_anonymous,
          score: post.score,
          num_comments: post.num_comments,
          device_mentioned: post.device_mentioned,
          sentiment: post.sentiment,
          published_at: post.published_at,
          topic_tags: post.topic_tags,
          is_solution: post.is_solution,
          post_type: post.post_type,
          url: post.url,
        })
        .select('id, post_id')
        .maybeSingle();

      if (postError) {
        console.error(`Error inserting post ${post.post_id}:`, postError);
        continue;
      }

      insertedPosts++;
      postIdMap[post.post_id] = insertedPost.id;
      console.log(`Inserted post: ${post.title.substring(0, 50)}...`);

      // Generate and insert comments for this post
      const comments = generateCommentsForPost(post);
      
      for (const comment of comments) {
        const { error: commentError } = await supabase
          .from('community_comments')
          .insert({
            post_id: insertedPost.id,
            author_anonymous: comment.author_anonymous,
            content: comment.content,
            score: comment.score,
            parent_comment_id: null,
            created_at: comment.created_at,
          });

        if (commentError) {
          console.error(`Error inserting comment:`, commentError);
          continue;
        }
        insertedComments++;
      }
    }

    console.log(`Seeding complete: ${insertedPosts} posts, ${insertedComments} comments`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedPosts} intimacy posts with ${insertedComments} comments`,
        posts_inserted: insertedPosts,
        comments_inserted: insertedComments,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in seed-intimacy-community-posts:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errMsg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
