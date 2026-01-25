import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const historyEvents = [
  // Ancient Period
  {
    year: -1550,
    era: 'ancient',
    title: 'Ebers Papyrus Documents Diabetes',
    short_description: 'First known written documentation of diabetes symptoms in ancient Egypt',
    detailed_description: 'The Ebers Papyrus, an ancient Egyptian medical document dating to around 1550 BCE, contains the first known description of a condition matching diabetes. It describes a "medicine to drive away the passing of too much urine" - recognizing polyuria as a key symptom. The document recommends a mixture of bones, wheat, grain, grit, green lead, and earth as treatment. This papyrus is one of the oldest preserved medical documents and shows that physicians 3,500 years ago were already grappling with this mysterious disease.',
    category: 'discovery',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The Ebers Papyrus contains over 700 magical formulas and remedies',
      'Ancient Egyptians believed diabetes was caused by evil spirits',
      'The recommended "cure" was essentially useless but showed early medical observation'
    ],
    impact_score: 7
  },
  {
    year: -250,
    era: 'ancient',
    title: 'Apollonius Coins "Diabetes"',
    short_description: 'Greek physician creates the term "diabetes" meaning "to pass through"',
    detailed_description: 'Apollonius of Memphis, a Greek physician, coined the term "diabetes" around 250 BCE. The word comes from the Greek "diabainein" meaning "to pass through" or "siphon" - a reference to the excessive urination that characterizes the disease. Ancient Greek physicians observed that fluids seemed to pass through the body of diabetic patients without being retained.',
    category: 'discovery',
    sources: ['https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2606813/'],
    interesting_facts: [
      'Ancient physicians would actually taste urine to diagnose diseases',
      'The Greeks noticed diabetic patients were constantly thirsty',
      'Diabetes was considered extremely rare in ancient times'
    ],
    impact_score: 6
  },
  {
    year: 1674,
    era: 'pre-insulin',
    title: 'Thomas Willis Adds "Mellitus"',
    short_description: 'English physician discovers diabetic urine tastes sweet like honey',
    detailed_description: 'Thomas Willis, an English physician, added "mellitus" (Latin for "honey-sweet") to the name diabetes after rediscovering that the urine of diabetic patients had a sweet taste. This practice of tasting urine for diagnosis, called "water tasting," was common in medicine for centuries. Willis\'s observation helped distinguish diabetes mellitus from diabetes insipidus, another condition causing excessive urination but without the sweet urine.',
    category: 'discovery',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'Physicians would sometimes leave urine outside to see if ants were attracted to it',
      'Willis was also famous for his work on the brain and nervous system',
      'The practice of urine tasting continued into the 19th century'
    ],
    impact_score: 8
  },
  {
    year: 1776,
    era: 'pre-insulin',
    title: 'Matthew Dobson Proves Sugar in Blood',
    short_description: 'First scientific proof that sugar exists in diabetic blood and urine',
    detailed_description: 'English physician Matthew Dobson was the first to prove that the sweet taste in diabetic urine was due to sugar. He evaporated urine from diabetic patients and obtained a crystalline residue that tasted like brown sugar. He also demonstrated that the blood of diabetic patients contained elevated sugar levels. This was a crucial step in understanding diabetes as a metabolic disorder.',
    category: 'research',
    sources: ['https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2606813/'],
    interesting_facts: [
      'Dobson worked at the Liverpool Infirmary',
      'He measured blood sugar by tasting serum after letting blood clot',
      'This discovery laid groundwork for understanding diabetes as a sugar problem'
    ],
    impact_score: 8
  },
  {
    year: 1869,
    era: 'pre-insulin',
    title: 'Paul Langerhans Discovers Islets',
    short_description: 'German medical student identifies mysterious cell clusters in the pancreas',
    detailed_description: 'Paul Langerhans, a 22-year-old German medical student, discovered clusters of cells in the pancreas during his doctoral research. He had no idea what these cells did, simply noting they were different from the surrounding pancreatic tissue. These clusters would later be named "islets of Langerhans" in his honor and would prove to be the key to understanding diabetes - they produce insulin.',
    category: 'discovery',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'Langerhans made this discovery at just 22 years old',
      'He died of tuberculosis at age 41, never knowing the significance of his discovery',
      'The islets make up only 1-2% of the pancreas by weight'
    ],
    impact_score: 9
  },
  {
    year: 1889,
    era: 'pre-insulin',
    title: 'Pancreas Linked to Diabetes',
    short_description: 'Minkowski and von Mering prove removing the pancreas causes diabetes',
    detailed_description: 'German physicians Oskar Minkowski and Joseph von Mering made a crucial discovery while studying digestion. After surgically removing the pancreas from a dog, they noticed the animal began urinating frequently. A lab assistant observed that flies were attracted to the urine - it was full of sugar. This proved definitively that the pancreas was essential for preventing diabetes.',
    category: 'landmark',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The discovery was somewhat accidental - they were studying fat digestion',
      'The dog developed severe diabetes within 24 hours of surgery',
      'This experiment was the key breakthrough leading to insulin discovery'
    ],
    impact_score: 10
  },
  {
    year: 1906,
    era: 'pre-insulin',
    title: 'Jean de Meyer Names "Insulin"',
    short_description: 'Belgian researcher coins the term for the unknown pancreatic substance',
    detailed_description: 'Belgian researcher Jean de Meyer proposed the name "insuline" (from Latin "insula" meaning island) for the hypothetical substance produced by the islets of Langerhans that regulates blood sugar. Though the substance hadn\'t been isolated yet, scientists were convinced it existed. The name referred to the "islands" of cells that Langerhans had discovered.',
    category: 'discovery',
    sources: ['https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2606813/'],
    interesting_facts: [
      'The name was proposed 15 years before insulin was actually isolated',
      'Multiple researchers were racing to find this mysterious substance',
      'Early attempts to extract insulin failed because digestive enzymes destroyed it'
    ],
    impact_score: 6
  },
  {
    year: 1921,
    era: 'insulin-discovery',
    title: 'Banting & Best Isolate Insulin',
    short_description: 'The discovery that would save millions of lives',
    detailed_description: 'In the summer of 1921, Frederick Banting and Charles Best, working in J.J.R. Macleod\'s lab at the University of Toronto with biochemist James Collip, successfully isolated insulin from dog pancreases. On January 11, 1922, 14-year-old Leonard Thompson became the first human to receive insulin injections. Though the first injection caused a severe allergic reaction, a purified extract two weeks later brought his blood sugar from 520 mg/dL to 120 mg/dL. Thompson, who had been near death, would live another 13 years.',
    category: 'landmark',
    decade: '1920s',
    decade_summary: 'Before 1921, a T1D diagnosis was a death sentence within 1-2 years. The only "treatment" was starvation diets of 400-500 calories per day. Patients wasted away, becoming skeletal before dying. The discovery of insulin was like a miracle - children at death\'s door walked out of hospitals within weeks.',
    sources: ['https://www.diabetes.org/about-diabetes/history', 'https://www.nobelprize.org/prizes/medicine/1923/banting/biographical/'],
    interesting_facts: [
      'Banting sold the insulin patent for $1, believing it should be available to all',
      'Early insulin extracted from pigs required 2 tons of pig parts for 8 oz of insulin',
      'Leonard Thompson\'s initial reaction was so severe he nearly died from the treatment',
      'Eli Lilly began mass production within one year of discovery'
    ],
    impact_score: 10
  },
  {
    year: 1922,
    era: 'insulin-discovery',
    title: 'Eli Lilly Begins Insulin Production',
    short_description: 'First commercial-scale insulin manufacturing begins',
    detailed_description: 'Just one year after insulin\'s discovery, pharmaceutical company Eli Lilly began commercial production. They worked directly with the Toronto researchers to scale up purification techniques. Within a year, insulin went from a laboratory curiosity to a life-saving medication available (though expensive) to patients. Production required massive amounts of pig and cow pancreases from slaughterhouses.',
    category: 'treatment',
    decade: '1920s',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'Early insulin had to be injected multiple times daily',
      'Patients often had allergic reactions due to impurities',
      'A single dose cost about half a week\'s wages for many workers'
    ],
    impact_score: 9
  },
  {
    year: 1923,
    era: 'insulin-discovery',
    title: 'Nobel Prize Awarded for Insulin',
    short_description: 'Banting and Macleod receive medicine\'s highest honor in record time',
    detailed_description: 'Frederick Banting and J.J.R. Macleod were awarded the Nobel Prize in Physiology or Medicine - just two years after the discovery, one of the fastest Nobel recognitions ever. Banting, feeling Best had been overlooked, shared his prize money with him. Macleod shared his with Collip. The speed of the award reflected the profound impact insulin had immediately demonstrated.',
    category: 'landmark',
    decade: '1920s',
    sources: ['https://www.nobelprize.org/prizes/medicine/1923/summary/'],
    interesting_facts: [
      'Banting was furious that Best wasn\'t included in the prize',
      'This remains one of the most controversial Nobel prizes due to credit disputes',
      'Macleod was criticized for taking credit despite being away during key experiments'
    ],
    impact_score: 8
  },
  {
    year: 1936,
    era: 'insulin-discovery',
    title: 'First Long-Acting Insulin',
    short_description: 'Hagedorn develops protamine zinc insulin for fewer daily injections',
    detailed_description: 'Danish researcher Hans Christian Hagedorn developed protamine zinc insulin (PZI), the first long-acting insulin formulation. By combining insulin with protamine (a protein from fish sperm) and zinc, he created a form that was absorbed more slowly, lasting up to 24 hours. This meant patients could reduce from 4-6 daily injections to just 1-2.',
    category: 'treatment',
    decade: '1930s',
    decade_summary: 'The 1930s saw insulin become more widely available, though still expensive. Patients used glass syringes that had to be boiled for sterilization. Needles were reused until dull. Blood sugar testing was done by boiling urine with Benedict\'s solution. Life expectancy for T1D patients improved dramatically.',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'PZI came from fish sperm proteins',
      'This formulation is the ancestor of modern NPH insulin',
      'The Hagedorn lab became Novo Nordisk, now a major insulin manufacturer'
    ],
    impact_score: 8
  },
  {
    year: 1949,
    era: 'mid-century',
    title: 'First Urine Glucose Test Strips',
    short_description: 'Ames introduces Clinitest tablets for home urine testing',
    detailed_description: 'The Ames Company introduced Clinitest tablets, allowing patients to test their urine for glucose at home. While not as accurate as blood testing, this was revolutionary - patients could monitor themselves between doctor visits. The tablets caused a chemical reaction that changed color based on glucose levels in the urine.',
    category: 'technology',
    decade: '1940s',
    decade_summary: 'The 1940s brought World War II, which disrupted insulin supplies in Europe. Patients learned to reuse and sterilize their own supplies. Glass syringes and reusable needles were standard. Insulin doses were measured in "units" but standardization was still imperfect.',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The tablets produced a violent chemical reaction if mishandled',
      'Urine testing only showed glucose from hours earlier, not current levels',
      'Patients would collect 24-hour urine samples for testing'
    ],
    impact_score: 7
  },
  {
    year: 1959,
    era: 'mid-century',
    title: 'Type 1 and Type 2 Distinguished',
    short_description: 'Scientists finally recognize two distinct forms of diabetes',
    detailed_description: 'Researchers definitively distinguished between Type 1 (insulin-dependent) and Type 2 (non-insulin-dependent) diabetes. This was crucial because the conditions have different causes, progressions, and treatments. Type 1 was recognized as an autoimmune disease where the body destroys its own insulin-producing cells.',
    category: 'research',
    decade: '1950s',
    decade_summary: 'The 1950s brought oral diabetes medications (for Type 2) and better understanding of diabetes types. Syringes became smaller but were still glass. Patients boiled their equipment for sterilization. Long-acting insulins improved, reducing injection frequency.',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'For decades, all diabetes was treated the same way',
      'Type 1 was called "juvenile diabetes" because it often appeared in children',
      'This distinction helped researchers focus on autoimmune aspects of T1D'
    ],
    impact_score: 9
  },
  {
    year: 1969,
    era: 'mid-century',
    title: 'First Portable Glucose Meter',
    short_description: 'Ames Reflectance Meter brings blood testing out of labs',
    detailed_description: 'The Ames Reflectance Meter was the first portable blood glucose meter, though "portable" is relative - it weighed about 3 pounds and cost $650 (equivalent to over $5,000 today). It required a large blood sample and took 1-2 minutes to produce a reading. Despite these limitations, it was revolutionary for allowing blood glucose testing outside of hospitals.',
    category: 'technology',
    decade: '1960s',
    decade_summary: 'The 1960s saw the first attempts at blood glucose monitoring and early insulin pump concepts. Disposable plastic syringes were introduced, ending the era of boiling glass syringes. Patients still relied primarily on urine testing and symptoms to manage their diabetes.',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The meter was the size of a large brick',
      'It was intended for doctor\'s offices, not home use',
      'The blood sample required was about 10 times larger than modern meters'
    ],
    impact_score: 8
  },
  {
    year: 1970,
    era: 'mid-century',
    title: 'First Insulin Pump Prototype',
    short_description: 'Dr. Arnold Kadish creates the first wearable insulin delivery device',
    detailed_description: 'Dr. Arnold Kadish developed the first insulin pump prototype. It was the size of a backpack and impractical for daily use, but it proved the concept that continuous insulin delivery was possible. The pump delivered a steady "basal" rate of insulin, mimicking what a healthy pancreas does.',
    category: 'technology',
    decade: '1970s',
    decade_summary: 'The 1970s brought major advances in blood glucose monitoring and insulin delivery. Home blood glucose meters became available (though expensive). The first commercial insulin pumps appeared near the decade\'s end. Patients still used urine testing as primary monitoring.',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The pump was so large patients had to carry it in a backpack',
      'It required frequent filling and battery changes',
      'Many doctors were skeptical that pumps would ever be practical'
    ],
    impact_score: 7
  },
  {
    year: 1982,
    era: 'technology',
    title: 'First Synthetic Human Insulin',
    short_description: 'FDA approves Humulin - insulin made by genetically modified bacteria',
    detailed_description: 'The FDA approved Humulin, the first biosynthetic human insulin produced using recombinant DNA technology. Created by inserting human insulin genes into E. coli bacteria, this eliminated the need for animal pancreases. It also reduced allergic reactions since it was identical to human insulin rather than slightly different pig or cow insulin.',
    category: 'treatment',
    decade: '1980s',
    decade_summary: 'The 1980s revolutionized diabetes care. Home blood glucose monitoring became practical with smaller, faster meters. Human insulin replaced animal insulin. Insulin pens were introduced in Europe. The landmark DCCT study began, eventually proving that tight glucose control prevents complications.',
    sources: ['https://www.fda.gov/about-fda/histories-product-regulation/bringing-insulin-1982-human-insulin-market'],
    interesting_facts: [
      'This was the first genetically engineered pharmaceutical product',
      'Production could now be scaled up without relying on slaughterhouse supplies',
      'Some patients claimed they lost hypo awareness when switching from animal insulin'
    ],
    impact_score: 9
  },
  {
    year: 1986,
    era: 'technology',
    title: 'Insulin Pens Introduced',
    short_description: 'NovoPen launches in Europe, revolutionizing insulin injection',
    detailed_description: 'Novo Nordisk introduced the NovoPen in Europe, the first reusable insulin pen. Instead of drawing insulin from vials with syringes, patients could simply dial a dose and inject. Pens were more discreet, more accurate for small doses, and less intimidating than syringes. They would gradually become the dominant injection method worldwide.',
    category: 'technology',
    decade: '1980s',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'Insulin pens didn\'t reach the US market until years later',
      'The pen design made public injections less stigmatizing',
      'Modern pens can deliver doses in 0.5 or even 0.1 unit increments'
    ],
    impact_score: 8
  },
  {
    year: 1993,
    era: 'technology',
    title: 'DCCT Results Published',
    short_description: 'Landmark study proves tight control prevents complications',
    detailed_description: 'The Diabetes Control and Complications Trial (DCCT) published results proving definitively that intensive blood glucose control dramatically reduces the risk of diabetic complications. Patients with tight control had 76% less eye disease, 50% less kidney disease, and 60% less nerve damage. This changed diabetes treatment philosophy worldwide.',
    category: 'research',
    decade: '1990s',
    decade_summary: 'The 1990s brought smaller, faster glucose meters (still 30-60 seconds). Rapid-acting insulin analogs appeared. Insulin pumps became smaller and more practical. Carb counting replaced strict meal plans. The goal shifted from "surviving" to achieving near-normal blood sugars.',
    sources: ['https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2622728/'],
    interesting_facts: [
      'The study followed 1,441 patients for an average of 6.5 years',
      'Intensive control required 3-4 daily injections or a pump',
      'The study proved what many patients had suspected for years'
    ],
    impact_score: 10
  },
  {
    year: 1995,
    era: 'technology',
    title: 'The 1990s Diabetes Experience',
    short_description: 'Large meters, 60-second readings, NPH and Regular insulin',
    detailed_description: 'Living with Type 1 diabetes in the 1990s meant carrying a glucose meter the size of a cell phone (and those were big then). Test strips were expensive. Readings took 30-60 seconds. Insulin options were NPH (cloudy, unpredictable) and Regular (too slow for meals). Patients followed rigid meal schedules because insulin timing couldn\'t be adjusted. Finger prickers felt like staplers.',
    category: 'treatment',
    decade: '1990s',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The Glucometer Elite was considered "compact" at 4 inches long',
      'Patients typically tested only 2-4 times daily due to strip costs',
      'NPH insulin had a peak action that caused afternoon lows',
      'Log books were paper - and often fictional before doctor visits'
    ],
    impact_score: 7
  },
  {
    year: 1996,
    era: 'technology',
    title: 'First Rapid-Acting Insulin Analog',
    short_description: 'Humalog (lispro) allows eating without waiting 30 minutes',
    detailed_description: 'Eli Lilly received FDA approval for Humalog (insulin lispro), the first rapid-acting insulin analog. Unlike Regular insulin which required injecting 30 minutes before eating, Humalog could be taken at mealtime. The insulin\'s molecular structure was modified to make it absorb faster and clear faster, better matching natural insulin patterns.',
    category: 'treatment',
    decade: '1990s',
    sources: ['https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/insulin-lispro-marketed-humalog'],
    interesting_facts: [
      'Two amino acids are swapped compared to human insulin',
      'This made spontaneous eating possible for the first time',
      'NovoLog (aspart) and Apidra (glulisine) followed with similar designs'
    ],
    impact_score: 9
  },
  {
    year: 1999,
    era: 'digital',
    title: 'First CGM Approved',
    short_description: 'MiniMed CGMS allows continuous glucose monitoring',
    detailed_description: 'The FDA approved the first continuous glucose monitor (CGM), the MiniMed CGMS. It was a "professional" device - patients wore it for a few days, then a doctor downloaded the data. It wasn\'t real-time, but for the first time, the complete picture of glucose patterns between fingersticks could be seen. The technology showed overnight lows patients never knew they had.',
    category: 'technology',
    decade: '1990s',
    sources: ['https://www.fda.gov/medical-devices/consumer-products/continuous-glucose-monitoring-system-cgms'],
    interesting_facts: [
      'Patients couldn\'t see their own data in real-time',
      'The sensor accuracy was poor by modern standards',
      'This technology would evolve into today\'s advanced CGM systems'
    ],
    impact_score: 9
  },
  {
    year: 2004,
    era: 'digital',
    title: 'Dexcom Launches First CGM',
    short_description: 'Real-time continuous glucose monitoring becomes available',
    detailed_description: 'Dexcom received FDA approval for its first real-time CGM system. Unlike the MiniMed professional system, patients could see their glucose levels and trends continuously throughout the day. This was revolutionary - for the first time, people with diabetes could watch their blood sugar rise and fall in real-time, not just see snapshots from fingersticks.',
    category: 'technology',
    decade: '2000s',
    decade_summary: 'The 2000s brought CGM, smaller pumps, faster meters (5-second readings!), and long-acting insulin analogs like Lantus. Carb counting with insulin-to-carb ratios became standard. Email and early smartphones let patients share data with doctors. Quality of life improved dramatically.',
    sources: ['https://www.dexcom.com/about-dexcom'],
    interesting_facts: [
      'Early Dexcom sensors lasted only 3 days',
      'The receiver was a separate device to carry',
      'Accuracy improved dramatically with each generation'
    ],
    impact_score: 9
  },
  {
    year: 2006,
    era: 'digital',
    title: 'First Pump with CGM Integration',
    short_description: 'Medtronic Paradigm REAL-Time combines pump and sensor data',
    detailed_description: 'Medtronic introduced the Paradigm REAL-Time system, the first insulin pump to display CGM data directly on the pump screen. While the pump couldn\'t yet automatically adjust insulin based on CGM readings, having both devices communicate was a major step toward the "artificial pancreas" dream.',
    category: 'technology',
    decade: '2000s',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'The pump displayed CGM data but couldn\'t act on it automatically',
      'This was called "sensor-augmented pump therapy"',
      'Many patients found watching their glucose all day stressful at first'
    ],
    impact_score: 8
  },
  {
    year: 2016,
    era: 'digital',
    title: 'First Hybrid Closed Loop System',
    short_description: 'Medtronic 670G automates basal insulin delivery',
    detailed_description: 'The FDA approved the Medtronic 670G, the first hybrid closed-loop insulin delivery system. Using CGM data, the pump automatically adjusts basal insulin every 5 minutes to keep glucose in range. Users still bolus for meals, hence "hybrid." This was the first commercially available "artificial pancreas" system.',
    category: 'technology',
    decade: '2010s',
    decade_summary: 'The 2010s transformed diabetes technology. CGMs became accurate enough to replace fingersticks. Flash glucose monitoring (FreeStyle Libre) made scanning popular. Hybrid closed loops automated insulin delivery. Smartphones integrated with diabetes devices. DIY "looping" communities built their own artificial pancreas systems.',
    sources: ['https://www.fda.gov/news-events/press-announcements/fda-approves-first-automated-insulin-delivery-device-type-1-diabetes'],
    interesting_facts: [
      'The system requires calibration fingersticks twice daily',
      'It aims for a glucose target of 120 mg/dL',
      'FDA called it a "milestone" in diabetes technology'
    ],
    impact_score: 10
  },
  {
    year: 2017,
    era: 'digital',
    title: 'DIY Loop Systems Gain Popularity',
    short_description: 'Open-source "looping" community creates alternative AID systems',
    detailed_description: 'The #WeAreNotWaiting movement gained momentum with DIY artificial pancreas systems like Loop, OpenAPS, and AndroidAPS. Frustrated with slow FDA approval processes, tech-savvy patients built their own closed-loop systems using old Medtronic pumps and CGM data. Thousands of patients worldwide began "looping" before commercial systems were widely available.',
    category: 'technology',
    decade: '2010s',
    sources: ['https://openaps.org/', 'https://loopkit.github.io/loopdocs/'],
    interesting_facts: [
      'DIY systems are not FDA approved but widely used',
      'The community openly shares code and support',
      'Some studies show DIY systems outperform commercial ones',
      'Many commercial systems later adopted algorithms similar to DIY versions'
    ],
    impact_score: 8
  },
  {
    year: 2021,
    era: 'digital',
    title: 'Interoperable AID Components Approved',
    short_description: 'FDA clears individual AID components to work together',
    detailed_description: 'The FDA approved the first interoperable automated insulin dosing (iAID) controller, allowing patients to mix and match compatible pumps, CGMs, and control algorithms. This moved away from proprietary locked systems toward patient choice. Tidepool Loop became the first FDA-cleared app-based AID controller.',
    category: 'technology',
    decade: '2020s',
    decade_summary: 'The 2020s bring full closed-loop systems, tubeless pumps like Omnipod 5, smartphone-based control, implantable CGMs, and ever-improving algorithms. Insulin remains expensive in the US, sparking advocacy for price caps. Teplizumab offers hope for delaying T1D onset. The cure remains elusive but management has never been better.',
    sources: ['https://www.fda.gov/news-events/press-announcements/fda-clears-new-insulin-pump-and-algorithm-based-software-better-diabetes-management'],
    interesting_facts: [
      'Patients can now choose their preferred pump and CGM combinations',
      'This reflects years of patient advocacy for device interoperability',
      'More AID options mean more personalized diabetes management'
    ],
    impact_score: 8
  },
  {
    year: 2022,
    era: 'digital',
    title: 'Teplizumab Delays T1D Onset',
    short_description: 'First drug approved to delay Type 1 diabetes in high-risk individuals',
    detailed_description: 'The FDA approved Teplizumab (Tzield), the first drug shown to delay the onset of Type 1 diabetes. In clinical trials, the immunotherapy drug delayed T1D diagnosis by an average of 2-3 years in people with early-stage autoimmunity. While not a cure, it represents a major shift toward prevention rather than just treatment.',
    category: 'landmark',
    decade: '2020s',
    sources: ['https://www.fda.gov/news-events/press-announcements/fda-approves-first-drug-can-delay-onset-type-1-diabetes'],
    interesting_facts: [
      'Teplizumab is given as IV infusions over 14 days',
      'It works by modifying immune cells that attack beta cells',
      'The drug costs approximately $194,000',
      'Research continues on longer-lasting prevention strategies'
    ],
    impact_score: 9
  },
  {
    year: 2024,
    era: 'digital',
    title: 'Modern T1D Management',
    short_description: 'Closed-loop systems, CGMs, and smartphone integration become standard',
    detailed_description: 'By 2024, advanced diabetes technology has become standard care in many countries. CGMs can last 14+ days. Insulin pumps automatically adjust delivery based on predicted glucose levels. Smartphone apps control pumps and display CGM data. Many patients achieve time-in-range above 70%. Yet challenges remain: device costs, access disparities, and the continued search for a cure.',
    category: 'treatment',
    decade: '2020s',
    sources: ['https://www.diabetes.org/about-diabetes/history'],
    interesting_facts: [
      'Some CGMs no longer require fingerstick calibrations',
      'Artificial pancreas systems can predict lows 30+ minutes ahead',
      'Insulin delivery can be adjusted every 5 minutes automatically',
      'Despite advances, insulin prices in the US remain controversial'
    ],
    impact_score: 8
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Seeding ${historyEvents.length} T1D history events...`);

    // Clear existing data
    await supabase.from('t1d_history_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert all events
    const { data, error } = await supabase
      .from('t1d_history_events')
      .insert(historyEvents);

    if (error) {
      console.error('Error seeding history events:', error);
      throw error;
    }

    console.log('Successfully seeded T1D history events');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeded ${historyEvents.length} T1D history events`,
        count: historyEvents.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in seed-t1d-history:', err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
