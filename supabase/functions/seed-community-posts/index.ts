import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Curated, high-quality T1D community solutions
const curatedPosts = [
  // GLUCOSE LOWS
  {
    source: 'r/diabetes',
    post_id: 'curated_morning_lows_1',
    title: 'Finally solved my morning lows! Here is what worked',
    content: 'I struggled with lows around 5-6am for months. What finally worked: 1) Reduced overnight basal by 20% after 2am, 2) Small protein snack (cheese stick) before bed, 3) Set temp target to 130 for Control-IQ during sleep. The combination was key! My endo said many people need different basal rates for different parts of the night.',
    score: 234,
    num_comments: 45,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'morning', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_exercise_lows_1',
    title: 'How I finally stopped going low during workouts',
    content: 'After years of struggling with exercise lows, here is my protocol: 1) Reduce basal 50% starting 2 hours before, 2) Eat 15-20g carbs without bolus 30 min before, 3) Keep glucose tabs and juice nearby, 4) For strength training I actually need LESS reduction than cardio. The key was learning that different exercise types affect BG differently!',
    score: 189,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_hypo_unawareness_1',
    title: 'Regained my hypo awareness after 3 months - here is how',
    content: 'I had lost my hypo awareness after 15 years of T1D. My endo had me keep my BG above 100 for 3 months straight - no lows at all. It was hard but CGM alerts helped. After 3 months, I started feeling lows again at 70! The body can relearn. Key tips: Set CGM alert at 85, treat immediately, avoid letting yourself sit in the 70s.',
    score: 312,
    num_comments: 89,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_night_lows_1',
    title: 'Night lows were ruining my sleep until I tried this',
    content: 'I was waking up 2-3 times per night from low alarms. Solution: 1) Moved dinner earlier (6pm instead of 8pm), 2) Reduced dinner bolus by 15%, 3) Added a bedtime snack with fat + protein (peanut butter on crackers), 4) Set my low alert to 75 instead of 70 so I catch it earlier. Now I sleep through most nights!',
    score: 156,
    num_comments: 34,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'nighttime'],
    is_solution: true,
  },

  // GLUCOSE HIGHS
  {
    source: 'r/diabetes',
    post_id: 'curated_dawn_phenomenon_1',
    title: 'Dawn phenomenon: what actually works',
    content: 'My BG would rise from 100 to 200 between 4-8am no matter what. Solutions I tried: 1) Increased basal starting at 3am (this worked!), 2) Some people have luck with a small bolus when they wake, 3) Protein-heavy breakfast helps prevent the spike from continuing, 4) For pumpers, a higher overnight profile helped. The key is everyone is different - test what works for you!',
    score: 278,
    num_comments: 92,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'morning'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_post_meal_spikes_1',
    title: 'Finally tamed my post-meal spikes with pre-bolusing',
    content: 'I used to spike to 250+ after every meal. Game changer: pre-bolusing 15-20 minutes before eating. For fast carbs (bread, rice), I wait 20 min. For protein-heavy meals, only 10 min. For high-fat meals like pizza, I split the bolus 60/40 over 2 hours. My post-meal peaks rarely go above 180 now. It takes practice but worth it!',
    score: 445,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_stubborn_highs_1',
    title: 'Stubborn highs that wont come down? Check these things',
    content: 'When corrections dont work, I check: 1) Infusion site - could be kinked or in scar tissue, 2) Insulin - could be bad from heat/age, 3) Ketones - if present, you need MORE insulin plus fluids, 4) Illness - even minor infections raise BG, 5) Stress - cortisol is real, 6) Injection technique if on MDI. Usually its the site for me!',
    score: 567,
    num_comments: 201,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_pizza_bolusing_1',
    title: 'Pizza bolusing strategy that actually works',
    content: 'Pizza was my nemesis until I figured this out: 1) Bolus for only 50% of carbs upfront, 2) Extended bolus the other 50% over 3-4 hours, 3) Or if on injections, do a second shot 2 hours later, 4) The fat slows carb absorption so you need insulin later. Works for other high-fat foods too (Chinese food, Mexican). My post-pizza numbers are SO much better now.',
    score: 389,
    num_comments: 87,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
  },

  // DEVICES - CGM
  {
    source: 'r/dexcom',
    post_id: 'curated_g6_accuracy_1',
    title: 'Tips for better G6 accuracy from 5 years of use',
    content: 'After 5 years on G6: 1) Avoid arms if you sleep on your side - compression lows are annoying, 2) Back of arm or abdomen work best for me, 3) Use skin prep like SkinTac for better adhesion, 4) Dont insert right after shower - skin moisture affects readings, 5) If readings are off, try calibrating once but dont over-calibrate, 6) First 12-24 hours are often wonky - be patient.',
    score: 234,
    num_comments: 67,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/dexcom',
    post_id: 'curated_g7_compression_1',
    title: 'G7 compression low solutions that work',
    content: 'Kept getting false lows at night from sleeping on my sensor. What helped: 1) Move sensor to back of arm instead of front, 2) Try abdomen if arm doesnt work, 3) Some people use a cut-out sleep position pillow, 4) The G7 is more prone to this than G6 in my experience, 5) If it says LOW but you feel fine, finger stick to confirm before treating!',
    score: 178,
    num_comments: 45,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/Freestylelibre',
    post_id: 'curated_libre_accuracy_1',
    title: 'Getting better readings from Libre 3',
    content: 'Libre reads interstitial fluid so it lags finger sticks by 10-15 min. Tips: 1) Dont make decisions when BG is rapidly changing, 2) Place on back of arm, avoid muscle, 3) First 24 hours readings are often off - I manually enter a calibration, 4) Stay hydrated - dehydration affects accuracy, 5) If sensor fails early, Abbott will replace it - call customer service!',
    score: 145,
    num_comments: 38,
    device_mentioned: 'libre',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/dexcom',
    post_id: 'curated_sensor_adhesion_1',
    title: 'Sensor staying on for full 10 days - my method',
    content: 'Used to lose sensors after 5-6 days. Now they last the full session: 1) Clean skin with alcohol, let dry completely, 2) Apply SkinTac or Mastisol and let it get tacky, 3) Apply sensor, 4) Put Tegaderm or GrifGrips overlay on top, 5) When showering, try to keep it dry or pat dry after. Ive gone swimming with this setup and sensor stayed on!',
    score: 267,
    num_comments: 54,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // DEVICES - PUMPS
  {
    source: 'r/Omnipod',
    post_id: 'curated_omnipod_sites_1',
    title: 'Best Omnipod 5 placement sites - my experience',
    content: 'After 2 years on O5: 1) Back of arms works great but watch for compression, 2) Lower back/love handle area is my favorite - out of the way, 3) Thighs work but pants can knock it off, 4) Abdomen is classic but I get scar tissue there, 5) Rotate religiously - I map out my sites on paper to avoid reusing too soon. Good rotation = better absorption!',
    score: 198,
    num_comments: 72,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/tandem',
    post_id: 'curated_controliq_tips_1',
    title: 'Control-IQ tips from an endo and T1D',
    content: 'As someone with T1D who also works with patients: 1) Trust the algorithm but keep your settings accurate, 2) Update your weight, TDD, and carb ratios regularly, 3) Sleep activity works better than exercise activity for most, 4) Dont rage bolus when high - let CIQ work, 5) If you consistently need manual corrections, your profile needs adjusting. The algorithm is only as good as your settings!',
    score: 456,
    num_comments: 134,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_infusion_site_1',
    title: 'Infusion site issues? Here is what Ive learned',
    content: 'Common site problems and solutions: 1) Bleeding - use shorter cannula or steel sets, 2) Tunnel tracks - you can see insulin leak out - change site immediately, 3) Lipohypertrophy (lumpy tissue) - stop using that area for 6+ months, 4) Pain on insertion - try different angles, use ice beforehand, 5) Allergic reaction - try different tape or use barrier film. Rotate rotate rotate!',
    score: 321,
    num_comments: 87,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },

  // EXERCISE
  {
    source: 'r/diabetes',
    post_id: 'curated_running_t1d_1',
    title: 'Running with T1D - my complete strategy',
    content: 'Marathon runner with T1D here: 1) Check BG 30 min before, eat if under 150, 2) Reduce basal 50% starting 1-2 hours before, 3) Carry fast sugar always (gels work great), 4) For runs over 1 hour, I eat 15-30g carbs per hour, 5) Post-run I often go LOW hours later - reduce basal or eat extra, 6) Strength training makes me go HIGH - opposite of cardio! Learn your patterns.',
    score: 387,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_gym_t1d_1',
    title: 'Weight lifting and blood sugar - what I learned',
    content: 'Lifting makes BG go UP for me due to adrenaline/cortisol. My approach: 1) Start with BG around 120-150, 2) Sometimes I need a small bolus before heavy lifting, 3) Cardio afterwards brings it back down, 4) Protein shakes - I bolus for about half the carbs listed, 5) Rest days I need more basal. Totally different than cardio!',
    score: 234,
    num_comments: 56,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },

  // TRAVEL
  {
    source: 'r/diabetes',
    post_id: 'curated_flying_t1d_1',
    title: 'Flying with T1D supplies - TSA tips',
    content: 'Flown 50+ times with pump and CGM: 1) Get a TSA notification card from your endo (not required but helps), 2) Tell them you have medical devices, 3) Pumps and CGMs can go through regular X-ray, 4) NEVER put insulin in checked luggage - pressure/temp can ruin it, 5) Bring double supplies in carry-on, 6) I tell them about my pump and ask for pat-down instead of body scanner just to be safe. Never had issues!',
    score: 523,
    num_comments: 187,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_time_zones_1',
    title: 'Managing insulin across time zones',
    content: 'For pump users crossing time zones: 1) Change pump time gradually - 1-2 hours per day, 2) Or change immediately and monitor closely, 3) For MDI - keep basal injection at the same TIME in your home zone initially, then shift, 4) Flying east is harder than west, 5) I set alarms so I dont forget doses, 6) Jet lag affects BG too - stress + sleep changes = wonky numbers for a few days.',
    score: 267,
    num_comments: 73,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_travel_supplies_1',
    title: 'What I pack for 2 weeks abroad',
    content: 'My travel supply list: 1) 2x the insulin I need, 2) Extra pump supplies (sites, reservoirs), 3) Backup syringes in case pump fails, 4) Extra CGM sensors, 5) Glucose tabs + glucagon, 6) Doctors letter (for customs), 7) Prescription copies, 8) Cooling case for insulin if going somewhere hot. I split supplies between carry-on and partners bag. Never been stranded without supplies!',
    score: 345,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },

  // FOOD & CARBS
  {
    source: 'r/diabetes',
    post_id: 'curated_carb_counting_1',
    title: 'Carb counting accuracy tips that changed my control',
    content: 'Went from 7.5 to 6.2 A1C mainly by fixing carb counting: 1) Get a food scale - eyeballing is wildly inaccurate, 2) Use apps like Calorie King or MyFitnessPal, 3) Weigh foods raw when possible, 4) Hidden carbs are everywhere - sauces, dressings, even "sugar-free" stuff, 5) Restaurant portions are usually 2x what you think. The food scale was the single biggest improvement!',
    score: 478,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_alcohol_t1d_1',
    title: 'Drinking alcohol with T1D safely - what works for me',
    content: 'After years of trial and error: 1) Beer has carbs - bolus for them, 2) Spirits with diet mixers have no carbs, 3) Alcohol blocks liver from releasing glucose - risk of severe low later, 4) I reduce overnight basal by 20-30% after drinking, 5) Always eat something with protein, 6) Set CGM alarms lower than usual, 7) Never drink alone, tell friends how to use glucagon. Be careful but you can enjoy responsibly!',
    score: 334,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },

  // EMOTIONAL / MENTAL HEALTH
  {
    source: 'r/diabetes',
    post_id: 'curated_burnout_1',
    title: 'Recovering from diabetes burnout - my story',
    content: 'Hit severe burnout after 20 years. What helped: 1) Therapy with someone who understands chronic illness, 2) CGM with alarms so I didnt have to think as much, 3) Letting go of perfection - 80% is better than burning out trying for 100%, 4) Automating what I could (auto-mode pump), 5) Finding online community who GET IT, 6) Taking breaks from diabetes social media when it felt like too much. Its okay to struggle!',
    score: 567,
    num_comments: 234,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_anxiety_1',
    title: 'Managing diabetes anxiety and fear of lows',
    content: 'I used to run high on purpose because I was scared of lows. What helped: 1) Therapy specifically for health anxiety, 2) CGM gave me data and confidence, 3) Practicing what to do during lows so I felt prepared, 4) Realizing most lows are very treatable, 5) Keeping glucose everywhere so Im never without treatment, 6) Telling people around me so they can help. My anxiety is so much better and my A1C dropped!',
    score: 289,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_newly_diagnosed_1',
    title: 'What I wish I knew when newly diagnosed',
    content: 'Diagnosed 10 years ago. What I wish someone told me: 1) It gets easier - the learning curve is steep at first, 2) You will mess up and thats okay, 3) Find your community online, 4) Technology has improved SO much and keeps improving, 5) You can still eat your favorite foods - just learn to dose for them, 6) Advocate for yourself with doctors, 7) A bad day doesnt define you. You got this!',
    score: 723,
    num_comments: 198,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // SICK DAYS
  {
    source: 'r/diabetes',
    post_id: 'curated_sick_days_1',
    title: 'Sick day management guide that works',
    content: 'Sick days are tough. My protocol: 1) Check BG every 2-4 hours, 2) Check ketones if over 250, 3) Usually need 20-50% MORE insulin when sick, 4) Stay hydrated even if you cant eat, 5) Sugar-free Gatorade for electrolytes, 6) Dont skip basal even if not eating, 7) Call endo if ketones are moderate/high or you cant keep fluids down. Have a sick day kit ready before you need it!',
    score: 398,
    num_comments: 87,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },

  // DIY/LOOP SYSTEMS
  {
    source: 'r/loop',
    post_id: 'curated_loop_intro_1',
    title: 'Loop vs commercial systems - honest comparison',
    content: 'Used DIY Loop for 3 years before switching to commercial. Pros of DIY: 1) More customizable, 2) No waiting for FDA approval, 3) Often more aggressive algorithms. Cons: 1) Requires technical skills, 2) No official support, 3) Have to build it yourself. Commercial (Control-IQ, O5): More reliable, easier setup, but less flexible. Both work well - depends on your comfort level and needs!',
    score: 234,
    num_comments: 89,
    device_mentioned: 'loop',
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },

  // INSURANCE / COST
  {
    source: 'r/diabetes',
    post_id: 'curated_insulin_cost_1',
    title: 'Getting affordable insulin in the US - resources',
    content: 'Insulin shouldnt cost this much, but until it changes: 1) Manufacturer programs (Lilly Cares, Novo Patient Assistance), 2) GetInsulin.org, 3) Mark Cuban Cost Plus Drugs, 4) Walmart ReliOn insulin as emergency backup ($25 vial), 5) GoodRx coupons, 6) Ask your endo for samples, 7) Some states have $35 insulin cap laws. Never ration - there are resources out there!',
    score: 892,
    num_comments: 267,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // PARENTS / KIDS
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_school_t1d_1',
    title: 'Managing T1D at school - parents guide',
    content: 'Parent of T1D kid here. What helped: 1) 504 plan is essential - get it in writing, 2) Train the nurse AND backup staff, 3) CGM share with parents phone = peace of mind, 4) Pack low snacks in multiple places, 5) Advocate for your kid to self-manage when ready, 6) Connect with other T1D families at school. The school system can work with you - just be persistent!',
    score: 345,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // Additional device-specific posts
  {
    source: 'r/Omnipod',
    post_id: 'curated_omnipod_screaming_1',
    title: 'Omnipod screaming/alarming - how to stop it',
    content: 'That screaming alarm is terrible! Ways to stop it: 1) Deactivate through PDM/app before removing, 2) If it already started, paperclip in the hole on the back, 3) Put it in a jar of water (last resort), 4) Check for pod errors before they become screaming sessions - bubbles in insulin, poor site, etc. The alarm is supposed to be loud for safety but its panic-inducing!',
    score: 187,
    num_comments: 54,
    device_mentioned: 'omnipod',
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_medtronic_770_1',
    title: 'Tips for Medtronic 770G users',
    content: 'Been on 770G for 2 years: 1) Guardian sensors need more calibrations than Dexcom - just accept it, 2) Tape over the sensor overtape - their adhesive isnt great, 3) Auto mode can be strict - if it kicks you out often, check your settings, 4) The app is glitchy sometimes - restart phone, 5) Customer service is slow but they will replace failed sensors. Not perfect but it works!',
    score: 145,
    num_comments: 67,
    device_mentioned: 'medtronic',
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump', 'cgm'],
    is_solution: true,
  },

  // Lifestyle topics
  {
    source: 'r/diabetes',
    post_id: 'curated_dating_t1d_1',
    title: 'Dating with T1D - when to tell them',
    content: 'I used to hide my T1D on dates. Now I mention it early and its so much better: 1) Its a good filter - anyone weird about it isnt worth your time, 2) Explain basics simply, 3) Show them your CGM - most people think tech is cool, 4) Tell them about lows and what to do, 5) Dont make it your whole identity but dont hide it. Most people are understanding and even curious!',
    score: 412,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_pregnancy_t1d_1',
    title: 'T1D pregnancy - tips from someone whos been there',
    content: 'Had a healthy baby with T1D! Key things: 1) Get A1C under 7 before conceiving if possible, 2) See a maternal-fetal medicine specialist, 3) Insulin needs change DRAMATICALLY - I needed 3x my normal dose by 3rd trimester, 4) Tight control is exhausting but worth it, 5) Post-birth insulin needs drop immediately - risk of severe lows, 6) Its totally possible to have healthy pregnancies with T1D!',
    score: 534,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // More device troubleshooting
  {
    source: 'r/dexcom',
    post_id: 'curated_dexcom_restart_1',
    title: 'Extending Dexcom sensors - does it work?',
    content: 'Many people restart G6/G7 to extend use. My experience: 1) Sensors often stay accurate for 14-20 days, 2) Some sensors fail early even on first session, 3) Accuracy varies - fingerstick to confirm if unsure, 4) Method: remove transmitter, wait 15 min, reinsert, start new sensor, 5) Your results may vary. Not officially supported but many people do it successfully.',
    score: 378,
    num_comments: 145,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // Replies/Comments format
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_lows_1',
    parent_post_id: 'curated_morning_lows_1',
    title: null,
    content: 'This worked for me too! I also found that having a tablespoon of peanut butter before bed specifically helped stabilize my overnight sugars. The combination of protein and fat really helps prevent those early morning drops.',
    score: 89,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'morning'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_exercise_1',
    parent_post_id: 'curated_exercise_lows_1',
    title: null,
    content: 'Great tips! I would add that the TYPE of carb matters. I find that slower carbs like a granola bar work better pre-workout than fast sugar. The sugar burns off too quickly for me and I still go low mid-workout.',
    score: 67,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'exercise', 'food'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/dexcom',
    post_id: 'curated_reply_adhesion_1',
    parent_post_id: 'curated_sensor_adhesion_1',
    title: null,
    content: 'SkinTac is amazing! Another tip - I use a hairdryer on low to warm up the edges of the adhesive when its starting to peel. It kind of re-sticks it. Works great for an extra day or two.',
    score: 45,
    num_comments: 0,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
    post_type: 'reply',
  },

  // More diverse topics
  {
    source: 'r/diabetes',
    post_id: 'curated_cgm_insurance_1',
    title: 'How I got my insurance to cover a CGM',
    content: 'Insurance denied my CGM twice. What finally worked: 1) Get letter from endo explaining medical necessity, 2) Document hypoglycemia unawareness if you have it, 3) Keep a log of severe lows, 4) Appeal every denial - most get approved on 2nd or 3rd try, 5) Patient assistance programs if all else fails. Dont give up - CGM is life changing!',
    score: 456,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_swimming_t1d_1',
    title: 'Swimming with pump and CGM - its possible!',
    content: 'I swim 3x per week with my devices: 1) Omnipod is waterproof - just go, 2) Tandem needs to be disconnected - limit to 1 hour, 3) Dexcom is water resistant but long swims can affect adhesive, 4) Put on fresh overlay before swim day, 5) Check BG before and after - exercise + water = variable, 6) Keep snacks poolside. Dont let T1D stop you from swimming!',
    score: 234,
    num_comments: 67,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['exercise', 'devices'],
    is_solution: true,
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting seed of curated community posts...');
    
    const postsToInsert = curatedPosts.map(post => {
      // Generate a search URL for the subreddit to help users find similar content
      const subreddit = post.source.replace('r/', '');
      const searchQuery = encodeURIComponent(post.title?.substring(0, 50) || '');
      const url = `https://www.reddit.com/r/${subreddit}/search?q=${searchQuery}&restrict_sr=1`;
      
      return {
        source: post.source,
        post_id: post.post_id,
        title: post.title || '',
        content: post.content,
        author_anonymous: 'community_member',
        score: post.score,
        num_comments: post.num_comments,
        device_mentioned: post.device_mentioned,
        sentiment: post.sentiment,
        topic_tags: post.topic_tags,
        is_solution: post.is_solution,
        post_type: post.post_type || 'post',
        parent_post_id: post.parent_post_id || null,
        published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 30 days
        fetched_at: new Date().toISOString(),
        url: url,
      };
    });

    const { data, error } = await supabase
      .from('community_posts')
      .upsert(postsToInsert, { 
        onConflict: 'post_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error inserting posts:', error);
      throw error;
    }

    console.log(`Successfully seeded ${postsToInsert.length} curated community posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${postsToInsert.length} curated T1D community solutions`,
        count: postsToInsert.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed-community-posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
