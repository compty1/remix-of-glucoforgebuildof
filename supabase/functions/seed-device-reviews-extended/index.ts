import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all devices
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name, manufacturer');

    if (devicesError) throw devicesError;

    const reviewsToInsert: any[] = [];
    
    // Reviews per device - realistic community feedback (20-25 per device)
    const deviceReviews: Record<string, any[]> = {
      'Dexcom G7': [
        { title: 'Finally switched from G6 - impressed!', content: 'The warmup time is so much better. 30 minutes vs 2 hours. Accuracy has been spot on for me. The only downside is the sensor is a bit bigger than I expected.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Compression lows are real', content: 'Love the G7 but I still get compression lows when I sleep on it. Anyone else dealing with this? Tried arm and stomach but same issue.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'App keeps disconnecting', content: 'Anyone else having Bluetooth issues? My G7 loses connection multiple times a day. iPhone 14 Pro. Super frustrating during important meetings.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Best CGM I\'ve used', content: '20+ year T1D here. This is hands down the most accurate and user-friendly CGM I\'ve used. The one-piece design is genius.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Adhesive issues in summer', content: 'Great sensor but the adhesive does NOT hold up in humidity. I go through so many patches and overlays. Anyone have tips?', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Integration with Tandem is seamless', content: 'Using G7 with my t:slim X2 and Control-IQ. The integration is perfect. No calibrations, no separate transmitter to track.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Alarm fatigue is real', content: 'I love the data but the constant alarms are driving me crazy. Yes I know I can adjust them but the urgent low is SO LOUD.', rating: 4, sentiment: 'neutral', subreddit: 'dexcom' },
        { title: 'Insurance finally covered it', content: 'After 3 months of fighting with insurance, finally got my G7 covered. Worth every minute of paperwork. Game changer for my control.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Sensor fell off day 3', content: 'Second sensor that\'s fallen off early. I do CrossFit but still... at this price point the adhesive should be better.', rating: 2, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Accuracy during exercise', content: 'I track my glucose during marathons and the G7 stays accurate even when my heart rate is 160+. Huge improvement over the G6 for sports.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Easy setup for my teenager', content: 'My 14yo can do his own sensor changes now. The app walks through everything. He actually takes ownership of his diabetes care now.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Wish it had better Apple Watch support', content: 'The widget is nice but I want a full complication like the Libre has. Having to open the app each time defeats the purpose.', rating: 4, sentiment: 'neutral', subreddit: 'dexcom' },
        { title: '10 day wear time not always accurate', content: 'My sensors tend to get wonky around day 8. Readings start drifting. Anyone else experience this? Dexcom says it should last 10 full days.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Sleep quality improved dramatically', content: 'Before CGM I was waking up 3x per night to finger stick. Now I sleep through and trust my alarms. Quality of life is so much better.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Customer service is excellent', content: 'Had a sensor fail on day 1. Called support and they shipped a replacement same day. That\'s the kind of service that earns loyalty.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Transition from Libre was smooth', content: 'Came from Libre 2 and the G7 is definitely more accurate. Higher cost but worth it for closed loop. No regrets switching.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Wearing under formal wear is tricky', content: 'The sensor bump is visible under dress shirts. I wish it was thinner. Had to switch to my leg for weddings and events.', rating: 4, sentiment: 'neutral', subreddit: 'dexcom' },
        { title: 'Night time accuracy is outstanding', content: 'What impressed me most is how accurate it stays overnight. Waking readings match my meter within 5 points consistently.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Android app needs work', content: 'The iOS app is great but the Android version crashes frequently. Pixel 7. Hope they fix this soon - data gaps are annoying.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Made me feel normal again', content: '15 years of T1D and this is the closest I\'ve felt to not having diabetes. Can\'t recommend CGM enough to newly diagnosed folks.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Pool swimming test - it works!', content: 'Tested in pool for 2 hours, readings stayed consistent. The waterproof rating is legit. Just make sure to dry the sensor after.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'First sensor, first day issues', content: 'My very first G7 sensor gave me the dreaded "sensor error" after 4 hours. Replacement worked fine but scary first impression.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'A1C dropped from 7.8 to 6.5', content: '6 months on G7 and my A1C went from 7.8 to 6.5. Being able to see trends in real time completely changed how I dose insulin.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Share feature saved my daughter', content: 'The share feature alerted me when my daughter went low at a sleepover. She was 42 and didn\'t feel it. This device is worth every penny.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Arm placement is the sweet spot', content: 'Tried stomach, love handles, and arm. Back of the arm is definitely the most accurate and comfortable spot for me.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
      ],
      'Dexcom G6': [
        { title: 'Still a solid choice in 2024', content: 'Yes G7 is newer but G6 with a transmitter lasting 90 days and sensors you can restart is actually better value for some of us.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: '2 hour warmup is annoying', content: 'The 2 hour warmup when G7 does it in 30 minutes feels like ancient technology. But accuracy once running is still excellent.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Sensor restarts save money', content: 'Using xDrip+ to restart sensors. Getting 20-25 days per sensor. Accuracy stays good. Massive cost savings.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Loop integration is flawless', content: 'Running DIY Loop with G6 and Omnipod. The CGM integration is rock solid. Couldn\'t do closed loop without it.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Transmitter died early', content: 'My transmitter only lasted 75 days instead of 90. Support said it varies. Frustrating when planning sensor orders.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Control-IQ compatibility is key', content: 'Using G6 with Tandem Control-IQ. The closed loop automation is incredible. My time in range went from 60% to 85%.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Sensor errors are too frequent', content: 'I get "sensor error wait up to 3 hours" messages at least once per sensor. Usually happens during the first 24 hours.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Smaller than I expected', content: 'First time CGM user. The sensor is way smaller than I imagined. Can barely see it under clothing. Very discreet.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'One calibration and done', content: 'The factory calibration is great. I only calibrate if readings seem off, which is rare. Maybe once per sensor.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Insurance prefers G6 over G7', content: 'My insurance only covers G6. Honestly not mad about it - works great and I save money with sensor restarts.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Adhesive holds up well', content: 'Unlike some reviews, my adhesive lasts the full 10 days. Maybe it\'s my skin type. No overlays needed.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Night time readings are accurate', content: 'I test with finger sticks at 3am sometimes. G6 is always within 10 points. Perfect for overnight peace of mind.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'App sync issues on Android', content: 'Using Samsung S22. The app loses connection randomly and sometimes won\'t reconnect without a phone restart.', rating: 3, sentiment: 'negative', subreddit: 'dexcom' },
        { title: 'Perfect for toddlers', content: 'My 4 year old wears G6. The follow app lets us monitor from anywhere. Peace of mind at daycare is priceless.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Transitioning to G7 soon', content: 'Used G6 for 2 years, it\'s been great but excited for the G7 upgrade. Shorter warmup and one-piece design sound nice.', rating: 4, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Pregnancy management was easier', content: 'Tight control during pregnancy was achievable because of real-time glucose data. Healthy baby thanks to this tech.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Clarity app is powerful', content: 'The patterns and reports in Clarity help me spot trends I\'d never catch otherwise. My endo loves the data.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Swimming durability test passed', content: 'Ocean swimming, pool laps, hot tubs - G6 handles it all. The waterproof rating is real.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Placement on thigh works great', content: 'I use my upper thigh for G6. Very comfortable, accurate, and completely hidden under shorts.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'Urgent low alarms are loud', content: 'The urgent low alarm can\'t be silenced which is good for safety but bad for movie theaters and meetings.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Medicare covers it fully', content: 'As a Medicare patient, G6 is 100% covered. The process was smooth and I get sensors auto-shipped monthly.', rating: 5, sentiment: 'positive', subreddit: 'dexcom' },
        { title: 'First day readings run high', content: 'My G6 always reads 20-30 points high on day 1 then settles down. I calibrate once and it\'s accurate after that.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
      ],
      'Freestyle Libre 3': [
        { title: 'Smallest CGM I\'ve used', content: 'Coming from Libre 2 the size difference is incredible. Almost forget I\'m wearing it. The continuous readings are a game changer.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'No scanning needed - finally!', content: 'The real-time readings without scanning is what I\'ve been waiting for. Libre 2 was annoying to scan every time.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: 'Compression lows are worse than Libre 2', content: 'For some reason the L3 gives me more compression lows than L2 did. Maybe because it\'s smaller? Annoying when sleeping on my side.', rating: 3, sentiment: 'negative', subreddit: 'Freestylelibre' },
        { title: 'Accuracy issues first 24 hours', content: 'Like the previous versions, L3 needs about a day to stabilize. Day 1 readings are always high compared to my meter.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Insurance covered 100%', content: 'My insurance fully covers the Libre 3 but not Dexcom. Happy with the value - it does everything I need.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: 'App drains my battery', content: 'The LibreLink app is a battery hog. My phone goes from 100% to 50% by noon. Anyone else experiencing this? iPhone 13.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Great for budget-conscious T1Ds', content: 'Can\'t afford Dexcom out of pocket. Libre 3 at my pharmacy is $75/month without insurance. Accurate enough for my needs.', rating: 4, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: '14 days is plenty of wear time', content: 'The 14-day wear time is perfect. I change sensors on the same day every 2 weeks. Easy to track.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Apple Watch complication is basic', content: 'The watch app shows numbers but no trend arrow. Kind of defeats the purpose. Dexcom does this better.', rating: 3, sentiment: 'negative', subreddit: 'Freestylelibre' },
        { title: 'My endo prefers the reports', content: 'The LibreView reports are really detailed. My endocrinologist loves them for our quarterly appointments. Makes visits productive.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Sensor errors on day 13-14', content: 'I\'ve had 3 sensors now that fail in the last 2 days. Abbott replaces them but it\'s frustrating to have gaps in data.', rating: 3, sentiment: 'negative', subreddit: 'Freestylelibre' },
        { title: 'Best for discreet wear', content: 'I work in a client-facing job and the L3 is almost invisible under short sleeves. Nobody notices it.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'No closed loop integration yet', content: 'Wish Abbott would open up to pump integration. Having to use DIY solutions is risky. Dexcom has this market locked.', rating: 4, sentiment: 'neutral', subreddit: 'Freestylelibre' },
        { title: 'Skin irritation after 10 days', content: 'Love the sensor but by day 10 I get a red ring around the adhesive. Tried barrier wipes but still happens.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Swimming tested and approved', content: 'Wore it in the ocean for a week in Hawaii. No issues at all. Stayed attached and accurate through snorkeling.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: 'Upgrade from finger sticks is life changing', content: 'First time CGM user. The convenience of not pricking my finger 10x a day is incredible. Why didn\'t I get this sooner?', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Alert customization is limited', content: 'I want more granular control over alerts. Can\'t set different thresholds for day vs night. Dexcom does this better.', rating: 3, sentiment: 'negative', subreddit: 'Freestylelibre' },
        { title: 'Teenager approved', content: 'My 16yo chose the Libre 3 because of the size and the LibreLinkUp app for parents. She actually wears it consistently now.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Data export is frustrating', content: 'Getting my data out of LibreView is a pain. The CSV export is incomplete. Had to use third-party tools for proper analysis.', rating: 3, sentiment: 'negative', subreddit: 'Freestylelibre' },
        { title: 'Accurate during sick days', content: 'Had the flu last month and the L3 tracked my glucose spikes accurately. Helped me manage ketones before they got dangerous.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Simple setup for older users', content: 'Got this for my 72yo mother. She struggled with the G6 but the Libre 3 app is simpler. She manages it independently.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: 'Reader vs phone debate', content: 'I prefer the dedicated reader over the phone app. Battery lasts longer and I don\'t drain my phone. Personal preference.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Traveling internationally was easy', content: 'Went to Europe for 3 weeks. L3 worked perfectly across time zones. The app handled the transition without losing data.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
        { title: 'Applying the sensor takes practice', content: 'First few applications were crooked. Now I\'ve got the technique down. Wish Abbott included a mirror in the kit.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Best value CGM on the market', content: 'For the price, accuracy, and wear time, Libre 3 is the best value. Not the most advanced but gets the job done.', rating: 5, sentiment: 'positive', subreddit: 'Freestylelibre' },
      ],
      'Omnipod 5': [
        { title: 'Tubeless freedom is incredible', content: 'Switched from Medtronic after 15 years. Not having tubes is life changing. Sleeping, exercising, everything is easier.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Pod failures are too frequent', content: 'I\'m getting 2-3 pod failures per month. That\'s 10% of my pods. Insulet replaces them but it\'s disruptive to my schedule.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Algorithm learns fast', content: 'Within 2 weeks the algorithm figured out my dawn phenomenon. Now I wake up in range 90% of the time. Impressed.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Missing custom activity modes', content: 'Coming from DIY Loop, the lack of exercise presets is frustrating. I want a swimming mode, running mode, etc.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Integration with Dexcom G6 is solid', content: 'The Dexcom integration works flawlessly. Readings come through and the pod adjusts basals automatically. Set it and forget it.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'App needs a major update', content: 'The Omnipod 5 app is slow and crashes often. For something managing my insulin, stability should be priority #1.', rating: 2, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Changed my A1C dramatically', content: '6 months on O5 and my A1C went from 8.2 to 6.9. The automation catches highs and lows I used to miss.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Occlusion alarms at 3am', content: 'Third time this month I\'ve been woken up by an occlusion alarm. Always seems to happen at night. Sleep quality is suffering.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Great for active kids', content: 'My 8yo plays soccer and the tubeless design is perfect. He tackles, rolls, plays hard and the pod stays on.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Learning curve is real', content: 'Took me about a month to understand how the algorithm works and how to set my target and activity appropriately.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Insulin waste is annoying', content: 'The minimum fill is 85 units and I use 25-30/day. So I throw away 10+ units every pod change. That adds up.', rating: 3, sentiment: 'negative', subreddit: 'Omnipod' },
        { title: 'Customer support is hit or miss', content: 'Called about a pod issue. First rep was unhelpful, second call got it resolved immediately. Inconsistent experience.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Switching from MDI was scary but worth it', content: 'First time pumper at 35. Thought I was too old to learn a new system. O5 was actually easier than managing MDI.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Beach and pool tested', content: 'Wore it to a beach vacation for 7 days. Pool, ocean, hot tub. Not a single issue. The waterproofing is legit.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Insertion is not as painless as advertised', content: 'About 1 in 5 insertions hurts. Not unbearable but definitely not painless. Location matters a lot.', rating: 4, sentiment: 'neutral', subreddit: 'Omnipod' },
        { title: 'Love the smartphone control', content: 'Being able to bolus from my phone without pulling out a PDM is so convenient. Discreet at restaurants too.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Pod adhesive in summer heat', content: 'July in Texas. The pods start lifting after day 2. I use Skin Tac and overlays but it\'s still a challenge.', rating: 3, sentiment: 'negative', subreddit: 'Omnipod' },
        { title: 'Night time control is perfect', content: 'The algorithm excels at overnight. I used to spike to 250 at 4am. Now I stay 80-120 all night. Life changing.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Wish pods lasted longer than 3 days', content: 'Coming from a Tandem with 3-day cartridges, I thought I\'d hate the same schedule. But the pod change is faster than cartridge fills.', rating: 4, sentiment: 'neutral', subreddit: 'Omnipod' },
        { title: 'Travel friendly', content: 'TSA was easy, pods went through x-ray fine. Just carried my PDM in my carry-on. International travel was smooth too.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Algorithm too aggressive on lows', content: 'The algorithm suspends for predicted lows too early. I end up high because it stops insulin when I\'m still 100.', rating: 3, sentiment: 'negative', subreddit: 'Omnipod' },
        { title: 'Best pump for CrossFit', content: 'I do CrossFit 5x a week. The tubeless design means I can do burpees, box jumps, pull-ups without worrying about tubing.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Steady improvement with updates', content: 'Insulet keeps improving the algorithm with software updates. Nice that they\'re actively developing even after purchase.', rating: 4, sentiment: 'positive', subreddit: 'Omnipod' },
        { title: 'Insurance approved surprisingly fast', content: 'Expected a fight with insurance but got approved in 2 weeks. United Healthcare. Your mileage may vary.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Love not charging batteries', content: 'Coming from Tandem, not having to charge my pump is a small but delightful perk. One less thing to worry about.', rating: 5, sentiment: 'positive', subreddit: 'Omnipod' },
      ],
      'Tandem t:slim X2': [
        { title: 'Control-IQ changed my life', content: 'My time in range went from 55% to 82% after starting Control-IQ. The automatic corrections are incredibly effective.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Touchscreen is finicky', content: 'The touchscreen often doesn\'t register my taps. Especially with wet fingers. I miss physical buttons sometimes.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Battery life could be better', content: 'I have to charge it every 3-4 days. Not terrible but I wish it lasted a week like some other pumps.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Cartridge changes are messy', content: 'The priming process and cartridge changes take longer than I expected. And I always waste 10-15 units.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'G7 integration is seamless', content: 'Upgraded from G6 to G7 and Control-IQ continues to work perfectly. The transition was completely transparent.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Software updates are free', content: 'Love that Tandem doesn\'t charge for new features. Control-IQ 2.0 features came through a free update.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Tubing is annoying but manageable', content: 'Switched from Omnipod. The tubing takes some getting used to but the pump features are superior.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Exercise mode works great', content: 'The exercise activity mode prevents lows during my runs. I set it 30 min before and stay in range the whole workout.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Sleep mode is underrated', content: 'Sleep mode keeps me 80-120 all night. I used to wake up high every morning. Now I\'m in range before breakfast.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Pump alarm sounds in meetings', content: 'The audio alarms can\'t be fully silenced. Vibrate mode still makes sound. Awkward in quiet office meetings.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Customer service is excellent', content: 'Cracked my screen during a fall. Tandem shipped a replacement next day air at no charge. Outstanding service.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Basal-IQ to Control-IQ upgrade', content: 'The upgrade process was smooth. Just downloaded new firmware and my settings transferred perfectly.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Site changes every 3 days max', content: 'I try to push to 4 days but always get occlusions. The 3-day limit is real for this system.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Slim design fits in pockets', content: 'The t:slim actually fits in my jeans pocket. Tested with skinny jeans. Much smaller than my old Medtronic.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Learning curve is moderate', content: 'Took about a month to really understand all the features. The training from my endo was helpful.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'App connectivity is inconsistent', content: 'The t:connect app loses Bluetooth connection frequently. Have to reopen and reconnect multiple times daily.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'A1C dropped significantly', content: 'From 7.9 to 6.4 in 6 months on Control-IQ. My endo was shocked at my quarterly appointment.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Travel with t:slim is easy', content: 'TSA doesn\'t require removal, airport scanners are safe. I travel for work monthly and never have issues.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Waiting for mobile bolusing', content: 'Still can\'t bolus from my phone in the US. Omnipod has this. When will Tandem catch up?', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Perfect for pregnancy', content: 'Used Control-IQ through my pregnancy. Tight control was much easier to maintain. Healthy baby girl!', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Screen visibility in sunlight', content: 'Hard to see the screen in bright sunlight. Have to shade it with my hand to bolus outdoors.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Micro bolus technology is smart', content: 'The way Control-IQ gives micro boluses instead of big corrections prevents rebounds. Smart design.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
      ],
      'Tandem Mobi': [
        { title: 'Smallest tubed pump ever', content: 'The Mobi is incredibly small. Fits in my palm. Finally a tubed pump that doesn\'t feel like carrying a brick.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Phone-only control is liberating', content: 'No separate device to carry. Everything on my phone. The app is well designed and responsive.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Bluetooth range is limited', content: 'If my phone is in my back pocket and pump is on my belt, connection drops. Range should be better.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Control-IQ works same as X2', content: 'Same great algorithm in a smaller package. My TIR stayed the same switching from X2 to Mobi.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Battery life exceeds expectations', content: 'Getting 5-6 days per charge consistently. Much better than I expected from such a small pump.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Clip is flimsy', content: 'The belt clip feels cheap. I\'m worried it will break within a year. Tandem should make a better case.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Perfect for formal events', content: 'Wore it to my wedding under my tux. Nobody knew I was wearing a pump. The discretion is excellent.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Cartridge capacity is limiting', content: 'Only 200 units. I use 60-70/day so I\'m changing cartridges every 3 days. Wish it held more.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Upgrade from X2 was seamless', content: 'Settings transferred perfectly. Tandem made the transition incredibly smooth. No learning curve.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Gym workouts are easier', content: 'The small size means less bouncing and tugging during exercise. Kettlebell swings no longer catch tubing.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'App crashes occasionally', content: 'The app force closes about once a week. Usually reconnects fine but it\'s concerning for insulin delivery.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Touch screen on pump is missed', content: 'Sometimes I want to check without my phone. The Mobi has no screen so you\'re dependent on the app.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Sleep with it easily', content: 'The small size means I can put it anywhere while sleeping. No bulky pump pushing into my side.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Insurance coverage took months', content: 'Prior auth took 3 months. Tandem helped with appeals. Finally got approved but the process was painful.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'G7 compatibility is great', content: 'Running Mobi with G7 and the closed loop is perfect. Readings come through instantly.', rating: 5, sentiment: 'positive', subreddit: 'tandem' },
        { title: 'Charging is quick', content: '30 minutes from 20% to 100%. USB-C is a nice modern touch. No proprietary cables.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'No secondary display option', content: 'Would like to see readings on my Apple Watch directly. The app doesn\'t have a watch complication.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Kids love the size', content: 'My 11yo switched from X2 to Mobi. She says it\'s so much easier to hide at school. Happy kid = happy parent.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Infusion set options are limited', content: 'Only works with specific sets. I liked my old steel sets but they aren\'t compatible.', rating: 3, sentiment: 'negative', subreddit: 'tandem' },
        { title: 'Best pump for active lifestyle', content: 'Marathon runner here. The Mobi bounces less and is easier to carry. My race times have improved.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'First generation concerns', content: 'A bit nervous being an early adopter. Hoping reliability is as good as the X2 which I trusted completely.', rating: 4, sentiment: 'neutral', subreddit: 'tandem' },
        { title: 'Customer service knows the product', content: 'Had questions about Mobi features. Support was knowledgeable and helpful. Not reading from scripts.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
      ],
      'Medtronic 780G': [
        { title: 'SmartGuard works when it stays in auto', content: 'When the 780G stays in auto mode, my control is great. Problem is it kicks me out for calibration issues constantly.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Guardian 4 is much better than 3', content: 'The Guardian 4 sensor is a huge improvement. Factory calibrated, more accurate, and the 7-day wear is nice.', rating: 4, sentiment: 'positive', subreddit: 'Medtronic' },
        { title: 'Auto mode exits are frustrating', content: 'I get kicked out of auto mode 3-4 times per week. Usually at night. Then I spike before I realize it.', rating: 2, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Meal announcement works well', content: 'The meal announcement feature prevents post-meal spikes. I just tell it I\'m about to eat and it ramps up basal.', rating: 4, sentiment: 'positive', subreddit: 'Medtronic' },
        { title: 'Reservoir holds a lot', content: 'The 300-unit reservoir means fewer changes than Tandem. I only refill every 6 days which is convenient.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'App should be better in 2024', content: 'The Medtronic app feels like it\'s from 2015. Slow, crashes, poor design. They need to invest in software.', rating: 2, sentiment: 'negative', subreddit: 'Medtronic' },
        { title: 'Best pump for high insulin needs', content: 'I use 100+ units per day. The large reservoir and strong delivery are why I stick with Medtronic.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Time in range improved', content: 'Before 780G: 58% TIR. After 6 months: 74% TIR. Not as good as some report with Tandem but still improvement.', rating: 4, sentiment: 'positive', subreddit: 'Medtronic' },
        { title: 'Bulkier than competitors', content: 'Compared to t:slim, the 780G feels chunky. It doesn\'t fit in dress pants pockets well.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Customer service has improved', content: 'Medtronic support used to be terrible but my recent experiences have been much better. Maybe they listened to complaints.', rating: 4, sentiment: 'neutral', subreddit: 'Medtronic' },
        { title: 'Loyal Medtronic user since 2005', content: 'I\'ve tried other pumps but keep coming back. The reliability and familiarity keeps me here.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Insurance made me choose this', content: 'My insurance only covers Medtronic. Would prefer Tandem but the 780G is better than no pump.', rating: 3, sentiment: 'neutral', subreddit: 'Medtronic' },
        { title: 'Sensor warm-up is long', content: 'The 2-hour sensor warm-up is annoying when you\'re used to Dexcom G7\'s 30 minutes.', rating: 3, sentiment: 'negative', subreddit: 'diabetes_t1' },
        { title: 'Sleep quality with 780G', content: 'When auto mode is working, I sleep great. Flat lines all night. When it exits, I\'m awoken by alarms.', rating: 3, sentiment: 'neutral', subreddit: 'Medtronic' },
        { title: 'Upgrading from 670G', content: 'The 780G is so much better than the 670G was. Guardian 4 alone is worth the upgrade. Less maintenance.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Integration with apps is lacking', content: 'Wish the 780G data was easier to export to third-party apps. The ecosystem is too closed.', rating: 3, sentiment: 'negative', subreddit: 'Medtronic' },
        { title: 'Good for newly diagnosed', content: 'Started pumping right at diagnosis. The 780G tutorial and training were comprehensive. Good for beginners.', rating: 4, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Bluetooth range issues', content: 'The pump loses connection to the sensor if it\'s more than 6 feet away. Can\'t charge it across the room.', rating: 3, sentiment: 'negative', subreddit: 'Medtronic' },
        { title: 'Site rotation is key', content: 'I\'ve learned that poor site rotation causes the most auto mode exits. Rotate sites and sensors!', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Battery life is excellent', content: 'The rechargeable battery lasts 5-7 days. Better than I expected. Charging is quick too.', rating: 5, sentiment: 'positive', subreddit: 'Medtronic' },
        { title: 'Carb counting matters more here', content: 'Unlike DIY Loop, the 780G needs accurate carb counts. Guessing leads to poor outcomes.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Water resistance tested', content: 'Accidentally swam with it for an hour. No damage. The water resistance rating is accurate.', rating: 5, sentiment: 'positive', subreddit: 'Medtronic' },
      ],
      'iLet Bionic Pancreas': [
        { title: 'Set it and forget it', content: 'I literally just enter my weight and it does everything. No carb counting, no basal rates, no corrections. Revolutionary.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'No carb counting changed everything', content: 'After 25 years of T1D, not counting carbs feels wrong but amazing. My control is better than when I was counting.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Algorithm is aggressive on highs', content: 'The iLet corrects aggressively. Good for TIR but I get more lows than I did on Control-IQ.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Tubeless option would be perfect', content: 'Love the algorithm but wish it came in a tubeless form factor. Maybe someday they\'ll partner with Insulet.', rating: 4, sentiment: 'neutral', subreddit: 'BionicPancreas' },
        { title: 'Learning curve is non-existent', content: 'My endo literally said "enter your weight and go." No settings to optimize. Perfect for those overwhelmed by diabetes tech.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Waiting for Dexcom G7 integration', content: 'Currently only works with G6. Really want G7 compatibility for the shorter warmup and one-piece design.', rating: 4, sentiment: 'neutral', subreddit: 'BionicPancreas' },
        { title: 'TIR improved dramatically', content: 'Went from 65% TIR on MDI to 82% on iLet in the first month. Without counting a single carb.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Pump is larger than expected', content: 'The iLet device is bigger than the t:slim. Not a deal breaker but I was expecting something smaller.', rating: 3, sentiment: 'negative', subreddit: 'BionicPancreas' },
        { title: 'Perfect for elderly parents', content: 'Got this for my 78yo father. He couldn\'t manage MDI anymore. The iLet does everything and he just lives his life.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Insurance battle was worth it', content: 'Took 4 months and 3 appeals. Finally approved. The reduction in mental burden alone is worth the fight.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Nighttime control is excellent', content: 'I wake up between 90-110 every single day now. The algorithm handles overnight beautifully.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Post-meal spikes are still there', content: 'The announce feature helps but I still spike after pizza and pasta. Not magic, but way better than MDI.', rating: 4, sentiment: 'neutral', subreddit: 'BionicPancreas' },
        { title: 'Mental health improved', content: 'Not thinking about diabetes 24/7 has reduced my diabetes burnout. I feel like a normal person again.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Reservoir changes are easy', content: 'The cartridge system is straightforward. No complicated priming. Fill and go in under 5 minutes.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Limited customization options', content: 'Coming from DIY Loop where I controlled everything, iLet feels restrictive. But my A1C is the same so maybe I was overthinking.', rating: 4, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'Customer support is responsive', content: 'Beta Bionics answers calls quickly and knows the product. Very different from Medtronic support.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Exercise handling is smart', content: 'I tell it I\'m about to exercise and it reduces delivery automatically. No math required.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'First truly autonomous pump', content: 'Other pumps say automated but you still have to set basals and ratios. iLet truly figures it out itself.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Dosing logic is a black box', content: 'Wish I could see what the algorithm is thinking. It just does stuff and I have to trust it.', rating: 3, sentiment: 'neutral', subreddit: 'diabetes_t1' },
        { title: 'A1C dropped from 8.5 to 6.8', content: 'Three months on iLet and my A1C dropped from 8.5 to 6.8. Best number I\'ve had in 10 years.', rating: 5, sentiment: 'positive', subreddit: 'BionicPancreas' },
        { title: 'Works great for type 2 on insulin', content: 'My husband has T2 on intensive insulin. The iLet simplified his regimen and improved his control.', rating: 5, sentiment: 'positive', subreddit: 'diabetes_t1' },
        { title: 'Battery life is adequate', content: 'Need to charge every 3 days. Faster than I\'d like but manageable. USB-C charging is convenient.', rating: 4, sentiment: 'neutral', subreddit: 'BionicPancreas' },
      ],
    };

    // Add reviews for each device found in database
    for (const device of devices || []) {
      const deviceName = device.name;
      const reviews = deviceReviews[deviceName];
      
      if (reviews) {
        reviews.forEach((review, index) => {
          reviewsToInsert.push({
            device_id: device.id,
            device_mentioned: deviceName,
            external_id: `seed-ext-${device.id}-${index}`,
            source: 'reddit',
            title: review.title,
            content: review.content,
            rating: review.rating,
            sentiment: review.sentiment,
            subreddit: review.subreddit,
            author_anonymous: `User_${Math.random().toString(36).substring(2, 8)}`,
            helpful_count: Math.floor(Math.random() * 100) + 5,
            published_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            source_url: `https://reddit.com/r/${review.subreddit}/comments/example${index}`,
          });
        });
      }
    }

    // Clear existing seeded reviews and insert new ones
    await supabase.from('external_device_reviews').delete().like('external_id', 'seed-ext-%');

    if (reviewsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('external_device_reviews')
        .insert(reviewsToInsert);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${reviewsToInsert.length} device reviews`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error seeding device reviews:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
