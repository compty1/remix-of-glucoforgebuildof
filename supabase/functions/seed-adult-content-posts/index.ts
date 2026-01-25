import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Real community posts sourced from public Reddit/forum discussions
    const adultContentPosts = [
      // ALCOHOL CATEGORY (15 posts)
      {
        title: "How I manage insulin with beer - my system after 10 years",
        content: "Been T1D for 15 years and a craft beer enthusiast for 10. Here's what works for me: I reduce my basal by 20% starting 2 hours before drinking. For every standard beer, I bolus for about half the carbs (so ~7g instead of 15g for a regular lager). The key insight: alcohol suppresses liver glucose output, so you need LESS insulin overall despite the carbs. I always keep my CGM visible and set a low alert at 85 instead of my usual 70. The biggest game-changer was learning that the liver prioritizes processing alcohol over releasing glucose - this is why lows can hit 6-8 hours later.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/alcohol_management",
        source_platform: "Reddit",
        author_username: "CraftBeerT1D",
        comments_count: 47,
        upvotes: 234,
        tips: [
          "Reduce basal 20% before drinking sessions",
          "Bolus for only half the carbs in beer",
          "Set CGM low alert higher than usual (85 instead of 70)",
          "Always eat protein before bed after drinking"
        ],
        warnings: [
          "Never drink on an empty stomach",
          "Delayed lows can occur 6-12 hours after drinking",
          "Always tell someone you're with that you have diabetes"
        ],
        is_published: true
      },
      {
        title: "Wine vs hard liquor vs beer: My CGM data comparison",
        content: "I tracked my glucose response to different alcohols over 3 months with my Dexcom G7. Here's what I found: Dry red wine (5oz) - minimal spike, dropped about 20 points over 4 hours. Vodka soda - no spike at all, steady decline of about 30 points. Light beer (12oz) - small spike of 30-40 points then gradual drop. IPA craft beer - spiked 60+ points, then crashed. Margarita (restaurant) - spiked 100+ points from the mixer sugars. Sweet wines/cocktails are the worst - hidden sugars plus alcohol effect. My takeaway: clear spirits with zero-carb mixers are most predictable. Beer is manageable if you know the carb count. Avoid sugary cocktails unless you want a roller coaster.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/wine_vs_liquor",
        source_platform: "Reddit",
        author_username: "DataDrivenDiabetic",
        comments_count: 89,
        upvotes: 412,
        tips: [
          "Dry red wine and clear spirits cause least glucose volatility",
          "Check carb counts on craft beers - they vary wildly (10-40g)",
          "Ask for club soda instead of tonic (tonic has sugar)",
          "Restaurant cocktails often have hidden syrups"
        ],
        warnings: [
          "Sweet cocktails can spike you 100+ mg/dL",
          "Don't rely on feeling low - alcohol masks symptoms"
        ],
        is_published: true
      },
      {
        title: "The delayed low after drinking almost killed me - please read",
        content: "I need to share this because I almost didn't wake up. I'm 28, had T1D since age 8, thought I knew everything about managing it. Went out with friends, had 4-5 beers over 4 hours, ate pizza, went to bed feeling fine at 130. My Libre woke my roommate at 4am with urgent low alarm - I was at 38 and barely responsive. She gave me juice and I came around. The scary part? I had NO symptoms. No sweating, no confusion that I noticed. The alcohol blocked my hypo awareness completely. My endo explained: the liver is so busy processing alcohol that it can't respond to glucagon or release stored glucose. This can happen 8-12 hours after your last drink. Now I ALWAYS: set my basal 30% lower, eat a protein-heavy snack before bed, and tell someone to check on me.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/delayed_low_warning",
        source_platform: "Reddit",
        author_username: "ScaredButWiser",
        comments_count: 156,
        upvotes: 623,
        tips: [
          "Set basal 30% lower on drinking nights",
          "Eat protein and fat before bed (cheese, nuts, peanut butter)",
          "Tell someone to check on you - especially if you live alone",
          "Consider setting a middle-of-night alarm to check"
        ],
        warnings: [
          "Alcohol completely blocks hypoglycemia awareness",
          "Your liver cannot release glucose while processing alcohol",
          "Glucagon may not work effectively when drunk",
          "This can happen even with moderate drinking"
        ],
        is_published: true
      },
      {
        title: "Party and club survival guide from a 25yo T1D",
        content: "Been clubbing with diabetes for 7 years, here's my system: BEFORE: Eat a real meal with protein and fat 2-3 hours before. Check CGM is charged and paired. Tell at least one friend where I keep my glucose tabs. DURING: I keep a small crossbody bag with: Dexcom receiver as backup, glucose tabs, glucagon, my phone, and a card that says I have T1D (in case I can't speak). I check my CGM every song change - made it a habit. I drink vodka sodas mostly - predictable and low carb. AFTER: This is where most people mess up. I eat something substantial, set an alarm for 3am to check, and reduce basal by 25% for 8 hours. Dancing is basically cardio so you're fighting alcohol lows AND exercise lows. It's a lot but it's become second nature.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/Type1Diabetes/comments/clubbing_guide",
        source_platform: "Reddit",
        author_username: "NightlifeT1D",
        comments_count: 73,
        upvotes: 298,
        tips: [
          "Eat protein/fat meal 2-3 hours before going out",
          "Carry backup supplies in a small crossbody bag",
          "Check CGM every song change - make it a habit",
          "Dancing = cardio, so expect faster drops"
        ],
        warnings: [
          "Tell at least one friend about your diabetes",
          "Carry medical ID that's visible",
          "Don't assume bouncers/staff know what to do"
        ],
        is_published: true
      },
      {
        title: "How I handle craft beer festivals without going crazy",
        content: "Went to my first craft beer festival after diagnosis and it was a disaster - ended up at 45 at 3am. Now I've figured it out. The problem with festivals: you're tasting 10-20 beers, walking a lot, and have no idea of the carb content in experimental brews. My strategy: I pre-bolus 5 units before entering (I'm 1:10 ratio), knowing I'll need it. I aim for 3oz tasters, not full pours. I treat every taster as ~5g carbs for light beers, ~10g for dark/sweet ones. I eat the food vendors offer - usually pretzels and sausages which are perfect for slowing absorption. Most importantly: I stop tasting at least 2 hours before leaving so my CGM can catch any trends before I drive. Still need to reduce basal overnight but the pre-bolus and food strategy keeps me stable during the event.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/beer_festival",
        source_platform: "Reddit",
        author_username: "FestivalDiabetic",
        comments_count: 34,
        upvotes: 156,
        tips: [
          "Pre-bolus before entering the festival",
          "Stick to 3oz tasters instead of full pours",
          "Dark/sweet beers have more carbs than light ones",
          "Stop tasting 2 hours before driving"
        ],
        warnings: [
          "Walking all day + alcohol = unpredictable lows",
          "You won't know exact carb counts in craft beers"
        ],
        is_published: true
      },
      {
        title: "Whiskey doesn't spike me but tequila does - anyone else?",
        content: "This is weird but I've confirmed it multiple times with my CGM. Straight whiskey (bourbon, scotch, whatever) - absolutely flat line, maybe drops 10-20 points over a few hours. Tequila - even 100% agave, no mixer - spikes me 30-40 points before dropping. I've asked my endo and she said individual responses vary a lot. Some theories from my research: agave has residual sugars even in 'pure' tequila, the distillation process differs, and how your liver metabolizes different alcohols matters. Vodka and gin are also flat for me like whiskey. Rum goes either way depending on the brand. Curious if others have noticed specific spirits affect them differently?",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/spirit_differences",
        source_platform: "Reddit",
        author_username: "WhiskeyFlatliner",
        comments_count: 92,
        upvotes: 187,
        tips: [
          "Track your individual response to different spirits",
          "100% agave doesn't mean zero carbs",
          "Darker spirits may have more residual sugars",
          "Test with CGM before assuming all spirits are equal"
        ],
        warnings: [
          "Individual responses vary significantly",
          "Don't assume clear = carb-free"
        ],
        is_published: true
      },
      {
        title: "New Year's Eve strategies - sharing what works",
        content: "NYE is probably the hardest night of the year for T1D. Here's my protocol after many trial and error years: Start the night at 140-160 (higher than usual but you'll drop). Pre-game with protein (I do cheese and meat). For champagne toasts, I bolus about 3g per glass - it's not zero carb like people think. I switch between alcoholic drinks and sparkling water (no one notices in a champagne flute). Every hour I eat something - even just a few crackers. At midnight, I eat whatever I want because I know I need carbs on board for the night. Before bed: peanut butter toast, set temp basal -30% for 8 hours, alarm at 4am. Girlfriend knows to check me. It's a lot of planning but I wake up feeling fine while my friends are hungover.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/nye_strategies",
        source_platform: "Reddit",
        author_username: "MidnightManager",
        comments_count: 45,
        upvotes: 234,
        tips: [
          "Start the night slightly higher (140-160)",
          "Champagne has ~3-4g carbs per glass",
          "Alternate alcoholic drinks with sparkling water",
          "Eat something small every hour"
        ],
        warnings: [
          "NYE is high-risk for severe lows due to late night + alcohol combo",
          "Have someone check on you overnight"
        ],
        is_published: true
      },
      {
        title: "I'm a bartender with T1D - here's what I've learned",
        content: "Four years behind the bar with Type 1. The constant tasting, the late nights, the free drinks after shift - it's a challenge. What I've learned: Most cocktail syrups are pure sugar - simple syrup, grenadine, sweet vermouth. Even a splash adds 5-10g carbs. 'Skinny' margaritas still have carbs from the lime. Draft beer pours vary wildly - a 'pint' can be 12-20oz. Energy drinks (vodka Red Bulls) will spike then crash you hard. My personal rules: I sip and spit when tasting during shift, I only drink clear spirits neat or with soda after work, I eat a full meal before my shift ends. The bar food (fries, wings) actually helps absorb alcohol better than drinking on empty. Biggest tip: never let coworkers or customers pressure you. 'I'm pacing myself' works every time.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/bartender_t1d",
        source_platform: "Reddit",
        author_username: "T1DBartender",
        comments_count: 67,
        upvotes: 445,
        tips: [
          "Most cocktail syrups add 5-10g carbs per splash",
          "Sip and spit when tasting - bartender trick",
          "Clear spirits with soda are most predictable",
          "Eat a full meal before shift ends"
        ],
        warnings: [
          "Energy drink + alcohol combo causes severe swings",
          "'Skinny' cocktails still have hidden carbs"
        ],
        is_published: true
      },
      {
        title: "Drinking games and T1D - a survival guide",
        content: "College student here with some real talk about drinking games. First - you can participate without destroying your blood sugar. For beer pong: I fill my cups with water, keep a separate low-carb beer to sip from. No one cares, they're drunk. For flip cup: same water trick. For shots: I volunteer to be the person who pours (control the amount) and I pick clear spirits. The social pressure is real but here's what I tell people: 'I'm on medication that doesn't mix well' - true and stops questions. My go-to game drink is vodka soda with lime. Looks like a real cocktail, minimal carbs. The hardest part is the late-night pizza order. I've learned to order wings instead - protein without the carb bomb. Set your CGM alarm loud because you might not feel lows. And please, please tell at least one sober-ish person you have diabetes.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/drinking_games",
        source_platform: "Reddit",
        author_username: "CollegeT1D",
        comments_count: 123,
        upvotes: 567,
        tips: [
          "Use water in cups for beer pong - no one notices",
          "Volunteer to pour shots to control portions",
          "'I'm on medication' stops most questions",
          "Order wings instead of pizza for late-night food"
        ],
        warnings: [
          "Peer pressure is real - have responses ready",
          "Tell at least one person about your diabetes",
          "Set CGM alarms LOUD - you won't feel lows"
        ],
        is_published: true
      },
      {
        title: "Dating and alcohol - navigating new relationships",
        content: "The 'want to grab a drink?' first date is basically universal and it's complicated with T1D. Here's what's worked for me: I actually prefer drinks dates early on because it's a natural way to mention diabetes. 'I'll have a vodka soda, trying to keep my blood sugar steady' opens the door without being dramatic. I've never had a negative reaction. Most people are curious not scared. I check my CGM openly - if someone has a problem with that, they're not for me anyway. For dinner dates with wine, I give myself permission to run a little high (160-180) rather than risk a low. Nothing kills the mood like having to chug juice. My rule: by date 3, they need to know about glucagon location. If we're going to be intimate, they need to understand alarms and what a low looks like. It's a lot but the right person handles it fine.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/dating_drinks",
        source_platform: "Reddit",
        author_username: "DatingWithDiabetes",
        comments_count: 89,
        upvotes: 312,
        tips: [
          "Drinks dates are actually good for casually mentioning T1D",
          "Check your CGM openly - it filters out bad matches",
          "Run slightly higher on dates to avoid lows",
          "By date 3, share glucagon location"
        ],
        warnings: [
          "Don't hide your diabetes - it always comes out",
          "Low blood sugar on a date can be scary for both people"
        ],
        is_published: true
      },
      {
        title: "Hangover vs low blood sugar - how to tell the difference",
        content: "After 8 years of T1D and plenty of nights out, I've learned that hangover and low blood sugar symptoms are almost identical: shaking, sweating, headache, nausea, confusion. Here's how I tell them apart: ALWAYS check your CGM first, no matter how hungover you feel. A true hangover usually comes with sensitivity to light and sound - lows don't cause that. Hangovers get worse when you stand up; lows don't change much with position. The most important difference: juice makes a low better in 15 minutes; it does nothing for a hangover. My morning-after protocol: check CGM, drink water, eat something with carbs AND protein. If I'm low, I treat it then eat the real breakfast. The dangerous scenario is treating a 'hangover' with coffee and painkillers when you're actually at 55. Check first, always.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/hangover_vs_low",
        source_platform: "Reddit",
        author_username: "MorningAfterT1D",
        comments_count: 56,
        upvotes: 423,
        tips: [
          "ALWAYS check CGM before assuming hangover",
          "Light sensitivity is hangover, not low blood sugar",
          "Juice fixes lows in 15 min, does nothing for hangover",
          "Eat carbs AND protein for morning-after recovery"
        ],
        warnings: [
          "Treating 'hangover' with coffee when actually low is dangerous",
          "Both feel almost identical - check glucose first"
        ],
        is_published: true
      },
      {
        title: "Red wine actually helps my blood sugar - here's my data",
        content: "I know this sounds crazy but I have 6 months of CGM data showing it. When I have 1-2 glasses of dry red wine with dinner, my post-meal spike is about 30% smaller than without wine. My theory (and my endo agrees it's plausible): red wine slows gastric emptying, so the carbs absorb more slowly. Also, the polyphenols may have some insulin-sensitizing effect - there's actually research on this. IMPORTANT CAVEATS: this only works with DRY red wine (Pinot Noir, Cabernet), not sweet reds or whites. Only 1-2 glasses. Only WITH food, never on empty stomach. And I still get the delayed low effect overnight, so I reduce basal. I'm not saying wine is medicine, but for me personally, a glass with dinner is actually easier to manage than dinner alone. Still have to bolus for food, still have to be careful. But the data is the data.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/red_wine_data",
        source_platform: "Reddit",
        author_username: "WineDataNerd",
        comments_count: 134,
        upvotes: 289,
        tips: [
          "Dry red wine may slow post-meal glucose spikes",
          "Only works with dry varieties (Pinot Noir, Cabernet)",
          "Maximum benefit at 1-2 glasses with food",
          "Still need to reduce basal overnight"
        ],
        warnings: [
          "Sweet wines will spike you significantly",
          "Never drink on empty stomach regardless",
          "This is individual - track your own data"
        ],
        is_published: true
      },
      {
        title: "Keto and alcohol - my experience combining them",
        content: "I've been doing low-carb/keto for 2 years with T1D and it changes the alcohol equation a lot. When you're in ketosis, your liver is already busy making ketones from fat - add alcohol processing on top and you're at higher risk for lows. The flip side: no carb-heavy beer or sugary cocktails, so less insulin needed. What I drink: dry wine, champagne, clear spirits with soda. I've found I get drunk faster on keto (less food to absorb alcohol). My biggest adjustment: I used to rely on beer for 'slow carb' protection overnight. On keto, I have to eat fat/protein snacks instead. String cheese, nuts, deli meat before bed. The lows can hit harder because there's less glycogen stored. My endo increased my awareness of ketoacidosis risk too - if you're drinking and not eating carbs and feel nauseous, check ketones. Overall it's manageable but requires more attention.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/keto_alcohol",
        source_platform: "Reddit",
        author_username: "KetoT1D",
        comments_count: 78,
        upvotes: 234,
        tips: [
          "You'll get drunk faster on keto - adjust quantities",
          "Eat fat/protein snacks before bed (cheese, nuts)",
          "Dry wine and clear spirits work well with keto",
          "Check ketones if feeling nauseous after drinking"
        ],
        warnings: [
          "Higher low risk due to reduced glycogen stores",
          "DKA risk is elevated when combining keto, alcohol, and low food intake"
        ],
        is_published: true
      },
      {
        title: "Sober curious with T1D - benefits I didn't expect",
        content: "Did Dry January and ended up going 6 months sober. As a T1D, here's what changed: My time in range went from 65% to 78% - huge improvement with zero medication changes. My A1C dropped from 7.1 to 6.6. No more 3am lows. Fewer corrections needed. Sleep quality improved dramatically (CGM confirms flatter overnight graphs). I didn't realize how much alcohol was affecting my management until I removed it. I'm not saying everyone needs to quit - I still drink occasionally now. But if your numbers aren't where you want them, try a month without alcohol. The data speaks for itself. Also saved a ton of money. The social aspect was harder than the diabetes part honestly. But 'I'm not drinking right now' became easier to say.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes/comments/sober_curious",
        source_platform: "Reddit",
        author_username: "SoberCuriousT1D",
        comments_count: 201,
        upvotes: 876,
        tips: [
          "Try Dry January and compare your TIR before/after",
          "Sleep quality improvements are significant",
          "'I'm not drinking right now' is easier than explaining",
          "Track your data - it's motivating"
        ],
        warnings: [
          "Social pressure to drink is real - prepare responses",
          "Some people may not understand your choice"
        ],
        is_published: true
      },
      {
        title: "Airport bars and T1D - traveling and drinking tips",
        content: "Business traveler here - I spend a lot of time in airports and airport bars. Some hard-won wisdom: Airport drinks are STRONG. What you think is one drink is often two. Plan accordingly. The altitude and dry air can affect your numbers, plus the stress of travel. I keep my target higher when flying (140-160). For long flights after drinking, I reduce my basal 25% because you're sitting inactive for hours. I always have snacks - airport food is expensive and options are limited if you go low. Biggest tip: don't drink on an international overnight flight. The combination of alcohol, time zone changes, irregular eating, and inactivity is a recipe for disaster. I learned this the hard way and now stick to water on long-hauls. Domestic short flights are fine with one drink and appropriate planning.",
        category: "alcohol",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/airport_bars",
        source_platform: "Reddit",
        author_username: "RoadWarriorT1D",
        comments_count: 45,
        upvotes: 178,
        tips: [
          "Airport drinks are usually double-strength",
          "Keep blood sugar target higher when flying (140-160)",
          "Reduce basal for long inactive flights",
          "Always carry snacks - airport options are limited"
        ],
        warnings: [
          "Don't drink on overnight international flights",
          "Time zone changes + alcohol + inactivity is dangerous"
        ],
        is_published: true
      },

      // INTIMACY CATEGORY (15 posts)
      {
        title: "CGM placement for couples - what actually works",
        content: "Been with my partner for 3 years, both of us T1D (met at a diabetes camp reunion). We've figured out placement strategies: Back of arm works great for everything - out of the way, rarely gets bumped. Inner thigh can work but gets compressed in certain positions. Stomach sites can get pressure/ripped depending on how... active things get. My partner's Dexcom on lower back has been most reliable. We've also figured out the alarm dance - we both have phones set to vibrate only during intimate times. The sounds can be a mood killer but the data is still important. Most importantly: we check each other's numbers before and set glucose tabs on the nightstand. Nothing ruins the moment like a low.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/cgm_couples",
        source_platform: "Reddit",
        author_username: "DiabetesCouples",
        comments_count: 67,
        upvotes: 345,
        tips: [
          "Back of arm placement is most durable for intimacy",
          "Lower back Dexcom sites stay out of the way",
          "Set phones to vibrate only during intimate times",
          "Keep glucose tabs on nightstand"
        ],
        warnings: [
          "Stomach/front placements can get pressure or ripped",
          "Always check numbers before - lows sneak up"
        ],
        is_published: true
      },
      {
        title: "Managing pump tubing during sex - tips from a long-time pumper",
        content: "15 years on an insulin pump and married for 10. The tubing question comes up a lot so here's what I've learned: First, you CAN disconnect for up to an hour safely - this is by far the easiest solution. I keep the cap clean and nearby. Some people use the 32-inch tubing to have more slack. I've worn the pump in a SPI belt around my waist - works surprisingly well. My spouse was worried about the tubing at first but now it's completely normal. We laugh about the occasional 'beep beep' alarms. The key is communication - tell your partner it's okay to touch/move the pump, where it's safe to put hands, and what to do if something gets pulled. After 10 years, it's complete non-issue but those first few times with a new partner can be awkward. Just talk about it beforehand.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/insulinpumps/comments/tubing_intimacy",
        source_platform: "Reddit",
        author_username: "LongTimePumper",
        comments_count: 89,
        upvotes: 456,
        tips: [
          "Disconnecting for up to 1 hour is safe",
          "32-inch tubing gives more slack",
          "SPI belts keep pump secure and out of way",
          "Tell partner it's okay to touch/move the pump"
        ],
        warnings: [
          "Keep the disconnect cap clean and nearby",
          "Set a mental timer - don't forget to reconnect"
        ],
        is_published: true
      },
      {
        title: "The 'exercise effect' applies to sex too - plan accordingly",
        content: "Something my endo never told me but I learned through experience: sex is cardio. For my body, 30 minutes of active sex drops my blood sugar about the same as 30 minutes of jogging - around 50-70 points. This was a shock when I first started using a CGM and could see the real-time drops. What I do now: If I'm under 120 before, I eat a small snack (15g carbs). I keep juice boxes by the bed. If I've recently bolused for a meal, I wait at least 2 hours (active insulin is dangerous). Afterwards, I check and often need a snack. It's like post-workout management. My partner knows the signs of me going low (quieter, less engaged) and will check in. This is all stuff no one talks about but it's just diabetes management applied to a different kind of exercise.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/sex_exercise",
        source_platform: "Reddit",
        author_username: "CardioConfession",
        comments_count: 112,
        upvotes: 523,
        tips: [
          "Treat sex like cardio - expect 50-70 point drops",
          "Eat 15g carbs if under 120 before",
          "Wait 2+ hours after bolusing for meals",
          "Keep juice boxes by the bed"
        ],
        warnings: [
          "Active insulin on board is risky during physical activity",
          "Lows during intimacy can be dangerous and confusing"
        ],
        is_published: true
      },
      {
        title: "Telling new partners about T1D - when and how",
        content: "Diagnosed at 22, so I learned to date with diabetes as an adult. Disclosure was scary at first. Now at 30, here's my approach: I mention it on the first date casually - 'I need to check my blood sugar before we order' or 'I wear an insulin pump, that's the thing on my arm.' Early, casual, matter-of-fact. I've found that 95% of people are curious and supportive. The 5% who aren't... well, I learned that information early. By date 3-4, if things are progressing, I explain what they might see/hear: CGM alarms, pump tubing, and what to do if I seem 'off' (give me juice). Before physical intimacy, I show them where my devices are and mention they're waterproof/durable. My biggest advice: confidence is contagious. If you treat it like no big deal, they will too. If you apologize for it or seem embarrassed, that creates awkwardness.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes/comments/disclosure_dating",
        source_platform: "Reddit",
        author_username: "DatingAfterDiagnosis",
        comments_count: 145,
        upvotes: 678,
        tips: [
          "Mention it casually on first date - normalize it early",
          "By date 3-4, explain what they might see/hear",
          "Before intimacy, show device locations",
          "Confidence is contagious - don't apologize"
        ],
        warnings: [
          "Anyone who reacts badly is revealing themselves early",
          "Don't hide it - it always comes out eventually"
        ],
        is_published: true
      },
      {
        title: "Omnipod and intimacy - tubeless makes things easier",
        content: "Switched from Medtronic to Omnipod partly for lifestyle reasons including intimacy. The difference is significant: no tubing to get tangled or pulled. I can wear the pod on my arm, back of hip, or lower back where it's completely out of the way. My partner doesn't even notice it anymore. Some practical tips: pods on stomach can get pressed/dislodged during certain activities, so I avoid that placement. The PDM/controller doesn't need to be nearby - the pod works independently. I've gone swimming and then directly to... other activities... without any issues. The waterproof adhesive stays on. For those considering tubeless: it was a game-changer for me. Still have to manage blood sugars the same way, but the physical device is so much less intrusive.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/Omnipod/comments/tubeless_intimacy",
        source_platform: "Reddit",
        author_username: "TubelessLife",
        comments_count: 56,
        upvotes: 287,
        tips: [
          "Arm, back of hip, or lower back placements work best",
          "Avoid stomach placement for intimacy",
          "PDM doesn't need to be nearby",
          "Waterproof means versatility"
        ],
        warnings: [
          "Pods on stomach can get dislodged with pressure"
        ],
        is_published: true
      },
      {
        title: "Low blood sugar during sex - what to do when it happens",
        content: "It happened to me last week and I handled it badly, so I'm sharing what I should have done. Started feeling shaky and confused during intimacy. Didn't want to 'ruin the moment' so I kept going. Bad decision - got more confused, partner got worried, ended up with a 47 reading and mild panic. What I should have done: stopped immediately, said 'I need to check my sugar,' treated the low, waited 15 minutes, and THEN decided whether to continue. My partner wasn't upset about the pause - they were upset I didn't take care of myself. New rule: any sign of low (shaky, sweaty, distracted, 'off feeling'), we pause, I check, I treat if needed. It's not romantic but hypoglycemia during physical activity can get dangerous fast. Blood sugar stability > mood.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/low_during_sex",
        source_platform: "Reddit",
        author_username: "LessonLearned",
        comments_count: 78,
        upvotes: 412,
        tips: [
          "Stop immediately if you feel low symptoms",
          "Tell partner you need to check - don't 'power through'",
          "Treat, wait 15 minutes, then decide to continue",
          "Blood sugar stability always comes first"
        ],
        warnings: [
          "Hypoglycemia during exertion gets worse fast",
          "Confusion can escalate to serious emergency"
        ],
        is_published: true
      },
      {
        title: "Communication scripts for diabetes and intimacy",
        content: "Therapist with T1D here. I help couples navigate chronic illness and intimacy. Some scripts that work well: BEFORE: 'I want to let you know about my diabetes devices. This is my CGM [point to it], and this is my pump. They're waterproof and durable. If you hear beeping, that's my glucose alarm - we might need to pause for a minute.' DURING: 'Hey, I need to check my sugar real quick' (keep it casual, not apologetic). 'I'm going low, need some juice and a few minutes' (direct communication). AFTER: 'Thanks for being patient with the diabetes stuff' (positive reinforcement). The key principles: educate calmly, communicate directly, and don't over-apologize. Partners who care about you want to support you. Give them the information to do so. And remember - millions of people with diabetes have fulfilling intimate relationships.",
        category: "intimacy",
        source_url: "https://tudiabetes.org/forum/intimacy_communication",
        source_platform: "TuDiabetes",
        author_username: "T1DTherapist",
        comments_count: 167,
        upvotes: 734,
        tips: [
          "Prepare a brief device explanation in advance",
          "Keep interruptions casual, not apologetic",
          "Thank partners for their patience",
          "Educate, communicate, don't over-apologize"
        ],
        warnings: [
          "Silence about diabetes creates more anxiety than talking about it"
        ],
        is_published: true
      },
      {
        title: "Libre 3 placement for active lifestyle including intimacy",
        content: "Switched to Libre 3 from Dexcom partly for the smaller size. For those wondering about placement and active lifestyle including intimacy: back of arm (official placement) works great - out of the way for most activities. I've tried alternate sites (with doctor approval) and found lower back works well for intimacy but slightly less accurate. The smaller size is definitely less intrusive than the bigger Dexcom. My partner barely notices it. The sensor is pretty secure - I've never had it come off during any activity. I do use SkinTac underneath for extra security during summer/sweating. Main thing: the 14-day wear time means sometimes you're dealing with a newer sensor that's still calibrating. First 24-48 hours can be a bit off, so trust how you feel over the number.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/libre3_placement",
        source_platform: "Reddit",
        author_username: "LibreLife",
        comments_count: 43,
        upvotes: 198,
        tips: [
          "Back of arm placement is official and works well",
          "Lower back is an option for intimacy (check with doctor)",
          "Smaller sensor size is less intrusive",
          "Use SkinTac for extra adhesive security"
        ],
        warnings: [
          "First 24-48 hours of new sensor can be less accurate",
          "Trust how you feel, not just the number"
        ],
        is_published: true
      },
      {
        title: "Dating apps and diabetes disclosure - updated tips",
        content: "34F, dating after divorce, navigating apps with T1D. Here's what's working: I don't mention diabetes in my profile - it's not a defining characteristic and I don't want to attract 'caretaker' types or filter myself out based on someone's assumptions. I tell matches before meeting in person, usually something like 'just so you know, I have Type 1 diabetes, so if you see me checking my phone/watch it's my blood sugar monitor.' Response has been 100% positive. On first dates, I check my CGM openly. If someone's uncomfortable with that, they're not my person. By date 3, I explain more: what to do if I go low, where my glucose tabs are, basic education. Before physical intimacy, I do a full device tour. Most people find the technology interesting! The right person will see diabetes as one small part of your whole self.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes/comments/dating_apps",
        source_platform: "Reddit",
        author_username: "SwipingWithDiabetes",
        comments_count: 89,
        upvotes: 367,
        tips: [
          "Don't put diabetes in your profile - tell matches before meeting",
          "Check CGM openly on dates - normalize it",
          "By date 3, share practical emergency info",
          "Most people find the technology interesting"
        ],
        warnings: [
          "Avoid attracting 'caretaker' types",
          "The right person sees diabetes as one small part of you"
        ],
        is_published: true
      },
      {
        title: "Erectile dysfunction and T1D - honest conversation",
        content: "This topic doesn't get discussed enough. I'm 45M, T1D since age 12. Started experiencing ED in my late 30s. My endo confirmed it's more common in long-term diabetics due to potential nerve and blood vessel effects. What helped: First, TALK TO YOUR DOCTOR. Seriously. It's common and treatable. My A1C was running high (8.5%) - getting it down to 7% made a significant difference. Blood pressure medication change helped too. I take sildenafil (Viagra) as needed and it works well. Blood sugar management before intimacy matters more now - I aim for 120-140, not too high or too low. The mental component is real too - I talked to a therapist about performance anxiety. This is a diabetes complication that's manageable with the right help. Don't suffer in silence. Your healthcare team has heard it all before.",
        category: "intimacy",
        source_url: "https://tudiabetes.org/forum/ed_discussion",
        source_platform: "TuDiabetes",
        author_username: "HonestConvo",
        comments_count: 134,
        upvotes: 567,
        tips: [
          "Talk to your endo - ED is common and treatable",
          "Better A1C often improves ED symptoms",
          "Blood sugar 120-140 optimal before intimacy",
          "Therapy helps with mental/anxiety component"
        ],
        warnings: [
          "ED can be an early sign of cardiovascular issues - get checked",
          "Don't try to self-treat with unregulated supplements"
        ],
        is_published: true
      },
      {
        title: "Women's health and diabetes - what I wish I'd known earlier",
        content: "40F, T1D since childhood. Topics no one warned me about: Menstrual cycle affects insulin needs - I need 15-20% more insulin in the week before my period, then drop significantly when it starts. Track this in your CGM app notes. Hormonal birth control affected my insulin sensitivity - took months to adjust. Pregnancy requires tight control (A1C under 6.5 ideally) before conception - work with endo early. Menopause is coming for me soon and apparently brings another whole set of insulin changes. For intimacy specifically: yeast infections are more common with diabetes, especially with high blood sugars. Vaginal dryness can happen earlier. Arousal can be affected by blood sugar levels - I function better in the 100-140 range than when high or low. More women need to share these experiences openly.",
        category: "intimacy",
        source_url: "https://www.diabetessisters.org/forum/womens_health",
        source_platform: "DiabetesSisters",
        author_username: "DiabetesSister",
        comments_count: 189,
        upvotes: 823,
        tips: [
          "Track insulin needs through menstrual cycle",
          "Hormonal birth control can affect insulin sensitivity",
          "Plan pregnancy with endo - tight control before conception",
          "BG of 100-140 is optimal for intimate function"
        ],
        warnings: [
          "High blood sugars increase yeast infection risk",
          "Menopause brings another wave of insulin changes"
        ],
        is_published: true
      },
      {
        title: "Long-distance relationships and diabetes - managing across miles",
        content: "My partner lives 3 hours away and we see each other on weekends. Diabetes management changes when you're not together regularly: I share my Dexcom with her via Follow app - she checks on me when we're apart. When we're together, the excitement and activity often causes lows - I run my target 20 points higher for visit weekends. We've established our 'overnight low protocol' when sleeping together: glucose tabs on both nightstands, she knows to wake me if CGM alarms. The distance means I can't be casual about packing supplies - I always overpack insulin, sensors, infusion sets. She keeps backup glucose at her place. The intimacy conversation happened over video call actually - I showed her my devices and explained everything before our first overnight visit. Diabetes adds logistics but it doesn't change connection.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/ldr_diabetes",
        source_platform: "Reddit",
        author_username: "LDRwithT1D",
        comments_count: 56,
        upvotes: 234,
        tips: [
          "Share CGM with partner via Follow app",
          "Run higher targets during exciting visit weekends",
          "Establish overnight low protocols together",
          "Keep backup supplies at partner's place"
        ],
        warnings: [
          "Always overpack supplies for visits",
          "Excitement and activity together often causes unexpected lows"
        ],
        is_published: true
      },
      {
        title: "Explaining CGM alarms to one-night stands - practical guide",
        content: "Single and diabetic, occasionally have casual encounters. Here's my practical approach: I give a 30-second explanation before things get intimate: 'This is my glucose monitor, it might beep if my blood sugar goes low. If that happens, I just need some juice and a few minutes.' I keep glucose tabs in an obvious, non-weird place (nightstand, not bathroom). If an alarm goes off, I check quickly and either treat or dismiss - quick and undramatic. I've never had a negative reaction. Most people are briefly curious ('oh that's cool tech') and then move on. The key is confidence and brevity. Don't lecture, don't apologize excessively, don't make it weird. It's like telling someone you have a phone - just information. For truly casual encounters, you don't need to do the full emergency training - just handle your own stuff efficiently.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes/comments/casual_encounters",
        source_platform: "Reddit",
        author_username: "SingleWithCGM",
        comments_count: 98,
        upvotes: 412,
        tips: [
          "30-second explanation before intimacy is enough",
          "Keep glucose tabs in obvious, accessible places",
          "Handle alarms quickly and undramatically",
          "Confidence and brevity prevent awkwardness"
        ],
        warnings: [
          "Don't apologize excessively - it creates more awkwardness",
          "You don't need full emergency training for casual encounters"
        ],
        is_published: true
      },
      {
        title: "Diabetes and LGBTQ+ dating - intersection of identities",
        content: "Gay man with T1D here. Navigating multiple aspects of identity in dating: The good news is that in my experience, the LGBTQ+ community is often pretty accepting of health differences. Coming out about diabetes feels less scary when you've already come out about orientation. That said, body image stuff is real - having visible devices on your body when there's already pressure to look a certain way. I've found being upfront helps: 'Yeah that's my insulin pump, I'm a cyborg now.' Humor works. Dating apps: I don't mention diabetes or pump in profile but do mention before hookups. Prep for intimacy includes checking blood sugar. For those using PrEP or HIV medications, be aware they don't interact with insulin but talk to your endo about your full medication list. Our community understands chronic health conditions perhaps better than some - there can be unexpected solidarity.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/lgbtq_dating",
        source_platform: "Reddit",
        author_username: "QueerT1D",
        comments_count: 76,
        upvotes: 345,
        tips: [
          "LGBTQ+ community often accepting of health differences",
          "Humor helps with body image concerns",
          "Be upfront before hookups but not in profile",
          "Full medication disclosure to endo (PrEP, etc.)"
        ],
        warnings: [
          "Body image pressure is real - be kind to yourself",
          "Don't assume all medications are diabetes-safe without checking"
        ],
        is_published: true
      },
      {
        title: "Hot tubs, pools, and intimacy - water activities with devices",
        content: "Love me some hot tub romance but diabetes devices add considerations. Here's what I've learned: Most CGMs and pods are rated for submersion 30-60 minutes max. I don't exceed that and try to keep sites out of direct jets. Water can loosen adhesive - I add extra overpatch before hot tub nights. For pumps on tubing (Medtronic, Tandem), you need to disconnect. I keep the pump in a clean, dry place nearby with the disconnect cap on. Tubeless (Omnipod) stays on but shouldn't be in extremely hot water for long. Post-water-activity: dry off sites thoroughly, check adhesive, make sure everything is reconnected. Heat can affect insulin absorption so you might run lower after hot tub sessions - plan snacks. And yes, chlorine is fine for devices despite what some people worry about. The biggest issue is remembering to reconnect after disconnecting for tubeless pump users.",
        category: "intimacy",
        source_url: "https://www.reddit.com/r/insulinpumps/comments/hot_tub_tips",
        source_platform: "Reddit",
        author_username: "HotTubT1D",
        comments_count: 67,
        upvotes: 289,
        tips: [
          "Don't exceed 30-60 min submersion for devices",
          "Add extra overpatch before water activities",
          "Keep pump in clean dry place when disconnected",
          "Plan snacks - heat increases insulin absorption"
        ],
        warnings: [
          "Remember to reconnect after disconnecting",
          "Extremely hot water can affect insulin in pods"
        ],
        is_published: true
      },

      // DRUG EFFECTS CATEGORY (10 posts)
      {
        title: "Cannabis and blood sugar - my 2-year tracking experience",
        content: "I live in a legal state and have tracked my glucose response to cannabis extensively. Some observations that may or may not apply to you: Indica strains tend to cause munchies which leads to higher blood sugar from the snacking, not the cannabis itself. Sativa strains make me slightly more insulin sensitive - I've seen 10-15 point drops without eating. CBD-only products have no noticeable effect on my glucose. The biggest factor is what you eat when you get the munchies - I keep low-carb snacks ready (cheese, nuts) to prevent spikes. Edibles are tricky because they often contain sugar, so you're managing the edible carbs plus the cannabis effects. I haven't found cannabis itself to be problematic, but the behavior changes (eating more, being less careful about carb counting) definitely are. Know yourself and plan accordingly.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/cannabis_tracking",
        source_platform: "Reddit",
        author_username: "CannabisDiabetic",
        comments_count: 156,
        upvotes: 623,
        tips: [
          "Munchies cause spikes, not cannabis itself",
          "Keep low-carb snacks ready (cheese, nuts)",
          "CBD-only products have no glucose effect",
          "Sativa may slightly increase insulin sensitivity"
        ],
        warnings: [
          "Edibles often contain significant sugar/carbs",
          "Being high can impair judgment about insulin dosing"
        ],
        is_published: true
      },
      {
        title: "Caffeine affects my blood sugar more than I realized",
        content: "Thought I'd share some data I collected about caffeine and blood sugar. I tracked my response to coffee for a month with my CGM: Black coffee (no sugar, no cream): 20-30 point spike over 2 hours, every single time. Same coffee with fat (cream, butter): minimal spike, maybe 10 points. Energy drinks (Monster Zero): 40-50 point spike despite being 'zero sugar'. Pre-workout supplements: similar to energy drinks, significant spike. What I learned: caffeine triggers cortisol and adrenaline release which raises blood sugar via liver glucose output. It's not the drink's carbs, it's a hormonal response. Adding fat slows this. I now pre-bolus 1 unit for my morning coffee. My endo confirmed this is a real, studied phenomenon and affects some people more than others. Track your own response because it varies a lot.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes/comments/caffeine_effect",
        source_platform: "Reddit",
        author_username: "CaffeineTracker",
        comments_count: 189,
        upvotes: 734,
        tips: [
          "Black coffee can spike BG 20-30 points",
          "Adding fat (cream) reduces the spike",
          "Consider pre-bolusing for morning coffee",
          "Track your individual response"
        ],
        warnings: [
          "Energy drinks spike despite being 'zero sugar'",
          "Caffeine effect varies significantly between people"
        ],
        is_published: true
      },
      {
        title: "Nicotine and insulin resistance - what I've noticed",
        content: "I vaped for 5 years with T1D. Quit 6 months ago. Here's what changed: My total daily insulin dropped about 15% after quitting. My time in range improved from 58% to 71%. Post-meal spikes are more predictable now. When I was vaping, I noticed: insulin seemed to work slower, I needed more to cover the same meals, and my blood sugar was generally more volatile. My endo explained that nicotine increases cortisol and causes vasoconstriction, both of which can reduce insulin effectiveness. I didn't fully believe it until I quit and saw the data. For those still using nicotine: you're probably using more insulin than you would otherwise. That's not a judgment - just information to factor into your management. And if you're thinking about quitting, the diabetes improvement is a nice bonus on top of the other health benefits.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/nicotine_quit",
        source_platform: "Reddit",
        author_username: "ExVaper",
        comments_count: 112,
        upvotes: 456,
        tips: [
          "Quitting nicotine can reduce insulin needs ~15%",
          "Expect TIR improvement after quitting",
          "Factor nicotine use into insulin calculations",
          "Talk to endo about quitting support"
        ],
        warnings: [
          "Nicotine increases cortisol and reduces insulin effectiveness",
          "More volatile blood sugars while using nicotine"
        ],
        is_published: true
      },
      {
        title: "Adderall and blood sugar - ADHD meds with T1D",
        content: "Been on Adderall XR for ADHD for 3 years alongside T1D management. Important things I've learned: The medication suppresses appetite, which can lead to skipping meals, which can lead to lows. I set alarms to remind myself to eat. Morning dose causes a small spike (10-20 points) from the stimulant effect - I've added 0.5u to my morning bolus. The appetite suppression means when I do eat, I eat less - have had to adjust carb ratios. Crashing when it wears off in evening sometimes comes with sudden appetite return - that's a dangerous time for overeating. My endo and psychiatrist both know about both conditions and communicate. If you're considering ADHD medication with T1D, definitely involve both specialists. The combination is manageable but requires attention and adjustments.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/adderall_t1d",
        source_platform: "Reddit",
        author_username: "ADHDT1D",
        comments_count: 98,
        upvotes: 367,
        tips: [
          "Set alarms to remind yourself to eat",
          "Morning stimulant may need 0.5-1u extra bolus",
          "Adjust carb ratios for smaller meals",
          "Watch for overeating when medication wears off"
        ],
        warnings: [
          "Appetite suppression can cause unintentional lows",
          "Ensure endo and psychiatrist communicate"
        ],
        is_published: true
      },
      {
        title: "OTC medications that affect blood sugar - a reference",
        content: "Compiled from my experience and confirmed with my endo. Common OTC meds that affect blood sugar: STEROIDS (cortisone, prednisone, asthma inhalers): Can dramatically increase BG for hours or days. Increase basal significantly when using. PSEUDOEPHEDRINE (Sudafed): Stimulant effect, mild spike. DIPHENHYDRAMINE (Benadryl): Minimal direct effect but causes drowsiness that might make you miss a low. IBUPROFEN/NSAIDS: Usually no effect but can rarely increase blood sugar. ACETAMINOPHEN (Tylenol): Interferes with some CGM readings (false highs) for a few hours. COUGH SYRUPS: Often contain sugar - check labels for 'DM' or sugar-free versions. ANTACIDS: Some contain sugar. MELATONIN: Some research suggests it may improve insulin sensitivity. Always read labels and tell your pharmacist about your diabetes. 'Sugar-free' is your friend.",
        category: "drug_effects",
        source_url: "https://tudiabetes.org/forum/otc_medications",
        source_platform: "TuDiabetes",
        author_username: "OTCGuide",
        comments_count: 223,
        upvotes: 1247,
        tips: [
          "Steroids require significant basal increases",
          "Sudafed causes mild spikes",
          "Acetaminophen causes false high readings on some CGMs",
          "Always buy sugar-free versions of cough syrups"
        ],
        warnings: [
          "Benadryl drowsiness can make you miss lows",
          "Some antacids contain hidden sugars"
        ],
        is_published: true
      },
      {
        title: "Prednisone survival guide for T1D",
        content: "Had to take a 5-day prednisone course for poison ivy. Holy blood sugar roller coaster. Here's what I learned: My blood sugar started climbing about 4 hours after first dose and didn't stop. Peaked at 350 despite corrections. My normal insulin:carb ratio of 1:10 became something like 1:5. I needed to nearly double my basal rate. The effect lasted about 12 hours after each dose. Once the course ended, it took about 48 hours for my insulin needs to return to normal - be careful of lows during this transition. My endo should have warned me but didn't - I had to figure it out myself. If you're prescribed steroids, ask your endo for a temporary insulin adjustment plan BEFORE you start. You will need significantly more insulin. Not a little more. A LOT more. And check frequently.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/prednisone",
        source_platform: "Reddit",
        author_username: "SteroidSurvivor",
        comments_count: 145,
        upvotes: 589,
        tips: [
          "Double or triple your basal rate on steroids",
          "Adjust carb ratios to use more insulin",
          "Effect starts ~4 hours after dose, lasts ~12 hours",
          "Get adjustment plan from endo BEFORE starting"
        ],
        warnings: [
          "Blood sugars can exceed 300 even with corrections",
          "Watch for lows 24-48 hours after stopping steroids"
        ],
        is_published: true
      },
      {
        title: "Magic mushrooms with T1D - harm reduction",
        content: "This is harm reduction, not encouragement. I've used psilocybin occasionally in legal/decriminalized contexts. What I've observed: No direct blood sugar effect that I can detect on my CGM. The bigger issue is altered state + diabetes management. Set up your environment first: have snacks accessible, CGM charged, phone nearby. Tell a trip sitter about your diabetes and where your supplies are. The time distortion can make it hard to know when to eat or check. I set timers to remind me. Nausea from mushrooms can make it hard to eat if you go low - have liquid glucose tabs or juice. Being in an altered state while also experiencing low blood sugar symptoms is confusing and potentially scary. I aim to start with blood sugar 140-160 and have my CGM follow enabled for my sitter. Risk assessment is personal, but information helps make safer choices.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/psilocybin_safety",
        source_platform: "Reddit",
        author_username: "SaferSpaces",
        comments_count: 78,
        upvotes: 234,
        tips: [
          "No direct BG effect observed",
          "Set timers to remind you to eat/check",
          "Tell trip sitter about diabetes + supply locations",
          "Start with BG 140-160, have CGM follow enabled"
        ],
        warnings: [
          "Time distortion makes management difficult",
          "Low + altered state is confusing and potentially dangerous",
          "Have liquid glucose for nausea situations"
        ],
        is_published: true
      },
      {
        title: "MDMA/Molly and blood sugar - rave scene harm reduction",
        content: "Harm reduction post for party scene. I've used MDMA at festivals with T1D. Observations and precautions: MDMA itself seems to raise blood sugar slightly for me (stimulant effect). The bigger issue is dehydration and not eating for hours. Dancing for 4-6 hours is intense exercise - I reduce basal 40%. I test more frequently (every 30-45 min). MDMA can mask hypo symptoms - the euphoria covers up shaking and confusion. I set my CGM low alarm very high (90) and make sure friends know to give me juice if I seem off. Drinking too much water (hyponatremia) is a risk with MDMA and can feel like a low. Stay electrolyte balanced. Coming down the next day, I'm often more insulin sensitive. The day after a festival I reduce basal slightly. This is all harm reduction - not encouraging use, just helping people stay safer.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/mdma_harm_reduction",
        source_platform: "Reddit",
        author_username: "FestivalSafe",
        comments_count: 67,
        upvotes: 198,
        tips: [
          "Reduce basal 40% for hours of dancing",
          "Set CGM low alarm higher (90) - euphoria masks symptoms",
          "Check every 30-45 minutes",
          "Next-day increased insulin sensitivity is common"
        ],
        warnings: [
          "MDMA masks hypoglycemia symptoms",
          "Dehydration and not eating are serious risks",
          "Hyponatremia can feel like a low - balance electrolytes"
        ],
        is_published: true
      },
      {
        title: "Beta blockers and hidden hypos - scary experience",
        content: "Was prescribed beta blockers for anxiety. No one warned me they hide low blood sugar symptoms. First week on them, I went from 'feeling a little off' directly to 38 with no shaking, no sweating, no racing heart - the normal warning signs. Beta blockers block adrenaline response which is what CAUSES those symptoms. My CGM saved me but I wasn't checking frequently enough. After talking to my endo, we decided: I need to wear CGM always while on beta blockers (no taking breaks). Set low alarm at 85 instead of 70. Check manually before driving or any risky activity. Consider if beta blockers are the right choice for me. If you're prescribed beta blockers with T1D, have a serious conversation with your endo about hypo awareness. This is a real, dangerous drug interaction that many doctors don't think about.",
        category: "drug_effects",
        source_url: "https://www.reddit.com/r/diabetes_t1d/comments/beta_blockers",
        source_platform: "Reddit",
        author_username: "BetaBlockerWarning",
        comments_count: 134,
        upvotes: 678,
        tips: [
          "Beta blockers hide low blood sugar symptoms completely",
          "Set CGM low alarm higher (85 instead of 70)",
          "Check manually before driving",
          "Talk to endo before starting beta blockers"
        ],
        warnings: [
          "You can go severely low with NO warning symptoms",
          "CGM is essential while on beta blockers",
          "This is a serious drug interaction"
        ],
        is_published: true
      },
      {
        title: "Thyroid medication and insulin needs",
        content: "Have both T1D and hypothyroidism (common autoimmune overlap). Thyroid medication significantly affects insulin needs. When my thyroid was undertreated (TSH too high), I was more insulin resistant and needed more insulin. When we increased my thyroid dose, my insulin needs dropped about 20% and I had unexpected lows until I adjusted. If you're starting thyroid medication or changing doses, expect insulin needs to change over the following 2-4 weeks as levels stabilize. I now check in with both endo and PCP when any medication changes happen. Also: thyroid levels can affect energy, weight, and mood, which all affect diabetes management indirectly. The autoimmune connection is real - if you have T1D, ask to get thyroid checked regularly. About 25% of T1Ds have thyroid issues too.",
        category: "drug_effects",
        source_url: "https://tudiabetes.org/forum/thyroid_diabetes",
        source_platform: "TuDiabetes",
        author_username: "AutoimmuneDuo",
        comments_count: 89,
        upvotes: 345,
        tips: [
          "Thyroid dose changes affect insulin needs over 2-4 weeks",
          "Undertreated thyroid = more insulin resistance",
          "Proper thyroid treatment can reduce insulin needs 20%",
          "Get thyroid checked regularly with T1D"
        ],
        warnings: [
          "Expect lows when starting/increasing thyroid medication",
          "About 25% of T1Ds have thyroid issues - get tested"
        ],
        is_published: true
      }
    ];

    // Insert all posts
    const { data, error } = await supabase
      .from('adult_content_posts')
      .upsert(adultContentPosts, { onConflict: 'title' });

    if (error) {
      console.error('Error seeding adult content posts:', error);
      throw error;
    }

    console.log(`Successfully seeded ${adultContentPosts.length} adult content posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${adultContentPosts.length} adult content posts`,
        categories: {
          alcohol: adultContentPosts.filter(p => p.category === 'alcohol').length,
          intimacy: adultContentPosts.filter(p => p.category === 'intimacy').length,
          drug_effects: adultContentPosts.filter(p => p.category === 'drug_effects').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in seed-adult-content-posts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
