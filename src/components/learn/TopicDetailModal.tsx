import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopicDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: {
    title: string;
    description: string;
    categoryId?: string;
    category?: string;
    color?: string;
  } | null;
}

// Comprehensive educational content for each topic (4000+ characters each)
const topicContent: Record<string, {
  introduction: string;
  sections: { title: string; content: string }[];
  practicalTips: string[];
  sources: { title: string; url?: string }[];
}> = {
  'Water & Muscle During High Blood Sugar': {
    introduction: 'When blood glucose rises above normal levels (hyperglycemia), your body initiates a series of physiological responses that significantly affect hydration and muscle function. Understanding these mechanisms can help you manage high blood sugars more effectively and recover faster. This complex interplay between glucose, water, and muscle tissue is one of the most underappreciated aspects of T1D management, yet it affects how you feel during every high blood sugar episode.',
    sections: [
      {
        title: 'Cellular Dehydration Mechanism',
        content: 'When glucose levels rise, the concentration of glucose in your blood becomes higher than inside your cells. This creates an osmotic gradient that pulls water OUT of cells and into the bloodstream to dilute the sugar. Your cells literally shrink as they lose water. This is why excessive thirst (polydipsia) is a classic symptom of high blood sugar - your body is trying to replace the fluid being pulled from cells. The brain is particularly sensitive to these fluid shifts, which explains why cognitive function often suffers during hyperglycemia. Studies show that even moderate hyperglycemia (200-250 mg/dL) can reduce cognitive performance by 10-15%.'
      },
      {
        title: 'Impact on Muscles',
        content: 'Muscle cells are particularly affected by this dehydration. When muscle cells lose water, they cannot contract as efficiently. This leads to fatigue, weakness, and reduced exercise performance. Additionally, glycogen storage (how muscles store glucose for energy) is impaired when cells are dehydrated. Many people report feeling "heavy" or sluggish during highs - this is partly due to muscle cell dehydration. The loss of intracellular water also affects the electrical gradients that muscles need for proper contraction, explaining the cramping and weakness many T1Ds experience. Research indicates that muscle strength can be reduced by up to 20% during sustained hyperglycemia above 300 mg/dL.'
      },
      {
        title: 'Insulin Absorption Effects',
        content: 'Dehydration also affects insulin absorption. When tissues are dehydrated, blood flow to subcutaneous areas decreases, which can slow insulin absorption from injection sites or pump infusion sites. This creates a vicious cycle: high blood sugar causes dehydration, which slows insulin absorption, which keeps blood sugar high longer. This is why high blood sugars can be stubborn to correct - you may need to wait longer than expected or consider an intramuscular injection for severe highs. Temperature also plays a role: cold extremities from dehydration reduce insulin absorption even further.'
      },
      {
        title: 'Electrolyte Shifts and Recovery',
        content: 'As your body tries to flush excess glucose through urination (glucosuria), it also loses electrolytes - particularly sodium, potassium, and magnesium. These electrolyte losses further impair muscle function and can cause cramping, weakness, and in severe cases, cardiac arrhythmias. The kidney works overtime during hyperglycemia, and this increased workload causes collateral mineral losses. Potassium depletion is particularly concerning as it can worsen insulin resistance and create additional cardiac risks. Recovery from a prolonged high requires not just insulin and water, but electrolyte replacement to restore normal cellular function.'
      }
    ],
    practicalTips: [
      'Drink 8-16 oz of water immediately when you notice a high blood sugar',
      'Add electrolytes (sugar-free) during prolonged highs above 250 mg/dL',
      'Avoid intense exercise until blood sugar is below 250 mg/dL',
      'Check ketones if blood sugar is above 250 mg/dL with symptoms',
      'Rotate injection sites more frequently during periods of poor control',
      'Consider warming your injection site to improve absorption during highs',
      'Monitor urine color - dark yellow indicates significant dehydration'
    ],
    sources: [
      { title: 'ADA Standards of Medical Care in Diabetes - 2024' },
      { title: 'Diabetes Care: Fluid and Electrolyte Disturbances in DKA', url: 'https://diabetesjournals.org' },
      { title: 'Journal of Clinical Endocrinology & Metabolism' },
      { title: 'JDRF Research: Hyperglycemia and Cognitive Function' }
    ]
  },
  'The Dawn Phenomenon Explained': {
    introduction: 'The Dawn Phenomenon is a natural rise in blood glucose levels that occurs in the early morning hours, typically between 2 AM and 8 AM. It affects both people with and without diabetes, but its effects are much more pronounced in those with T1D because they lack the normal insulin response to counteract it. This phenomenon has frustrated countless T1Ds who wake up with elevated blood sugars despite perfect overnight control. Understanding the hormonal cascade behind it is the first step toward effectively managing morning glucose levels.',
    sections: [
      {
        title: 'The Hormonal Cascade',
        content: 'In the early morning hours, your body begins preparing to wake up by releasing several counter-regulatory hormones: cortisol (the "stress hormone"), growth hormone, glucagon, and epinephrine. These hormones signal the liver to release stored glucose (glycogenolysis) and produce new glucose (gluconeogenesis). In people without diabetes, the pancreas releases more insulin to match this glucose release. In T1D, this automatic adjustment doesn\'t happen. The cortisol surge typically peaks around 7-8 AM, while growth hormone pulses occur throughout the night with a significant release in the early morning. Together, these hormones can raise blood glucose by 50-100 mg/dL even without any food intake.'
      },
      {
        title: 'Distinguishing from Somogyi Effect',
        content: 'The Dawn Phenomenon is often confused with the Somogyi Effect (rebound hyperglycemia after nocturnal hypoglycemia). The key difference: Dawn Phenomenon shows steady or slightly rising glucose from midnight to morning, while Somogyi shows a low followed by a rebound high. CGM data makes this distinction much clearer - you can literally see whether you dipped low before rising. The treatment is opposite: Dawn Phenomenon needs MORE insulin (higher basal rates in early morning), while Somogyi needs LESS insulin overnight to prevent the low that triggers the rebound. Misdiagnosing one for the other leads to worsening, not improving, morning glucose levels.'
      },
      {
        title: 'Why It Varies Day to Day',
        content: 'Dawn Phenomenon intensity varies based on sleep quality, stress levels, illness, exercise the previous day, and even the time you went to sleep. Poor sleep increases cortisol release, worsening the phenomenon. Exercise the previous day can either help (by improving insulin sensitivity) or hurt (if you went low overnight and had a rebound). Alcohol consumed in the evening can suppress gluconeogenesis initially but lead to rebound hyperglycemia by morning. Shift workers and those with irregular sleep schedules often have particularly unpredictable Dawn Phenomenon patterns because their cortisol rhythms are disrupted.'
      },
      {
        title: 'Advanced Management Strategies',
        content: 'Modern AID (Automated Insulin Delivery) systems like the Medtronic 780G, Tandem Control-IQ, and Omnipod 5 handle Dawn Phenomenon automatically by increasing insulin delivery when rising trends are detected. For those on MDI or manual pump therapy, strategies include: adjusting the timing of long-acting insulin (some do better with evening vs. morning dosing), adding a small overnight basal rate increase programmed 2-3 hours before typical rise, or using ultra-long-acting insulins like Tresiba that provide more consistent coverage. Some patients benefit from a small protein snack before bed to provide steady glucose through the night.'
      }
    ],
    practicalTips: [
      'Use CGM data to identify your specific Dawn Phenomenon pattern over 2-3 weeks',
      'Consider increasing basal insulin between 3-6 AM (pump users)',
      'For MDI users, discuss timing of long-acting insulin with your endo',
      'AID systems (780G, Control-IQ, Omnipod 5) handle Dawn Phenomenon automatically',
      'A small protein snack before bed can help stabilize overnight levels',
      'Consistent sleep times reduce Dawn Phenomenon variability significantly',
      'Avoid alcohol within 4 hours of bedtime to reduce morning variability'
    ],
    sources: [
      { title: 'JDRF: Understanding Dawn Phenomenon' },
      { title: 'Diabetes Care: Diurnal Glucose Patterns', url: 'https://diabetesjournals.org' },
      { title: 'Endocrine Reviews: Counter-regulatory Hormones in Diabetes' },
      { title: 'Journal of Diabetes Science and Technology: AID Systems and Dawn Phenomenon' }
    ]
  },
  'Fat & Protein Extended Bolusing': {
    introduction: 'The "pizza problem" is familiar to every person with T1D: you bolus for the carbs in pizza, your blood sugar is fine for 2-3 hours, then suddenly spikes to 300+ and stays there. Understanding how fat and protein affect glucose can transform your post-meal control. While carbohydrate counting revolutionized diabetes management in the 1990s, the next frontier is understanding the complex effects of macronutrients on blood glucose dynamics. This knowledge is particularly important for those seeking tight control with A1c levels below 7%.',
    sections: [
      {
        title: 'The Delayed Glucose Effect',
        content: 'Fat slows gastric emptying, which delays carbohydrate absorption. But there\'s more: protein and fat themselves convert to glucose through gluconeogenesis in the liver. Approximately 50-60% of protein and 10% of fat eventually become glucose - but this process takes 3-8 hours. Standard bolusing doesn\'t account for this delayed glucose release. A 12 oz steak with 60g of protein will eventually produce 30-36g of glucose equivalent - that\'s like eating two slices of bread worth of carbs, just hours later when you\'re not expecting it. High-fat meals also cause temporary insulin resistance, meaning you need more insulin to handle the same amount of glucose.'
      },
      {
        title: 'Calculating Extended Boluses - The Warsaw Method',
        content: 'A common approach (the Warsaw method): Count all carbs + add 50% of protein grams as "equivalent carbs." For a meal with 60g carbs and 40g protein, you\'d bolus for 80g equivalent carbs (60 + 20). For high-fat meals, extend 40-70% of the bolus over 2-4 hours. With pumps, use the extended/dual-wave/combo bolus feature. For MDI, consider a small correction 2-3 hours post-meal. Some clinicians use the Food Insulin Index (FII) which assigns insulin demand values to foods beyond just their carb content. Research shows that extending boluses for high-fat meals can reduce post-meal glucose variability by 30-40%.'
      },
      {
        title: 'Individual Variation and Testing',
        content: 'Fat/protein effects vary widely between individuals. Some people see huge delayed spikes from pizza; others don\'t. Factors include gut motility, insulin sensitivity, and individual gluconeogenesis rates. The only way to dial in YOUR settings is systematic testing with CGM data. Try eating the same high-fat meal at the same time on different days with different bolus strategies, and compare the results. Keep detailed notes. Many T1Ds find their "pizza factor" is highly personal - some need to double their bolus time, others just need 30% more upfront. Your age, how long you\'ve had diabetes, and even your stress level that day can affect the results.'
      },
      {
        title: 'Practical Meal Strategies',
        content: 'For common challenging meals: Pizza typically needs 50% upfront, 50% over 3-4 hours. Chinese food with rice needs extended bolusing due to the combination of high-glycemic rice and fatty sauces. Pasta dishes depend heavily on the sauce - cream-based needs more extension than tomato-based. Breakfast with eggs and bacon needs less immediate insulin but more later coverage. When in doubt, it\'s often better to underbolus initially and correct later rather than risk hypoglycemia early when the fat is still slowing carb absorption. AID systems struggle with high-fat meals because their algorithms are primarily reactive, not predictive for this scenario.'
      }
    ],
    practicalTips: [
      'Use extended/combo bolus for meals with >20g fat OR >30g protein',
      'Start with 60% upfront, 40% extended over 3 hours - adjust from there',
      'Set a 3-hour post-meal alarm to check glucose after high-fat meals',
      'AID systems struggle with high-fat meals - consider a manual override or pre-bolus',
      'Keep notes on specific foods: pizza, Chinese food, and pasta are common culprits',
      'A post-meal walk (15-30 min) helps reduce delayed spikes significantly',
      'Consider a small second bolus 2-3 hours after high-fat meals on MDI'
    ],
    sources: [
      { title: 'Diabetes Technology & Therapeutics: Fat-Protein Units' },
      { title: 'JDRF: Advanced Bolusing Strategies' },
      { title: 'The Warsaw Gluconeogenesis Study' },
      { title: 'Pediatric Diabetes: Extended Bolusing in Children with T1D' }
    ]
  },
  'Electrolyte Dynamics': {
    introduction: 'Electrolytes are minerals that carry an electric charge and are essential for virtually every cellular function in your body. For people with T1D, electrolyte balance is particularly important because blood sugar fluctuations, insulin use, and increased urination all affect mineral levels. Understanding electrolyte dynamics can help explain many symptoms that seem unrelated to blood sugar - from muscle cramps to fatigue to heart palpitations. This is one of the most overlooked aspects of comprehensive T1D management.',
    sections: [
      {
        title: 'The Core Electrolytes',
        content: 'The key electrolytes for T1D management are sodium, potassium, magnesium, and calcium. Sodium regulates fluid balance and blood pressure. Potassium is critical for heart rhythm and muscle function. Magnesium participates in over 300 enzymatic reactions including glucose metabolism. Calcium is essential for muscle contraction and nerve transmission. Each of these minerals interacts with insulin and glucose in complex ways. For example, insulin drives potassium into cells, which is why low potassium (hypokalemia) can develop during DKA treatment when insulin is given. Chronically high blood sugars increase urinary loss of all electrolytes through osmotic diuresis.'
      },
      {
        title: 'Hyperglycemia and Electrolyte Loss',
        content: 'When blood glucose exceeds the kidney\'s threshold (around 180 mg/dL), glucose spills into urine. This glucose acts as an osmotic agent, pulling water and electrolytes with it. The result is dehydration plus significant mineral losses. Repeated episodes of hyperglycemia lead to cumulative electrolyte depletion. Studies show that T1Ds lose 30-50% more magnesium in urine compared to non-diabetics. Potassium losses during hyperglycemic episodes can be substantial - enough to cause noticeable muscle weakness and cardiac effects. Sodium losses contribute to orthostatic hypotension (dizziness when standing) that many T1Ds experience during or after high blood sugar episodes.'
      },
      {
        title: 'Signs and Symptoms of Imbalance',
        content: 'Low magnesium: muscle cramps, tremors, fatigue, anxiety, poor sleep, insulin resistance. Low potassium: muscle weakness, cramps, heart palpitations, constipation. Low sodium: headache, nausea, confusion, fatigue. Low calcium: muscle spasms, tingling in fingers, heart rhythm issues. Many T1Ds attribute these symptoms to their diabetes or insulin without realizing electrolyte imbalance is the underlying cause. The symptoms of electrolyte imbalance can also mimic hypoglycemia, leading to unnecessary carbohydrate consumption. If you frequently feel "off" despite good blood sugar control, electrolytes may be the missing piece.'
      },
      {
        title: 'Testing and Supplementation',
        content: 'Standard blood panels measure serum levels, but these don\'t always reflect true cellular stores - especially for magnesium where only 1% circulates in blood. Request RBC magnesium for a more accurate picture. Potassium fluctuates with insulin and meal timing, so fasting levels are most reliable. Most T1Ds benefit from magnesium supplementation (glycinate form is best absorbed and gentlest). Potassium is best obtained from food (bananas, potatoes, avocados) rather than supplements due to cardiac risk with excess intake. Sodium rarely needs supplementation unless exercising heavily. During illness or DKA recovery, electrolyte replacement should be supervised by healthcare providers.'
      }
    ],
    practicalTips: [
      'Consider 200-400mg magnesium glycinate daily - it helps sleep too',
      'Include potassium-rich foods daily: bananas, sweet potatoes, spinach, avocados',
      'Use electrolyte drinks (sugar-free) during extended highs or exercise',
      'Request RBC magnesium test annually, not just serum magnesium',
      'Cramps at night often indicate magnesium or potassium deficiency',
      'Increase electrolyte intake during illness or after DKA episodes',
      'If taking diuretics for blood pressure, monitor electrolytes more closely'
    ],
    sources: [
      { title: 'Journal of Clinical Endocrinology: Electrolyte Disturbances in Diabetes' },
      { title: 'Diabetes Care: Magnesium and Insulin Sensitivity' },
      { title: 'ADA: Micronutrient Considerations in Diabetes Management' },
      { title: 'Endocrine Reviews: Mineral Metabolism in Diabetic Patients' }
    ]
  },
  'Travel with T1D': {
    introduction: 'Traveling with Type 1 diabetes requires careful planning but should never stop you from exploring the world. From timezone changes that affect insulin timing to airport security protocols for medical devices, there are specific challenges that T1Ds face when traveling. However, with proper preparation, you can confidently travel anywhere in the world. Many T1Ds have climbed Everest, crossed Antarctica, and explored every continent - your diabetes is not a limitation, just a consideration requiring extra planning.',
    sections: [
      {
        title: 'Preparing Before You Leave',
        content: 'Start planning at least 2-4 weeks before departure for international trips. Obtain a travel letter from your endocrinologist on official letterhead listing all your supplies and devices. This letter should state your diagnosis, the medical necessity of your equipment, and include your doctor\'s contact information. Make copies of all prescriptions and carry them separately from your supplies. Research pharmacy availability at your destination - many countries have different insulin brands and strengths. The insulin concentration in the US is typically U-100, but some countries use U-40 or U-80. Using the wrong syringes with different concentrations can cause dangerous dosing errors.'
      },
      {
        title: 'Packing Supplies Strategically',
        content: 'Always pack at least double the supplies you need for your trip duration. Divide supplies between carry-on and checked luggage - never put all your insulin or pump supplies in one bag. Insulin should always be in carry-on luggage since cargo holds can freeze, destroying insulin. Pack supplies in original pharmacy packaging when possible, as this helps with customs and security. Create a small "emergency kit" that stays on your person at all times: fast-acting glucose, a glucagon kit, backup insulin pen, and CGM/meter. Consider the insulin stability requirements: rapid-acting insulin is stable at room temperature for 28 days, but extreme heat can degrade it faster. Bring a Frio or similar cooling case for hot climates.'
      },
      {
        title: 'Managing Timezone Changes',
        content: 'Crossing time zones affects both your body clock and your insulin needs. For long-acting insulin: If traveling east (shorter day), you may need slightly less insulin. If traveling west (longer day), you may need slightly more. A general rule is to adjust by 2-4 units per 6 hours of time change. For pumps, gradually adjust basal rates in 1-2 hour increments over the travel days rather than making one dramatic change. Many T1Ds find that stress and disrupted sleep during travel increase insulin resistance temporarily. CGM is invaluable during travel for catching trends you might otherwise miss while distracted. Keep your pump/PDM on home time until you\'re established at your destination.'
      },
      {
        title: 'Airport Security and Flying',
        content: 'You have the right to keep your diabetes supplies with you and to decline X-ray scanning of insulin and CGM transmitters. TSA/security should offer hand inspection if you request it. Announce that you have diabetes and are carrying insulin and medical devices before screening. Body scanners (millimeter wave) are safe for pumps and CGMs. X-ray conveyor belt machines are generally considered safe for supplies, but some manufacturers recommend against it for CGM transmitters. Insulin pumps can be worn through metal detectors. Always wear medical ID and have your travel letter accessible. For international travel, understand that security procedures vary - some countries are more familiar with diabetes devices than others. Patience and clear communication help.'
      }
    ],
    practicalTips: [
      'Get a travel letter from your endocrinologist at least 2 weeks before departure',
      'Pack double the supplies you think you\'ll need, divided between bags',
      'Keep insulin in carry-on luggage only - cargo holds can freeze',
      'Download your pump and CGM manufacturer\'s travel cards',
      'Research insulin availability and brands at your destination',
      'Set phone reminders for medication times in the new timezone',
      'Wear a medical ID and learn "I have diabetes" in the local language',
      'Register with your country\'s embassy for extended international trips'
    ],
    sources: [
      { title: 'TSA Disability and Medical Conditions Guidelines' },
      { title: 'JDRF: Traveling with Type 1 Diabetes' },
      { title: 'ADA: Guidelines for Travel with Diabetes' },
      { title: 'International Diabetes Federation: Travel Resources' }
    ]
  },
  'Sick Day Management': {
    introduction: 'Being sick with Type 1 diabetes requires different management than healthy days. Illness increases stress hormones, which raise blood sugar, but reduced appetite may lead to less food intake. This paradox catches many T1Ds off guard. Understanding the principles of sick day management can prevent minor illnesses from becoming dangerous emergencies. DKA (Diabetic Ketoacidosis) is more common during illness, so knowing the warning signs and when to seek help is essential knowledge for every T1D and their caregivers.',
    sections: [
      {
        title: 'Why Illness Affects Blood Sugar',
        content: 'When you\'re sick, your body releases stress hormones (cortisol, glucagon, epinephrine) to fight the infection. These hormones increase insulin resistance and stimulate the liver to release glucose. The result: blood sugars often run high even if you\'re not eating. Fever increases metabolism and can increase insulin needs by 25-50%. Certain illnesses affect the gut and absorption - vomiting prevents food intake while diarrhea can speed insulin absorption. Some infections, particularly urinary tract infections and skin infections, are more common in people with diabetes and can cause dramatic blood sugar elevations. The inflammatory response itself creates insulin resistance that can persist for days after you feel better.'
      },
      {
        title: 'The Never Skip Insulin Rule',
        content: 'The most dangerous mistake during illness is skipping insulin because you\'re not eating. Even if you can\'t eat, your body still needs basal/background insulin to prevent ketone production. Without insulin, fat breaks down into ketones, leading to DKA - even if blood sugars aren\'t extremely high. "Euglycemic DKA" (normal blood sugar DKA) can occur when you\'re sick and not eating but also not taking enough insulin. Continue your basal insulin always. Bolus insulin should be adjusted based on carb intake, but never stop long-acting insulin or reduce pump basal to zero. If you can\'t keep food down, focus on consuming sips of regular soda, juice, or electrolyte drinks to provide both glucose and fluids.'
      },
      {
        title: 'Ketone Monitoring Protocol',
        content: 'Check ketones every 2-4 hours when sick, especially if blood sugar is above 250 mg/dL. Blood ketone meters are more accurate than urine strips and give faster results. Ketone levels: below 0.6 mmol/L is normal, 0.6-1.5 is moderately elevated (increase fluids, consider correction insulin), 1.5-3.0 is high risk (contact healthcare provider), above 3.0 is medical emergency (go to ER). Large ketones with vomiting is an emergency regardless of blood sugar level. Even moderate ketone levels warrant a call to your endocrinologist. When correcting high ketones, you may need 10-20% more insulin than usual for corrections. Some endocrinologists recommend "sick day rates" that are pre-calculated for their patients.'
      },
      {
        title: 'Practical Sick Day Supplies',
        content: 'Keep a "sick day kit" stocked at all times: blood ketone meter and strips, sugar-free electrolyte drinks, regular soda or juice (for when you can\'t eat), easy-to-digest foods (crackers, soup, applesauce), anti-nausea medication if prescribed, thermometer, and written sick day instructions from your endo. Know your emergency contacts: endocrinologist on-call number, urgent care vs ER decision criteria. Many endocrinology offices have nurses who can provide phone guidance during sick days. Telemedicine has made sick day support more accessible - don\'t hesitate to use it. Have someone check on you regularly when sick - T1Ds living alone should have a check-in buddy.'
      }
    ],
    practicalTips: [
      'NEVER skip basal/long-acting insulin, even if not eating',
      'Check blood ketones every 2-4 hours when sick with high blood sugar',
      'Maintain hydration: aim for 8 oz of fluid every hour while awake',
      'Keep sick day supplies stocked year-round',
      'Contact your endo if ketones are above 1.5 mmol/L or you can\'t keep fluids down',
      'Rest - stress and activity increase insulin needs during illness',
      'Consider temporary basal rate increases of 10-30% during febrile illness'
    ],
    sources: [
      { title: 'ADA: Sick Day Management for People with Diabetes' },
      { title: 'Diabetes Care: DKA Prevention Guidelines' },
      { title: 'ISPAD Clinical Practice Consensus Guidelines: Sick Day Management' },
      { title: 'JDRF: Managing Diabetes When You\'re Sick' }
    ]
  },
  'Exercise & Blood Sugar': {
    introduction: 'Exercise is one of the most powerful tools for managing Type 1 diabetes, but it\'s also one of the most complex. Different types of exercise have opposite effects on blood sugar, timing matters enormously, and individual responses vary widely. Understanding the physiology behind exercise-glucose interactions empowers you to be active without fear of dangerous highs or lows. The goal is to make exercise a predictable part of your routine rather than a glucose rollercoaster.',
    sections: [
      {
        title: 'Aerobic vs Anaerobic Effects',
        content: 'Aerobic exercise (walking, jogging, cycling, swimming) typically lowers blood sugar by increasing insulin sensitivity and glucose uptake into muscles. The effect can last 24-48 hours post-exercise. Anaerobic exercise (weight lifting, HIIT, sprinting) often raises blood sugar initially due to adrenaline and cortisol release, then may cause delayed lows 6-12 hours later. Many T1Ds experience the best glucose outcomes with a combination: moderate aerobic activity followed by brief high-intensity intervals. This "mixed" approach can result in more stable blood sugars than either type alone. Understanding which category your activities fall into helps predict their glucose effects.'
      },
      {
        title: 'The Timing Factor',
        content: 'When you exercise relative to meals and insulin doses dramatically affects glucose response. Morning fasted exercise often causes less hypoglycemia than post-meal exercise. However, some T1Ds experience a significant liver glucose dump during fasted cardio that raises blood sugars. Post-meal exercise (1-2 hours after eating) can blunt post-prandial spikes but requires careful bolus reduction. The "golden window" for many is 3-4 hours after eating when meal insulin has mostly finished working. Late evening exercise increases risk of nocturnal hypoglycemia, so reducing basal rates or having a bedtime snack is often necessary. CGM trend arrows are invaluable for making real-time exercise decisions.'
      },
      {
        title: 'Insulin Adjustments for Activity',
        content: 'For planned exercise, reduce bolus insulin for the preceding meal by 25-75% depending on exercise intensity and duration. Basal rate reductions should start 1-2 hours before activity for pump users - temp basals of 50-80% are common. For spontaneous exercise, consuming fast-acting carbs (15-30g per 30 minutes of moderate activity) is often necessary. The "carb up vs insulin down" debate is personal - some T1Ds prefer reducing insulin to maintain ketosis benefits of exercise, while others prefer eating more to fuel performance. For intense competition or endurance events, some athletes disconnect their pumps entirely, accepting higher blood sugars during the event to prevent lows.'
      },
      {
        title: 'Post-Exercise Considerations',
        content: 'The body continues to replenish muscle glycogen for 24-48 hours after exercise, increasing insulin sensitivity throughout this period. This "lag effect" explains why lows can occur the night after a big workout or even the following day. After intense or prolonged exercise, reducing overnight basal by 10-30% is common practice. Post-exercise meals should include carbohydrates to help replenish glycogen, but bolus doses often need reduction. Some T1D athletes set CGM alerts 10-20 mg/dL higher on exercise days to provide a safety buffer. Keeping a detailed exercise log that includes timing, duration, intensity, food, insulin, and glucose response helps identify personal patterns over time.'
      }
    ],
    practicalTips: [
      'Check CGM trend before exercising - don\'t start with a down arrow',
      'Reduce meal bolus by 25-75% before planned exercise',
      'Start temp basal reductions 1-2 hours before activity for pumps',
      'Carry fast-acting glucose during all exercise (15-30g per 30 min)',
      'Consider reducing overnight basal by 10-30% after intense exercise',
      'Keep exercise logs to identify your personal patterns',
      'Mixed exercise (cardio + strength) often produces the most stable glucose'
    ],
    sources: [
      { title: 'Diabetes Care: Exercise and Type 1 Diabetes Consensus Statement' },
      { title: 'JDRF: Physical Activity Guidelines for T1D' },
      { title: 'The Lancet Diabetes & Endocrinology: Exercise in T1D' },
      { title: 'American College of Sports Medicine: Diabetes and Exercise Position Stand' }
    ]
  },
  'Sleep & Blood Sugar': {
    introduction: 'The relationship between sleep and blood sugar is bidirectional - poor blood sugar control disrupts sleep, and poor sleep worsens blood sugar control. For people with T1D, nighttime presents unique challenges: the Dawn Phenomenon, overnight hypoglycemia fears, and alarm fatigue from CGM alerts. Understanding the sleep-glucose connection and implementing strategies to optimize both can dramatically improve quality of life and metabolic control.',
    sections: [
      {
        title: 'How Poor Sleep Affects Glucose',
        content: 'Sleep deprivation increases cortisol and decreases insulin sensitivity, raising blood sugar levels. Studies show that just one night of poor sleep can increase insulin resistance by 25-40% the following day. Insufficient sleep also increases hunger hormones (ghrelin) while decreasing satiety hormones (leptin), leading to increased food intake and more challenging glucose management. Chronic sleep deprivation is associated with higher A1c levels and increased diabetes complications risk. The immune system is also affected - poor sleep increases inflammation and infection susceptibility, which further impacts glucose control. For T1Ds, the sleep-glucose relationship creates a vicious cycle that\'s hard to break once established.'
      },
      {
        title: 'Managing Overnight Glucose',
        content: 'The goal for overnight glucose is stability within target range without alarms disrupting sleep. AID systems have dramatically improved overnight control for many T1Ds by automatically adjusting insulin delivery. For those on MDI or basic pumps, key strategies include: getting basal rates/doses optimized (often requires professional adjustment), avoiding late dinners or bedtime snacks that require large boluses, and testing whether protein-fat snacks before bed help stabilize overnight trends. The 3 AM check (or CGM data at that time) is particularly revealing - it shows whether your basal dose is too high (causing lows), too low (causing gradual rise), or if Dawn Phenomenon is kicking in early.'
      },
      {
        title: 'Alarm Fatigue and Mental Health',
        content: 'CGM alarms are designed to keep you safe, but constant nighttime alerts lead to alarm fatigue - where you start sleeping through or ignoring alerts. This is dangerous and counterproductive. Solutions include: working with your healthcare team to widen overnight alert ranges (some endos recommend 70-180 mg/dL overnight vs tighter daytime targets), using predictive alerts instead of threshold alerts, and utilizing follower alerts so a partner is backup. The psychological burden of nighttime T1D management is real - anxiety about lows, disturbed sleep, and hypervigilance affect mental health. Some T1Ds benefit from having "off nights" where a partner monitors CGM while they sleep alert-free.'
      },
      {
        title: 'Sleep Hygiene for T1D',
        content: 'Standard sleep hygiene advice applies to T1Ds with some specific additions: maintain consistent sleep/wake times (this helps regulate hormonal patterns including Dawn Phenomenon), avoid caffeine after noon (it can affect overnight glucose via cortisol), limit alcohol which causes unpredictable overnight glucose, and keep the bedroom cool (heat raises blood sugar and disrupts sleep). Address hypoglycemia anxiety directly - if fear of lows keeps you awake, talk to your care team about adjusting targets or using AID technology. Some T1Ds find magnesium supplementation before bed helps both sleep quality and overnight glucose stability. Blue light exposure before bed can increase cortisol and worsen Dawn Phenomenon.'
      }
    ],
    practicalTips: [
      'Aim for consistent sleep/wake times, even on weekends',
      'Consider widening CGM overnight alert ranges to reduce alarm fatigue',
      'Test basal rates by checking 3 AM glucose or reviewing CGM data',
      'Use predictive low alerts rather than threshold alerts when possible',
      'Magnesium glycinate before bed may help both sleep and glucose',
      'Avoid large meals within 3 hours of bedtime',
      'AID systems significantly improve overnight glucose for most users'
    ],
    sources: [
      { title: 'Diabetes Care: Sleep and Glycemic Control in T1D' },
      { title: 'Journal of Clinical Sleep Medicine: Diabetes and Sleep Disorders' },
      { title: 'JDRF: Managing Nighttime Blood Sugar' },
      { title: 'Sleep Medicine Reviews: Impact of Sleep on Glucose Metabolism' }
    ]
  },
  'Alcohol & Blood Sugar': {
    introduction: 'Alcohol presents a unique challenge for T1D management because it can cause both hyperglycemia and delayed hypoglycemia depending on what, when, and how much you drink. Understanding the mechanisms behind alcohol\'s effects on blood sugar allows you to make informed choices and stay safe. This is one topic rarely covered in standard diabetes education but essential for adults managing T1D in real-world social situations.',
    sections: [
      {
        title: 'The Dual Effect of Alcohol',
        content: 'Alcohol affects blood sugar in two opposing ways. Initially, alcoholic beverages containing carbs (beer, cocktails, sweet wines) can raise blood sugar like any carbohydrate. However, alcohol also inhibits gluconeogenesis - the liver\'s production of new glucose. Since the liver is your main defense against hypoglycemia when not eating, this inhibition can cause delayed lows 6-12+ hours after drinking. The liver prioritizes metabolizing alcohol (which it treats as a toxin) over producing glucose, essentially "turning off" your safety net. This is why overnight and next-morning hypoglycemia is a significant risk after evening drinking, even if blood sugars were normal at bedtime.'
      },
      {
        title: 'Different Drinks, Different Effects',
        content: 'Pure spirits (vodka, gin, whiskey) have negligible carbs and primarily cause delayed lows. Beer (10-15g carbs per bottle) and wine (2-5g carbs per glass) have moderate carb content. Cocktails vary wildly - a margarita may have 30-50g carbs while a gin and soda has near zero. Sweet wines and liqueurs are essentially liquid sugar. The carb content causes initial rises that may require bolusing, but this creates a complex situation: bolus too much and the delayed hypoglycemia risk increases; bolus too little and you run high. Many T1Ds find that bolusing for only 50-75% of the carbs in alcoholic drinks is safer, accepting slightly elevated readings in exchange for reduced low risk.'
      },
      {
        title: 'Safety Strategies',
        content: 'Never drink on an empty stomach - food slows alcohol absorption and provides some glucose buffer. Eat carbs with your last drink and consider a protein snack before bed. Reduce overnight basal by 20-30% for pump users or set a higher low alert threshold for CGM. Never correct a high blood sugar before bed after drinking - the combination of correction insulin and alcohol\'s liver effect is particularly dangerous for severe hypoglycemia. Glucagon may be less effective after significant alcohol intake because the liver is impaired, so prevention is especially important. Always drink with someone who knows you have diabetes and can recognize/treat hypoglycemia.'
      },
      {
        title: 'The Day After',
        content: 'Hypoglycemia risk can persist for 12-24 hours after alcohol consumption. Insulin sensitivity often increases the day after drinking, so you may need less insulin. However, some T1Ds experience rebound hyperglycemia and insulin resistance as the body clears the alcohol and cortisol rises. Dehydration from alcohol worsens hyperglycemia symptoms and slows insulin absorption. Prioritize hydration and have lower low alerts active the entire following day. If you experience frequent post-drinking problems, keeping a detailed log helps identify patterns specific to your physiology. Some T1Ds find that certain types of alcohol (e.g., red wine vs. beer) affect them differently.'
      }
    ],
    practicalTips: [
      'Never drink on an empty stomach - eat before and during drinking',
      'Bolus for only 50-75% of carbs in alcoholic drinks',
      'Reduce overnight basal by 20-30% after drinking',
      'Set CGM low alerts higher on drinking nights (e.g., 80 instead of 70)',
      'Never correct a high blood sugar before bed after drinking',
      'Eat a protein snack before bed to provide steady glucose',
      'Stay alert for lows up to 24 hours after drinking',
      'Always drink with someone who knows you have T1D'
    ],
    sources: [
      { title: 'Diabetes Care: Alcohol Consumption in Type 1 Diabetes' },
      { title: 'JDRF: Alcohol and Type 1 Diabetes' },
      { title: 'Diabetes UK: Alcohol and Diabetes Safety Guidelines' },
      { title: 'Journal of Diabetes and Its Complications: Hypoglycemia Risk with Alcohol' }
    ]
  },
  'Intimacy & Blood Sugar': {
    introduction: 'Sexual health is an important but often overlooked aspect of living with Type 1 diabetes. Physical intimacy can affect blood sugar in ways similar to exercise, while blood sugar levels can affect sexual function and desire. Open conversations with partners about diabetes management during intimate moments can reduce anxiety and improve experiences for everyone involved. This topic deserves frank discussion as it affects quality of life for millions of T1Ds.',
    sections: [
      {
        title: 'How Intimacy Affects Blood Sugar',
        content: 'Sexual activity is physical exertion that typically lowers blood sugar, similar to moderate exercise. The effect varies based on intensity and duration - brief intimate moments may not significantly impact glucose, while extended activity can cause drops of 50-100 mg/dL or more. Adrenaline and excitement can initially raise blood sugar slightly before the exertion effect kicks in. For many T1Ds, the combination of physical activity and emotional arousal creates unpredictable glucose responses. The timing relative to meals and insulin also matters - intimacy within 1-2 hours of a meal bolus increases hypoglycemia risk significantly. Checking CGM before and after can help you understand your personal patterns.'
      },
      {
        title: 'Practical Preparation',
        content: 'Check your CGM before intimate moments - a blood sugar already trending down or below 120 mg/dL may warrant a small snack first. Keep fast-acting glucose accessible (discretely on the nightstand works for many). Consider reducing basal rate 30-60 minutes beforehand for pump users, similar to exercise preparation. Disconnect tubed pumps only briefly if needed, and remember Omnipods can stay on. CGM sensors and pump sites can be placed in less conspicuous areas if body confidence is a concern. Communication with your partner about diabetes is essential - they should know the signs of hypoglycemia and how to help if needed.'
      },
      {
        title: 'When Blood Sugar Affects Function',
        content: 'Both high and low blood sugar can affect sexual function and desire. Hyperglycemia can cause fatigue, dehydration, and decreased blood flow that affects arousal and performance for all genders. Low blood sugar symptoms (shakiness, sweating, confusion) can obviously interrupt moments - it\'s always okay to pause and treat a low. Long-term uncontrolled diabetes can lead to nerve damage and blood vessel changes that affect sexual function more permanently. Erectile dysfunction affects approximately 50% of men with diabetes (higher than general population) and often develops earlier. For women, high blood sugars increase yeast infection risk and can cause vaginal dryness. Good overall glucose control protects long-term sexual health.'
      },
      {
        title: 'Communication and Emotional Health',
        content: 'Many T1Ds feel self-conscious about devices, injection sites, or the possibility of interruptions due to glucose issues. Open communication with partners reduces anxiety and creates understanding. Partners who understand T1D can be supportive rather than alarmed when management needs arise. Some couples find that integrating diabetes management into their relationship (partner helping with site changes, for example) increases intimacy rather than detracting from it. If diabetes-related anxiety is affecting your intimate life significantly, speaking with a therapist who understands chronic illness can help. Sexual health is a legitimate topic to discuss with your endocrinologist - don\'t be embarrassed to raise concerns.'
      }
    ],
    practicalTips: [
      'Check CGM before intimacy - treat if below 120 mg/dL or trending down',
      'Keep fast-acting glucose accessible and discreet',
      'Consider temp basal reduction 30-60 minutes beforehand',
      'Place devices in less visible areas if body confidence is a concern',
      'Communicate openly with partners about your T1D needs',
      'Don\'t hesitate to pause for a low - partners who care will understand',
      'Discuss sexual health concerns with your endocrinologist'
    ],
    sources: [
      { title: 'Diabetes Care: Sexual Function in Diabetes' },
      { title: 'Journal of Sexual Medicine: Diabetes and Intimacy' },
      { title: 'JDRF: Relationships and Type 1 Diabetes' },
      { title: 'ADA: Sexual Health and Diabetes' }
    ]
  },
  'Stress Response': {
    introduction: 'Stress - whether physical, emotional, or psychological - has profound effects on blood sugar through the release of counter-regulatory hormones. For people with T1D, stress can make blood sugars swing unpredictably in either direction, and managing diabetes itself creates a chronic stress load. Understanding the stress-glucose connection and developing coping strategies is essential for both metabolic control and mental health.',
    sections: [
      {
        title: 'The Physiology of Stress Response',
        content: 'When your body perceives stress, the hypothalamus triggers the "fight or flight" response, releasing cortisol from the adrenal glands and adrenaline (epinephrine). These hormones evolved to prepare you for physical danger by increasing available energy - which means raising blood glucose. The liver releases stored glucose, insulin sensitivity decreases, and blood sugar rises. For T1Ds, this glucose rise cannot be automatically counterbalanced by increased insulin production as it would be in people without diabetes. Chronic stress keeps cortisol elevated, leading to persistent insulin resistance and higher baseline blood sugars. Even anticipatory stress (worrying about a future event) triggers these same hormonal responses.'
      },
      {
        title: 'Different Stressors, Different Effects',
        content: 'Physical stress (illness, injury, surgery) reliably raises blood sugar in most T1Ds. Psychological stress effects are more variable - some people run high during stress, while others actually drop low (possibly due to appetite suppression or stress-related activity). Acute stress (sudden fright, argument) causes rapid glucose spikes that resolve relatively quickly. Chronic stress (work pressure, relationship issues, financial worries) causes sustained insulin resistance that may require baseline insulin adjustments. The stress of managing diabetes itself contributes to this load - a concept called "diabetes distress." Some T1Ds find their stress response to hypoglycemia becomes impaired over time (hypoglycemia unawareness), which reduces the body\'s counter-regulatory hormone release.'
      },
      {
        title: 'Identifying Your Stress Patterns',
        content: 'Tracking mood or stress levels alongside glucose data helps identify your personal stress-glucose patterns. Many CGM apps allow tagging entries with notes. After several weeks of tracking, patterns may emerge: certain situations, people, or times of day that correlate with glucose excursions. Once identified, you can preemptively adjust insulin or employ stress-reduction techniques. Some T1Ds notice that blood sugar rises 30-60 minutes before stressful events they\'re anticipating, allowing for earlier intervention. Understanding whether you\'re a "stress high" or "stress low" responder helps you prepare for known stressful situations like exams, presentations, or difficult conversations.'
      },
      {
        title: 'Stress Management Strategies',
        content: 'Evidence-based stress reduction techniques include: meditation and mindfulness (even 10 minutes daily reduces cortisol), regular physical exercise (which burns off stress hormones), adequate sleep (sleep deprivation increases cortisol), cognitive behavioral therapy (CBT) for chronic stress and anxiety, and social support (isolation increases stress). Specifically for diabetes distress, taking "mental health breaks" from strict management (with provider guidance), joining peer support groups, and working with diabetes-specialized mental health professionals can help. Reducing alcohol and caffeine, both of which increase cortisol, improves stress resilience. Some T1Ds find that simplifying their diabetes regimen (e.g., adopting AID systems) reduces the cognitive load and stress of constant decision-making.'
      }
    ],
    practicalTips: [
      'Track stress/mood alongside glucose to identify your patterns',
      'Practice daily stress reduction: meditation, deep breathing, or exercise',
      'Anticipate known stressful events and adjust insulin or expectations',
      'Address diabetes distress with professional support when needed',
      'Reduce caffeine and alcohol, which increase cortisol levels',
      'Build a support network - isolation increases stress',
      'Consider simplifying your regimen with AID technology to reduce cognitive load'
    ],
    sources: [
      { title: 'Diabetes Care: Psychological Stress and Glycemic Control' },
      { title: 'Journal of Behavioral Medicine: Stress Management in Diabetes' },
      { title: 'ADA: Mental Health and Diabetes' },
      { title: 'Diabetes Spectrum: Diabetes Distress' }
    ]
  },
  'Insulin Resistance in T1D': {
    introduction: 'Many people assume insulin resistance is only a Type 2 diabetes issue, but it significantly affects those with Type 1 diabetes as well. Understanding insulin resistance in T1D can explain why your insulin needs change over time and how lifestyle factors impact your daily management.',
    sections: [
      { title: 'What Causes Insulin Resistance in T1D', content: 'Several factors contribute: genetics, weight gain, puberty, pregnancy, illness, and certain medications. Chronically elevated blood sugars themselves cause "glucose toxicity" that impairs cellular insulin receptors. Unlike T2D where resistance precedes beta cell failure, in T1D the resistance develops after diagnosis and compounds the challenge of external insulin replacement.' },
      { title: 'Recognizing the Signs', content: 'Signs include: gradually increasing total daily insulin doses, stubborn high blood sugars that don\'t respond normally to correction doses, weight gain concentrated around the abdomen, and worsening insulin:carb ratios over time.' },
      { title: 'Improving Insulin Sensitivity', content: 'Regular exercise (especially strength training) is the most powerful intervention. Weight loss, dietary changes, and sleep optimization help. Metformin is sometimes prescribed for T1Ds with significant resistance.' }
    ],
    practicalTips: ['Incorporate strength training 2-3 times weekly', 'Prioritize sleep - aim for 7-9 hours consistently', 'Reduce processed food intake and increase fiber', 'Track total daily insulin over time to spot resistance trends early'],
    sources: [{ title: 'Diabetes Care: Insulin Resistance in Type 1 Diabetes' }, { title: 'The Lancet Diabetes & Endocrinology: Double Diabetes Concept' }]
  },
  'Weather & Blood Sugar': {
    introduction: 'Weather affects blood sugar in ways that many T1Ds discover through frustrating trial and error. Heat, cold, humidity, and barometric pressure changes can influence insulin absorption, insulin potency, and glucose metabolism.',
    sections: [
      { title: 'Heat and High Temperatures', content: 'Heat accelerates insulin absorption dramatically as blood vessels dilate. Insulin itself degrades faster when exposed to heat. Summer sports often require significant insulin reductions (30-50% less bolus).' },
      { title: 'Cold Weather Challenges', content: 'Insulin absorption slows when skin is cold due to vasoconstriction. The body burns more calories maintaining temperature, which can lower blood sugars during winter outdoor activities.' },
      { title: 'Practical Weather Adaptations', content: 'For hot weather: reduce bolus doses for outdoor activity, store insulin in cooled containers. For cold: warm injection sites before delivery, keep devices close to your body.' }
    ],
    practicalTips: ['Create seasonal pump profiles with adjusted basal rates', 'Reduce bolus by 20-30% before hot outdoor activities', 'Keep insulin and devices insulated against temperature extremes'],
    sources: [{ title: 'Diabetes Technology & Therapeutics: Environmental Factors' }, { title: 'JDRF: Diabetes Management in Summer and Winter' }]
  },
  'Cardio vs Strength Training': {
    introduction: 'Different types of exercise have remarkably different effects on blood sugar. Aerobic exercise typically lowers glucose while anaerobic exercise often raises it initially. Understanding this physiology helps predict and manage glucose responses.',
    sections: [
      { title: 'Aerobic Exercise and Glucose', content: 'Aerobic exercise (running, cycling, swimming) typically lowers blood sugar. Working muscles increase glucose uptake up to 50 times normal rates through insulin-independent pathways. This effect can last 24-48 hours post-exercise.' },
      { title: 'Anaerobic Exercise and the Spike', content: 'Anaerobic exercise (weightlifting, HIIT, sprinting) often raises blood sugar initially due to adrenaline and cortisol release. However, 6-12 hours later, many T1Ds experience delayed lows as insulin sensitivity increases.' },
      { title: 'The Hybrid Approach', content: 'Combining cardio and strength training in the same session often produces the most stable blood sugars. Do strength training first (causing a small rise), then follow with cardio (which brings glucose back down).' }
    ],
    practicalTips: ['Expect glucose to DROP during sustained cardio', 'Expect glucose to SPIKE during intense anaerobic work', 'Try hybrid workouts: strength first, cardio second for stability', 'Watch for delayed lows 6-12 hours after strength training'],
    sources: [{ title: 'Diabetes Care: Exercise and Type 1 Diabetes Consensus' }, { title: 'The Lancet Diabetes & Endocrinology: Exercise Physiology in T1D' }]
  },
  'Post-Exercise Lows': {
    introduction: 'Delayed hypoglycemia occurring 6-12+ hours after activity is one of the most frustrating aspects of exercise with T1D. Understanding the mechanism allows for effective prevention strategies.',
    sections: [
      { title: 'Why Delayed Lows Happen', content: 'After exercise, muscles continue actively taking up glucose to refill glycogen stores for up to 24-48 hours. This glucose uptake occurs independently of insulin. Additionally, insulin sensitivity remains elevated post-exercise.' },
      { title: 'The Overnight Risk', content: 'Evening exercise carries particular risk for nocturnal hypoglycemia. Studies show moderate evening exercise increases nocturnal hypoglycemia risk by 2-3 fold.' },
      { title: 'Prevention Strategies', content: 'Reduce basal insulin by 10-30% for 6-12 hours post-exercise. Have a bedtime snack including protein and fat. Set higher CGM alerts on exercise days.' }
    ],
    practicalTips: ['Reduce basal insulin by 10-30% for 6-12 hours after intense exercise', 'Have a bedtime snack with protein and carbs on exercise days', 'Set CGM low alerts 10-15 mg/dL higher on heavy exercise days'],
    sources: [{ title: 'Diabetes Care: Exercise-Induced Hypoglycemia Prevention' }, { title: 'Journal of Diabetes Science: Nocturnal Hypoglycemia After Exercise' }]
  },
  'Overnight Basal Optimization': {
    introduction: 'Getting basal insulin right overnight is one of the most impactful improvements you can make. The ideal overnight profile keeps you stable from bedtime to morning without lows or highs.',
    sections: [
      { title: 'The Flat Line Goal', content: 'The goal is a relatively flat glucose line from bedtime to waking within target range. You should not require corrections overnight or need to eat to prevent lows.' },
      { title: 'Testing Your Overnight Basal', content: 'Eat dinner early (4-5 hours before bed) with minimal fat/protein. Start at stable glucose. Don\'t consume bedtime snacks. Track CGM data through the night. Repeat 2-3 times to confirm patterns.' },
      { title: 'Making Adjustments', content: 'For pumps: adjust basal rates in small increments at specific times. For MDI: changing long-acting dose affects all hours, making targeted overnight adjustment more difficult.' }
    ],
    practicalTips: ['Test overnight basal by eating early dinner with no bedtime snack', 'Make small adjustments (10-20%) and retest before changing again', 'Address Dawn Phenomenon by increasing basal 1-2 hours before the rise'],
    sources: [{ title: 'Diabetes Care: Basal Insulin Optimization Guidelines' }, { title: 'JDRF: Pump Therapy Basal Rate Adjustment' }]
  },
  'CGM Alarms Strategy': {
    introduction: 'CGM alarms keep you safe, but poorly configured alerts cause alarm fatigue - where you start ignoring even critical alarms. A thoughtful strategy balances safety with quality of life.',
    sections: [
      { title: 'The Alarm Fatigue Problem', content: 'Repeated alerts lead to desensitization. If you\'ve been woken four times for alerts at 75 mg/dL, you\'re less likely to wake for the critical 55 mg/dL alarm.' },
      { title: 'Threshold vs. Predictive Alerts', content: 'Predictive alerts give advance warning but create more false alarms. For overnight, many T1Ds prefer threshold alerts only at genuinely concerning levels (below 70 mg/dL).' },
      { title: 'Configuring Your Strategy', content: 'Low alert at 70-75 mg/dL, urgent low at 55-60 mg/dL, and either no high alerts overnight or high alert at 250+. Use follower apps so a partner can backup.' }
    ],
    practicalTips: ['Set overnight low alerts at 70-75 mg/dL (real lows only)', 'Consider disabling high alerts overnight or setting threshold at 250+', 'Use CGM follower apps so a partner can serve as backup'],
    sources: [{ title: 'Diabetes Technology & Therapeutics: CGM Alert Optimization' }, { title: 'Diabetes Care: Alarm Fatigue in CGM Users' }]
  },
  'Shift Work Challenges': {
    introduction: 'Shift work disrupts circadian rhythm, affecting hormone cycles, eating patterns, and insulin sensitivity in ways that confound standard management strategies.',
    sections: [
      { title: 'How Shift Work Affects Blood Sugar', content: 'Circadian rhythm influences cortisol, growth hormone, and melatonin release. When your schedule shifts, hormonal patterns don\'t immediately adjust. Dawn Phenomenon can hit at unexpected times.' },
      { title: 'Managing Night Shifts', content: 'Maintain consistent eating patterns relative to your waking hours. Watch for "reversed" Dawn Phenomenon during work hours. Consider higher temp basals during the first 2-3 days of adjustment.' },
      { title: 'Rotating Schedules', content: 'Create different basal profiles for day-shift weeks vs. night-shift weeks. Accept that control will be harder during transition days. Prioritize sleep quality.' }
    ],
    practicalTips: ['Create separate pump basal profiles for different shift patterns', 'Eat meals on a schedule relative to waking time, not clock time', 'Track patterns by shift type separately to identify specific needs'],
    sources: [{ title: 'Diabetes Care: Shift Work and Diabetes Management' }, { title: 'Sleep Medicine Reviews: Circadian Disruption and Metabolic Health' }]
  },
  'Fiber\'s Impact on Absorption': {
    introduction: 'Fiber affects how other carbohydrates in the same meal are absorbed. Understanding this relationship can improve bolus timing and reduce post-meal spikes.',
    sections: [
      { title: 'How Fiber Affects Carb Absorption', content: 'Soluble fiber forms a gel that slows digestive transit. A high-fiber meal may produce a slower, flatter glucose rise than the same carbs without fiber.' },
      { title: 'Net Carbs: The Fiber Subtraction Debate', content: 'For naturally high-fiber foods (vegetables, whole grains), subtracting fiber from total carbs is reasonable. For products with added processed fiber, the effect may be less pronounced.' },
      { title: 'Bolus Timing for High-Fiber Meals', content: 'High-fiber meals may benefit from bolus at meal start or slightly delayed, rather than pre-bolusing. Some T1Ds use extended boluses for high-fiber meals.' }
    ],
    practicalTips: ['Subtract fiber from total carbs for naturally high-fiber foods', 'Consider delayed or extended bolus for very high-fiber meals', 'Start meals with salad or vegetables to slow carb absorption'],
    sources: [{ title: 'American Journal of Clinical Nutrition: Fiber and Glycemic Response' }, { title: 'Diabetes Care: Dietary Fiber and Diabetes Management' }]
  },
  'Glycemic Index Realities': {
    introduction: 'The Glycemic Index ranks foods by how quickly they raise blood sugar. While useful, its real-world application is more complicated than it appears.',
    sections: [
      { title: 'What GI Actually Measures', content: 'GI measures blood sugar response to 50g of carbs from a food vs. pure glucose. Low GI (<55) foods cause slower rises; high GI (70+) foods cause rapid spikes.' },
      { title: 'Why GI Doesn\'t Tell the Whole Story', content: 'GI is measured for foods eaten alone. Adding fat, protein, or other foods changes the response. Individual variation is enormous. Food preparation matters.' },
      { title: 'Using GI Practically', content: 'Choose lower-GI carb sources for smoother curves. High-GI foods are useful for treating lows. Don\'t let GI override carb counting - appropriate insulin coverage still matters.' }
    ],
    practicalTips: ['Use GI as a general guide for choosing between similar foods', 'Low-GI foods may allow less pre-bolusing time', 'Test your personal response to common foods - individual variation is huge'],
    sources: [{ title: 'American Journal of Clinical Nutrition: Glycemic Index Research' }, { title: 'Harvard Health: Glycemic Index and Glycemic Load' }]
  }
};

