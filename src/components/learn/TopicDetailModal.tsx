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

// Comprehensive educational content for each topic
const topicContent: Record<string, {
  introduction: string;
  sections: { title: string; content: string }[];
  practicalTips: string[];
  sources: { title: string; url?: string }[];
}> = {
  'Water & Muscle During High Blood Sugar': {
    introduction: 'When blood glucose rises above normal levels (hyperglycemia), your body initiates a series of physiological responses that significantly affect hydration and muscle function. Understanding these mechanisms can help you manage high blood sugars more effectively.',
    sections: [
      {
        title: 'Cellular Dehydration Mechanism',
        content: 'When glucose levels rise, the concentration of glucose in your blood becomes higher than inside your cells. This creates an osmotic gradient that pulls water OUT of cells and into the bloodstream to dilute the sugar. Your cells literally shrink as they lose water. This is why excessive thirst (polydipsia) is a classic symptom of high blood sugar - your body is trying to replace the fluid being pulled from cells.'
      },
      {
        title: 'Impact on Muscles',
        content: 'Muscle cells are particularly affected by this dehydration. When muscle cells lose water, they cannot contract as efficiently. This leads to fatigue, weakness, and reduced exercise performance. Additionally, glycogen storage (how muscles store glucose for energy) is impaired when cells are dehydrated. Many people report feeling "heavy" or sluggish during highs - this is partly due to muscle cell dehydration.'
      },
      {
        title: 'Insulin Absorption Effects',
        content: 'Dehydration also affects insulin absorption. When tissues are dehydrated, blood flow to subcutaneous areas decreases, which can slow insulin absorption from injection sites or pump infusion sites. This creates a vicious cycle: high blood sugar causes dehydration, which slows insulin absorption, which keeps blood sugar high longer.'
      },
      {
        title: 'Electrolyte Shifts',
        content: 'As your body tries to flush excess glucose through urination (glucosuria), it also loses electrolytes - particularly sodium, potassium, and magnesium. These electrolyte losses further impair muscle function and can cause cramping, weakness, and in severe cases, cardiac arrhythmias.'
      }
    ],
    practicalTips: [
      'Drink 8-16 oz of water immediately when you notice a high blood sugar',
      'Add electrolytes (sugar-free) during prolonged highs above 250 mg/dL',
      'Avoid intense exercise until blood sugar is below 250 mg/dL',
      'Check ketones if blood sugar is above 250 mg/dL with symptoms',
      'Rotate injection sites more frequently during periods of poor control'
    ],
    sources: [
      { title: 'ADA Standards of Medical Care in Diabetes - 2024' },
      { title: 'Diabetes Care: Fluid and Electrolyte Disturbances in DKA', url: 'https://diabetesjournals.org' },
      { title: 'Journal of Clinical Endocrinology & Metabolism' }
    ]
  },
  'The Dawn Phenomenon Explained': {
    introduction: 'The Dawn Phenomenon is a natural rise in blood glucose levels that occurs in the early morning hours, typically between 2 AM and 8 AM. It affects both people with and without diabetes, but its effects are much more pronounced in those with T1D because they lack the normal insulin response to counteract it.',
    sections: [
      {
        title: 'The Hormonal Cascade',
        content: 'In the early morning hours, your body begins preparing to wake up by releasing several counter-regulatory hormones: cortisol (the "stress hormone"), growth hormone, glucagon, and epinephrine. These hormones signal the liver to release stored glucose (glycogenolysis) and produce new glucose (gluconeogenesis). In people without diabetes, the pancreas releases more insulin to match this glucose release. In T1D, this automatic adjustment doesn\'t happen.'
      },
      {
        title: 'Distinguishing from Somogyi Effect',
        content: 'The Dawn Phenomenon is often confused with the Somogyi Effect (rebound hyperglycemia after nocturnal hypoglycemia). The key difference: Dawn Phenomenon shows steady or slightly rising glucose from midnight to morning, while Somogyi shows a low followed by a rebound high. CGM data makes this distinction much clearer. The treatment is opposite - Dawn Phenomenon needs MORE insulin, Somogyi needs LESS.'
      },
      {
        title: 'Why It Varies Day to Day',
        content: 'Dawn Phenomenon intensity varies based on sleep quality, stress levels, illness, exercise the previous day, and even the time you went to sleep. Poor sleep increases cortisol release, worsening the phenomenon. This is why blood sugars can be frustratingly unpredictable some mornings.'
      }
    ],
    practicalTips: [
      'Use CGM data to identify your specific Dawn Phenomenon pattern',
      'Consider increasing basal insulin between 3-6 AM (pump users)',
      'For MDI users, discuss timing of long-acting insulin with your endo',
      'AID systems (780G, Control-IQ, Omnipod 5) handle Dawn Phenomenon automatically',
      'A small protein snack before bed can help stabilize overnight levels',
      'Consistent sleep times reduce Dawn Phenomenon variability'
    ],
    sources: [
      { title: 'JDRF: Understanding Dawn Phenomenon' },
      { title: 'Diabetes Care: Diurnal Glucose Patterns', url: 'https://diabetesjournals.org' },
      { title: 'Endocrine Reviews: Counter-regulatory Hormones in Diabetes' }
    ]
  },
  'Fat & Protein Extended Bolusing': {
    introduction: 'The "pizza problem" is familiar to every person with T1D: you bolus for the carbs in pizza, your blood sugar is fine for 2-3 hours, then suddenly spikes to 300+ and stays there. Understanding how fat and protein affect glucose can transform your post-meal control.',
    sections: [
      {
        title: 'The Delayed Glucose Effect',
        content: 'Fat slows gastric emptying, which delays carbohydrate absorption. But there\'s more: protein and fat themselves convert to glucose through gluconeogenesis in the liver. Approximately 50-60% of protein and 10% of fat eventually become glucose - but this process takes 3-8 hours. Standard bolusing doesn\'t account for this delayed glucose release.'
      },
      {
        title: 'Calculating Extended Boluses',
        content: 'A common approach (the Warsaw method): Count all carbs + add 50% of protein grams as "equivalent carbs." For a meal with 60g carbs and 40g protein, you\'d bolus for 80g equivalent carbs (60 + 20). For high-fat meals, extend 40-70% of the bolus over 2-4 hours. With pumps, use the extended/dual-wave/combo bolus feature. For MDI, consider a small correction 2-3 hours post-meal.'
      },
      {
        title: 'Individual Variation',
        content: 'Fat/protein effects vary widely between individuals. Some people see huge delayed spikes from pizza; others don\'t. Factors include gut motility, insulin sensitivity, and individual gluconeogenesis rates. The only way to dial in YOUR settings is systematic testing with CGM data.'
      }
    ],
    practicalTips: [
      'Use extended/combo bolus for meals with >20g fat OR >30g protein',
      'Start with 60% upfront, 40% extended over 3 hours - adjust from there',
      'Set a 3-hour post-meal alarm to check glucose after high-fat meals',
      'AID systems struggle with high-fat meals - consider a manual override',
      'Keep notes on specific foods: pizza, Chinese food, and pasta are common culprits',
      'A post-meal walk (15-30 min) helps reduce delayed spikes'
    ],
    sources: [
      { title: 'Diabetes Technology & Therapeutics: Fat-Protein Units' },
      { title: 'JDRF: Advanced Bolusing Strategies' },
      { title: 'The Warsaw Gluconeogenesis Study' }
    ]
  }
};

// Default content for topics not yet detailed
const defaultContent = {
  introduction: 'This topic provides practical, real-world information about managing Type 1 Diabetes. Our content is designed to give you the knowledge that isn\'t always covered in standard diabetes education.',
  sections: [
    {
      title: 'Key Concepts',
      content: 'Understanding the physiological mechanisms behind your daily experiences with T1D empowers you to make better decisions. We focus on the "why" behind recommendations, not just the "what."'
    },
    {
      title: 'Practical Application',
      content: 'Each topic includes actionable tips that you can apply immediately. These are drawn from both clinical research and the collective experience of the T1D community.'
    }
  ],
  practicalTips: [
    'Always verify information with your healthcare team',
    'What works for others may not work exactly the same for you',
    'Track your experiences to identify your personal patterns',
    'Small changes over time often work better than dramatic shifts'
  ],
  sources: [
    { title: 'American Diabetes Association Standards of Care' },
    { title: 'JDRF Research Publications' },
    { title: 'Peer-reviewed diabetes journals' }
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
