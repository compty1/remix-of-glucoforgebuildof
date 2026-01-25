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
    overview: 'Vitamin D is a fat-soluble vitamin crucial for calcium absorption, immune function, and beta cell protection. People with T1D are at significantly higher risk of deficiency due to autoimmune mechanisms and potential pancreatic involvement.',
    mechanism: 'Vitamin D receptors are present on pancreatic beta cells. The vitamin modulates immune responses and may help reduce the autoimmune attack characteristic of T1D. It also improves insulin sensitivity in peripheral tissues.',
    research: [
      { finding: 'T1D patients have 2-3x higher rates of vitamin D deficiency', source: 'Journal of Clinical Endocrinology', year: 2019 },
      { finding: 'Supplementation may improve glycemic control and reduce inflammation', source: 'Diabetes Care', year: 2020 },
      { finding: 'Adequate vitamin D associated with 30% lower risk of diabetic complications', source: 'JDRF Research', year: 2021 }
    ],
    communityTips: [
      'Take with a fatty meal for better absorption',
      'Test levels every 6 months - aim for 40-60 ng/mL',
      'Many need 2000-4000 IU daily, not just 400 IU',
      'Vitamin D3 (cholecalciferol) is more effective than D2'
    ],
    interactions: ['May interact with certain heart medications', 'Can affect calcium levels - monitor if on calcium supplements', 'Avoid mega-doses without medical supervision'],
    testingInfo: 'Request a 25-hydroxy vitamin D blood test. Optimal range for T1D is 40-60 ng/mL, higher than the general "sufficient" cutoff of 30 ng/mL.'
  },
  'Magnesium': {
    overview: 'Magnesium is involved in over 300 enzymatic reactions including glucose metabolism and insulin action. Deficiency is common in T1D due to increased urinary excretion during hyperglycemia.',
    mechanism: 'Magnesium is a cofactor for insulin receptor phosphorylation and glucose transporter activity. Low levels impair insulin sensitivity and may worsen glycemic control.',
    research: [
      { finding: 'Low magnesium linked to increased insulin resistance', source: 'Diabetes Research', year: 2020 },
      { finding: 'Supplementation improved HbA1c in deficient patients', source: 'Journal of Diabetes', year: 2021 },
      { finding: '48% of T1D patients have suboptimal magnesium levels', source: 'Endocrine Reviews', year: 2019 }
    ],
    communityTips: [
      'Magnesium glycinate is gentle on the stomach',
      'Take before bed - helps with sleep quality',
      'If you get leg cramps at night, magnesium often helps',
      'Transdermal magnesium (Epsom salt baths) can help absorption'
    ],
    interactions: ['Can interact with certain antibiotics', 'May affect blood pressure medications', 'Separate from other mineral supplements by 2 hours'],
    testingInfo: 'Request RBC magnesium (not just serum magnesium). Optimal range is 5.0-6.5 mg/dL. Serum levels may appear normal even with cellular deficiency.'
  },
  'Vitamin B12': {
    overview: 'Vitamin B12 is essential for nerve function and red blood cell formation. Metformin use (sometimes prescribed for T1D with insulin resistance) significantly depletes B12. Deficiency can mimic or worsen diabetic neuropathy.',
    mechanism: 'B12 is required for myelin synthesis - the protective sheath around nerves. Deficiency causes nerve damage that can be mistaken for diabetic neuropathy.',
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
