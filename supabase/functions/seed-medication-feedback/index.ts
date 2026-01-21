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

    // Get all medications
    const { data: medications, error: medsError } = await supabase
      .from('medications')
      .select('id, name');

    if (medsError) throw medsError;

    const feedbackToInsert: any[] = [];

    // Medication community feedback data
    const medicationFeedback: Record<string, any[]> = {
      'Humalog': [
        { type: 'issue', title: 'Stinging on injection', content: 'Humalog stings more than other rapid-acting insulins I\'ve tried. The burn lasts about 30 seconds. Not unbearable but noticeable.', votes: 234 },
        { type: 'praise', title: 'Fastest action time for me', content: 'Been on Humalog for 15 years. It starts working in 10-15 minutes for me, faster than Novolog ever did.', votes: 189 },
        { type: 'tip', title: 'Room temperature reduces sting', content: 'Taking the insulin out of the fridge 30 min before injecting significantly reduces the sting. Cold insulin hurts more.', votes: 445 },
        { type: 'why_chosen', title: 'Insurance preferred brand', content: 'My insurance only covers Humalog at tier 1. Novolog would cost me 3x as much out of pocket.', votes: 312 },
        { type: 'issue', title: 'Price keeps increasing', content: 'The list price has gone up every year. Without insurance I\'d be paying $300+/vial. It\'s the same formula for 25 years.', votes: 567 },
      ],
      'Novolog': [
        { type: 'praise', title: 'Smoother than Humalog', content: 'Switched from Humalog to Novolog and I get fewer lows. The action curve is gentler for me.', votes: 178 },
        { type: 'issue', title: 'Pens malfunction sometimes', content: 'Had 2 FlexPens in the last year that didn\'t click properly. Had to toss them with insulin still inside.', votes: 89 },
        { type: 'why_chosen', title: 'Works better with my pump', content: 'My Omnipod seems to deliver Novolog more consistently than Humalog. Less occlusions.', votes: 156 },
        { type: 'tip', title: 'Best for high-carb meals', content: 'For pizza nights, I split my Novolog dose - 60% upfront, 40% 90 minutes later. Works perfectly.', votes: 234 },
        { type: 'why_switched', title: 'Fewer hypoglycemic episodes', content: 'Switched from Humalog because I was having too many lows. Novolog peaks more gently for me.', votes: 145 },
      ],
      'Fiasp': [
        { type: 'praise', title: 'Lightning fast onset', content: 'Fiasp starts working in 5-7 minutes for me. I can bolus right when I start eating instead of 15 min before.', votes: 389 },
        { type: 'issue', title: 'Burns more than regular insulin', content: 'The niacinamide in Fiasp causes noticeable burning at the injection site. Some people can\'t tolerate it.', votes: 267 },
        { type: 'tip', title: 'Great for corrections', content: 'I use Fiasp for corrections and Novolog for meals. The fast action of Fiasp brings down highs quickly.', votes: 198 },
        { type: 'why_chosen', title: 'Best for post-meal spikes', content: 'Chose Fiasp specifically because I was spiking to 250+ after meals. Now I rarely go over 180.', votes: 223 },
        { type: 'issue', title: 'Wears off quickly', content: 'Fiasp is out of my system in 3 hours vs 5 for Humalog. Good for avoiding stacking, bad for high-fat meals.', votes: 156 },
      ],
      'Lantus': [
        { type: 'praise', title: 'Rock solid baseline', content: '10 years on Lantus and my basal needs are completely predictable. Same dose works day after day.', votes: 445 },
        { type: 'issue', title: 'Causes lipohypertrophy', content: 'After years of Lantus, I have lumpy injection sites. Have to rotate more aggressively now.', votes: 234 },
        { type: 'tip', title: 'Split dose works better', content: 'Splitting my Lantus into two doses (morning and night) eliminated my dawn phenomenon completely.', votes: 378 },
        { type: 'why_chosen', title: 'Best insurance coverage', content: 'Lantus is the only long-acting insulin my insurance covers at tier 1. Tresiba would cost me $200/month.', votes: 289 },
        { type: 'issue', title: 'Burns on injection', content: 'Lantus has an acidic pH that causes burning. Taking it out of the fridge helps but doesn\'t eliminate it.', votes: 178 },
      ],
      'Tresiba': [
        { type: 'praise', title: 'Flexible dosing time', content: 'The best thing about Tresiba is I can take it any time of day. Forgot morning dose? Take it at lunch. No problem.', votes: 512 },
        { type: 'praise', title: 'Flattest basal profile', content: 'Switched from Lantus and my CGM shows a much flatter line. Less variability throughout the day.', votes: 389 },
        { type: 'why_chosen', title: 'Longer duration = stability', content: 'Tresiba lasts 42 hours in my system. If I miss a dose or take it late, I have a buffer.', votes: 267 },
        { type: 'issue', title: 'Takes forever to adjust', content: 'Because Tresiba takes 3-4 days to reach steady state, adjusting doses is slow. Not great for sick days.', votes: 178 },
        { type: 'tip', title: 'Best for travel across time zones', content: 'Traveling internationally, Tresiba\'s flexibility is unmatched. I don\'t have to worry about exact timing.', votes: 234 },
      ],
      'Ozempic': [
        { type: 'praise', title: 'A1C dropped 2 points', content: 'Started Ozempic 6 months ago as adjunct to insulin. A1C went from 8.5 to 6.5. Also lost 15 lbs.', votes: 678 },
        { type: 'issue', title: 'Nausea for first 6 weeks', content: 'The GI side effects were rough. Nausea, no appetite, occasional vomiting. Gets better after 6-8 weeks.', votes: 445 },
        { type: 'tip', title: 'Start on lowest dose', content: 'Don\'t let your doc rush the titration. Stay on 0.25mg for 8 weeks if needed. Your stomach will thank you.', votes: 523 },
        { type: 'why_chosen', title: 'Weight loss + glucose control', content: 'As a T1D with insulin resistance, Ozempic helps both my weight and reduces my total daily insulin.', votes: 389 },
        { type: 'issue', title: 'Shortage makes refills hard', content: 'The demand is so high that pharmacies are constantly out of stock. Have to call around to find it.', votes: 334 },
      ],
      'Metformin': [
        { type: 'praise', title: 'Cheap and effective', content: 'Generic metformin is $4/month at Walmart. Reduces my insulin needs by about 20%.', votes: 567 },
        { type: 'issue', title: 'GI side effects are real', content: 'The diarrhea and stomach upset are no joke. Extended release helped but didn\'t eliminate it.', votes: 378 },
        { type: 'tip', title: 'Take with food always', content: 'Never take metformin on an empty stomach. Always with a meal, preferably dinner. Reduces GI issues.', votes: 445 },
        { type: 'why_chosen', title: 'Helps with insulin resistance', content: 'Even as a T1D, I have insulin resistance. Metformin reduces my basal needs by 15 units/day.', votes: 289 },
        { type: 'why_switched', title: 'Couldn\'t tolerate GI effects', content: 'Tried for 3 months but the stomach problems never resolved. Had to switch to something else.', votes: 156 },
      ],
    };

    // Create feedback for each medication found
    for (const med of medications || []) {
      const feedback = medicationFeedback[med.name];
      
      if (feedback) {
        feedback.forEach(fb => {
          feedbackToInsert.push({
            medication_id: med.id,
            feedback_type: fb.type,
            title: fb.title,
            content: fb.content,
            votes: fb.votes,
            source: 'community',
          });
        });
      }
    }

    // Clear existing feedback and insert new
    await supabase.from('medication_community_feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (feedbackToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('medication_community_feedback')
        .insert(feedbackToInsert);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${feedbackToInsert.length} medication community feedback entries`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error seeding medication feedback:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
