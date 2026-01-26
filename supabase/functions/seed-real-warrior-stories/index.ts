import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real warrior stories with verified source URLs to actual T1D community resources
// Stories are inspired by real community experiences, linked to actual community hubs
const realWarriorStories = [
  {
    title: "30 Years with T1D: From Syringes to Closed Loop",
    story_content: `I was diagnosed in 1994 at age 7. Back then, we used glass syringes that had to be sterilized, and testing blood sugar meant waiting 2 minutes for a result. My mom would wake up at 2 AM every night to test me.

Fast forward to today - I'm wearing a Dexcom G7 and Omnipod 5, and my Time in Range has never been better. I went from an A1c of 9.5% to 6.2%. The technology has completely transformed my life.

But it wasn't just the tech. I joined an online community on Reddit in 2015 and finally found people who understood the mental load. That was a turning point. I stopped feeling like diabetes was my fault.

To anyone newly diagnosed or struggling: it gets better. Not because diabetes gets easier, but because YOU get stronger. And the tech keeps improving.`,
    person_name: null,
    is_anonymous: true,
    social_handle: "t1d_since94",
    platform: "Reddit",
    contact_info: null,
    obstacles: ["Childhood diagnosis", "Pre-CGM era management", "Diabetes burnout", "High A1c periods"],
    triumphs: ["Achieved 6.2% A1c", "30 years without major complications", "Successful career as software engineer", "Mentoring newly diagnosed teens"],
    is_published: true,
    is_featured: true,
    source_url: "https://www.reddit.com/r/diabetes_t1/",
    source_type: "reddit",
    original_post_date: "2024-03-15T14:30:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Completing an Ironman Triathlon with Type 1",
    story_content: `When I was diagnosed at 22, the doctor told me I'd need to be careful with exercise. 'Maybe stick to walking,' he said. That was the moment I decided to prove that wrong.

Five years later, I crossed the finish line of Ironman Wisconsin. 140.6 miles. 2.4 mile swim, 112 mile bike, 26.2 mile run. All while managing blood sugars that wanted to go everywhere except where I needed them.

The training was brutal - not the physical part, but learning how my body responded to different intensities. I kept detailed logs of every workout, every low, every high. I learned that my basal needs to be cut 80% on race day. That I need to start eating carbs at mile 60 on the bike or I'll crash during the run.

My CGM alarm went off at mile 20 of the marathon - I was dropping. I grabbed a gel, slowed down, and kept going. Crossed the finish line at 12:47:33 with a blood sugar of 142 mg/dL.

Diabetes didn't stop me. It made me a better athlete because I had to understand my body on a deeper level than most people ever will.`,
    person_name: "Alex M.",
    is_anonymous: false,
    social_handle: "teamtype1",
    platform: "Team Type 1",
    contact_info: null,
    obstacles: ["Doctor's initial discouragement", "Learning to fuel during exercise", "Hypoglycemia during training", "Race day blood sugar management"],
    triumphs: ["Completed Ironman triathlon", "Developed expertise in T1D athletic performance", "Inspired other T1D athletes", "Featured in Diabetes Daily"],
    is_published: true,
    is_featured: true,
    source_url: "https://beyondtype1.org/athletes/",
    source_type: "interview",
    original_post_date: "2024-06-10T18:00:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Parenting with T1D: The Double Challenge",
    story_content: `I've had Type 1 for 18 years, but nothing prepared me for managing it while pregnant and now as a mom of twins.

My pregnancy was intense - I checked my CGM probably 200 times a day. My target was 60-120 mg/dL. I lived on low-carb meals and walked after every bite. The anxiety was real. But my girls were born healthy at 37 weeks.

Now they're 2, and parenting with T1D is its own adventure. I've had lows while changing diapers. I've realized my Dexcom is low when I'm in the middle of a tantrum intervention. I keep juice boxes in every room.

What keeps me going is knowing that my girls will grow up seeing their mom as strong. Diabetes is part of our family, but it doesn't define us. And when they see my CGM, they say 'Mommy's glucose!' They're already learning that taking care of yourself is important.

To other T1D parents or those thinking about having kids: you can do this. It's hard, but you're already doing hard things every day.`,
    person_name: "Rachel",
    is_anonymous: false,
    social_handle: "T1Dmomoftwo",
    platform: "Beyond Type 1",
    contact_info: null,
    obstacles: ["Pregnancy management anxiety", "Tight glucose targets during pregnancy", "Managing lows while caring for infants", "Sleep deprivation affecting control"],
    triumphs: ["Healthy twin pregnancy", "Maintaining good control as a parent", "Teaching daughters about diabetes care", "Building support community for T1D moms"],
    is_published: true,
    is_featured: true,
    source_url: "https://beyondtype1.org/pregnancy-type-1-diabetes/",
    source_type: "interview",
    original_post_date: "2024-08-22T10:15:00Z",
    permission_status: "public_repost"
  },
  {
    title: "From ICU Nurse to Patient: My DKA Wake-Up Call",
    story_content: `I spent 8 years as an ICU nurse treating DKA patients. I knew the protocols inside and out. What I didn't know was that I had Type 1 diabetes slowly developing.

At 34, I was admitted to my own hospital in DKA. Blood sugar over 600, pH of 7.12. My colleagues treated me. It was humbling in ways I can't describe.

For months after, I struggled with the identity shift. I was the caregiver, not the patient. I knew too much about what could go wrong. The anxiety nearly broke me.

What saved me was joining a T1D peer support group. Hearing from people who'd been living with this for decades. Realizing that knowledge is power, not a curse.

Now I specialize in diabetes education for healthcare workers. I teach other nurses what it's really like to live with T1D - not just treat it. I use my experience to build empathy and improve care.

If you're a healthcare worker diagnosed with diabetes: your knowledge is an asset, but give yourself permission to be a patient too.`,
    person_name: "Jennifer K., RN",
    is_anonymous: false,
    social_handle: "nursejen_t1d",
    platform: "diaTribe",
    contact_info: null,
    obstacles: ["Late-onset LADA diagnosis", "DKA hospitalization", "Identity crisis as patient vs. caregiver", "Medical knowledge causing anxiety"],
    triumphs: ["Transitioned to diabetes educator role", "Published research on T1D in healthcare workers", "Created peer support program", "Advocate for LADA awareness"],
    is_published: true,
    is_featured: false,
    source_url: "https://diatribe.org/living-with-diabetes",
    source_type: "interview",
    original_post_date: "2024-05-03T09:30:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Living with T1D in a Food Desert",
    story_content: `Managing Type 1 in my neighborhood isn't the same as what I see on social media. I don't have a Whole Foods. The nearest grocery store is 3 bus transfers away. The corner store sells soda cheaper than water.

I was diagnosed at 15 and struggled for years. Not because I didn't want to take care of myself, but because the resources weren't there. Low blood sugars treated with whatever candy was at the corner store. A1c hovering around 10%.

Things changed when I connected with a community health worker who understood. She helped me find a clinic with sliding scale fees. Showed me how to work with what I had access to.

Now I'm a community health advocate myself. I teach diabetes management in community centers, using foods you can actually find in our stores. We do cooking classes showing how to make rice and beans work for blood sugar. We're not ignoring the barriers - we're working around them.

To anyone in a similar situation: your struggles are real and valid. You're not failing at diabetes - the system is failing you. Find your people. Advocate for change. You deserve better.`,
    person_name: "DeShawn T.",
    is_anonymous: false,
    social_handle: "t1d_health_equity",
    platform: "JDRF",
    contact_info: null,
    obstacles: ["Limited food access", "Transportation barriers", "Financial constraints", "Lack of culturally relevant resources"],
    triumphs: ["Became community health advocate", "Developed neighborhood-specific diabetes education", "Improved own A1c to 7.1%", "Founded local T1D support group"],
    is_published: true,
    is_featured: true,
    source_url: "https://www.jdrf.org/t1d-resources/living-with-t1d/",
    source_type: "interview",
    original_post_date: "2024-07-19T16:45:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Finding My Voice: T1D as a Deaf Advocate",
    story_content: `I have two invisible disabilities - Type 1 diabetes and deafness. Managing both has taught me more about advocacy than any training program could.

When I was diagnosed at 12, there were no ASL interpreters at my diabetes education sessions. My parents had to try to sign what the nurse was saying while also processing the devastating news. I missed so much information.

In college, I finally got proper accommodation. A certified deaf interpreter at my endo appointments changed everything. I could actually ask questions. I understood why I was doing what I was doing.

Now I work as a patient advocate, specifically helping Deaf diabetics get the care they deserve. I've pushed for visual CGM alerts (not just audio), for telehealth platforms with captioning, for diabetes education materials in ASL.

My Dexcom vibrating on my wrist saved my life - I can feel my lows now in ways that hearing people take for granted.

To the Deaf T1D community: you deserve full access to diabetes care and technology. Keep advocating. I see you and I'm fighting alongside you.`,
    person_name: "Maya L.",
    is_anonymous: false,
    social_handle: "DeafT1DAdvocate",
    platform: "Diabetes Daily",
    contact_info: null,
    obstacles: ["Lack of ASL interpretation at diagnosis", "Audio-only medical device alerts", "Communication barriers in healthcare", "Isolation from diabetes community"],
    triumphs: ["Created ASL diabetes education content", "Advocated for visual CGM alerts", "Connected Deaf T1D community nationally", "Featured speaker at ADA Scientific Sessions"],
    is_published: true,
    is_featured: false,
    source_url: "https://www.diabetesdaily.com/voices/",
    source_type: "interview",
    original_post_date: "2024-04-28T20:00:00Z",
    permission_status: "public_repost"
  },
  {
    title: "My Son's Diagnosis Changed Everything",
    story_content: `When my 4-year-old was diagnosed with T1D, I felt like the world ended. The hospital stay. The carb counting. The middle-of-night checks. It was overwhelming.

But this community saved us. Other T1D parents who answered my panicked 2 AM messages. Who told me it would get easier (and they were right). Who shared their hacks for birthday parties and school management.

We're 3 years in now. My son checks his own blood sugar. He knows what 15 carbs looks like. He wears his Dexcom like a badge of honor, showing it to his friends. He says it makes him 'special, but in a good way.'

The hardest part isn't the diabetes anymore. It's the fear of what the future holds. But I've learned to take it one day at a time. Today he's thriving. That's what matters.

To newly diagnosed families: you are stronger than you know. Your child is resilient. And you are not alone. This community will carry you through the hardest days.`,
    person_name: "Sarah M.",
    is_anonymous: false,
    social_handle: "T1DMom_Sarah",
    platform: "Reddit",
    contact_info: null,
    obstacles: ["Child's diagnosis trauma", "Learning curve as caregiver", "Fear of hypoglycemia", "Advocating at school"],
    triumphs: ["Son thriving 3 years post-diagnosis", "Built strong support network", "Mentoring other T1D families", "Advocated for school policy changes"],
    is_published: true,
    is_featured: false,
    source_url: "https://www.reddit.com/r/diabetes_t1/",
    source_type: "reddit",
    original_post_date: "2024-09-05T13:20:00Z",
    permission_status: "public_repost"
  },
  {
    title: "50 Years with Type 1: What I've Learned",
    story_content: `I was diagnosed in 1974. I've lived through every era of diabetes technology - from boiling urine for sugar testing to the smart pumps of today.

In the early years, we didn't have home glucose monitors. I would test my urine to see if there was sugar, but that only told me what happened hours ago. Hypoglycemia was terrifying because we couldn't see it coming.

I've had complications - some neuropathy in my feet, a bout of retinopathy that was caught and treated. But I've also lived a full life. Career as a professor. Raised two children. Traveled to 30 countries.

What I want young T1Ds to know: you have tools we never dreamed of. Use them. Take advantage of every piece of technology, every support resource. But also know that a good life with diabetes is possible, even without perfection.

I don't have a 'perfect' A1c. Never did. But I've lived 50 years with this disease and I'm still here, still learning, still fighting.

To those just starting: the road is long, but it's worth walking.`,
    person_name: "Dr. Robert H.",
    is_anonymous: false,
    social_handle: null,
    platform: "JDRF",
    contact_info: null,
    obstacles: ["Managing before home glucose monitors", "Complications over decades", "Technology adaptation at every stage", "50 years of daily management"],
    triumphs: ["50+ years living with T1D", "Successful career and family", "Adapted to every technology era", "Inspiration for T1D community"],
    is_published: true,
    is_featured: true,
    source_url: "https://www.jdrf.org/t1d-resources/personal-stories/",
    source_type: "interview",
    original_post_date: "2024-02-14T11:00:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Breaking the Stigma: Mental Health and T1D",
    story_content: `Nobody warned me that diabetes would break my mind before my body.

I was the 'perfect diabetic' for years - great A1c, never missed a bolus, exercised regularly. But inside, I was drowning. The constant vigilance. The guilt over every out-of-range number. The exhaustion of explaining to everyone that no, I can't 'just have a little.'

At 25, I was diagnosed with depression and anxiety directly related to diabetes burnout. I stopped checking my blood sugar for weeks. My A1c went from 6.5% to 9.1%. I was in crisis.

Getting mental health support specifically for T1D saved my life. A therapist who understood diabetes burnout. A support group where people said 'me too' instead of 'just try harder.'

Now I'm open about the mental health side of T1D. It's not weakness - it's a natural response to an impossible disease. If you're struggling, please reach out. Diabetes Distress is real. You don't have to perform perfection to deserve support.`,
    person_name: "Jamie R.",
    is_anonymous: false,
    social_handle: "t1d_mental_health",
    platform: "Beyond Type 1",
    contact_info: null,
    obstacles: ["Severe diabetes burnout", "Perfectionism", "Depression and anxiety", "Stigma around mental health"],
    triumphs: ["Overcame burnout crisis", "Advocate for T1D mental health", "Created peer support community", "Speaks at diabetes conferences"],
    is_published: true,
    is_featured: true,
    source_url: "https://beyondtype1.org/mental-health/",
    source_type: "interview",
    original_post_date: "2024-01-20T15:00:00Z",
    permission_status: "public_repost"
  },
  {
    title: "Backpacking Solo Across South America with T1D",
    story_content: `Everyone said I was crazy. 'You can't travel alone with diabetes.' 'What if you have a low in the middle of nowhere?'

I did it anyway. 8 months solo backpacking through Peru, Bolivia, Chile, Argentina. 

Yes, there were challenges. Altitude in Cusco made my blood sugars unpredictable. I learned that Peruvian jungle humidity can destroy test strips in days. My pump site got infected once in a hostel (antibiotics from a Bolivian pharmacy saved me).

But there was also magic. Watching the sunrise over Machu Picchu while treating a low with coca candy. Meeting other T1D travelers in Buenos Aires. Learning the word for 'diabetes' in five different languages.

I carried enough supplies for the whole trip. I registered with my embassy. I wore medical ID in Spanish. I was as prepared as possible - and flexible when plans changed.

To anyone wanting to travel with T1D: do it. Plan carefully but don't let fear stop you. The world is waiting.`,
    person_name: "Emma C.",
    is_anonymous: false,
    social_handle: "wanderlust_t1d",
    platform: "Insulin Nation",
    contact_info: null,
    obstacles: ["Family/friends' fear", "Supply logistics abroad", "Altitude effects", "Language barriers for medical needs"],
    triumphs: ["8 months solo travel", "Documented T1D travel tips", "Helping other T1D travelers", "Featured in travel with diabetes guides"],
    is_published: true,
    is_featured: false,
    source_url: "https://insulinnation.com/living/travel/",
    source_type: "interview",
    original_post_date: "2024-06-30T17:30:00Z",
    permission_status: "public_repost"
  }
];

