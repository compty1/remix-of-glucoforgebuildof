import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  FlaskConical, 
  AlertTriangle, 
  Apple, 
  Clock,
  ExternalLink,
  Pill
} from 'lucide-react';

interface QoLDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    description?: string;
    prevalence?: number;
    recommended_daily_amount?: string;
    symptoms_of_deficiency?: string[];
    food_sources?: string[];
    optimal_timing?: string;
    benefits_for_t1d?: string;
    precautions?: string;
    dosage_info?: string;
    scientific_evidence_level?: string;
  } | null;
  type: 'deficiency' | 'resource';
}

// Comprehensive content for each nutrient/supplement
const detailedContent: Record<string, {
  overview: string;
  mechanism: string;
  research: { finding: string; source: string; year: number }[];
  communityTips: string[];
  interactions: string[];
  testingInfo: string;
}> = {
  'Vitamin D': {
    overview: 'Vitamin D is a fat-soluble vitamin crucial for calcium absorption, immune function, and beta cell protection. People with T1D are at significantly higher risk of deficiency due to autoimmune mechanisms and potential pancreatic involvement. Research suggests that vitamin D plays a role in modulating the immune system, which is particularly relevant given the autoimmune nature of Type 1 diabetes.',
    mechanism: 'Vitamin D receptors are present on pancreatic beta cells. The vitamin modulates immune responses and may help reduce the autoimmune attack characteristic of T1D. It also improves insulin sensitivity in peripheral tissues and supports proper calcium and phosphorus metabolism essential for bone health.',
    research: [
      { finding: 'T1D patients have 2-3x higher rates of vitamin D deficiency', source: 'Journal of Clinical Endocrinology', year: 2019 },
      { finding: 'Supplementation may improve glycemic control and reduce inflammation', source: 'Diabetes Care', year: 2020 },
      { finding: 'Adequate vitamin D associated with 30% lower risk of diabetic complications', source: 'JDRF Research', year: 2021 },
      { finding: 'Early vitamin D supplementation in infants may reduce T1D risk', source: 'TEDDY Study', year: 2022 }
    ],
    communityTips: [
      'Take with a fatty meal for better absorption',
      'Test levels every 6 months - aim for 40-60 ng/mL',
      'Many need 2000-4000 IU daily, not just 400 IU',
      'Vitamin D3 (cholecalciferol) is more effective than D2',
      'Winter months require higher supplementation in northern latitudes'
    ],
    interactions: ['May interact with certain heart medications', 'Can affect calcium levels - monitor if on calcium supplements', 'Avoid mega-doses without medical supervision'],
    testingInfo: 'Request a 25-hydroxy vitamin D blood test. Optimal range for T1D is 40-60 ng/mL, higher than the general "sufficient" cutoff of 30 ng/mL.'
  },
  'Magnesium': {
    overview: 'Magnesium is involved in over 300 enzymatic reactions including glucose metabolism and insulin action. Deficiency is common in T1D due to increased urinary excretion during hyperglycemia. Studies show nearly half of people with diabetes have suboptimal magnesium levels, contributing to a cycle of poor glucose control and further magnesium depletion.',
    mechanism: 'Magnesium is a cofactor for insulin receptor phosphorylation and glucose transporter activity. Low levels impair insulin sensitivity and may worsen glycemic control. It also plays crucial roles in muscle relaxation, nerve function, and cardiovascular health.',
    research: [
      { finding: 'Low magnesium linked to increased insulin resistance', source: 'Diabetes Research', year: 2020 },
      { finding: 'Supplementation improved HbA1c in deficient patients', source: 'Journal of Diabetes', year: 2021 },
      { finding: '48% of T1D patients have suboptimal magnesium levels', source: 'Endocrine Reviews', year: 2019 },
      { finding: 'Magnesium supplementation reduces inflammation markers', source: 'Nutrients Journal', year: 2022 }
    ],
    communityTips: [
      'Magnesium glycinate is gentle on the stomach',
      'Take before bed - helps with sleep quality',
      'If you get leg cramps at night, magnesium often helps',
      'Transdermal magnesium (Epsom salt baths) can help absorption',
      'Start with lower doses and increase gradually to avoid GI upset'
    ],
    interactions: ['Can interact with certain antibiotics', 'May affect blood pressure medications', 'Separate from other mineral supplements by 2 hours'],
    testingInfo: 'Request RBC magnesium (not just serum magnesium). Optimal range is 5.0-6.5 mg/dL. Serum levels may appear normal even with cellular deficiency.'
  },
  'Vitamin B12': {
    overview: 'Vitamin B12 is essential for nerve function and red blood cell formation. Metformin use (sometimes prescribed for T1D with insulin resistance) significantly depletes B12. Deficiency can mimic or worsen diabetic neuropathy, making proper diagnosis and treatment essential for those experiencing nerve-related symptoms.',
    mechanism: 'B12 is required for myelin synthesis - the protective sheath around nerves. Deficiency causes nerve damage that can be mistaken for diabetic neuropathy. B12 is also essential for DNA synthesis, proper red blood cell formation, and brain health.',
    research: [
      { finding: 'Metformin users have 30% higher risk of B12 deficiency', source: 'BMJ', year: 2019 },
      { finding: 'B12 supplementation improved neuropathy symptoms in deficient patients', source: 'Neurology', year: 2020 },
      { finding: 'Annual B12 testing recommended for all diabetics on metformin', source: 'ADA Guidelines', year: 2024 }
    ],
    communityTips: [
      'Sublingual B12 absorbs better than oral pills',
      'Methylcobalamin form is preferred over cyanocobalamin',
      'If on metformin, supplementation is almost always needed',
      'Check levels before attributing symptoms to diabetic neuropathy'
    ],
    interactions: ['Generally very safe', 'Can mask folate deficiency - take together', 'No known drug interactions at normal doses'],
    testingInfo: 'Test serum B12 and methylmalonic acid (MMA). MMA is a more sensitive marker of true B12 status. Optimal B12 is above 500 pg/mL.'
  },
  'Zinc': {
    overview: 'Zinc is essential for insulin synthesis, storage, and secretion. It also plays a critical role in immune function and wound healing - both areas of concern for people with T1D. Research indicates that zinc deficiency is more common in people with diabetes and can contribute to impaired glucose metabolism and delayed healing.',
    mechanism: 'Zinc forms a complex with insulin in beta cells, creating crystalline structures necessary for proper insulin storage and release. It also functions as an antioxidant and is crucial for over 100 enzyme systems including those involved in carbohydrate metabolism and wound healing.',
    research: [
      { finding: 'Zinc supplementation improved glycemic control in diabetics', source: 'Diabetes Care', year: 2020 },
      { finding: 'Zinc deficiency associated with increased infection risk', source: 'Journal of Immunology', year: 2021 },
      { finding: 'Zinc helps protect beta cells from oxidative stress', source: 'Free Radical Biology', year: 2019 }
    ],
    communityTips: [
      'Take zinc with food to prevent nausea',
      'Zinc picolinate and zinc citrate are well-absorbed forms',
      'Don\'t exceed 40mg daily without medical supervision',
      'Take zinc separately from iron and calcium supplements',
      'Cold and flu zinc lozenges can be helpful for T1Ds'
    ],
    interactions: ['Can reduce absorption of certain antibiotics', 'High doses can deplete copper - consider combination supplement', 'May interact with diuretics'],
    testingInfo: 'Plasma zinc test is standard. Optimal range is 70-100 mcg/dL. Hair mineral analysis can provide additional insights into zinc status.'
  },
  'Omega-3 Fatty Acids': {
    overview: 'Omega-3 fatty acids (EPA and DHA) are essential fats with powerful anti-inflammatory properties. For people with T1D, omega-3s may help reduce cardiovascular risk factors, support brain health, and reduce inflammation associated with diabetes complications. They cannot be produced by the body and must be obtained from diet or supplements.',
    mechanism: 'Omega-3s incorporate into cell membranes, improving flexibility and signaling. They reduce production of inflammatory cytokines, lower triglycerides, and support endothelial function. EPA and DHA also play important roles in brain function and may help prevent diabetic neuropathy.',
    research: [
      { finding: 'Omega-3 supplementation reduced cardiovascular risk markers', source: 'Circulation', year: 2021 },
      { finding: 'EPA/DHA improved nerve function in diabetic neuropathy', source: 'Diabetes Care', year: 2020 },
      { finding: 'Anti-inflammatory effects may protect against diabetes complications', source: 'Diabetologia', year: 2022 }
    ],
    communityTips: [
      'Look for supplements with at least 1000mg combined EPA/DHA',
      'Choose purified fish oil or algae-based for vegetarians',
      'Store fish oil in the refrigerator to prevent rancidity',
      'Take with food containing fat for better absorption',
      'Fishy burps? Try enteric-coated capsules or freeze them'
    ],
    interactions: ['Can increase bleeding risk with blood thinners', 'May affect blood sugar levels - monitor closely when starting', 'High doses may lower blood pressure'],
    testingInfo: 'Omega-3 index test measures EPA+DHA in red blood cell membranes. Optimal is 8-12%. Most Americans are below 4%.'
  },
  'Alpha-Lipoic Acid': {
    overview: 'Alpha-lipoic acid (ALA) is a powerful antioxidant that has shown particular promise for diabetic neuropathy. Unlike most antioxidants, ALA is both water and fat-soluble, allowing it to work throughout the body. It\'s used medically in Europe for diabetic nerve pain and has strong research support.',
    mechanism: 'ALA neutralizes free radicals in both aqueous and lipid environments. It regenerates other antioxidants including vitamins C, E, and glutathione. In nerve tissue, it improves blood flow and protects against oxidative damage that causes neuropathy.',
    research: [
      { finding: 'ALA significantly reduced neuropathic pain symptoms', source: 'Diabetes Care', year: 2019 },
      { finding: '600mg daily improved nerve conduction velocity', source: 'Journal of Diabetes', year: 2020 },
      { finding: 'European prescription use for diabetic neuropathy shows effectiveness', source: 'Diabetic Medicine', year: 2021 }
    ],
    communityTips: [
      'Standard dose is 600mg daily for neuropathy',
      'R-lipoic acid is the natural, more potent form',
      'Take on an empty stomach for best absorption',
      'Benefits may take 3-5 weeks to become noticeable',
      'Can help with post-meal blood sugar spikes for some people'
    ],
    interactions: ['May enhance effects of diabetes medications - monitor blood sugar', 'Can lower thyroid hormone levels in some people', 'Take separately from minerals as it may chelate them'],
    testingInfo: 'No standard blood test for ALA. Effectiveness is typically assessed by symptom improvement (neuropathy pain scores, nerve conduction studies).'
  },
  'CoQ10 (Coenzyme Q10)': {
    overview: 'CoQ10 is essential for cellular energy production and acts as a powerful antioxidant. People with diabetes often have lower CoQ10 levels, and supplementation may help with energy, heart health, and blood sugar control. It\'s particularly important for those taking statin medications, which deplete CoQ10.',
    mechanism: 'CoQ10 is a component of the mitochondrial electron transport chain, essential for ATP (energy) production. It also protects cell membranes from oxidative damage and helps regenerate other antioxidants like vitamin E. In pancreatic cells, it supports insulin secretion.',
    research: [
      { finding: 'CoQ10 supplementation improved glycemic control and lipid profiles', source: 'European Journal of Nutrition', year: 2020 },
      { finding: 'Reduced oxidative stress markers in diabetic patients', source: 'Antioxidants Journal', year: 2021 },
      { finding: 'Statin users with diabetes particularly benefit from CoQ10', source: 'Heart Journal', year: 2022 }
    ],
    communityTips: [
      'Ubiquinol is the active, better-absorbed form (vs ubiquinone)',
      'Take with food containing fat for absorption',
      'Typical dose is 100-200mg daily',
      'Essential if taking statin medications',
      'May take 4-8 weeks to notice energy improvements'
    ],
    interactions: ['May reduce effectiveness of blood thinners', 'Can lower blood pressure - monitor if on BP meds', 'May reduce blood sugar - adjust diabetes medications as needed'],
    testingInfo: 'Blood CoQ10 test available but not routinely ordered. Levels below 0.5 mcg/mL suggest deficiency. Target is 2-3 mcg/mL with supplementation.'
  },
  'Chromium': {
    overview: 'Chromium is a trace mineral that enhances insulin action and may help improve glucose metabolism. While research results are mixed, some people with diabetes report improved blood sugar control with chromium supplementation. It\'s particularly studied for its role in insulin sensitivity.',
    mechanism: 'Chromium potentiates insulin action by enhancing insulin receptor signaling. It may increase the number of insulin receptors and improve their sensitivity. Chromium also plays a role in carbohydrate, fat, and protein metabolism.',
    research: [
      { finding: 'Chromium picolinate showed modest improvements in HbA1c', source: 'Diabetes Technology', year: 2019 },
      { finding: 'May be most beneficial for those with chromium deficiency', source: 'Nutrition Research', year: 2020 },
      { finding: 'Combined with biotin shows enhanced glucose benefits', source: 'Journal of Nutrition', year: 2021 }
    ],
    communityTips: [
      'Chromium picolinate is the most studied and absorbed form',
      'Typical dose is 200-1000 mcg daily',
      'May take several months to see effects',
      'Often combined with biotin for enhanced effects',
      'Food sources include broccoli, whole grains, and beef'
    ],
    interactions: ['Can enhance effects of diabetes medications', 'NSAIDs may reduce chromium absorption', 'Antacids can decrease chromium absorption'],
    testingInfo: 'Serum chromium test available but not highly reliable. Hair mineral analysis may provide better long-term status assessment.'
  },
  'Probiotics': {
    overview: 'The gut microbiome plays a significant role in immune function and metabolic health. For people with T1D, an autoimmune condition, gut health is particularly relevant. Probiotics may help modulate immune responses, reduce inflammation, and potentially improve glucose metabolism through gut-brain-pancreas connections.',
    mechanism: 'Probiotics influence gut barrier integrity, reducing "leaky gut" that allows inflammatory compounds into the bloodstream. They produce short-chain fatty acids that improve insulin sensitivity. They also modulate the immune system, potentially reducing autoimmune activity.',
    research: [
      { finding: 'Specific probiotic strains reduced inflammation in T1D', source: 'Gut Microbes', year: 2021 },
      { finding: 'Gut microbiome differences observed before T1D onset', source: 'TEDDY Study', year: 2020 },
      { finding: 'Probiotics may support glycemic control through multiple pathways', source: 'Diabetes Care', year: 2022 }
    ],
    communityTips: [
      'Look for strains specifically studied for metabolic health',
      'Multi-strain formulas often work better than single strains',
      'Start with lower doses to avoid GI upset',
      'Refrigerated probiotics often have better viability',
      'Consider fermented foods as natural probiotic sources'
    ],
    interactions: ['Generally safe but start slowly', 'Immunocompromised individuals should consult doctor first', 'Antibiotics will reduce probiotic effectiveness'],
    testingInfo: 'Comprehensive stool testing can assess gut microbiome diversity. Look for tests measuring specific beneficial and pathogenic bacteria ratios.'
  },
  'Vitamin C': {
    overview: 'Vitamin C is a water-soluble antioxidant that may help reduce oxidative stress associated with high blood sugar levels. People with diabetes often have lower vitamin C levels and higher requirements. It also supports immune function and collagen synthesis for wound healing.',
    mechanism: 'Vitamin C scavenges free radicals produced during hyperglycemia. It supports immune cell function and may help reduce the severity of infections. Vitamin C is also essential for collagen synthesis, supporting skin integrity and wound healing in diabetes.',
    research: [
      { finding: 'Vitamin C supplementation reduced oxidative stress markers', source: 'Antioxidants Research', year: 2020 },
      { finding: 'May help reduce duration of common colds in diabetics', source: 'Nutrients', year: 2021 },
      { finding: 'Higher intake associated with lower diabetes complication risk', source: 'Diabetes Care', year: 2019 }
    ],
    communityTips: [
      'High doses (500-1000mg) may benefit during illness',
      'Buffered vitamin C is gentler on the stomach',
      'Spread doses throughout the day for better absorption',
      'Food sources include citrus, peppers, and berries',
      'Liposomal vitamin C has better bioavailability'
    ],
    interactions: ['High doses may affect blood sugar readings on some meters', 'Can increase iron absorption - be cautious with hemochromatosis', 'May interact with certain chemotherapy drugs'],
    testingInfo: 'Serum vitamin C test available. Optimal levels are 0.7-2.0 mg/dL. Levels below 0.2 mg/dL indicate significant deficiency.'
  },
  'N-Acetyl Cysteine (NAC)': {
    overview: 'NAC is a precursor to glutathione, the body\'s master antioxidant. For people with T1D, NAC may help protect beta cells from oxidative damage, support liver function, and reduce inflammation. It\'s also used to break up mucus and support respiratory health, which can be important during illness.',
    mechanism: 'NAC donates cysteine for glutathione synthesis, enhancing the body\'s antioxidant capacity. It has direct antioxidant properties and can chelate heavy metals. NAC also modulates glutamate, which may affect insulin secretion and brain health.',
    research: [
      { finding: 'NAC protected beta cells from glucotoxicity in cell studies', source: 'Biochemical Pharmacology', year: 2019 },
      { finding: 'Improved insulin sensitivity and reduced inflammation markers', source: 'Journal of Clinical Medicine', year: 2020 },
      { finding: 'NAC supplementation improved liver enzyme levels in diabetics', source: 'Hepatology Research', year: 2021 }
    ],
    communityTips: [
      'Standard dose is 600-1200mg daily, divided into 2 doses',
      'Take on an empty stomach for best absorption',
      'NAC has a sulfur smell - that\'s normal',
      'Consider during cold/flu season for respiratory support',
      'Pairs well with vitamin C for enhanced antioxidant effects'
    ],
    interactions: ['May interact with nitroglycerin - avoid combining', 'Can enhance effects of blood thinners', 'May affect activated charcoal absorption'],
    testingInfo: 'Direct NAC testing not standard. Glutathione levels can be measured via blood test. Liver enzymes (ALT, AST) can show indirect benefits.'
  },
  'Berberine': {
    overview: 'Berberine is a plant compound with potent effects on glucose metabolism. Studies show it may be as effective as metformin for blood sugar control in some cases. For T1D, it may help with insulin sensitivity and reduce post-meal spikes, though insulin remains essential.',
    mechanism: 'Berberine activates AMPK (adenosine monophosphate-activated protein kinase), a master metabolic regulator. This improves glucose uptake, reduces glucose production in the liver, and enhances insulin sensitivity. It also positively affects the gut microbiome.',
    research: [
      { finding: 'Berberine reduced HbA1c comparably to metformin in Type 2 studies', source: 'Metabolism Journal', year: 2020 },
      { finding: 'Improved gut microbiome composition and reduced inflammation', source: 'Gut Microbes', year: 2021 },
      { finding: 'May enhance insulin sensitivity independent of insulin secretion', source: 'Diabetes Research', year: 2022 }
    ],
    communityTips: [
      'Standard dose is 500mg 2-3 times daily with meals',
      'Start low to avoid GI upset - increase gradually',
      'Effects are dose-dependent - consistency matters',
      'May help reduce post-meal blood sugar spikes',
      'Consider cycling on/off (8 weeks on, 2 weeks off)'
    ],
    interactions: ['Strong effect on blood sugar - monitor closely and adjust insulin', 'Can inhibit drug metabolism - check with pharmacist', 'May lower blood pressure'],
    testingInfo: 'No direct berberine test. Monitor blood glucose, HbA1c, and lipid panel to assess effectiveness. Liver function tests recommended during use.'
  },
  'Cinnamon (Ceylon)': {
    overview: 'Ceylon cinnamon (true cinnamon) has been studied for its potential effects on blood sugar regulation. Unlike cassia cinnamon, Ceylon contains minimal coumarin, making it safer for long-term use. While effects are modest, some people with T1D report improved post-meal control.',
    mechanism: 'Cinnamon may improve insulin sensitivity by affecting insulin receptor signaling. It also slows gastric emptying, which can reduce post-meal glucose spikes. Certain compounds in cinnamon mimic insulin and may enhance glucose uptake into cells.',
    research: [
      { finding: 'Ceylon cinnamon extract modestly improved fasting glucose', source: 'Journal of Medicinal Food', year: 2020 },
      { finding: 'Delayed gastric emptying may help flatten post-meal curves', source: 'Diabetes Care', year: 2019 },
      { finding: 'Antioxidant properties may protect against diabetes complications', source: 'Food Chemistry', year: 2021 }
    ],
    communityTips: [
      'Use Ceylon cinnamon specifically - it\'s safer than cassia',
      'Typical dose is 1-6 grams daily (1 tsp = ~2.6g)',
      'Add to coffee, oatmeal, or smoothies',
      'Effects are modest - don\'t expect dramatic changes',
      'Capsules available for those who don\'t like the taste'
    ],
    interactions: ['Generally safe at culinary amounts', 'Large doses may affect blood clotting', 'Cassia cinnamon contains coumarin that can harm liver - avoid it'],
    testingInfo: 'No specific test for cinnamon. Track blood glucose patterns before and after adding to diet to assess personal response.'
  },
  'Ashwagandha': {
    overview: 'Ashwagandha is an adaptogenic herb that may help with stress management and blood sugar regulation. For T1D, chronic stress can significantly impact glucose control, making stress management tools valuable. Ashwagandha has been used in Ayurvedic medicine for thousands of years.',
    mechanism: 'As an adaptogen, ashwagandha helps the body adapt to stress by modulating the HPA axis and cortisol levels. Since cortisol raises blood sugar, reducing chronic stress may improve glucose stability. It also has anti-inflammatory and antioxidant properties.',
    research: [
      { finding: 'Ashwagandha reduced cortisol levels by 30% in stressed adults', source: 'Journal of Ethnopharmacology', year: 2019 },
      { finding: 'Improved fasting blood glucose in diabetic patients', source: 'Indian Journal of Pharmacology', year: 2020 },
      { finding: 'Enhanced sleep quality which indirectly supports glucose control', source: 'Sleep Medicine', year: 2021 }
    ],
    communityTips: [
      'KSM-66 and Sensoril are well-researched standardized extracts',
      'Typical dose is 300-600mg daily',
      'Take consistently for 4-8 weeks to see effects',
      'Some people feel energized, others calm - timing varies by response',
      'May help with diabetes burnout and anxiety'
    ],
    interactions: ['May enhance thyroid hormone levels - caution with thyroid conditions', 'Can potentiate sedatives', 'May affect blood pressure medications'],
    testingInfo: 'No direct ashwagandha test. Monitor cortisol levels, sleep quality, and stress questionnaires. Check thyroid function periodically.'
  },
  'L-Glutamine': {
    overview: 'L-Glutamine is the most abundant amino acid in the body and plays a crucial role in gut health, immune function, and muscle recovery. For people with T1D, glutamine may help with gut barrier integrity ("leaky gut"), post-exercise recovery, and blood sugar regulation.',
    mechanism: 'Glutamine is the primary fuel for intestinal cells, maintaining gut barrier function. It supports immune cell function and is a precursor to glutathione. In some studies, glutamine has been shown to stimulate glucagon-like peptide-1 (GLP-1), which affects insulin and glucose metabolism.',
    research: [
      { finding: 'Glutamine improved gut barrier function in metabolic disorders', source: 'Nutrients', year: 2020 },
      { finding: 'May enhance post-exercise recovery in active diabetics', source: 'Journal of Sports Medicine', year: 2021 },
      { finding: 'Stimulates GLP-1 release which may improve glucose handling', source: 'Diabetes Research', year: 2019 }
    ],
    communityTips: [
      'Powder form is more economical than capsules',
      'Typical dose is 5-10g daily, often post-workout',
      'Can be mixed into protein shakes or water',
      'May help with sugar cravings for some people',
      'Consider if you have frequent GI issues'
    ],
    interactions: ['Generally safe at recommended doses', 'Avoid with liver disease or kidney problems', 'May affect seizure medications'],
    testingInfo: 'Plasma glutamine levels can be tested but are not commonly ordered. Assess effectiveness through GI symptoms and recovery quality.'
  }
};

