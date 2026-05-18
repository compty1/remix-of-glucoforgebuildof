import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, validateBodySize, errorResponse } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
// Curated, high-quality T1D community solutions
const curatedPosts = [
  // GLUCOSE LOWS
  {
    source: 'r/diabetes',
    post_id: 'curated_morning_lows_1',
    title: 'Finally solved my morning lows! Here is what worked',
    content: 'I struggled with lows around 5-6am for months. What finally worked: 1) Reduced overnight basal by 20% after 2am, 2) Small protein snack (cheese stick) before bed, 3) Set temp target to 130 for Control-IQ during sleep. The combination was key! My endo said many people need different basal rates for different parts of the night.',
    score: 234,
    num_comments: 3,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 2,
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
    num_comments: 3,
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

  // Replies/Comments format - comprehensive curated replies for all major posts
  
  // Replies for curated_morning_lows_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_morning_lows_1',
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
    post_id: 'curated_reply_morning_lows_2',
    parent_post_id: 'curated_morning_lows_1',
    title: null,
    content: 'Reducing overnight basal was key for me too. My endo suggested starting the reduction at 1am instead of 2am and it made a huge difference. Everyone needs to find their own timing.',
    score: 67,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'morning'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_morning_lows_3',
    parent_post_id: 'curated_morning_lows_1',
    title: null,
    content: 'Control-IQ sleep mode was a game changer for me. I set it to start 30 minutes before I actually go to bed so it has time to adjust before I fall asleep.',
    score: 45,
    num_comments: 0,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'devices'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_exercise_lows_1
  {
    source: 'r/diabetes_t1',
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
    source: 'r/diabetes_t1',
    post_id: 'curated_reply_exercise_2',
    parent_post_id: 'curated_exercise_lows_1',
    title: null,
    content: 'The 2 hours before reduction tip is crucial. I used to only reduce 30 min before and still crashed. Insulin takes time to clear your system!',
    score: 52,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'exercise'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_sensor_adhesion_1
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
  {
    source: 'r/dexcom',
    post_id: 'curated_reply_adhesion_2',
    parent_post_id: 'curated_sensor_adhesion_1',
    title: null,
    content: 'GrifGrips are the best overlays IMO. They come in fun patterns too which makes it less clinical looking. My kids love picking out their designs.',
    score: 38,
    num_comments: 0,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_insulin_cost_1 (most popular post)
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_insulin_cost_1',
    parent_post_id: 'curated_insulin_cost_1',
    title: null,
    content: 'Mark Cuban Cost Plus Drugs saved me hundreds. Generic insulin is around $35 there. Definitely recommend checking it out!',
    score: 156,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_insulin_cost_2',
    parent_post_id: 'curated_insulin_cost_1',
    title: null,
    content: 'Lilly Cares program approved me in 2 weeks. Just needed proof of income. Totally worth the paperwork.',
    score: 89,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_insulin_cost_3',
    parent_post_id: 'curated_insulin_cost_1',
    title: null,
    content: 'For anyone in California, there is a state cap on insulin costs now. Check your states laws - more are passing similar legislation.',
    score: 78,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_burnout_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_burnout_1',
    parent_post_id: 'curated_burnout_1',
    title: null,
    content: 'The permission to aim for 80% instead of perfection was life changing. My endo finally told me "good enough is good enough" and my mental health improved so much.',
    score: 134,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_burnout_2',
    parent_post_id: 'curated_burnout_1',
    title: null,
    content: 'Finding a therapist who understands chronic illness made all the difference. They get it in a way that regular therapists sometimes dont.',
    score: 98,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_post_meal_spikes_1
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_reply_spikes_1',
    parent_post_id: 'curated_post_meal_spikes_1',
    title: null,
    content: 'Pre-bolusing changed my life! I set a 15 min timer on my phone before meals now. My time in range went from 60% to 80% just from this one change.',
    score: 112,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_reply_spikes_2',
    parent_post_id: 'curated_post_meal_spikes_1',
    title: null,
    content: 'The extended bolus for pizza is key. I do 70/30 over 3 hours and it works perfectly. No more 300s after pizza night!',
    score: 87,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_controliq_tips_1
  {
    source: 'r/tandem',
    post_id: 'curated_reply_controliq_1',
    parent_post_id: 'curated_controliq_tips_1',
    title: null,
    content: 'The dont rage bolus advice is so hard to follow but so important. I have to literally walk away from my pump when Im high and frustrated.',
    score: 89,
    num_comments: 0,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/tandem',
    post_id: 'curated_reply_controliq_2',
    parent_post_id: 'curated_controliq_tips_1',
    title: null,
    content: 'Updating my settings regularly made such a difference. I review my TDD every few weeks and adjust carb ratios accordingly.',
    score: 67,
    num_comments: 0,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_flying_t1d_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_flying_1',
    parent_post_id: 'curated_flying_t1d_1',
    title: null,
    content: 'I always ask for a pat down instead of the body scanner. Never had any issues and the TSA agents are usually very understanding.',
    score: 92,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_flying_2',
    parent_post_id: 'curated_flying_t1d_1',
    title: null,
    content: 'Pro tip: bring a doctors letter in the local language if traveling internationally. It has saved me from a lot of hassle at customs.',
    score: 78,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_newly_diagnosed_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_newly_diagnosed_1',
    parent_post_id: 'curated_newly_diagnosed_1',
    title: null,
    content: 'This community has been my lifeline. Finding people who actually understand what youre going through makes such a difference.',
    score: 145,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_newly_diagnosed_2',
    parent_post_id: 'curated_newly_diagnosed_1',
    title: null,
    content: 'The technology really has improved so much. I was diagnosed 15 years ago with just MDI and finger sticks. CGMs and pumps have been life changing.',
    score: 98,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'devices'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_carb_counting_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_carb_1',
    parent_post_id: 'curated_carb_counting_1',
    title: null,
    content: 'Getting a food scale was the single best purchase I made for my diabetes. Eyeballing portions was off by 30-50% sometimes!',
    score: 102,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_carb_2',
    parent_post_id: 'curated_carb_counting_1',
    title: null,
    content: 'Hidden carbs in sauces got me for years. Now I always ask for sauce on the side at restaurants so I can control how much I use.',
    score: 78,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_dawn_phenomenon_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_dawn_1',
    parent_post_id: 'curated_dawn_phenomenon_1',
    title: null,
    content: 'Increasing basal at 3am was the key for me. It took a few weeks of tweaking to find the right amount but now my mornings are so much better.',
    score: 89,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'morning'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_dawn_2',
    parent_post_id: 'curated_dawn_phenomenon_1',
    title: null,
    content: 'A protein-heavy breakfast really does help! I switched from cereal to eggs and my post-breakfast numbers improved dramatically.',
    score: 67,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
    post_type: 'reply',
  },

  // Replies for curated_stubborn_highs_1
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_highs_1',
    parent_post_id: 'curated_stubborn_highs_1',
    title: null,
    content: 'Its almost always the site for me too. I now change my site first before doing anything else when corrections arent working.',
    score: 134,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
    post_type: 'reply',
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_reply_highs_2',
    parent_post_id: 'curated_stubborn_highs_1',
    title: null,
    content: 'Checking for ketones is so important. I learned the hard way that you need a LOT more insulin when ketones are present.',
    score: 98,
    num_comments: 0,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
    post_type: 'reply',
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - GLUCOSE LOWS
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_low_treatment_1',
    title: 'The 15-15 rule changed how I treat lows',
    content: 'I used to over-treat every low and end up high. The 15-15 rule works: eat 15g fast carbs, wait 15 minutes, retest. If still low, repeat. Glucose tabs are my go-to because they are exactly 4g each. No more roller coasters!',
    score: 234,
    num_comments: 45,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_alcohol_lows_1',
    title: 'Preventing lows after drinking alcohol',
    content: 'Learned this the hard way: alcohol blocks your liver from releasing glucose. My protocol: 1) Reduce overnight basal by 30%, 2) Have a protein snack before bed, 3) Set CGM alarm at 90 instead of 70, 4) Tell whoever youre with about your diabetes. Been much safer since following this!',
    score: 312,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'food', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_rebound_highs_1',
    title: 'Stopping the low-high roller coaster',
    content: 'Used to treat lows and skyrocket to 300. Solution: treat with JUST fast carbs (no food), wait the full 15 min, and dont eat more unless still low. Also learned that if Im dropping fast, I can temporarily suspend my pump. No more rebounds!',
    score: 189,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_driving_lows_1',
    title: 'Safe driving with T1D - my rules',
    content: 'After a close call, I made strict rules: 1) Check BG before driving, must be above 90, 2) Keep glucose tabs in cup holder, 3) Pull over IMMEDIATELY if feeling off, 4) For long drives, check every 2 hours, 5) Never drive if recently low - takes time for brain to recover. Safety first!',
    score: 445,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/dexcom',
    post_id: 'curated_compression_lows_2',
    title: 'Compression lows driving you crazy? Try this',
    content: 'Side sleeper here. Kept getting false lows at night. Solutions that worked: 1) Put sensor on back of arm, not front, 2) Use a pillow between arms, 3) Try abdomen instead, 4) Some people use a sleep bra to protect it. No more 2am panic attacks from fake lows!',
    score: 267,
    num_comments: 89,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['glucose_lows', 'devices', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_work_lows_1',
    title: 'Managing lows at work without everyone knowing',
    content: 'Tips for discrete low management: 1) Keep supplies in your desk, 2) Glucose tabs look like mints, 3) Juice boxes can be drunk quickly, 4) Tell at least one trusted coworker, 5) Take bathroom break if you need to sit out a low. You dont have to announce it to everyone!',
    score: 198,
    num_comments: 56,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_lows'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - GLUCOSE HIGHS
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_stress_highs_1',
    title: 'Stress spikes are real - here is how I manage them',
    content: 'Cortisol from stress raises blood sugar significantly. What helps: 1) Recognize its happening, 2) May need 10-20% more insulin during stressful periods, 3) Deep breathing actually helps, 4) Exercise if possible, 5) Dont beat yourself up - stress is part of life. Understanding the cause helps!',
    score: 378,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_coffee_highs_1',
    title: 'Coffee makes my blood sugar spike - anyone else?',
    content: 'Even black coffee raised my BG by 30-50 points. Solutions: 1) Small bolus with morning coffee (0.5-1 unit for me), 2) Drink it with breakfast and bolus together, 3) Switch to tea which affects me less, 4) Cold brew seems to spike less than hot. The caffeine stimulates glucose release!',
    score: 234,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_hormones_highs_1',
    title: 'Menstrual cycle and blood sugar patterns',
    content: 'Ladies, track your cycle with your BG! Pattern I found: 1) Week before period - need 20-30% more insulin, 2) First few days of period - sudden drop, risk of lows, 3) Ovulation - slight increase, 4) I have different pump profiles for different cycle phases now. Game changer!',
    score: 456,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_intramuscular_1',
    title: 'Intramuscular injection for stubborn highs',
    content: 'When correction wont work and ketones are rising, IM injection can help. How: inject into muscle (thigh works), insulin absorbs 2-3x faster. ONLY for emergencies, not regular use. Also drink tons of water. This has kept me out of the ER multiple times.',
    score: 345,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_chinese_food_1',
    title: 'Finally figured out Chinese food bolusing',
    content: 'Chinese food was impossible until I learned: 1) Rice has more carbs than you think, 2) Sauces are full of sugar, 3) Extended bolus 60/40 over 3 hours, 4) The fat delays absorption like pizza, 5) Fried rice is worse than steamed. My after-Chinese numbers are finally reasonable!',
    score: 312,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs', 'food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_scar_tissue_1',
    title: 'Scar tissue affecting insulin absorption',
    content: 'If you have been pumping or injecting in the same spots for years, you might have scar tissue. Signs: lumps, slower absorption, unexplained highs. Solutions: 1) Rotate sites religiously, 2) Let problem areas rest for months, 3) Try new body areas, 4) Massage areas gently. It can heal!',
    score: 267,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['glucose_highs', 'devices'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - DEVICES CGM
  // ==========================================
  {
    source: 'r/dexcom',
    post_id: 'curated_g7_warmup_1',
    title: 'G7 warmup period tips - what I learned',
    content: 'G7 warmup is only 30 min but readings can be off for first few hours. Tips: 1) Insert sensor a few hours before you need accurate readings, 2) First day may read higher than actual, 3) Calibration usually helps but dont over-calibrate, 4) Trust fingerstick if readings seem way off early on.',
    score: 189,
    num_comments: 67,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/FreeStyleLibre',
    post_id: 'curated_libre3_pairing_1',
    title: 'Libre 3 Bluetooth connection issues - solved',
    content: 'Had constant dropouts. What fixed it: 1) Keep phone within 20 feet of sensor, 2) Disable battery optimization for the app, 3) Make sure Bluetooth is always on, 4) Restart app if readings stop, 5) Reinstall app if problems persist. Connection is much more stable now!',
    score: 234,
    num_comments: 89,
    device_mentioned: 'libre',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/dexcom',
    post_id: 'curated_sensor_failure_1',
    title: 'Getting Dexcom to replace failed sensors',
    content: 'Dexcom will replace sensors that fail early or give bad readings. Process: 1) Call tech support, 2) Have sensor lot number ready, 3) Describe the issue clearly, 4) They usually send replacement no questions asked, 5) Keep failed sensors until replacement arrives. Great customer service!',
    score: 312,
    num_comments: 78,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/cgm',
    post_id: 'curated_cgm_swimming_1',
    title: 'Swimming with CGM - what actually works',
    content: 'Love to swim, tested different methods: 1) Tegaderm over sensor is waterproof, 2) SkinTac underneath helps it stick, 3) Pool chlorine can affect adhesive over time, 4) Check sensor after swimming - might need to press edges down, 5) Both Dexcom and Libre work fine underwater. Dont let diabetes stop you!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_cgm_accuracy_1',
    title: 'When to trust CGM vs fingerstick',
    content: 'CGM and meter often differ. When to trust fingerstick: 1) First 12-24 hours of new sensor, 2) Rapid changes (CGM lags by 10-15 min), 3) When readings seem wrong for how you feel, 4) After heavy compression, 5) Dehydration affects CGM accuracy. Both are tools - use them together!',
    score: 389,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - DEVICES PUMPS
  // ==========================================
  {
    source: 'r/Omnipod',
    post_id: 'curated_omnipod5_settings_1',
    title: 'Omnipod 5 settings that improved my control',
    content: 'After 6 months of tweaking: 1) Keep basal rates accurate - O5 uses them as a baseline, 2) Carb ratios need to be dialed in, 3) The algorithm works best with accurate weight entered, 4) Higher correction factor = less aggressive algorithm, 5) Trust it for a few weeks before making changes.',
    score: 278,
    num_comments: 89,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/tandemdiabetes',
    post_id: 'curated_mobi_review_1',
    title: 'Tandem Mobi first month review',
    content: 'Switched from t:slim to Mobi. Pros: tiny size, phone control is great, same Control-IQ algorithm. Cons: smaller reservoir means more changes, no screen on pump itself, must have phone nearby. Overall love it - the size difference is amazing!',
    score: 345,
    num_comments: 112,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_pump_vacation_1',
    title: 'Taking a pump vacation - my experience',
    content: 'Took 2 weeks off my pump for beach vacation. Tips: 1) Calculate your MDI doses before stopping, 2) Long-acting + rapid acting for meals, 3) May need slightly more total daily insulin on MDI, 4) Freedom from tubing is nice but control was harder, 5) Happy to go back to pump after!',
    score: 198,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump', 'travel'],
    is_solution: true,
  },
  {
    source: 'r/InsulinPumps',
    post_id: 'curated_pump_site_rotation_1',
    title: 'Site rotation map that keeps me organized',
    content: 'I created a rotation system to avoid scar tissue: 1) Divide abdomen into 8 zones, 2) Number them 1-8, 3) Move one zone clockwise each site change, 4) Mark in a notebook which zone and date, 5) Never use same zone within 2 weeks. My absorption has improved so much!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/medtronicdiabetes',
    post_id: 'curated_780g_tips_1',
    title: '780G tips after 8 months of use',
    content: 'Finally got the hang of 780G SmartGuard: 1) Calibrate when BG is stable, not changing, 2) Guardian 4 is much better than Guardian 3, 3) Set realistic glucose target (100-120 works for most), 4) Trust auto mode more than I initially did, 5) Time in range went from 55% to 75%!',
    score: 267,
    num_comments: 89,
    device_mentioned: 'medtronic',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - EXERCISE
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_hiit_t1d_1',
    title: 'HIIT workouts with T1D - my approach',
    content: 'HIIT is tricky because it can spike BG then crash later. Strategy: 1) Start around 150, 2) The spike during workout is normal from adrenaline, 3) Dont correct the spike - you will crash, 4) Have snack ready for 1-2 hours after, 5) Reduce basal for several hours post-workout. It works once you learn the pattern!',
    score: 212,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_yoga_t1d_1',
    title: 'Yoga and blood sugar - surprisingly effective',
    content: 'Started yoga and noticed interesting effects: 1) Stress reduction helps with overall BG, 2) Certain poses (inversions) can temporarily affect CGM readings, 3) Hot yoga is like cardio - causes drops, 4) Regular yoga = more stable numbers over time. Great low-impact option!',
    score: 178,
    num_comments: 56,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_cycling_t1d_1',
    title: 'Long distance cycling with Type 1 - complete guide',
    content: 'Did a 100 mile ride with T1D. What I learned: 1) Reduce basal 2 hours before by 50%, 2) Eat 30-60g carbs per hour, 3) Keep CGM visible (phone mount), 4) Carry fast sugar AND real food, 5) Post-ride sensitivity lasts hours - reduce basal or eat more. It is totally doable!',
    score: 345,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_morning_exercise_1',
    title: 'Morning vs evening exercise - different strategies needed',
    content: 'Discovered timing matters a lot: Morning workout often RAISES my BG (dawn phenomenon + cortisol), Evening workout drops it and keeps me low overnight. Solutions: may need small bolus for AM workouts, definitely reduce basal for PM workouts. Track your patterns!',
    score: 234,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise', 'morning'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_competition_t1d_1',
    title: 'Competing in sports with T1D - race day tips',
    content: 'I compete in triathlons. Race day strategy: 1) Higher BG target (120-180) for buffer, 2) Adrenaline will spike you - dont panic, 3) Carry nutrition even if short race, 4) Practice race nutrition in training, 5) Tell race officials about your condition. You can be competitive with T1D!',
    score: 289,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - TRAVEL
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_cruise_t1d_1',
    title: 'Cruise ship T1D tips - learned from experience',
    content: 'Just did a week cruise: 1) Bring 2x supplies you need, 2) Keep insulin in cabin fridge (request one if needed), 3) Buffet carb counting is hard - bring food scale, 4) Ship medical can help in emergency, 5) Motion sickness affects BG for some people. Had a great time!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel', 'food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_camping_t1d_1',
    title: 'Camping and backpacking with diabetes',
    content: 'Love the outdoors with T1D. Tips: 1) FRIO pouches keep insulin cool without ice, 2) Bring way more supplies than you think, 3) Activity often means less insulin needed, 4) Extra batteries for pump, 5) Tell hiking partners about lows, 6) Pack glucose tabs in easy-reach pocket. Nature is doable!',
    score: 312,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_hot_weather_1',
    title: 'Hot weather and insulin - important tips',
    content: 'Insulin degrades in heat! Protection strategies: 1) Never leave in car, 2) FRIO cooling wallet, 3) In extreme heat, keep unopened vials in hotel fridge, 4) If insulin looks cloudy or changed color, replace it, 5) May need less insulin in heat due to increased absorption. Stay cool!',
    score: 278,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_road_trip_1',
    title: 'Road trip T1D checklist that saved me',
    content: 'My car kit: 1) Cooler for insulin, 2) Glucose tabs in every cup holder, 3) Juice boxes in cooler, 4) Backup supplies for pump/CGM, 5) Chargers for all devices, 6) Snacks for lows, 7) Written prescription copies. Stops make great opportunities to check BG. Adventure awaits!',
    score: 256,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - FOOD
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_low_carb_1',
    title: 'Low carb eating with T1D - my experience',
    content: 'Tried low carb for 6 months: Pros - more stable BG, less insulin, easier to predict. Cons - harder to exercise, more fat = extended boluses still needed. Tips: 1) Still need basal insulin, 2) Protein can raise BG slowly, 3) Dont go too extreme. Works for some, not for all!',
    score: 345,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_ice_cream_1',
    title: 'Ice cream bolusing strategy that works',
    content: 'Ice cream used to wreck my BG. Now I nail it: 1) High fat = delayed spike, 2) Extended bolus 50/50 over 2-3 hours, 3) Portion size matters - use measuring cup, 4) Low-carb options exist but still have carbs, 5) Sometimes worth the effort! Pre-bolus doesnt work as well for ice cream.',
    score: 289,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food', 'glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_restaurant_tips_1',
    title: 'Restaurant eating - how I handle it now',
    content: 'Used to avoid restaurants. Now I enjoy them: 1) Look up menu and nutrition beforehand, 2) Ask for sauce/dressing on side, 3) Estimate high on carbs for restaurant portions, 4) Split meals to control portion, 5) Check BG 2 hours after to learn. You can eat out!',
    score: 312,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_protein_bolusing_1',
    title: 'Protein affects blood sugar too - here is how',
    content: 'Learned that protein converts to glucose slowly. Tips: 1) Large protein meals (steak, big burgers) may need small bolus, 2) Effect shows 3-4 hours later, 3) Fat slows it even more, 4) Some pumps have protein/fat settings, 5) Start small and adjust. Not just about carbs!',
    score: 267,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food', 'glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_fiber_1',
    title: 'Fiber and blood sugar - should you subtract?',
    content: 'Fiber question comes up a lot. My approach: 1) For whole foods, fiber naturally slows absorption, 2) For processed foods with added fiber, may still spike, 3) I subtract half the fiber from carbs as a starting point, 4) Net carbs work for some, not for others. Test YOUR response!',
    score: 198,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['food'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_meal_prep_1',
    title: 'Meal prepping makes T1D easier',
    content: 'Started meal prepping and my control improved: 1) Know exact carbs in advance, 2) Consistent portions = consistent results, 3) Less decision fatigue, 4) Can pre-bolus accurately, 5) Saves time AND money. I prep lunches for the week on Sundays. Life changing!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - EMOTIONAL
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_diagnosis_anniversary_1',
    title: 'Celebrating my diaversary - why I do it',
    content: 'I celebrate my diagnosis anniversary every year. Why: 1) Acknowledges the hard work, 2) Shows how far Ive come, 3) Connects with community, 4) Teaches non-diabetics that its a big deal, 5) Self-compassion matters. You deserve to be proud of yourself!',
    score: 445,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_therapy_t1d_1',
    title: 'Therapy specifically for chronic illness - finding one',
    content: 'Regular therapists didnt get it. Finding one who specializes in chronic illness changed everything: 1) JDRF can sometimes refer, 2) Psychology Today filter for chronic illness, 3) Telehealth expanded options, 4) They understand the constant management burden. Worth the search!',
    score: 378,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_imposter_syndrome_1',
    title: 'Diabetes imposter syndrome - when your numbers are good',
    content: 'Weird feeling: when control is good, I feel like Im faking being diabetic. Realized: 1) Good numbers mean youre working hard, 2) The work is invisible but real, 3) You still have T1D even with good A1C, 4) Dont minimize your effort to yourself or others. You are valid!',
    score: 312,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_anger_1',
    title: 'Its okay to be angry about having diabetes',
    content: 'For years I tried to be positive. Then I let myself be angry and it helped: 1) Anger is a valid emotion, 2) Feeling it doesnt mean acting on it, 3) Suppressing makes it worse, 4) Talk about it with people who get it, 5) Then move forward. You didnt ask for this!',
    score: 567,
    num_comments: 178,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_partner_support_1',
    title: 'How my partner learned to help without hovering',
    content: 'My spouse wanted to help but it felt like nagging. What worked: 1) Clear conversation about what help I actually want, 2) Specific things they can do (know where glucose is, learn glucagon), 3) They ask before suggesting, 4) I share wins not just struggles. We are a team now!',
    score: 289,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - SCHOOL/WORK
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_college_t1d_1',
    title: 'College freshman with T1D - survival guide',
    content: 'Just finished first year of college with T1D. Tips: 1) Register with disability services, 2) Keep supplies stocked - harder to get refills quickly, 3) Mini fridge for insulin, 4) Tell your RA, 5) Dining hall carb counting is an art, 6) Dont let partying wreck your control. You can do this!',
    score: 378,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_remote_work_1',
    title: 'Remote work is great for T1D management',
    content: 'Working from home benefits: 1) Can handle lows privately, 2) Full kitchen access for food, 3) No commute stress affecting BG, 4) Can exercise during lunch, 5) Bathroom whenever needed. If you have the option, it makes management so much easier!',
    score: 245,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_disclosing_work_1',
    title: 'Telling your employer about T1D - when and how',
    content: 'You dont legally have to disclose, but I find it helpful: 1) Tell HR for accommodations if needed, 2) Tell immediate supervisor so they understand if you need to step away, 3) Tell one nearby coworker for emergencies, 4) Keep it simple. Most workplaces are supportive!',
    score: 198,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_meetings_1',
    title: 'Long meetings and blood sugar management',
    content: 'All-day meetings used to stress me out. Now: 1) Bring snacks visibly - normalizes it, 2) Check CGM discreetly on phone/watch, 3) Sit near door if you need to step out, 4) Eat proper lunch even if everyone else skips, 5) Bathroom breaks are your right. Take care of yourself!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - DIY/TECH
  // ==========================================
  {
    source: 'r/loopkit',
    post_id: 'curated_loop_settings_1',
    title: 'Loop settings that improved my time in range',
    content: 'After tweaking Loop for months: 1) Delivery limits need to be accurate, 2) Suspend threshold should be higher than your alert, 3) Correction range affects aggressiveness, 4) Override presets are powerful for exercise, 5) Trust the algorithm. Went from 55% to 80% TIR!',
    score: 267,
    num_comments: 89,
    device_mentioned: 'loop',
    sentiment: 'positive',
    topic_tags: ['devices', 'tech'],
    is_solution: true,
  },
  {
    source: 'r/AndroidAPS',
    post_id: 'curated_aaps_1',
    title: 'AndroidAPS - worth the learning curve',
    content: 'AAPS took weeks to set up but worth it: 1) Start with objectives - dont skip, 2) SMB is amazing once unlocked, 3) More customizable than commercial systems, 4) Community support is incredible, 5) Backup everything. My A1C dropped from 7.5 to 6.2!',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'tech'],
    is_solution: true,
  },
  {
    source: 'r/Nightscout',
    post_id: 'curated_nightscout_1',
    title: 'Nightscout setup for remote monitoring',
    content: 'Set up Nightscout for my kid: 1) Free hosting on Heroku is gone but Railway works, 2) Share with caregivers easily, 3) Alarms on follower phones are lifesaver, 4) Historical data is invaluable for endo visits, 5) Worth learning even if not tech savvy. Peace of mind!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'tech'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_xdrip_1',
    title: 'xDrip+ features that changed my management',
    content: 'xDrip+ offers so much more than standard apps: 1) Predictive alerts, 2) Customizable graphs, 3) Smart watch support, 4) Noise filtering, 5) Works with multiple CGM types, 6) Follower mode for caregivers. Free and open source!',
    score: 289,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'tech', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - PREGNANCY
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_preconception_1',
    title: 'Preparing for pregnancy with T1D - timeline',
    content: 'Planning pregnancy with T1D: 1) Start 3-6 months before trying to conceive, 2) Goal A1C under 7, ideally under 6.5, 3) See high-risk OB before pregnancy, 4) Get on CGM if not already, 5) Review medications - some not safe, 6) Folic acid supplement. Preparation matters!',
    score: 356,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_first_trimester_1',
    title: 'First trimester insulin changes - my experience',
    content: 'First trimester was wild: 1) Insulin needs often DROP first, 2) Morning sickness + lows = dangerous combo, 3) Keep fast sugar everywhere, 4) May need to eat before bolusing, 5) Nausea is real - small frequent meals help. It gets different in second trimester!',
    score: 289,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['emotional', 'glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_postpartum_1',
    title: 'Postpartum insulin changes nobody warned me about',
    content: 'After delivery: 1) Insulin needs DROP immediately - like 50%, 2) High risk of severe lows while breastfeeding, 3) Sleep deprivation affects BG control, 4) Breastfeeding burns calories = lows, 5) Slowly rebuild as hormones stabilize. Be careful those first weeks!',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'glucose_lows'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - INSURANCE/COST
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_prior_auth_1',
    title: 'Fighting prior authorization denials - what worked',
    content: 'Insurance denied my CGM at first. How I won: 1) Get denial in writing, 2) Have endo write letter of medical necessity, 3) Appeal with supporting documentation, 4) Include A1C history showing why you need it, 5) Escalate if needed - many reversals happen on appeal. Dont give up!',
    score: 456,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_manufacturer_programs_1',
    title: 'Manufacturer assistance programs - how to apply',
    content: 'Used assistance programs when between insurance: 1) Lilly Cares, 2) Novo Patient Assistance, 3) Dexcom patient assistance, 4) Tandem financial assistance. Requirements: usually income-based, need prescription. Apply directly on manufacturer websites. They want to help!',
    score: 345,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_fsa_hsa_1',
    title: 'Maximizing FSA/HSA for diabetes supplies',
    content: 'Max out tax-advantaged accounts: 1) Calculate yearly supply costs, 2) Include insulin, CGM, pump supplies, glucose tabs, test strips, 3) Also covers pharmacy copays, 4) Even glucose tabs and medical alert jewelry count, 5) Save receipts! Can save 20-30% effectively.',
    score: 278,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - SICK DAYS
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_stomach_bug_1',
    title: 'Managing T1D during stomach flu - survival guide',
    content: 'Stomach bug with T1D is scary. My protocol: 1) NEVER skip basal even if not eating, 2) Sip electrolyte drinks constantly, 3) Check BG every 2 hours, 4) Check ketones if over 250, 5) Call endo if cant keep water down, 6) ER if ketones are moderate/high. Stay hydrated!',
    score: 378,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_cold_flu_1',
    title: 'Cold/flu with T1D - what I have learned',
    content: 'Every cold affects my BG: 1) Usually need more insulin, 2) Sugar-free cough medicine exists, 3) Check carbs in throat lozenges, 4) Fever means drink extra water, 5) Rest actually helps BG stabilize, 6) DayQuil and similar can raise BG. Sick kit ready saves stress!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_surgery_t1d_1',
    title: 'Surgery preparation with T1D - what to know',
    content: 'Had surgery recently. Tips: 1) Meet with anesthesiologist beforehand, 2) Discuss CGM/pump during surgery (usually keep CGM, pump varies), 3) May be on IV insulin, 4) NPO affects BG - monitor closely, 5) Recovery may need insulin adjustments, 6) Have supplies ready at home. Plan ahead!',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['glucose_highs'],
    is_solution: true,
  },

  // ==========================================
  // ADDITIONAL CURATED POSTS - PARENTS/KIDS
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_newly_diagnosed_parent_1',
    title: 'To parents of newly diagnosed kids - it gets easier',
    content: 'Our child was diagnosed 3 years ago. What helped: 1) Cry when you need to, 2) Join parent Facebook groups, 3) Let them be a kid first, diabetic second, 4) CGM is worth any fight with insurance, 5) They will learn to manage - trust them gradually. You will find your new normal!',
    score: 567,
    num_comments: 178,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_teenager_t1d_1',
    title: 'Helping teens take ownership of T1D',
    content: 'Transition to teen self-management: 1) Gradual handoff of responsibilities, 2) Mistakes are learning opportunities, 3) Let them make some choices (within safety), 4) Keep communication open without nagging, 5) Endo appointments alone at some point. They need to own it eventually!',
    score: 345,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_sleepovers_1',
    title: 'Sleepovers with T1D kids - making it work',
    content: 'Sleepovers seemed impossible at first. How we do it: 1) Share CGM with parents phone, 2) Train host parents on basics, 3) Pack a bag with everything labeled, 4) Set alarms/alerts on CGM, 5) Trial run at grandparents first. Kids need normalcy!',
    score: 289,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/diabetes',
    post_id: 'curated_camp_t1d_1',
    title: 'Diabetes camp changed my kids life',
    content: 'Sent kiddo to diabetes camp. Impact: 1) Made friends who truly get it, 2) Learned they are not alone, 3) Came back more confident, 4) Picked up tips from other kids, 5) Fun AND educational. Worth every penny - look into JDRF and ADA camps!',
    score: 423,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: PARENTING T1D KIDS - SCHOOL & DAYCARE
  // ==========================================
  {
    source: 'r/diabetes_parents',
    post_id: 'curated_school_504_plan_1',
    title: '504 Plan tips for T1D kids in school',
    content: 'After 3 years navigating school with T1D: 1) Get a 504 plan immediately - its federal law, 2) Include CGM access during class, 3) Specify nurse can call parent for dosing decisions, 4) Allow snacks anytime for lows, 5) Extra time for tests if BG is off, 6) Include sports/field trip protocols. Document everything!',
    score: 445,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/t1d_parents',
    post_id: 'curated_daycare_t1d_1',
    title: 'Getting daycare to manage T1D - our approach',
    content: 'Daycare with T1D seemed impossible. What worked: 1) Found a center willing to learn, 2) Provided written protocols for everything, 3) CGM sharing with phone in break room, 4) Pre-portioned snacks with carb counts labeled, 5) Weekly check-ins at first, 6) Trained backup staff too. It can work!',
    score: 312,
    num_comments: 89,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['parenting', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_parents',
    post_id: 'curated_school_nurse_1',
    title: 'Working with school nurses - building the relationship',
    content: 'Tips for school nurse partnership: 1) Meet before school starts, 2) Bring endo orders and clear protocols, 3) Share CGM with nurse for real-time monitoring, 4) Check in weekly initially, 5) Be available by phone, 6) Thank them often - theyre doing a lot! Good relationship = peace of mind.',
    score: 267,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting'],
    is_solution: true,
  },
  {
    source: 'r/Type1Kids',
    post_id: 'curated_birthday_parties_1',
    title: 'Managing birthday parties with T1D kid',
    content: 'Birthday party strategies: 1) Communicate with host parent about food, 2) Pre-bolus before cake, 3) Bring backup snacks just in case, 4) CGM lets them play without constant checks, 5) Its okay if numbers arent perfect - fun matters too, 6) Teach them to self-advocate as they get older.',
    score: 234,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting', 'food'],
    is_solution: true,
  },

  // ==========================================
  // NEW: TEEN & COLLEGE LIFE
  // ==========================================
  {
    source: 'r/CollegeDiabetics',
    post_id: 'curated_college_dorm_1',
    title: 'Dorm life with T1D - survival guide',
    content: 'Just finished freshman year: 1) Mini fridge for insulin is a must, 2) Keep glucose everywhere - bedside, backpack, desk, 3) Tell your RA about your condition, 4) Campus health center can refill supplies in emergency, 5) All-nighters wreck BG - plan accordingly, 6) Dining hall is tough - estimate high. You got this!',
    score: 378,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['college', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesTeens',
    post_id: 'curated_telling_friends_1',
    title: 'How to tell friends about T1D without making it weird',
    content: 'Telling new friends about T1D: 1) Be casual about it - if you make it NBD they will too, 2) Explain the basics briefly, 3) Show them what a low looks like so they can help, 4) Correct myths (no you didnt eat too much sugar), 5) Make jokes about it if comfortable. Real friends are supportive!',
    score: 289,
    num_comments: 87,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'college'],
    is_solution: true,
  },
  {
    source: 'r/CollegeDiabetics',
    post_id: 'curated_drinking_college_1',
    title: 'College drinking and T1D - harm reduction tips',
    content: 'Real talk about drinking in college with T1D: 1) NEVER drink alone, 2) Tell friends how to use glucagon, 3) Eat before drinking, 4) Reduce basal significantly - alcohol causes delayed lows, 5) Set CGM alarms louder, 6) Avoid sugary mixers then needing to correct, 7) Know your limits. Be safe out there.',
    score: 456,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['college', 'food', 'glucose_lows'],
    is_solution: true,
  },

  // ==========================================
  // NEW: ATHLETIC PERFORMANCE
  // ==========================================
  {
    source: 'r/diabeticathletes',
    post_id: 'curated_marathon_training_1',
    title: 'Training for a marathon with T1D - complete guide',
    content: 'Ran 5 marathons with T1D: 1) Start training runs with BG 150-180, 2) Reduce basal 50% 2hrs before long runs, 3) Carry gels every 3 miles, 4) Post-run lows happen 6-8hrs later - reduce basal, 5) Carb load works but need insulin, 6) Race day is different than training - start higher. You CAN do this!',
    score: 534,
    num_comments: 178,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['athletics', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabeticfitness',
    post_id: 'curated_crossfit_t1d_1',
    title: 'CrossFit with T1D - managing the intensity',
    content: 'CrossFit is unique because it mixes cardio and weights: 1) BG can go either direction depending on WOD, 2) Strength-heavy days = BG rises, 3) Cardio-heavy days = BG drops, 4) I keep glucose AND small bolus pen handy, 5) Tell coach youre T1D, 6) Learning your patterns takes time. Track everything!',
    score: 312,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['athletics', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabetesrunners',
    post_id: 'curated_triathlon_t1d_1',
    title: 'Completed my first triathlon with T1D',
    content: 'Triathlon tips from a T1D: 1) Each discipline affects BG differently, 2) Swim = slight rise for me, 3) Bike = major drop, 4) Run = depends on how hard bike was, 5) Transition zones are perfect for quick BG checks, 6) Waterproof CGM placement is key, 7) Tape pump securely for swim. Dream big!',
    score: 445,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['athletics', 'exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabeticathletes',
    post_id: 'curated_competitive_sports_1',
    title: 'Playing competitive sports in high school/college with T1D',
    content: 'Played college soccer with T1D: 1) Coach needs to understand lows, 2) Glucose on bench always, 3) Pump removed during games - give small bolus before, 4) Adrenaline raises BG so may need correction at halftime, 5) Post-game lows are real, 6) NCAA has medical exemption forms. Dont let T1D stop you!',
    score: 378,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['athletics', 'exercise', 'college'],
    is_solution: true,
  },

  // ==========================================
  // NEW: KETO & LOW CARB
  // ==========================================
  {
    source: 'r/diabeticketo',
    post_id: 'curated_keto_t1d_1',
    title: 'Keto with T1D - what my endo didnt tell me',
    content: 'Been keto for 2 years with T1D: 1) A1C dropped from 7.2 to 5.8, 2) Much less insulin needed, 3) More stable BGs, fewer swings, 4) Initial transition is rough - stick with it, 5) Still need basal insulin always, 6) Monitor ketones - nutritional ketosis is different from DKA, 7) Find a keto-friendly endo!',
    score: 567,
    num_comments: 234,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['keto', 'food'],
    is_solution: true,
  },
  {
    source: 'r/diabeticketo',
    post_id: 'curated_low_carb_transition_1',
    title: 'Transitioning to low carb with T1D safely',
    content: 'Low carb transition tips: 1) Reduce gradually - dont go cold turkey, 2) Youll need WAY less bolus, 3) Adjust basal too after a few weeks, 4) Expect some weird BG patterns at first, 5) Protein can raise BG - learn to dose for it, 6) Keep carbs for treating lows, 7) Work with your endo on settings.',
    score: 389,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['keto', 'food'],
    is_solution: true,
  },
  {
    source: 'r/diabeticketo',
    post_id: 'curated_bernstein_diet_1',
    title: 'Dr Bernstein approach - my honest experience',
    content: 'Tried strict Bernstein for 1 year: 1) Amazing A1C results (5.4), 2) Very restrictive socially, 3) Fewer lows but still happen, 4) Need to adjust protein bolusing, 5) Not sustainable for everyone, 6) Modified low carb (50-75g/day) is my sweet spot now. Find what works for YOUR life!',
    score: 312,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['keto', 'food'],
    is_solution: true,
  },

  // ==========================================
  // NEW: MENTAL HEALTH & BURNOUT
  // ==========================================
  {
    source: 'r/DiabetesBurnout',
    post_id: 'curated_severe_burnout_1',
    title: 'Rock bottom burnout - how I recovered',
    content: 'Was at my worst - stopped checking, A1C was 12. What helped: 1) Admitted I needed help, 2) Found a therapist who specializes in chronic illness, 3) Started with ONE thing - just wearing CGM, 4) Automation helped - got on closed loop, 5) No judgment from endo, 6) Online community for support. Recovery is possible.',
    score: 678,
    num_comments: 234,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['burnout', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Support',
    post_id: 'curated_diabetes_therapy_1',
    title: 'Finding a therapist who understands T1D',
    content: 'Therapy changed my T1D management: 1) Look for chronic illness specialists, 2) Or ask endo for referrals, 3) They dont need to know everything about T1D, 4) Focus on health anxiety, perfectionism, burnout, 5) EMDR helped with diagnosis trauma, 6) Online therapy works great. Mental health IS diabetes care.',
    score: 445,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['burnout', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesSpouses',
    post_id: 'curated_spouse_support_1',
    title: 'How to support your T1D spouse without being overbearing',
    content: 'As a spouse of someone with T1D: 1) Ask how they want to be supported, 2) Dont police their food choices, 3) Learn the basics but dont hover, 4) Be there for burnout days, 5) Know how to treat severe lows, 6) Its their disease - follow their lead. Love is the best medicine.',
    score: 389,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['dating', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesBurnout',
    post_id: 'curated_perfectionism_1',
    title: 'Letting go of diabetes perfectionism',
    content: 'Perfectionism was killing me: 1) Time in range is a RANGE not a single number, 2) 70% TIR is great - even endos say so, 3) Bad days happen to everyone, 4) One high BG wont kill you, 5) Comparison to others is toxic, 6) Your worth isnt your A1C. 80% effort long-term beats 100% for a month then burnout.',
    score: 534,
    num_comments: 189,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['burnout', 'emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DEVICE EXPERIENCES - iLET & TIDEPOOL
  // ==========================================
  {
    source: 'r/iLet',
    post_id: 'curated_ilet_experience_1',
    title: 'First month on iLet Bionic Pancreas - honest review',
    content: 'Been on iLet for 30 days: 1) Setup was SO simple - just enter weight, 2) No carb counting needed (but I still do roughly), 3) Learning period takes 1-2 weeks, 4) Runs you higher than I liked at first, 5) Gets better over time, 6) Amazing for burnout recovery, 7) Tubeless coming soon. Game changer for me!',
    score: 489,
    num_comments: 167,
    device_mentioned: 'ilet',
    sentiment: 'positive',
    topic_tags: ['devices'],
    is_solution: true,
  },
  {
    source: 'r/Tidepool',
    post_id: 'curated_tidepool_loop_1',
    title: 'Tidepool Loop vs DIY Loop - my comparison',
    content: 'Used DIY Loop for 3 years, now on Tidepool Loop: 1) FDA approved so insurance covered, 2) Same algorithm essentially, 3) More reliable - fewer crashes, 4) Works with Omnipod 5 pods, 5) Less tinkering needed, 6) Miss some DIY flexibility. Great for those who want loop without the DIY hassle!',
    score: 345,
    num_comments: 123,
    device_mentioned: 'tidepool',
    sentiment: 'positive',
    topic_tags: ['devices', 'tech'],
    is_solution: true,
  },
  {
    source: 'r/OmniPod5',
    post_id: 'curated_omnipod5_tips_1',
    title: 'Omnipod 5 - tips after 1 year',
    content: 'Year one on O5: 1) Let it learn for 2+ weeks before judging, 2) Automodes work best with accurate profiles, 3) Activity mode is your friend for exercise, 4) Pod placement matters for absorption, 5) Replace Dexcom at same time as pod change for sanity, 6) Customer service is solid for replacements.',
    score: 412,
    num_comments: 145,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG7',
    post_id: 'curated_g7_vs_g6_1',
    title: 'Switched from G6 to G7 - what changed',
    content: 'G6 to G7 transition: 1) Smaller and more discreet, 2) 30 min warmup vs 2 hours, 3) Accuracy is similar for me, 4) More compression lows in my experience, 5) Cant restart like G6, 6) Back of arm works best, 7) Adhesive is different - may need overlay still. Overall prefer G7 but G6 wasnt broken!',
    score: 378,
    num_comments: 134,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: REGIONAL HEALTHCARE NAVIGATION
  // ==========================================
  {
    source: 'r/DiabetesUK',
    post_id: 'curated_nhs_pumps_1',
    title: 'Getting a pump on the NHS - the process',
    content: 'NHS pump journey: 1) Ask endo for referral to pump service, 2) NICE criteria - A1C over 8.5 OR hypo unawareness, 3) Attend pump education sessions, 4) Wait time varies by trust, 5) Libre/Dexcom may be easier to get first, 6) Self-funding is option if desperate, 7) Persist and advocate!',
    score: 312,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['regional', 'devices', 'insurance'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesCanada',
    post_id: 'curated_canada_supplies_1',
    title: 'Navigating T1D supplies in Canada',
    content: 'Canadian T1D supply guide: 1) Provincial coverage varies widely, 2) Alberta and Ontario have ADP programs, 3) Private insurance usually covers rest, 4) Costco has cheapest test strips, 5) Mark Cuban pharma ships to Canada, 6) Cross-border shopping for some supplies. Know your provincial programs!',
    score: 289,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['regional', 'insurance'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesAustralia',
    post_id: 'curated_ndss_tips_1',
    title: 'Making the most of NDSS in Australia',
    content: 'NDSS tips for Aussie T1Ds: 1) Register as soon as diagnosed, 2) Subsidized test strips and pen needles, 3) CGM subsidies now available for some, 4) Pump consumables subsidized too, 5) Private health gets you faster specialist access, 6) Diabetes Australia has great resources. Were lucky compared to US!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['regional', 'insurance'],
    is_solution: true,
  },

  // ==========================================
  // NEW: WORKPLACE & CAREER
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_workplace_disclosure_1',
    title: 'Telling your employer about T1D - when and how',
    content: 'Career advice with T1D: 1) Not legally required to disclose usually, 2) But helpful if you want accommodations, 3) Tell HR not just manager for protection, 4) ADA protects against discrimination, 5) Focus on how it wont affect performance, 6) CGM beeping is a non-issue for most offices. Know your rights!',
    score: 423,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['workplace'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_t1',
    post_id: 'curated_travel_for_work_1',
    title: 'Business travel with T1D - lessons learned',
    content: 'Frequent flyer with T1D: 1) TSA Precheck is worth it, 2) Always carry supplies in carry-on, 3) Download your CGM data to phone, 4) Time zone adjustments are trial and error, 5) Client dinners = estimate high on carbs, 6) Expense your supplies if traveling. Make T1D invisible to clients if you prefer.',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['workplace', 'travel'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DATING & RELATIONSHIPS
  // ==========================================
  {
    source: 'r/diabetes',
    post_id: 'curated_dating_t1d_1',
    title: 'Dating with T1D - when to bring it up',
    content: 'Dating advice from T1D who found their person: 1) No need to mention on dating apps, 2) First date mention if it comes up naturally, 3) Definitely before getting intimate, 4) Show them your devices if curious, 5) Red flag if they have issue with it, 6) The right person wont care. Be yourself!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['dating', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/Type1Diabetes',
    post_id: 'curated_intimacy_t1d_1',
    title: 'Intimacy and T1D - practical tips',
    content: 'Real talk about T1D and intimacy: 1) Keep glucose nearby always, 2) Pump can be disconnected temporarily, 3) CGM alarms happen - laugh it off, 4) Activity can cause lows, 5) Communicate with partner about what to do for lows, 6) Its not as complicated as it seems. Normal life is possible!',
    score: 289,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['dating'],
    is_solution: true,
  },

  // ==========================================
  // NEW: SENIOR DIABETICS
  // ==========================================
  {
    source: 'r/SeniorDiabetics',
    post_id: 'curated_aging_t1d_1',
    title: 'Living with T1D into your 60s and beyond',
    content: '40 years with T1D, now 62: 1) Insulin needs change with age, 2) More sensitive to lows, 3) CGM is essential as you age, 4) A1C targets may relax - discuss with endo, 5) Watch for complications but dont obsess, 6) Community support matters, 7) Still living well after 4 decades. Long life is possible!',
    score: 456,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: NEWLY DIAGNOSED ADULTS (LADA)
  // ==========================================
  {
    source: 'r/lada',
    post_id: 'curated_lada_diagnosis_1',
    title: 'Adult onset T1D/LADA - the honeymoon period',
    content: 'Diagnosed at 35 with LADA: 1) Honeymoon can last months to years, 2) Insulin needs increase gradually, 3) Get c-peptide tested to track beta cell function, 4) You may still make some insulin for a while, 5) CGM from day one helps learn patterns, 6) Its still T1D - join T1D communities. Youre not alone!',
    score: 378,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/lada',
    post_id: 'curated_adult_diagnosis_shock_1',
    title: 'Processing adult T1D diagnosis - grief is normal',
    content: 'Diagnosed at 42, here is what helped: 1) Its okay to grieve your old life, 2) Anger and denial are normal stages, 3) Find a diabetes educator ASAP, 4) Online communities helped me feel less alone, 5) It gets manageable with time, 6) You didnt do anything wrong. This isnt your fault.',
    score: 423,
    num_comments: 178,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DEXCOM G6 SPECIFIC
  // ==========================================
  {
    source: 'r/DexcomG6',
    post_id: 'curated_g6_restart_1',
    title: 'G6 sensor restart trick that works every time',
    content: 'After the sensor expires, I wait 15 min, then restart. Remove transmitter, wait 20 min, reinsert. The key is letting it fully reset. Been doing this for 2 years with good accuracy. Note: This is off-label use. Some sensors work better than others for restarts.',
    score: 245,
    num_comments: 67,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG6',
    post_id: 'curated_g6_bleeding_1',
    title: 'Sensor insertion bleeding - when to replace',
    content: 'If you get a bleeder: 1) Small amount is usually OK - may cause brief inaccuracy, 2) Significant bleeding = replace sensor immediately, 3) Call Dexcom for replacement - they are good about it, 4) Try different sites if this happens often, 5) Avoid areas with visible veins. Hydration helps too!',
    score: 178,
    num_comments: 45,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG6',
    post_id: 'curated_g6_transmitter_life_1',
    title: 'Getting the most out of your G6 transmitter',
    content: 'Transmitter tricks I have learned: 1) Each transmitter lasts about 3 months or 110 days, 2) Track your start date, 3) If it dies early, Dexcom replaces it, 4) Keep transmitter dry when not in sensor, 5) The battery gauge is not always accurate near end of life. Plan ahead for replacement!',
    score: 156,
    num_comments: 38,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DEXCOM G7 SPECIFIC
  // ==========================================
  {
    source: 'r/DexcomG7',
    post_id: 'curated_g7_warmup_1',
    title: 'G7 warmup period tips - how to minimize inaccuracy',
    content: 'The first 24 hours of G7 can be wonky. My tips: 1) Apply new sensor night before old one expires if possible, 2) Let it "soak" for a few hours before starting, 3) Calibrate once if readings seem really off, 4) Dont make major insulin decisions in first 12 hours, 5) Accuracy improves dramatically after day 1.',
    score: 312,
    num_comments: 89,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG7',
    post_id: 'curated_g7_vs_g6_1',
    title: 'Switched from G6 to G7 - honest comparison after 3 months',
    content: 'My experience G6 vs G7: G7 Pros: Smaller, no separate transmitter, easier insertion, 30 min warmup. G7 Cons: Can not restart, more compression lows for me, shorter wear time. Accuracy is similar. I prefer G7 overall for convenience but miss restarts. Both are great!',
    score: 445,
    num_comments: 134,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG7',
    post_id: 'curated_g7_arm_placement_1',
    title: 'Best arm placement spots for G7',
    content: 'Tried every spot on my arm for G7: 1) Back of upper arm is most accurate, 2) Avoid the tricep muscle if you lift, 3) Rotate left and right arms, 4) Stay away from areas that press on chairs, 5) I mark my sites with a pen to remember rotation. Consistent placement helps with consistent readings!',
    score: 234,
    num_comments: 67,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/DexcomG7',
    post_id: 'curated_g7_iphone_issues_1',
    title: 'G7 iPhone app connection issues - solutions that work',
    content: 'G7 disconnecting from iPhone? Try: 1) Toggle Bluetooth off/on, 2) Force close and reopen app, 3) Keep phone within 20 feet, 4) Update to latest iOS, 5) Reinstall Dexcom app as last resort, 6) Apple Watch can help bridge connection. Most connection issues are temporary!',
    score: 189,
    num_comments: 56,
    device_mentioned: 'dexcom',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: LIBRE 3 SPECIFIC
  // ==========================================
  {
    source: 'r/Libre3',
    post_id: 'curated_libre3_accuracy_1',
    title: 'Libre 3 accuracy tips from long-time user',
    content: 'Been on Libre 3 for 18 months. Accuracy tips: 1) First 24-48 hours can read low - be patient, 2) Stay hydrated - dehydration affects readings significantly, 3) Compression lows happen less than Libre 2 but still occur, 4) Scanning is not needed - readings update every minute, 5) Abbott replaces sensors that fail early - keep the old one to report.',
    score: 267,
    num_comments: 78,
    device_mentioned: 'libre',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/Libre3',
    post_id: 'curated_libre3_vs_dexcom_1',
    title: 'Libre 3 vs Dexcom - which is right for you',
    content: 'Used both systems extensively. Libre 3: Smaller, cheaper, no transmitter, good accuracy. Dexcom: Better Share/Follow features, integrates with more pumps, slightly better accuracy in my experience. For most people, both work great. Choose based on: insurance, pump integration needs, and feature preferences.',
    score: 389,
    num_comments: 145,
    device_mentioned: 'libre',
    sentiment: 'neutral',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/Libre3',
    post_id: 'curated_libre3_adhesion_1',
    title: 'Keeping Libre 3 stuck for full 14 days',
    content: 'Libre 3 falling off? My protocol: 1) Clean arm with alcohol, let dry completely, 2) Apply SkinTac to the area first, 3) Apply sensor, 4) Add a Simpatch or similar overlay, 5) Pat dry after showers - dont rub, 6) Avoid that arm for sleeping if possible. Full 14 days every time now!',
    score: 234,
    num_comments: 67,
    device_mentioned: 'libre',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: EVERSENSE / IMPLANTABLE CGM
  // ==========================================
  {
    source: 'r/Eversense',
    post_id: 'curated_eversense_experience_1',
    title: 'Eversense E3 - 6 month review of implantable CGM',
    content: '6 months with Eversense implant: Pros - no weekly insertions, very accurate, vibration alerts even without phone. Cons - need doctor visit for insertion/removal, transmitter must be charged daily, can interfere with MRI. Best for: people tired of frequent sensor changes or with skin sensitivity issues.',
    score: 345,
    num_comments: 123,
    device_mentioned: 'eversense',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/Eversense',
    post_id: 'curated_eversense_insertion_1',
    title: 'What to expect from Eversense insertion procedure',
    content: 'Just got my Eversense inserted. The procedure: 1) Local anesthesia - felt nothing, 2) Small incision in upper arm, 3) Sensor placed under skin, 4) Few stitches or surgical glue, 5) Bruising for a week, 6) Start readings in 24 hours. Less painful than expected! Removal is similar process.',
    score: 178,
    num_comments: 56,
    device_mentioned: 'eversense',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: OMNIPOD 5 SPECIFIC
  // ==========================================
  {
    source: 'r/OmniPod5',
    post_id: 'curated_o5_algorithm_1',
    title: 'Omnipod 5 algorithm settings that work for me',
    content: 'After 8 months optimizing O5: 1) Keep target at 110 for best TIR, 2) Accurate carb counting is essential, 3) Pre-bolus still helps even with automation, 4) Activity mode 1-2 hours before exercise, 5) The algorithm learns your patterns over 2-3 weeks. Trust it but also fine-tune your settings!',
    score: 289,
    num_comments: 98,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/OmniPod5',
    post_id: 'curated_o5_pod_failures_1',
    title: 'Reducing Omnipod 5 pod failures - what worked',
    content: 'Was getting too many pod failures. Solutions: 1) Prime pod on flat surface, 2) Do not fill past max line, 3) Wait for clicks during priming, 4) Keep pods at room temperature before use, 5) Avoid areas with lots of movement, 6) Insulet replaces failed pods - document and call. Failure rate dropped significantly!',
    score: 234,
    num_comments: 67,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/OmniPod5',
    post_id: 'curated_o5_dexcom_pairing_1',
    title: 'O5 and Dexcom G6 pairing issues - troubleshooting',
    content: 'O5 losing connection to G6? Try: 1) Keep PDM and phone close to pod, 2) Bluetooth can only pair with so many devices, 3) Restart PDM if needed, 4) When changing sensors, pause algorithm, 5) G6 and O5 need time to sync after sensor restart. Most pairing issues resolve with patience!',
    score: 167,
    num_comments: 45,
    device_mentioned: 'omnipod',
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: TANDEM CONTROL-IQ SPECIFIC
  // ==========================================
  {
    source: 'r/ControlIQ',
    post_id: 'curated_ciq_sleep_mode_1',
    title: 'Control-IQ Sleep Activity vs Exercise Activity - when to use each',
    content: 'After testing extensively: Sleep Activity has tighter control (112.5 target), Exercise has higher target (140-160). I use Sleep for: actual sleep, desk work, movies. I use Exercise for: workouts, stressful events, yard work. Some people leave on Sleep 24/7 for tighter control - experiment to find what works!',
    score: 356,
    num_comments: 112,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/ControlIQ',
    post_id: 'curated_ciq_corrections_1',
    title: 'Why Control-IQ keeps giving small corrections',
    content: 'If C-IQ gives lots of auto-corrections: 1) Your basal might be too low, 2) Carb ratios might need adjustment, 3) The algorithm is working but your settings need tuning, 4) Work with endo to analyze data, 5) Too many corrections = less insulin available for bigger needs. Proper settings = smoother control!',
    score: 234,
    num_comments: 78,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/ControlIQ',
    post_id: 'curated_ciq_site_absorption_1',
    title: 'Tandem site rotation for best absorption',
    content: 'After 4 years on Tandem: 1) Abdomen still works best for absorption, 2) Rotate in a pattern - I use clockface positions, 3) Love handles are good backup sites, 4) Thighs work but absorption can be slower, 5) Arms are tricky with tubing, 6) Avoid scar tissue religiously. Good rotation = consistent BG!',
    score: 189,
    num_comments: 56,
    device_mentioned: 'tandem',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },

  // ==========================================
  // NEW: MEDTRONIC 780G SPECIFIC
  // ==========================================
  {
    source: 'r/MiniMed',
    post_id: 'curated_780g_smartguard_1',
    title: '780G SmartGuard tips for best results',
    content: 'Optimizing 780G SmartGuard: 1) Use lowest target (100) for best TIR, 2) Active insulin time of 2-2.5 hours works for most, 3) Accurate carb entry is crucial, 4) Calibrations still matter - do them when stable, 5) Give it 2 weeks to learn you. The algorithm is aggressive but effective once tuned!',
    score: 278,
    num_comments: 89,
    device_mentioned: 'medtronic',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/MiniMed',
    post_id: 'curated_guardian4_accuracy_1',
    title: 'Guardian 4 sensor accuracy - my tips after 1 year',
    content: 'Guardian 4 with 780G accuracy tips: 1) Arm placement gives me best accuracy, 2) Overtaping helps prevent early failures, 3) Calibrate only when BG is stable and in range, 4) Sensor needs 24 hours to settle, 5) Compression lows still happen - sleep position matters. Overall very happy with accuracy now!',
    score: 198,
    num_comments: 67,
    device_mentioned: 'medtronic',
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },

  // ==========================================
  // NEW: TIDEPOOL LOOP
  // ==========================================
  {
    source: 'r/Tidepool',
    post_id: 'curated_tidepool_loop_1',
    title: 'Tidepool Loop - FDA cleared DIY alternative',
    content: 'Switched to Tidepool Loop from DIY Loop: 1) Its FDA cleared now which is reassuring, 2) Same algorithm as DIY Loop, 3) Works with Omnipod and Dexcom, 4) Support from an actual company, 5) Free to use, 6) Works on iPhone without developer mode. Great option for those who want closed loop without full DIY!',
    score: 312,
    num_comments: 98,
    device_mentioned: 'omnipod',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump', 'diy'],
    is_solution: true,
  },

  // ==========================================
  // NEW: BETA BIONICS ILET
  // ==========================================
  {
    source: 'r/iLet',
    post_id: 'curated_ilet_bionic_1',
    title: 'iLet Bionic Pancreas - real user review',
    content: 'Using iLet for 6 months: Unique features - only needs your weight for dosing, learns everything else. Pros - truly automated, no carb counting required (optional). Cons - only works with Dexcom G6, larger than other pumps. Perfect for: people overwhelmed by settings, those who struggle with carb counting. TIR has been great!',
    score: 289,
    num_comments: 112,
    device_mentioned: 'ilet',
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },

  // ==========================================
  // NEW: OPENAPS / ANDROID APS
  // ==========================================
  {
    source: 'r/OpenAPS',
    post_id: 'curated_openaps_setup_1',
    title: 'OpenAPS vs commercial closed loops - experienced user comparison',
    content: 'Used OpenAPS for 4 years, now on commercial system. OpenAPS: More customizable, oref1 algorithm is powerful, requires tech knowledge. Commercial: Easier setup, warranty support, but less flexible. OpenAPS taught me so much about diabetes management. Both can achieve great results - choose based on comfort with tech!',
    score: 445,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/AndroidAPS',
    post_id: 'curated_aaps_beginners_1',
    title: 'AndroidAPS getting started guide from experienced looper',
    content: 'Starting AndroidAPS? Essential steps: 1) Read the documentation completely, 2) Join the Facebook and Discord communities, 3) Have solid MDI/pump skills first, 4) Complete all objectives in order, 5) Start with low glucose suspend before full loop, 6) Be patient with autosens learning. Worth the effort for those comfortable with tech!',
    score: 378,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/AndroidAPS',
    post_id: 'curated_aaps_profiles_1',
    title: 'AAPS profile optimization tips',
    content: 'Dialing in AAPS profiles: 1) Get basal rates perfect first - this is the foundation, 2) ISF (correction factor) affects how aggressive corrections are, 3) IC ratio affects meal dosing, 4) Use Autotune to suggest changes based on your data, 5) Adjust one thing at a time. Solid profiles = smooth automation!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices'],
    is_solution: true,
  },

  // ==========================================
  // NEW: NIGHTSCOUT
  // ==========================================
  {
    source: 'r/Nightscout',
    post_id: 'curated_nightscout_setup_1',
    title: 'Free Nightscout hosting options in 2024',
    content: 'Nightscout can still be free: 1) Railway.app has free tier, 2) Fly.io works with credit, 3) Render.com has free options, 4) Heroku no longer free but alternatives exist, 5) Self-host on Raspberry Pi for truly free, 6) NS10BE for managed hosting (paid). Follow the docs carefully - community helps troubleshoot!',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/Nightscout',
    post_id: 'curated_nightscout_caregivers_1',
    title: 'Nightscout for parents - remote monitoring setup',
    content: 'Parent of T1D using Nightscout: 1) Can see childs BG from anywhere, 2) Set up multiple followers (parents, grandparents, school), 3) Alarms on your phone when they go high/low, 4) See trends even when apart, 5) Works with most CGMs, 6) Peace of mind is priceless. Essential for parents of young T1Ds!',
    score: 456,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'parenting'],
    is_solution: true,
  },

  // ==========================================
  // NEW: LOOP DIY
  // ==========================================
  {
    source: 'r/LoopKit',
    post_id: 'curated_loop_algorithm_1',
    title: 'Loop algorithm - understanding how it works',
    content: 'How Loop makes decisions: 1) Predicts future BG based on insulin on board and carbs, 2) Adjusts temporary basals every 5 minutes, 3) Uses your settings (ISF, IC, basal) as foundation, 4) Glucose momentum affects predictions, 5) Retrospective correction learns from recent patterns. Understanding the algorithm helps you work with it!',
    score: 345,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/LoopKit',
    post_id: 'curated_loop_override_1',
    title: 'Loop overrides - when and how to use them',
    content: 'Loop overrides are powerful: 1) Exercise override (less insulin) - start 1-2 hours before activity, 2) Eating soon - primes for food, 3) Custom overrides for sick days, hormonal changes, etc., 4) Duration matters - set appropriately, 5) You can stack effects with different targets and insulin adjustments. Game changer for variable days!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['diy', 'devices', 'exercise'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DIABETIC KETO / LOW CARB
  // ==========================================
  {
    source: 'r/diabeticketo',
    post_id: 'curated_keto_t1d_2year_update',
    title: 'Keto with T1D - 2 year update and what I learned',
    content: 'My A1C went from 7.8 to 5.9 on keto. Key lessons: 1) Protein still raises BG - just slower, 2) Watch for ketone confusion vs DKA (nutritional ketones are different), 3) Less insulin needed overall, 4) Electrolytes are crucial, 5) Not for everyone - discuss with endo first. Works amazingly for me but requires commitment!',
    score: 567,
    num_comments: 189,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food', 'lifestyle'],
    is_solution: true,
  },
  {
    source: 'r/diabeticketo',
    post_id: 'curated_low_carb_starting_1',
    title: 'Starting low carb with T1D - practical tips',
    content: 'Transitioning to low carb: 1) Reduce carbs gradually - not all at once, 2) Youll need less insulin quickly - be prepared for lows, 3) Reduce basal by 20-30% initially, 4) Bolus ratios will change, 5) Fat and protein need different dosing, 6) Give it 2-4 weeks to adapt. Work closely with your endo during transition!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food', 'lifestyle'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DIABETIC FITNESS / ATHLETES
  // ==========================================
  {
    source: 'r/diabeticfitness',
    post_id: 'curated_strength_training_1',
    title: 'Strength training with T1D - complete guide',
    content: 'Lifting with T1D for 10 years: 1) BG often rises during heavy lifting (stress hormones), 2) May need small bolus before gym, 3) Post-workout lows can happen 6-12 hours later, 4) Protein timing matters less than total daily intake, 5) Creatine is generally safe, 6) Build muscle = better insulin sensitivity. Consistency is key!',
    score: 389,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise', 'lifestyle'],
    is_solution: true,
  },
  {
    source: 'r/diabeticfitness',
    post_id: 'curated_gym_lows_1',
    title: 'Preventing gym lows - what finally worked',
    content: 'Kept going low during workouts until: 1) I reduced basal 2 hours before (not just at gym), 2) Started workouts at BG 140-160, 3) Kept glucose tabs on me always, 4) Cardio drops me fast - strength less so, 5) Learned my personal patterns over time. Now I work out confidently without fear of lows!',
    score: 278,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise', 'glucose_lows'],
    is_solution: true,
  },
  {
    source: 'r/diabeticathletes',
    post_id: 'curated_marathon_t1d_1',
    title: 'Marathon running with T1D - race day protocol',
    content: 'Completed 5 marathons with T1D: 1) Reduce basal 50% starting night before, 2) Eat normal breakfast, bolus 50%, 3) Carry gels and glucose tabs, 4) Check BG every 5K, 5) Fuel every 30-45 min even if BG okay, 6) Post-race lows can happen for 24+ hours - stay vigilant. You CAN do endurance events with T1D!',
    score: 456,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise'],
    is_solution: true,
  },
  {
    source: 'r/diabeticathletes',
    post_id: 'curated_swimming_t1d_1',
    title: 'Swimming with T1D - managing devices and BG',
    content: 'Competitive swimmer with T1D: 1) Dexcom is waterproof and works in pool, 2) I disconnect pump and set temp basal before, 3) Swimming drops BG fast - start higher, 4) Waterproof case for phone to see CGM, 5) Keep juice poolside, 6) Practice retrieval skills. Swimming is great exercise - dont let T1D stop you!',
    score: 234,
    num_comments: 78,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['exercise', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/diabetesrunners',
    post_id: 'curated_running_fueling_1',
    title: 'Fueling strategy for long runs with T1D',
    content: 'Long run fueling that works: 1) For runs under 1 hour - usually no extra fuel needed, 2) Over 1 hour - 15-30g carbs per hour, 3) Practice fueling in training not race day, 4) Gels are convenient but some prefer real food, 5) Have backup fuel always, 6) Post-run refuel is important for recovery. Find what works for YOUR body!',
    score: 189,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['exercise', 'food'],
    is_solution: true,
  },

  // ==========================================
  // NEW: PARENTING T1D KIDS
  // ==========================================
  {
    source: 'r/diabetes_parents',
    post_id: 'curated_school_504_1',
    title: '504 plan template that covers everything - free to use',
    content: 'After fighting with 3 schools, I created a comprehensive 504 plan: 1) Nurse access anytime, 2) Snack permissions, 3) Bathroom access, 4) CGM viewing rights for staff, 5) Field trip accommodations, 6) Testing accommodations (extra time if low), 7) Emergency protocols. Document everything - schools must comply!',
    score: 723,
    num_comments: 234,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting', 'school'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_parents',
    post_id: 'curated_night_checks_1',
    title: 'Night checks without waking yourself or your kid fully',
    content: 'Nighttime BG checks got easier: 1) CGM with Follow app is the biggest help, 2) Red light flashlight doesnt wake anyone fully, 3) Keep supplies bedside, 4) Set specific alarm times rather than checking constantly, 5) Trust the CGM alarms, 6) Sleep training yourself takes time. It does get easier as they get older!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting', 'nighttime'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_parents',
    post_id: 'curated_toddler_t1d_1',
    title: 'Managing T1D in toddlers - survival tips',
    content: 'Parent of T1D toddler - what helps: 1) Toddlers need tiny insulin amounts - diluted insulin helps, 2) They eat unpredictably - bolus after meals, 3) Activity levels vary wildly, 4) CGM is essential at this age, 5) Have a support network, 6) Take breaks for your mental health. This is hard but you are doing great!',
    score: 456,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting'],
    is_solution: true,
  },
  {
    source: 'r/t1d_parents',
    post_id: 'curated_teenage_t1d_1',
    title: 'Helping teenagers take ownership of their T1D',
    content: 'Transitioning diabetes management to my teen: 1) Start transferring tasks gradually, 2) Let them make some mistakes (safely), 3) CGM sharing helps you monitor without hovering, 4) Peer support from other T1D teens is powerful, 5) Regular endo visits without parent in room, 6) Trust but verify. Independence is a process!',
    score: 389,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting'],
    is_solution: true,
  },
  {
    source: 'r/t1d_parents',
    post_id: 'curated_birthday_parties_1',
    title: 'Managing birthday parties and T1D kids',
    content: 'Birthday party strategy: 1) Ask host about food in advance, 2) Bring a safe treat if needed, 3) Pre-bolus when they start eating cake, 4) Let them participate - dont make them different, 5) Check BG before and during, 6) Accept that highs happen at parties - correct and move on. Kids deserve to be kids!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['parenting', 'food'],
    is_solution: true,
  },

  // ==========================================
  // NEW: COLLEGE / YOUNG ADULTS
  // ==========================================
  {
    source: 'r/CollegeDiabetics',
    post_id: 'curated_college_transition_1',
    title: 'Transitioning T1D care to college - complete guide',
    content: 'Starting college with T1D: 1) Find an endo near campus before you arrive, 2) Register with disability services for accommodations, 3) Stock your dorm with supplies and backup insulin, 4) Get a mini fridge for insulin, 5) Tell your RA and roommate basics, 6) Campus health center should know your situation. Planning makes it smooth!',
    score: 378,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['lifestyle', 'emotional'],
    is_solution: true,
  },
  {
    source: 'r/CollegeDiabetics',
    post_id: 'curated_college_drinking_1',
    title: 'Alcohol in college with T1D - staying safe',
    content: 'Real talk about college drinking: 1) Alcohol blocks liver glucose - severe low risk, 2) Never drink alone, 3) Eat before and during, 4) Set CGM alerts louder, 5) Tell friends what a low looks like, 6) Have glucagon available and someone trained, 7) Reduce overnight basal if drinking. Be smart about it or skip it entirely.',
    score: 289,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['lifestyle', 'food'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesTeens',
    post_id: 'curated_teen_burnout_1',
    title: 'Teen diabetes burnout is real - my experience',
    content: 'Hit burnout at 16 after 10 years T1D: What helped: 1) Therapy with someone who gets chronic illness, 2) Taking a break from perfection, 3) Letting CGM do more of the work, 4) Connecting with other T1D teens online, 5) Parent backing off (with CGM sharing as safety net). Burnout is valid - and recovery is possible.',
    score: 312,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'parenting'],
    is_solution: true,
  },

  // ==========================================
  // NEW: MENTAL HEALTH / BURNOUT
  // ==========================================
  {
    source: 'r/DiabetesBurnout',
    post_id: 'curated_burnout_recovery_1',
    title: 'How I recovered from severe diabetes burnout',
    content: 'Stopped checking my CGM for 6 months, A1C hit 12. Recovery: 1) Therapy specifically for chronic illness, 2) One small goal at a time (just check BG once/day at first), 3) Automate what you can, 4) Permission to be imperfect, 5) Community support from people who get it, 6) Gradual improvement not overnight fix. Recovery is possible!',
    score: 445,
    num_comments: 178,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'mental_health'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesBurnout',
    post_id: 'curated_burnout_signs_1',
    title: 'Signs of diabetes burnout - recognize it early',
    content: 'Burnout warning signs I missed: 1) Checking BG less often, 2) Not logging/tracking, 3) Dreading endo appointments, 4) Rage at devices/alarms, 5) Just dont care feeling, 6) Running high on purpose. If this is you - its not a character flaw, its exhaustion. Reach out for help before it gets worse.',
    score: 356,
    num_comments: 134,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['emotional', 'mental_health'],
    is_solution: true,
  },
  {
    source: 'r/Type1Support',
    post_id: 'curated_therapy_t1d_1',
    title: 'Finding a therapist who understands chronic illness',
    content: 'Tips for finding diabetes-aware therapy: 1) Search for chronic illness specialists, 2) Ask if they have T1D patients, 3) Explain the 24/7 nature of management, 4) Online therapy expands your options, 5) Support groups can supplement, 6) Your endo might have recommendations. Mental health is part of diabetes care!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'mental_health'],
    is_solution: true,
  },
  {
    source: 'r/diabetes_support',
    post_id: 'curated_anxiety_management_1',
    title: 'Managing health anxiety with T1D',
    content: 'T1D made my anxiety worse. What helps: 1) Data over feelings - CGM shows reality, 2) Understanding what I can control vs. can not, 3) Therapy for health anxiety specifically, 4) Meditation apps (Headspace has chronic illness content), 5) Limiting Dr. Google searches, 6) Remembering that perfect is enemy of good. Progress over perfection!',
    score: 189,
    num_comments: 67,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional', 'mental_health'],
    is_solution: true,
  },

  // ==========================================
  // NEW: REGIONAL COMMUNITIES
  // ==========================================
  {
    source: 'r/DiabetesUK',
    post_id: 'curated_nhs_libre_1',
    title: 'Getting Libre/Dexcom on NHS - step by step guide',
    content: 'It took me 3 months but I got Dexcom funded. Key steps: 1) Document hypo unawareness episodes, 2) Get endo support letter, 3) Know the NICE guidelines (NG17), 4) Appeal if initially refused, 5) PALS can help if stuck, 6) Ask for a trial period first. Persistence pays off with NHS!',
    score: 389,
    num_comments: 145,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['regional', 'insurance', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesUK',
    post_id: 'curated_uk_pump_access_1',
    title: 'Getting an insulin pump on NHS - the process',
    content: 'NHS pump journey: 1) Meet NICE criteria (hypos, high A1C despite effort, etc.), 2) Referral to pump-experienced clinic, 3) Complete structured education (DAFNE etc.), 4) Demonstrate carb counting ability, 5) Pump training sessions, 6) Ongoing follow-up required. The process is slow but pumps ARE available on NHS!',
    score: 312,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['regional', 'devices'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesCanada',
    post_id: 'curated_canada_coverage_1',
    title: 'Provincial diabetes coverage - what each province offers',
    content: 'Canadian coverage varies by province: 1) Ontario - ADP covers pumps for under 18s (OHIP+ for meds), 2) BC - Fair Pharmacare for meds, 3) Alberta - insulin pump program, 4) Coverage changes - check your provincial health site, 5) Private insurance fills gaps. Know your provincial benefits!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['regional', 'insurance'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesAustralia',
    post_id: 'curated_australia_ndss_1',
    title: 'NDSS registration and benefits explained',
    content: 'National Diabetes Services Scheme benefits: 1) Register through your endo or GP, 2) Subsidized strips, needles, syringes, 3) CGM subsidies now available, 4) Pump consumables subsidized, 5) Free education programs, 6) Access to diabetes educators. NDSS makes T1D more affordable in Australia!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['regional', 'insurance'],
    is_solution: true,
  },

  // ==========================================
  // NEW: PREGNANCY WITH T1D
  // ==========================================
  {
    source: 'r/T1Dpregnancy',
    post_id: 'curated_t1d_pregnancy_prep_1',
    title: 'Preparing for pregnancy with T1D - comprehensive guide',
    content: 'Successful T1D pregnancy (37 weeks now!): Pre-pregnancy: 1) Get A1C under 6.5 ideally, 2) Take folic acid, 3) Review all medications, 4) Establish high-risk OB care. During: Insulin needs 2-3x higher by end, BG targets are tighter, CGM essential, lots of appointments. It is hard but worth it!',
    score: 512,
    num_comments: 189,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['pregnancy', 'lifestyle'],
    is_solution: true,
  },
  {
    source: 'r/T1Dpregnancy',
    post_id: 'curated_t1d_pregnancy_insulin_1',
    title: 'Insulin changes during T1D pregnancy - what to expect',
    content: 'How insulin needs changed for me: First trimester - actually went DOWN (more lows), Second trimester - started increasing, Third trimester - needed 2.5x my normal dose, Post-partum - crashed back to pre-pregnancy or even less. Each trimester is different. Work closely with your endo - frequent adjustments needed!',
    score: 378,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['pregnancy'],
    is_solution: true,
  },

  // ==========================================
  // NEW: TRAVEL SPECIFIC
  // ==========================================
  {
    source: 'r/DiabetesTravel',
    post_id: 'curated_international_travel_1',
    title: 'International travel with T1D - lessons from 20 countries',
    content: 'Traveled to 20 countries with T1D: 1) Research insulin availability at destination, 2) Carry prescription copies translated if needed, 3) Travel insurance that covers pre-existing conditions, 4) Glucose tablets work globally, 5) Learn "I have diabetes" in local language, 6) Find local T1D groups for destination tips. The world is accessible!',
    score: 456,
    num_comments: 167,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesTravel',
    post_id: 'curated_cruise_t1d_1',
    title: 'Cruising with T1D - what to know',
    content: 'Cruise tips for T1D: 1) Notify medical team on board about your diabetes, 2) Bring WAY more supplies than you think (no pharmacies at sea), 3) Buffets = carb counting challenge - practice eyeballing, 4) Keep insulin in cabin fridge, 5) Time zones change slowly - easier than flying, 6) Excursions - bring hypo supplies. Cruising with T1D is doable!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['travel'],
    is_solution: true,
  },

  // ==========================================
  // NEW: INSULIN RESISTANCE / DOUBLE DIABETES
  // ==========================================
  {
    source: 'r/InsulinResistance',
    post_id: 'curated_t1d_insulin_resistance_1',
    title: 'T1D with insulin resistance - double diabetes strategies',
    content: 'T1D for 20 years, developed insulin resistance: 1) High doses needed - over 100 units/day, 2) Metformin added alongside insulin, 3) Exercise significantly improves sensitivity, 4) Low carb helps reduce total daily dose, 5) Weight loss if possible helps, 6) Concentrated insulin (U-200, U-500) might be needed. You can manage both!',
    score: 289,
    num_comments: 98,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['lifestyle'],
    is_solution: true,
  },

  // ==========================================
  // NEW: INSULIN PUMPS GENERAL
  // ==========================================
  {
    source: 'r/InsulinPumps',
    post_id: 'curated_pump_vs_mdi_1',
    title: 'Pump vs MDI - honest comparison after using both',
    content: 'Used MDI for 10 years, pump for 5: Pump pros - precise dosing, easier adjustments, no shots. Pump cons - always attached, site changes, cost. MDI pros - freedom from device, simpler, cheaper. MDI cons - less flexibility, more shots. Both can achieve great control. Choose based on YOUR lifestyle preferences!',
    score: 423,
    num_comments: 156,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },
  {
    source: 'r/InsulinPumps',
    post_id: 'curated_pump_vacation_1',
    title: 'Taking a pump vacation - how to do it safely',
    content: 'Sometimes you need a pump break: 1) Plan with your endo for MDI doses, 2) Calculate basal as long-acting (Lantus/Tresiba), 3) Use bolus ratios for meal insulin, 4) Check BG more frequently during transition, 5) A few days to weeks is fine, 6) CGM helps during transition. Pump vacations are valid self-care!',
    score: 234,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'pump'],
    is_solution: true,
  },

  // ==========================================
  // NEW: CGM GENERAL
  // ==========================================
  {
    source: 'r/cgm',
    post_id: 'curated_first_cgm_1',
    title: 'First time CGM user - what I wish I knew',
    content: 'Started CGM 6 months ago - advice for newbies: 1) The arrows matter more than the number, 2) You will see spikes you never knew about - it is overwhelming at first, 3) Compression lows are false lows from pressure, 4) Calibration is often unnecessary with modern CGMs, 5) Give it 2 weeks before judging. CGM is life-changing once you adapt!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm'],
    is_solution: true,
  },
  {
    source: 'r/cgm',
    post_id: 'curated_cgm_data_overload_1',
    title: 'CGM data overload - how to not obsess over the numbers',
    content: 'CGM anxiety is real: 1) Set reasonable alert thresholds (not too tight), 2) Focus on Time in Range not every spike, 3) Use the data trends not individual points, 4) Take screen breaks, 5) Remember: 70% TIR is the goal, not perfection, 6) CGM is a tool, not a report card. Your mental health matters too!',
    score: 289,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['devices', 'cgm', 'emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: DIABETES TECHNOLOGY GENERAL
  // ==========================================
  {
    source: 'r/DiabetesTech',
    post_id: 'curated_tech_integration_1',
    title: 'Integrating all your diabetes tech - my setup',
    content: 'My integrated T1D tech stack: 1) Dexcom G6 + Tandem Control-IQ pump = closed loop, 2) Sugarmate for Apple Watch complications, 3) Tidepool for data upload to endo, 4) Nightscout for family sharing, 5) Apple Health connects everything. The ecosystem when it all works together is amazing!',
    score: 312,
    num_comments: 98,
    device_mentioned: 'dexcom',
    sentiment: 'positive',
    topic_tags: ['devices', 'diy'],
    is_solution: true,
  },

  // ==========================================
  // NEW: NEWLY DIAGNOSED
  // ==========================================
  {
    source: 'r/NewlyDiagnosedT1D',
    post_id: 'curated_new_diagnosis_overwhelm_1',
    title: 'Just diagnosed - feeling overwhelmed and scared',
    content: 'Diagnosed 6 months ago, I remember the fear: 1) It DOES get easier, 2) You will mess up and that is okay, 3) Start with the basics - the rest comes with time, 4) Find your community online, 5) Ask your endo ALL your questions, 6) Modern T1D management is amazing compared to even 10 years ago. You will get through this!',
    score: 567,
    num_comments: 189,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['emotional'],
    is_solution: true,
  },
  {
    source: 'r/NewlyDiagnosedT1D',
    post_id: 'curated_honeymoon_phase_1',
    title: 'Honeymoon phase explained - why your numbers might seem easy now',
    content: 'In the honeymoon phase your pancreas still makes some insulin. This means: 1) Lower insulin needs initially, 2) Numbers might seem easy to control, 3) It ends eventually (months to ~2 years), 4) When it ends, you need more insulin - not failure, 5) Use this time to learn and practice. Honeymoon ending is normal progression!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['emotional'],
    is_solution: true,
  },

  // ==========================================
  // NEW: WORK/PROFESSIONAL
  // ==========================================
  {
    source: 'r/DiabetesAtWork',
    post_id: 'curated_disclosure_work_1',
    title: 'To disclose T1D at work or not - considerations',
    content: 'My thoughts on work disclosure: 1) You are NOT required to disclose, 2) I tell direct team for emergency awareness, 3) CGM on arm might out you anyway, 4) Request accommodations through HR if needed, 5) Know your legal protections (ADA in US), 6) Medical info stays confidential if disclosed to HR. Personal choice with no wrong answer!',
    score: 289,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'neutral',
    topic_tags: ['workplace'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesAtWork',
    post_id: 'curated_meetings_lows_1',
    title: 'Managing lows during important meetings',
    content: 'Professional situations and lows: 1) Keep glucose at desk always, 2) CGM on phone visible helps me preempt, 3) I treat at 85 before meetings, 4) Explain briefly if needed ("medical thing, one moment"), 5) Step out if symptoms are bad, 6) Most people are understanding. Your health comes first!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['workplace', 'glucose_lows'],
    is_solution: true,
  },

  // ==========================================
  // NEW: SPECIAL DIETS
  // ==========================================
  {
    source: 'r/diabeticrecipes',
    post_id: 'curated_low_glycemic_meals_1',
    title: 'Low glycemic meals that actually taste good',
    content: 'Favorite low-spike meals: 1) Cauliflower rice stir fry - tastes like fried rice, 2) Zucchini noodles with meat sauce, 3) Greek salad with grilled chicken, 4) Egg muffins for grab-and-go breakfast, 5) Fathead pizza dough, 6) Chia pudding for dessert. Eating well with T1D is possible and delicious!',
    score: 378,
    num_comments: 145,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },
  {
    source: 'r/diabeticrecipes',
    post_id: 'curated_meal_prep_t1d_1',
    title: 'Meal prep for better BG control',
    content: 'Meal prep changed my control: 1) Know exact carbs in each meal, 2) Consistent portions = consistent dosing, 3) Sunday prep saves weeknight decisions, 4) Freeze portions for busy days, 5) Same breakfast each day simplifies mornings, 6) Track what works and repeat. Predictability helps!',
    score: 267,
    num_comments: 89,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['food'],
    is_solution: true,
  },

  // ==========================================
  // NEW: PETS AND T1D
  // ==========================================
  {
    source: 'r/diabeticalert',
    post_id: 'curated_diabetic_alert_dog_1',
    title: 'Diabetic Alert Dogs - realistic expectations',
    content: 'Have a DAD for 4 years: 1) They CAN detect lows/highs before you feel them, 2) Training is expensive ($15k+) or 1-2 years self-training, 3) Not 100% reliable - CGM is still primary, 4) Great for hypo unawareness, 5) Good for peace of mind, 6) They are still dogs - need care and attention. Amazing companions but not magic!',
    score: 312,
    num_comments: 112,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['lifestyle'],
    is_solution: true,
  },

  // ==========================================
  // NEW: COMPLICATIONS PREVENTION
  // ==========================================
  {
    source: 'r/diabeticretinopathy',
    post_id: 'curated_eye_exams_1',
    title: 'Annual eye exams - what to expect and why they matter',
    content: 'T1D for 25 years, eyes still healthy: 1) Annual dilated exam is essential, 2) Catch problems early when treatable, 3) Good BG control is best prevention, 4) Blood pressure control matters too, 5) Report any vision changes immediately, 6) Modern treatments are effective if caught early. Prevention works!',
    score: 345,
    num_comments: 123,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['lifestyle'],
    is_solution: true,
  },
  {
    source: 'r/DiabetesComplications',
    post_id: 'curated_foot_care_1',
    title: 'Foot care routine to prevent neuropathy issues',
    content: 'Protecting my feet after 30 years T1D: 1) Check feet daily for cuts/sores, 2) Never go barefoot, 3) Moisturize but not between toes, 4) Trim nails carefully or get podiatry, 5) Wear proper fitting shoes, 6) Report any numbness or tingling to endo. Prevention is easier than treatment!',
    score: 234,
    num_comments: 78,
    device_mentioned: null,
    sentiment: 'positive',
    topic_tags: ['lifestyle'],
    is_solution: true,
  },

  // Final closing bracket for the array
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting seed of curated community posts...');

    // Helper: generate Reddit search URL from title
    function generateRedditSearchUrl(title: string): string {
      const titleWords = (title || '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 6)
        .join('+');
      return `https://www.reddit.com/search/?q=${titleWords}&type=link&sort=relevance&t=all`;
    }

    // Helper: compute SHA-256 hash for deduplication
    async function computeHash(text: string): Promise<string> {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Helper: compute confidence score
    function computeConfidence(post: { title?: string; content?: string; topic_tags?: string[]; source?: string }): number {
      return (
        ((post.title?.length || 0) > 10 ? 0.3 : 0) +
        ((post.content?.length || 0) > 50 ? 0.3 : 0) +
        ((post.topic_tags?.length || 0) > 0 ? 0.2 : 0) +
        (post.source ? 0.2 : 0)
      );
    }

    // Deduplicate posts by post_id (keep first occurrence)
    const seenIds = new Set<string>();
    const uniquePosts = curatedPosts.filter(post => {
      if (seenIds.has(post.post_id)) {
        console.log(`Skipping duplicate post_id: ${post.post_id}`);
        return false;
      }
      seenIds.add(post.post_id);
      return true;
    });
    
    console.log(`Found ${curatedPosts.length} total posts, ${uniquePosts.length} unique posts`);

    // Validate and prepare posts, quarantining invalid ones
    const postsToInsert = [];
    const quarantined = [];

    for (const post of uniquePosts) {
      const errors: string[] = [];
      if (!post.title || post.title.length < 3) errors.push('title too short');
      if (!post.content || post.content.length < 10) errors.push('content too short');

      if (errors.length > 0) {
        quarantined.push({
          raw_payload: post,
          validation_errors: errors,
        });
        continue;
      }

      const url = generateRedditSearchUrl(post.title);
      const hashInput = (post.title || '') + (post.content || '');
      const raw_payload_hash = await computeHash(hashInput);
      const confidence_score = computeConfidence(post);

      postsToInsert.push({
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
        published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        fetched_at: new Date().toISOString(),
        url: url,
        raw_payload_hash,
        confidence_score,
        quarantined: false,
      });
    }

    // Insert quarantined posts
    if (quarantined.length > 0) {
      await supabase.from('post_quarantine').insert(quarantined);
      console.log(`Quarantined ${quarantined.length} invalid posts`);
    }

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

    // Fix any remaining Google search URLs or example URLs
    const { data: brokenUrls } = await supabase
      .from('community_posts')
      .select('id, title, url')
      .or('url.ilike.%google.com%,url.ilike.%/comments/example%');

    let fixedCount = 0;
    if (brokenUrls && brokenUrls.length > 0) {
      for (const row of brokenUrls) {
        const newUrl = generateRedditSearchUrl(row.title);
        await supabase.from('community_posts').update({ url: newUrl }).eq('id', row.id);
        fixedCount++;
      }
      console.log(`Fixed ${fixedCount} broken URLs`);
    }

    // Sync num_comments with actual comment counts (using post_id text match)
    const { data: allPosts } = await supabase
      .from('community_posts')
      .select('id, num_comments')
      .eq('post_type', 'post');

    let syncedCount = 0;
    if (allPosts) {
      for (const p of allPosts) {
        const { count } = await supabase
          .from('community_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', p.id);
        const actualCount = count ?? 0;
        if (actualCount > 0 && actualCount !== p.num_comments) {
          await supabase.from('community_posts').update({ num_comments: actualCount }).eq('id', p.id);
          syncedCount++;
        }
      }
      console.log(`Synced comment counts for ${syncedCount} posts`);
    }

    // Backfill provenance data for posts missing raw_payload_hash or confidence_score
    const { data: missingProvenance } = await supabase
      .from('community_posts')
      .select('id, title, content, topic_tags, source')
      .is('raw_payload_hash', null);

    let backfilledCount = 0;
    if (missingProvenance && missingProvenance.length > 0) {
      for (const post of missingProvenance) {
        const hashInput = (post.title || '') + (post.content || '');
        const hash = await computeHash(hashInput);
        const confidence = computeConfidence(post);

        await supabase.from('community_posts').update({
          raw_payload_hash: hash,
          confidence_score: confidence,
        }).eq('id', post.id);

        // Log to backfill_audit
        await supabase.from('backfill_audit').insert([
          {
            post_id: post.id,
            field_name: 'raw_payload_hash',
            old_value: null,
            new_value: hash,
            performed_by: 'seed-community-posts',
            reason: 'Backfill missing provenance data',
          },
          {
            post_id: post.id,
            field_name: 'confidence_score',
            old_value: null,
            new_value: String(confidence),
            performed_by: 'seed-community-posts',
            reason: 'Backfill missing provenance data',
          },
        ]);

        backfilledCount++;
      }
      console.log(`Backfilled provenance for ${backfilledCount} posts`);
    }

    console.log(`Successfully seeded ${postsToInsert.length} curated community posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${postsToInsert.length} curated T1D community solutions`,
        count: postsToInsert.length,
        quarantined: quarantined.length,
        urlsFixed: fixedCount,
        commentsSynced: syncedCount,
        provenanceBackfilled: backfilledCount,
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
