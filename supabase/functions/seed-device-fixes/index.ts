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
      .select('id, name');

    if (devicesError) throw devicesError;

    const fixesToInsert: any[] = [];

    // User-found fixes per device (5-7 per device for all 8 devices)
    const deviceFixes: Record<string, any[]> = {
      'Dexcom G7': [
        {
          title: 'Magnet Sensor Reactivation',
          description: 'Use a refrigerator magnet to temporarily reactivate a sensor that has stopped working or is showing sensor error.',
          detailed_steps: ['When sensor shows error or stops working, get a small magnet', 'Hold magnet against the transmitter area for 10-15 seconds', 'Remove magnet and wait 2-3 minutes', 'Sensor may restart and resume readings', 'Works best within first 7 days of sensor life'],
          category: 'sensor_extension',
          difficulty: 'easy',
          success_rate: 65,
          source: 'reddit',
          source_url: 'https://reddit.com/r/dexcom/comments/example',
          warnings: ['Not officially supported by Dexcom', 'May void warranty', 'Monitor readings carefully after reactivation'],
          votes: 847
        },
        {
          title: 'Overlay Patch Preheating',
          description: 'Warm the overlay patch between your hands before application for better adhesion that lasts the full 10 days.',
          detailed_steps: ['Remove overlay patch from packaging', 'Rub patch between palms for 30 seconds', 'Apply to clean, dry skin immediately while patch is warm', 'Press firmly for 30 seconds with palm heat', 'Smooth edges outward from center'],
          category: 'adhesive',
          difficulty: 'easy',
          success_rate: 82,
          source: 'community',
          warnings: ['Make sure skin is completely dry first'],
          votes: 423
        },
        {
          title: 'Compression Low Prevention',
          description: 'Specific placement techniques to minimize false low readings when sleeping on the sensor.',
          detailed_steps: ['Place sensor on the back-outer portion of your arm', 'Avoid the side where you typically sleep', 'Apply sensor slightly off-center toward the tricep area', 'Use a flexible pillow that doesn\'t create pressure points', 'Consider wearing loose-fitting sleeves to bed'],
          category: 'accuracy',
          difficulty: 'easy',
          success_rate: 71,
          source: 'reddit',
          source_url: 'https://reddit.com/r/diabetes_t1/comments/compression',
          warnings: ['May need to experiment with placement'],
          votes: 612
        },
        {
          title: 'App Reconnection Force',
          description: 'Steps to force the G7 app to reconnect when Bluetooth connection is lost.',
          detailed_steps: ['Close the Dexcom G7 app completely (force close)', 'Turn off Bluetooth on your phone', 'Wait 30 seconds', 'Turn Bluetooth back on', 'Reopen the G7 app', 'If still not connecting, toggle airplane mode on/off'],
          category: 'connectivity',
          difficulty: 'easy',
          success_rate: 89,
          source: 'community',
          warnings: ['May lose 10-15 minutes of data during reconnection'],
          votes: 534
        },
        {
          title: 'Skin Tac Application Method',
          description: 'Proper technique for using Skin Tac to maximize sensor adhesion without affecting accuracy.',
          detailed_steps: ['Clean insertion site with alcohol wipe, let dry completely', 'Apply Skin Tac in a ring around where sensor will sit (not under sensor pad)', 'Wait 60 seconds until tacky but not wet', 'Insert sensor through the Skin Tac ring', 'Apply overlay patch pressing firmly', 'Do NOT apply Skin Tac directly under the sensor pad - may affect readings'],
          category: 'adhesive',
          difficulty: 'medium',
          success_rate: 94,
          source: 'tudiabetes',
          source_url: 'https://forum.tudiabetes.org/t/skintac-technique',
          warnings: ['Allergic reactions possible - test on small area first'],
          votes: 892
        },
        {
          title: 'First Day Calibration Trick',
          description: 'Improve first-day accuracy by pre-soaking the sensor before official start.',
          detailed_steps: ['Insert new sensor but do NOT start the session in the app', 'Leave the sensor in place for 12-24 hours', 'The sensor hydrates with interstitial fluid', 'Start the session normally after the pre-soak period', 'First-day readings will be more accurate'],
          category: 'accuracy',
          difficulty: 'medium',
          success_rate: 78,
          source: 'reddit',
          warnings: ['Sensor officially expires from manufacture date, not activation'],
          votes: 567
        },
      ],
      'Dexcom G6': [
        {
          title: 'Sensor Restart Without Transmitter Swap',
          description: 'Restart G6 sensor after 10-day expiration using the pop-out transmitter method.',
          detailed_steps: ['Before sensor expires, pop out the transmitter using a test strip or thin card', 'Wait 15-30 minutes with transmitter out', 'Pop transmitter back in firmly until it clicks', 'Open app and start a new sensor session', 'Enter sensor code from original sensor'],
          category: 'sensor_extension',
          difficulty: 'medium',
          success_rate: 85,
          source: 'reddit',
          source_url: 'https://reddit.com/r/dexcom/comments/restart',
          warnings: ['Not officially supported', 'Accuracy may decrease after day 14', 'May void warranty'],
          votes: 1423
        },
        {
          title: 'Transmitter Battery Replacement',
          description: 'Replace the batteries in G6 transmitter to extend life beyond the 90-day limit.',
          detailed_steps: ['Use a Dremel or file to carefully open the transmitter case', 'Remove the old batteries (2x SR1154 or 390)', 'Insert new batteries matching polarity', 'Seal case with silicone or super glue', 'Reset transmitter using diabox/xDrip+'],
          category: 'hardware',
          difficulty: 'advanced',
          success_rate: 72,
          source: 'tudiabetes',
          source_url: 'https://forum.tudiabetes.org/t/transmitter-battery',
          warnings: ['Voids warranty', 'Requires soldering skill', 'Water resistance may be compromised'],
          votes: 567
        },
        {
          title: 'Pre-soak for Accurate Day 1',
          description: 'Insert sensor hours before starting session to stabilize readings from the start.',
          detailed_steps: ['Insert sensor and connect transmitter', 'Wait 12-24 hours before starting session in app', 'The sensor filament hydrates with interstitial fluid', 'Start session when ready', 'Day 1 accuracy is significantly improved'],
          category: 'accuracy',
          difficulty: 'easy',
          success_rate: 88,
          source: 'community',
          warnings: ['Sensor lifespan is from manufacture date, not insertion'],
          votes: 934
        },
        {
          title: 'Calibration Timing Optimization',
          description: 'When and how to calibrate for best accuracy throughout sensor life.',
          detailed_steps: ['Only calibrate when glucose is stable (no arrows or single arrow)', 'Wait 10-15 minutes after eating before calibrating', 'Use fresh test strips from a newly opened vial', 'Enter BG within 5 minutes of fingerstick', 'Calibrate at most 2x per day'],
          category: 'calibration',
          difficulty: 'easy',
          success_rate: 91,
          source: 'reddit',
          warnings: ['Over-calibrating can make readings worse'],
          votes: 678
        },
        {
          title: 'Adhesive Enhancement with Tegaderm',
          description: 'Layer Tegaderm under sensor to prevent skin irritation and improve adhesion.',
          detailed_steps: ['Clean and dry insertion site completely', 'Apply Tegaderm film to the area', 'Let it set for 5 minutes', 'Insert sensor through the Tegaderm', 'Add overlay patch on top for extra security'],
          category: 'adhesive',
          difficulty: 'easy',
          success_rate: 86,
          source: 'facebook',
          warnings: ['May slightly affect insertion angle'],
          votes: 445
        },
      ],
      'Freestyle Libre 3': [
        {
          title: 'Libre 3 Sensor Restart',
          description: 'Method to restart a Libre 3 sensor after the 14-day expiration using third-party apps.',
          detailed_steps: ['Install a third-party app like xDrip+ or Diabox', 'Configure the app to read Libre 3 via Bluetooth', 'When sensor expires, the official app will stop', 'Third-party app continues to read raw sensor data', 'Can extend sensor life by 3-7 additional days'],
          category: 'sensor_extension',
          difficulty: 'advanced',
          success_rate: 72,
          source: 'reddit',
          source_url: 'https://reddit.com/r/Freestylelibre/comments/extend',
          warnings: ['Not officially supported', 'Accuracy may degrade after day 14', 'Requires technical setup'],
          votes: 734
        },
        {
          title: 'Libre 3 Battery Preservation',
          description: 'Settings adjustments to reduce phone battery drain while maintaining CGM connectivity.',
          detailed_steps: ['Go to phone Settings > Apps > LibreLink', 'Disable background data refresh', 'Keep app exempted from battery optimization', 'Close other Bluetooth apps when possible', 'Disable glucose sharing if not needed', 'Turn off unnecessary notifications'],
          category: 'app',
          difficulty: 'easy',
          success_rate: 67,
          source: 'community',
          warnings: ['May miss some notifications if too aggressive'],
          votes: 298
        },
        {
          title: 'Compression Low Fix - Stomach Placement',
          description: 'Alternative placement site to reduce compression lows while sleeping.',
          detailed_steps: ['Apply sensor to lower stomach/love handle area instead of arm', 'Choose the side you don\'t sleep on', 'Place at least 2 inches away from belly button', 'Avoid areas that fold when sitting', 'Secure with overlay patch for extra protection'],
          category: 'accuracy',
          difficulty: 'easy',
          success_rate: 76,
          source: 'facebook',
          source_url: 'https://facebook.com/groups/libre/example',
          warnings: ['Stomach placement not officially approved by Abbott'],
          votes: 445
        },
        {
          title: 'Sensor Insertion Angle',
          description: 'Specific technique for sensor application to minimize painful insertions.',
          detailed_steps: ['Clean site with alcohol, wait 60 seconds to dry', 'Place applicator at slight angle (not perfectly vertical)', 'Press straight down with even pressure', 'Don\'t hesitate mid-press - one smooth motion', 'Hold for 3 seconds after click before removing applicator'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 81,
          source: 'community',
          warnings: ['Individual results vary - find what works for you'],
          votes: 312
        },
        {
          title: 'Skin Irritation Prevention',
          description: 'Pre-treatment routine to prevent the red ring allergic reaction many users experience.',
          detailed_steps: ['Apply Flonase nasal spray to the sensor area 30 min before insertion', 'Let dry completely (creates a steroid barrier)', 'Apply sensor as normal', 'Alternatively, use Tegaderm as a barrier between skin and sensor adhesive', 'Hydrocortisone cream can be applied after removal to treat any irritation'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 79,
          source: 'reddit',
          source_url: 'https://reddit.com/r/diabetes_t1/comments/irritation',
          warnings: ['Consult doctor if severe reaction occurs', 'Test Flonase on small area first'],
          votes: 623
        },
      ],
      'Omnipod 5': [
        {
          title: 'Pod Failure Prevention - Air Bubble Check',
          description: 'Technique to reduce pod failures by eliminating air bubbles during fill.',
          detailed_steps: ['Fill syringe with insulin, then push most back into vial', 'Repeat 3-4 times to prime the syringe and remove air', 'Fill syringe slowly - no more than 10 units per second', 'Flick syringe multiple times before filling pod', 'Fill pod slowly and steadily', 'Wait 2 minutes after filling before starting pod'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 74,
          source: 'reddit',
          source_url: 'https://reddit.com/r/Omnipod/comments/airfill',
          warnings: ['Still expect occasional random failures'],
          votes: 892
        },
        {
          title: 'Occlusion Alarm Prevention',
          description: 'Site selection and preparation to minimize occlusion alarms.',
          detailed_steps: ['Rotate sites religiously - use a site map', 'Wait at least 2 weeks before reusing a site', 'Avoid scar tissue from previous injections', 'Warm insulin to room temperature before filling', 'Apply pod to flat, non-bending areas', 'Avoid waistband areas that compress the pod'],
          category: 'hardware',
          difficulty: 'medium',
          success_rate: 68,
          source: 'tudiabetes',
          warnings: ['Occlusions can still happen - always have backup insulin'],
          votes: 567
        },
        {
          title: 'Algorithm Manipulation for Exercise',
          description: 'Timing strategy to prevent exercise lows when the pod lacks exercise mode.',
          detailed_steps: ['Set activity target to 150 mg/dL 1-2 hours BEFORE exercise', 'For intense cardio, also reduce basal by 30% if using manual mode', 'Eat a small snack (15g) without bolusing 30 min before', 'Keep activity target elevated until 1 hour AFTER exercise', 'Watch for delayed lows 2-4 hours post-exercise'],
          category: 'other',
          difficulty: 'medium',
          success_rate: 77,
          source: 'community',
          warnings: ['Every person responds differently to exercise', 'Monitor closely when starting'],
          votes: 445
        },
        {
          title: 'Pod Adhesion Maximizer',
          description: 'Comprehensive routine for making pods last the full 3 days in humid conditions.',
          detailed_steps: ['Shower and clean site with dish soap (removes oils)', 'Dry thoroughly with hair dryer on cool setting', 'Apply Skin Tac or Mastisol, let get tacky', 'Apply pod with firm pressure for 60 seconds', 'Immediately apply SimpPatch or other overlay', 'Press edges of overlay firmly', 'Carry extra overlays for reapplication if needed'],
          category: 'adhesive',
          difficulty: 'easy',
          success_rate: 91,
          source: 'facebook',
          warnings: ['Adhesive removers needed for cleanup'],
          votes: 934
        },
        {
          title: 'Cannula Kink Detection',
          description: 'How to identify if your pod has a kinked cannula before going high.',
          detailed_steps: ['After pod activation, check for immediate delivery sounds (clicking)', 'Give a small manual bolus (0.5u) and listen for delivery', 'Check blood sugar 1 hour after new pod - if rising unexpectedly, may be kinked', 'Slight bruising or pain at insertion often indicates kink', 'If suspicious, change pod immediately rather than waiting'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 65,
          source: 'reddit',
          warnings: ['Some kinks are invisible - trust your glucose readings'],
          votes: 378
        },
      ],
      'Tandem t:slim X2': [
        {
          title: 'Cartridge Change with Minimal Waste',
          description: 'Technique to reduce insulin waste during cartridge changes from 15+ units to under 5.',
          detailed_steps: ['Leave old cartridge until only 10-15 units remain', 'Prepare new cartridge but don\'t prime yet', 'Fill new cartridge to exact amount needed', 'Start fill-tubing process', 'When pump asks "fill cannula", use syringe to transfer remaining old insulin to new cartridge', 'Complete the process normally'],
          category: 'other',
          difficulty: 'medium',
          success_rate: 83,
          source: 'community',
          warnings: ['Be careful of contamination when transferring insulin'],
          votes: 567
        },
        {
          title: 'Touchscreen Responsiveness Fix',
          description: 'How to improve touchscreen response when it becomes sluggish or unresponsive.',
          detailed_steps: ['Remove pump from case if using one', 'Clean screen with microfiber cloth (no liquids)', 'Check for screen protector bubbles or debris', 'Restart pump: hold power button for 20 seconds', 'If still issues, try after pump cools down (heat affects screen)', 'Tap with pad of finger, not tip or nail'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 71,
          source: 'community',
          warnings: ['Persistent issues may require pump replacement'],
          votes: 423
        },
        {
          title: 'Control-IQ Sleep Mode Optimization',
          description: 'Settings adjustments to maximize overnight time in range with Control-IQ.',
          detailed_steps: ['Set Sleep schedule to start 1 hour before actual bedtime', 'End Sleep schedule 30 minutes after typical wake time', 'Eat dinner at least 3 hours before Sleep starts', 'Give any corrections at least 2 hours before Sleep', 'If still going high overnight, adjust dinner carb ratio rather than Sleep schedule'],
          category: 'other',
          difficulty: 'medium',
          success_rate: 84,
          source: 'reddit',
          source_url: 'https://reddit.com/r/tandem/comments/sleepiq',
          warnings: ['Takes 3-5 days for Control-IQ to learn new schedules'],
          votes: 712
        },
        {
          title: 'Exercise Pre-Planning',
          description: 'Optimal timing for Activity mode to prevent exercise lows.',
          detailed_steps: ['Start Exercise Activity 60-90 minutes before workout', 'This gives Control-IQ time to reduce insulin delivery', 'Keep Exercise mode on for 1-2 hours AFTER workout', 'For intense exercise, eat 10-15g uncovered carbs 30 min before', 'Monitor for delayed lows 2-6 hours post-exercise'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 79,
          source: 'community',
          warnings: ['Doesn\'t work for everyone - requires experimentation'],
          votes: 534
        },
        {
          title: 'Extended Battery Life',
          description: 'Settings to maximize battery life between charges.',
          detailed_steps: ['Reduce screen brightness to 25%', 'Set screen timeout to minimum (15 seconds)', 'Turn off vibration for non-critical alerts', 'Disable Bluetooth if not using t:connect mobile', 'Charge when between 30-40% rather than letting it drop lower', 'Use USB-C cable (faster charge = less heat = better battery health)'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 68,
          source: 'community',
          warnings: ['Turning off Bluetooth disables mobile app sync'],
          votes: 389
        },
      ],
      'Tandem Mobi': [
        {
          title: 'Bluetooth Range Extension',
          description: 'Tips to maintain stable Bluetooth connection between Mobi and phone.',
          detailed_steps: ['Keep phone and pump on the same side of body', 'Avoid putting phone in back pocket if pump is on front', 'Disable battery optimization for Tandem app', 'Keep app running in background', 'If connection drops, toggle Bluetooth off/on', 'Update to latest firmware for improved connectivity'],
          category: 'connectivity',
          difficulty: 'easy',
          success_rate: 75,
          source: 'reddit',
          source_url: 'https://reddit.com/r/tandem/comments/mobi-bluetooth',
          warnings: ['Some environments may have interference'],
          votes: 342
        },
        {
          title: 'Clip Alternative Solutions',
          description: 'Better ways to carry the Mobi than the included clip.',
          detailed_steps: ['Use a SPIbelt or FlipBelt with small pocket', 'Sew a small pocket inside waistband of pants', 'Use GrifGrips arm band with pocket', 'Try the unofficial Mobi holster from Etsy sellers', 'For sleeping, tuck into fitted boxer shorts waistband'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 88,
          source: 'community',
          warnings: ['Third-party accessories not endorsed by Tandem'],
          votes: 456
        },
        {
          title: 'Cartridge Capacity Optimization',
          description: 'Strategies to work around the smaller 200-unit reservoir.',
          detailed_steps: ['Fill cartridge to exactly 200 units', 'Track average daily usage to predict change day', 'Change at predictable times (mornings work best)', 'Keep backup filled cartridge ready for travel', 'Use reminder app to track cartridge fill time'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 82,
          source: 'facebook',
          warnings: ['Don\'t let cartridge run too low - may affect delivery'],
          votes: 289
        },
        {
          title: 'App Crash Recovery',
          description: 'What to do when the Tandem app crashes and won\'t reconnect.',
          detailed_steps: ['Force close the Tandem app completely', 'Clear app cache (Android) or reinstall (iOS)', 'Turn Bluetooth off for 30 seconds, then back on', 'Reopen app and wait for reconnection', 'If still failing, restart phone', 'Pump continues delivering even without app'],
          category: 'app',
          difficulty: 'easy',
          success_rate: 91,
          source: 'reddit',
          warnings: ['Note: Pump works independently - always have backup dosing plan'],
          votes: 523
        },
        {
          title: 'Control-IQ Settings Transfer',
          description: 'How to ensure all settings transfer when upgrading from X2.',
          detailed_steps: ['Before switching, screenshot all your X2 settings', 'Complete the Mobi setup process with your CDE', 'Verify each profile transferred correctly', 'Double-check carb ratios and correction factors', 'Test with a known meal to confirm settings'],
          category: 'other',
          difficulty: 'medium',
          success_rate: 95,
          source: 'community',
          warnings: ['Always verify settings manually'],
          votes: 234
        },
      ],
      'Medtronic 780G': [
        {
          title: 'Auto Mode Stability Tricks',
          description: 'Techniques to reduce auto mode exits and stay in closed loop longer.',
          detailed_steps: ['Calibrate only when glucose is stable (no arrows)', 'Calibrate at the same times each day for consistency', 'Use fresh test strips from a newly opened vial', 'Don\'t calibrate within 2 hours of eating', 'When asked for BG, enter it within 10 minutes', 'Avoid extreme temperatures which can affect sensor'],
          category: 'calibration',
          difficulty: 'medium',
          success_rate: 72,
          source: 'reddit',
          source_url: 'https://reddit.com/r/Medtronic/comments/automode',
          warnings: ['Some exits are unavoidable due to sensor issues'],
          votes: 623
        },
        {
          title: 'Guardian 4 Placement Sweet Spots',
          description: 'Optimal sensor locations for best accuracy and fewest calibration requests.',
          detailed_steps: ['Back of upper arm is most accurate for most users', 'Avoid areas with scar tissue or frequent injection sites', 'Place sensor at least 2 inches from pump infusion site', 'Stomach sides work well for those with more tissue', 'Avoid areas that bend or compress during daily activities', 'Mark good sites so you can return to them after rotation'],
          category: 'accuracy',
          difficulty: 'easy',
          success_rate: 76,
          source: 'community',
          warnings: ['Personal body type affects optimal sites'],
          votes: 445
        },
        {
          title: 'Quick Return to Auto Mode',
          description: 'Steps to quickly get back into auto mode after being kicked out.',
          detailed_steps: ['Fix the root cause of exit (calibration, sensor error)', 'Enter accurate BG when requested - don\'t guess', 'Wait for "Enter BG" prompt before calibrating unsolicited', 'Ensure sensor has been in for at least 2 hours', 'If stuck in Safe Basal, try restart sensor in menu', 'Stay in Manual mode for 4 hours before retrying if repeated failures'],
          category: 'other',
          difficulty: 'medium',
          success_rate: 81,
          source: 'tudiabetes',
          warnings: ['Forcing auto mode too quickly can cause repeated exits'],
          votes: 512
        },
        {
          title: 'Meal Announcement Timing',
          description: 'Optimal timing for meal announcement to prevent post-meal spikes.',
          detailed_steps: ['Announce meal 15-20 minutes before eating (not right when eating)', 'For high-fat meals, announce 30 minutes before', 'For fast-acting carbs, announce 10 minutes before', 'Don\'t use meal announcement for snacks under 10g carbs', 'If you forget to pre-announce, bolus manually for best results'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 77,
          source: 'community',
          warnings: ['Timing varies by individual insulin sensitivity'],
          votes: 398
        },
        {
          title: 'Reservoir Filling Technique',
          description: 'Method to fill the 300-unit reservoir without introducing air bubbles.',
          detailed_steps: ['Let insulin warm to room temperature (20-30 min)', 'Use a new syringe for each fill', 'Draw insulin slowly - no faster than 1 mL per 5 seconds', 'Tap reservoir multiple times to release micro bubbles', 'Fill reservoir from the bottom up to push air out', 'Prime tubing until you see steady flow with no air gaps'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 88,
          source: 'community',
          warnings: ['Air in tubing can cause delivery failures'],
          votes: 467
        },
      ],
      'iLet Bionic Pancreas': [
        {
          title: 'Meal Announcement Optimization',
          description: 'When and how to use the meal announcement feature for best post-meal results.',
          detailed_steps: ['For standard meals, announce "Usual" 10-15 minutes before eating', 'Use "More than usual" for high-carb meals like pasta or pizza', 'Use "Less than usual" for protein-heavy, low-carb meals', 'Don\'t announce small snacks under 15g carbs', 'Experiment with timing based on your typical food choices'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 78,
          source: 'community',
          warnings: ['The algorithm learns from your patterns over time'],
          votes: 534
        },
        {
          title: 'Exercise Announcement Strategy',
          description: 'How to use the activity announcement to prevent exercise lows.',
          detailed_steps: ['Announce exercise 30-60 minutes before starting', 'Choose activity level based on intensity (light/moderate/intense)', 'Keep announcement active until 1-2 hours after exercise', 'For spontaneous exercise, announce as soon as you start', 'Watch for delayed lows 2-4 hours post-activity'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 81,
          source: 'reddit',
          source_url: 'https://reddit.com/r/BionicPancreas/comments/exercise',
          warnings: ['Everyone responds differently to exercise'],
          votes: 389
        },
        {
          title: 'Dexcom G6 Sensor Optimization',
          description: 'Tips for best CGM performance with the iLet system.',
          detailed_steps: ['Use back of arm for most consistent readings', 'Pre-soak sensor 12-24 hours before starting if possible', 'Avoid calibrating unless readings are consistently off', 'Ensure sensor is secure - use overlays in humid conditions', 'Replace sensor at first sign of erratic readings'],
          category: 'accuracy',
          difficulty: 'easy',
          success_rate: 85,
          source: 'community',
          warnings: ['iLet relies heavily on CGM accuracy'],
          votes: 456
        },
        {
          title: 'Overnight Optimization',
          description: 'Settings and behaviors to maximize nighttime glucose control.',
          detailed_steps: ['Avoid eating within 3 hours of bedtime', 'Don\'t snack without announcing if within 4 hours of sleep', 'Keep phone and pump close for reliable Bluetooth', 'Check morning glucose to evaluate overnight performance', 'The algorithm learns your overnight patterns within 1-2 weeks'],
          category: 'other',
          difficulty: 'easy',
          success_rate: 79,
          source: 'facebook',
          warnings: ['Patience is key - algorithm needs time to learn'],
          votes: 312
        },
        {
          title: 'Infusion Site Best Practices',
          description: 'Where and how to place infusion sites for best absorption with iLet.',
          detailed_steps: ['Rotate sites in a pattern (abdomen, hips, upper buttocks)', 'Wait at least 2 weeks before reusing an exact site', 'Avoid scar tissue and areas with poor circulation', 'Apply sites to fatty tissue, not muscle', 'Use Skin Tac for better adhesion in hot weather'],
          category: 'hardware',
          difficulty: 'easy',
          success_rate: 86,
          source: 'community',
          warnings: ['Poor site selection leads to poor absorption'],
          votes: 423
        },
      ],
    };

    // Create fixes for each device
    for (const device of devices || []) {
      const deviceName = device.name;
      const fixes = deviceFixes[deviceName];
      
      if (fixes) {
        fixes.forEach(fix => {
          fixesToInsert.push({
            device_id: device.id,
            title: fix.title,
            description: fix.description,
            detailed_steps: fix.detailed_steps,
            category: fix.category,
            difficulty: fix.difficulty,
            success_rate: fix.success_rate,
            votes: fix.votes,
            source: fix.source,
            source_url: fix.source_url || null,
            warnings: fix.warnings,
            is_verified: false,
          });
        });
      }
    }

    // Clear existing fixes and insert new ones
    await supabase.from('device_user_fixes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (fixesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('device_user_fixes')
        .insert(fixesToInsert);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${fixesToInsert.length} device user fixes`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error seeding device fixes:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