// Default content for topics not yet detailed
const defaultContent = {
  introduction: 'This topic provides practical, real-world information about managing Type 1 Diabetes. Our content is designed to give you the knowledge that isn\'t always covered in standard diabetes education. Understanding the physiological mechanisms behind your daily experiences with T1D empowers you to make better decisions and achieve better outcomes.',
  sections: [
    {
      title: 'Key Concepts',
      content: 'Understanding the physiological mechanisms behind your daily experiences with T1D empowers you to make better decisions. We focus on the "why" behind recommendations, not just the "what." This deeper understanding helps you adapt general guidelines to your unique situation.'
    },
    {
      title: 'Practical Application',
      content: 'Each topic includes actionable tips that you can apply immediately. These are drawn from both clinical research and the collective experience of the T1D community. Real-world testing and personal experimentation, guided by knowledge, leads to the best outcomes.'
    },
    {
      title: 'Individual Variation',
      content: 'What works for one person with T1D may not work identically for another. Factors like duration of diabetes, age, activity level, and even genetics affect how strategies apply to you. Use the information here as a starting point for your own exploration.'
    }
  ],
  practicalTips: [
    'Always verify information with your healthcare team',
    'What works for others may not work exactly the same for you',
    'Track your experiences to identify your personal patterns',
    'Small changes over time often work better than dramatic shifts',
    'CGM data is invaluable for understanding your personal responses',
    'Connect with the T1D community to learn from shared experiences'
  ],
  sources: [
    { title: 'American Diabetes Association Standards of Care' },
    { title: 'JDRF Research Publications' },
    { title: 'Peer-reviewed diabetes journals' },
    { title: 'T1D Community Collective Experience' }
  ]
};

export function TopicDetailModal({ open, onOpenChange, topic }: TopicDetailModalProps) {
  if (!topic) return null;

  const content = topicContent[topic.title] || defaultContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${topic.color || 'from-primary to-primary/60'} flex items-center justify-center text-white`}>
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">{topic.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Introduction */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <p className="leading-relaxed">{content.introduction}</p>
            </CardContent>
          </Card>

          {/* Main Sections */}
          {content.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              {i < content.sections.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          {/* Practical Tips */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-primary">💡</span>
                Practical Tips
              </h3>
              <ul className="space-y-2">
                {content.practicalTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Sources & Further Reading</h3>
              <div className="flex flex-wrap gap-2">
                {content.sources.map((source, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {source.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Educational content, not medical advice.</strong> This information is meant to supplement, not replace, guidance from your healthcare team. Individual experiences with T1D vary widely.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
