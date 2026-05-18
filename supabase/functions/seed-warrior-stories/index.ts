import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { guardSeedFunction } from "../_shared/seedGuard.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }



  const seedGuard = await guardSeedFunction(req);
  if (seedGuard) return seedGuard;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if data already exists
    const { count } = await supabase
      .from("warrior_stories")
      .select("*", { count: "exact", head: true });

    if (count && count > 5) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Warrior stories already seeded (${count} records exist)`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const warriorStories = [
      {
        person_name: "Marcus Chen",
        title: "From Fear to Fearless: Running Ultramarathons with T1D",
        story_content: `When I was diagnosed with Type 1 diabetes at age 8, my world felt like it was ending. My parents were terrified, and the doctors gave us a long list of things I "couldn't" do anymore. Sports were supposed to be "carefully monitored." Adventures were out of the question.

But at 16, I discovered running. Not just jogging—I mean really running. My first 5K turned into a 10K, then a half marathon. Each finish line proved the doctors' limitations wrong.

At 28, I ran my first ultramarathon—a 50-mile race through the Cascades. My Dexcom beeped warnings at mile 32. I treated with gels, adjusted my basal, and kept moving. That finish line meant more than any medal.

Today, I've completed 12 ultramarathons. My CGM is my copilot. My insulin is my fuel. T1D isn't a limitation—it's taught me to listen to my body better than any non-diabetic athlete ever could.`,
        obstacles: ["Fear of exercise-induced hypoglycemia", "Endurance nutrition management", "Overcoming medical stigma about physical limits"],
        triumphs: ["Completed 12 ultramarathons", "Became a certified diabetes sports coach", "Founded a running group for T1D athletes"],
        is_anonymous: false,
        is_featured: true,
        is_published: true,
        platform: null,
        social_handle: null,
      },
      {
        person_name: "Sarah Thompson",
        title: "Late Diagnosis: Finding Myself After LADA at 22",
        story_content: `At 22, I was a senior in college when I started losing weight rapidly. "Great!" I thought. My doctor agreed—must be stress and my new gym routine. For six months, I was treated for Type 2 diabetes with oral medications that did nothing.

By the time I was correctly diagnosed with LADA (Latent Autoimmune Diabetes in Adults), I was in DKA with a blood sugar of 680. I woke up in the ICU with an insulin drip and a new identity.

The hardest part wasn't the needles or the counting or the devices. It was the grief. Grieving the body that had betrayed me. Grieving the simplicity of eating without math. Grieving the version of myself who never had to think about staying alive.

But grief transformed into purpose. Now I run a support group for adult-onset T1D. I've spoken at three JDRF events. I write a blog that's helped thousands of late-diagnosed diabetics feel less alone.

Type 1 found me late, but it didn't find me weak.`,
        obstacles: ["Misdiagnosis as Type 2 for 6 months", "DKA hospitalization", "College graduation delayed", "Mental health challenges post-diagnosis"],
        triumphs: ["Founded adult-onset T1D support group", "JDRF advocate and speaker", "Completed psychology degree focused on chronic illness"],
        is_anonymous: false,
        is_featured: true,
        is_published: true,
        platform: null,
        social_handle: null,
      },
      {
        person_name: null,
        title: "40 Years of T1D: Complications, Comebacks, and Counting Blessings",
        story_content: `I was diagnosed in 1985 when I was five years old. Back then, we used urine strips and pork insulin. There were no CGMs, no pumps, no hope for anything close to "normal" control.

I won't sugarcoat it: 40 years took a toll. At 35, I was diagnosed with retinopathy. At 40, neuropathy started in my feet. Every diabetes educator's warning came true.

But here's what they don't tell you about complications: they're not the end. I've had laser surgery on my eyes—and I can still see my grandchildren's faces. My feet hurt some days—but they still carry me to the park with my family.

I've been married for 20 years to someone who learned to treat my lows in her sleep. I raised two healthy kids who understand that Dad's beeping devices keep him alive. I built a career as an engineer because my early years of carb counting made me good at math.

Complications are part of my story, but they're not the whole story. I'm still here. Still fighting. Still grateful.`,
        obstacles: ["Pre-CGM era management", "Retinopathy requiring laser surgery", "Peripheral neuropathy", "Diabetes burnout periods"],
        triumphs: ["40 years of T1D survival", "Raised 2 healthy children", "30-year engineering career", "Mentor to newly diagnosed adults"],
        is_anonymous: true,
        is_featured: true,
        is_published: true,
        platform: null,
        social_handle: null,
      },
      {
        person_name: "Jordan Rivera",
        title: "Gen Z Diabetic: Thriving Through TikTok and Technology",
        story_content: `I found out I had Type 1 during finals week of 8th grade. Classic timing, right? I went from worrying about algebra tests to learning how to give myself shots in the span of a week.

High school was... complicated. I was the kid who had to leave class to check blood sugar. The kid who couldn't just grab pizza without doing math first. The kid with the weird device on their arm.

But something changed junior year. I made a TikTok about filling my Omnipod, just for fun. It got 50,000 views overnight. Suddenly, other diabetic teens were finding me. Sharing their stories. Asking questions.

Now I have 200K followers. I make content about everything from date night with diabetes to explaining CGMs to curious non-diabetics. I've partnered with diabetes tech companies and spoken at my local JDRF walk.

I'm pre-med now, planning to become an endocrinologist. Type 1 gave me my career path, my community, and my purpose.`,
        obstacles: ["Diagnosis during stressful school period", "Teenage social stigma", "Dating with diabetes", "College transition"],
        triumphs: ["Built 200K follower diabetes education platform", "JDRF youth ambassador", "Accepted to pre-med program", "Diabetes tech advocate"],
        is_anonymous: false,
        is_featured: true,
        is_published: true,
        platform: "tiktok",
        social_handle: "jordanT1D",
      },
      {
        person_name: "Dr. Patricia Okafor",
        title: "From Patient to Physician: Treating the Disease That Shaped Me",
        story_content: `I was 12 years old in Nigeria when I was diagnosed with Type 1 diabetes. In 1985 Lagos, this was practically a death sentence. Insulin was scarce. CGMs didn't exist. My family was told to prepare for the worst.

But my mother refused to accept it. She found a doctor who believed I could live. She smuggled insulin from relatives abroad. She kept me alive long enough for me to get a scholarship to study in the US.

I knew from age 14 that I wanted to be an endocrinologist. I wanted to be the doctor I needed when I was young. I wanted to tell other diabetic kids: "Look at me. I'm still here. You will be too."

I've been practicing for 20 years now. I've treated thousands of Type 1 patients. I've held hands during diagnosis. I've celebrated A1C victories. I've mourned losses.

Every patient I see is a younger version of myself. Every success story proves what my mother knew in 1985: Type 1 diabetes is not the end.`,
        obstacles: ["Diagnosed in 1985 Nigeria with limited insulin access", "Immigration challenges", "Medical school while managing T1D", "Imposter syndrome as diabetic doctor"],
        triumphs: ["Became board-certified endocrinologist", "20 years treating T1D patients", "Founded pediatric diabetes clinic", "Published research on diabetes in African populations"],
        is_anonymous: false,
        is_featured: true,
        is_published: true,
        platform: null,
        social_handle: null,
      },
      {
        person_name: "Jake Morrison",
        title: "Climbing Mountains: Literal and Metaphorical",
        story_content: `I was 16 and already obsessed with climbing when diabetes found me. My endocrinologist's first question was: "Are you still planning to climb?" When I said yes, she smiled and said, "Good. Let's figure out how."

That attitude changed everything. Instead of being told what I couldn't do, I was asked how I wanted to live. Together, we developed strategies for altitude, cold, and exertion.

At 22, I climbed my first 14er in Colorado. At 24, I tackled Rainier. At 26, I stood on the summit of Denali—20,310 feet above sea level—with my Omnipod working perfectly in -20°F temperatures.

The diabetes community often focuses on what we lose. But climbing taught me what I gained: meticulous preparation, deep body awareness, and a refusal to accept arbitrary limits.

Every mountain I climb is dedicated to every diabetic kid who was ever told to stay on the ground.`,
        obstacles: ["Cold weather insulin management", "Altitude effects on blood sugar", "Remote location diabetes care", "Equipment failures in extreme conditions"],
        triumphs: ["Summited Denali (20,310 ft)", "Completed all Colorado 14ers", "Became certified mountain guide", "Leads expeditions for diabetic climbers"],
        is_anonymous: false,
        is_featured: false,
        is_published: true,
        platform: "instagram",
        social_handle: "jakeclimbsT1D",
      },
      {
        person_name: null,
        title: "A Mother's Perspective: When Your Child Gets Diagnosed",
        story_content: `The day my daughter was diagnosed, I thought our lives were over. She was 4 years old, barely old enough to understand why Mommy was crying. I remember the hospital room, the smell of antiseptic, the nurse teaching me to draw up insulin into a syringe.

For the first year, I didn't sleep more than two hours at a stretch. I would set alarms, check her blood sugar, adjust, and try to sleep again. I became obsessed with numbers. Every high felt like failure. Every low felt like I was killing her.

But kids are resilient. My daughter adapted faster than I did. At 6, she was telling her teacher about carb counting. At 8, she was explaining CGMs to curious classmates. At 10, she started doing her own site changes.

Now she's 12. She manages her own diabetes better than I ever could. She teaches me about new Dexcom features. She reminds me when it's time to reorder supplies.

Type 1 diabetes didn't break our family. It made us stronger, more connected, more aware of how precious health really is.`,
        obstacles: ["Sleep deprivation for years", "School management challenges", "Insurance battles", "Parental guilt and anxiety"],
        triumphs: ["Daughter now self-managing at 12", "Became school diabetes policy advocate", "Started parent support group", "Both children mentally thriving"],
        is_anonymous: true,
        is_featured: false,
        is_published: true,
        platform: null,
        social_handle: null,
      },
      {
        person_name: "Tyler Washington",
        title: "Black, Diabetic, and Invisible: Fighting for Recognition",
        story_content: `When I was 19, I walked into an urgent care with a blood sugar of 450. The doctor barely looked at me before prescribing metformin for "Type 2." I was young, Black, and to him, that meant one thing.

It took three more visits—and DKA—before someone finally tested my C-peptide and antibodies. The diagnosis came back: Type 1 diabetes. The Type 2 medications I'd been taking for months had done nothing while my pancreas completed its shutdown.

The medical bias I experienced isn't rare. Black patients with Type 1 are significantly more likely to be misdiagnosed. We're invisible in a disease that's stereotyped as affecting white children.

Now I'm a health equity consultant specializing in diabetes care. I train medical students to recognize their biases. I advocate for routine antibody testing regardless of patient demographics. I refuse to let another Black diabetic go through what I did.

Type 1 diabetes doesn't discriminate. But the healthcare system does. And I'm working to change that.`,
        obstacles: ["Racial misdiagnosis bias", "DKA from delayed treatment", "Lack of representation in diabetes community", "Medical trauma"],
        triumphs: ["Health equity consultant career", "Medical school bias training programs", "Policy change advocacy", "Founded Black T1D support network"],
        is_anonymous: false,
        is_featured: true,
        is_published: true,
        platform: null,
        social_handle: null,
      },
    ];

    // Insert warrior stories
    const { error: storiesError } = await supabase
      .from("warrior_stories")
      .insert(warriorStories);

    if (storiesError) {
      console.error("Error seeding warrior stories:", storiesError);
      throw storiesError;
    }

    console.log(`Successfully seeded ${warriorStories.length} warrior stories`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${warriorStories.length} warrior stories`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in seed-warrior-stories:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