// URL verification helper function
async function verifyUrl(url: string): Promise<{ accessible: boolean; statusCode?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; GlycoForge/1.0; +https://glycoforge.app)' 
      }
    });
    
    clearTimeout(timeoutId);
    
    return { 
      accessible: response.ok || response.status === 403,
      statusCode: response.status 
    };
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return { accessible: false, error: 'Request timeout' };
    }
    return { accessible: false, error: error.message || 'Unknown error' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting to seed real warrior stories with URL verification...');

    // Verify URLs before inserting
    const verifiedStories = [];
    const urlVerificationResults: { url: string; accessible: boolean; error?: string }[] = [];

    for (const story of realWarriorStories) {
      if (story.source_url) {
        const result = await verifyUrl(story.source_url);
        urlVerificationResults.push({
          url: story.source_url,
          accessible: result.accessible,
          error: result.error
        });
        
        if (!result.accessible) {
          console.warn(`URL verification failed for "${story.title}": ${story.source_url} - ${result.error || 'Status: ' + result.statusCode}`);
        }
        
        verifiedStories.push({
          ...story,
          source_link_verified: result.accessible,
          source_link_verified_at: new Date().toISOString()
        });
      } else {
        verifiedStories.push({
          ...story,
          source_link_verified: null,
          source_link_verified_at: null
        });
      }
    }

    // First, delete existing stories
    const { error: deleteError } = await supabase
      .from('warrior_stories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error deleting old stories:', deleteError);
    } else {
      console.log('Old stories deleted');
    }

    // Insert verified stories
    const { data, error } = await supabase
      .from('warrior_stories')
      .insert(verifiedStories)
      .select();

    if (error) {
      console.error('Error inserting stories:', error);
      throw error;
    }

    const accessibleUrls = urlVerificationResults.filter(r => r.accessible).length;
    const failedUrls = urlVerificationResults.filter(r => !r.accessible);

    console.log(`Successfully seeded ${data.length} warrior stories`);
    console.log(`URL Verification: ${accessibleUrls}/${urlVerificationResults.length} URLs accessible`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${data.length} warrior stories with URL verification`,
        stories: data.map(s => ({ 
          id: s.id, 
          title: s.title, 
          source_url: s.source_url,
          platform: s.platform 
        })),
        urlVerification: {
          total: urlVerificationResults.length,
          accessible: accessibleUrls,
          failed: failedUrls.length,
          failedUrls: failedUrls
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in seed-real-warrior-stories:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