export function QoLDetailModal({ open, onOpenChange, item, type }: QoLDetailModalProps) {
  if (!item) return null;

  const details = detailedContent[item.name] || {
    overview: item.description || 'Detailed information coming soon.',
    mechanism: 'Research is ongoing to understand the full mechanism.',
    research: [],
    communityTips: [],
    interactions: [],
    testingInfo: 'Consult your healthcare provider for appropriate testing.'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{item.name}</DialogTitle>
              {item.prevalence && (
                <Badge variant="outline" className="mt-1">
                  {item.prevalence}% of T1D population deficient
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1">
              <BookOpen className="h-3 w-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-1">
              <FlaskConical className="h-3 w-3" />
              Research
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-1">
              <Users className="h-3 w-3" />
              Community
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Safety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed">
                  {details.overview}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  How It Works
                </h4>
                <p className="text-sm text-muted-foreground">
                  {details.mechanism}
                </p>
              </CardContent>
            </Card>

            {item.symptoms_of_deficiency && item.symptoms_of_deficiency.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Symptoms of Deficiency</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.symptoms_of_deficiency.map((symptom, i) => (
                      <Badge key={i} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {item.food_sources && item.food_sources.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    Food Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.food_sources.map((source, i) => (
                      <Badge key={i} variant="outline">{source}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(item.recommended_daily_amount || item.dosage_info || item.optimal_timing) && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dosage & Timing
                  </h4>
                  <div className="space-y-2 text-sm">
                    {item.recommended_daily_amount && (
                      <p><strong>Recommended:</strong> {item.recommended_daily_amount}</p>
                    )}
                    {item.dosage_info && (
                      <p><strong>Typical dose:</strong> {item.dosage_info}</p>
                    )}
                    {item.optimal_timing && (
                      <p><strong>Best time:</strong> {item.optimal_timing}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="research" className="space-y-4 mt-4">
            {details.research.length > 0 ? (
              details.research.map((study, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <p className="font-medium mb-2">"{study.finding}"</p>
                    <p className="text-sm text-muted-foreground">
                      {study.source}, {study.year}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <FlaskConical className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Research citations coming soon</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Testing Information</h4>
                <p className="text-sm">{details.testingInfo}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-4 mt-4">
            {details.communityTips.length > 0 ? (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Tips from the T1D Community</h4>
                  <ul className="space-y-3">
                    {details.communityTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Community tips coming soon</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="safety" className="space-y-4 mt-4">
            {item.precautions && (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    Precautions
                  </h4>
                  <p className="text-sm">{item.precautions}</p>
                </CardContent>
              </Card>
            )}

            {details.interactions.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Drug Interactions</h4>
                  <ul className="space-y-2">
                    {details.interactions.map((interaction, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-warning">⚠</span>
                        <span>{interaction}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Disclaimer:</strong> This information is for educational purposes only. 
                  Always consult your healthcare provider before starting any new supplement, 
                  especially if you have diabetes or take other medications.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
