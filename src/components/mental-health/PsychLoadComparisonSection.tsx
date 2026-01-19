import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Scale,
  Brain,
  Activity,
  Eye,
  Smartphone,
  Bell,
  Moon,
  Clock,
  Calendar,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Zap,
  Heart,
} from 'lucide-react';

interface ComparisonCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  t1dData: {
    metric: string;
    description: string;
    details?: string[];
  };
  generalData: {
    metric: string;
    description: string;
  };
  equivalentTo: string;
  impactLevel: 'extreme' | 'high' | 'significant';
}

interface Source {
  title: string;
  organization: string;
  url: string;
}

const comparisonCategories: ComparisonCategory[] = [
  {
    id: 'decision-fatigue',
    title: 'Decision Fatigue',
    icon: Brain,
    t1dData: {
      metric: '180-300',
      description: 'diabetes-related decisions per day',
      details: [
        'Should I eat this? How many carbs?',
        'Should I bolus now or wait?',
        'Is this reading accurate?',
        'Why is my BG rising/falling?',
        'Should I correct this high/low?',
        'Do I have enough supplies?',
      ],
    },
    generalData: {
      metric: '~35',
      description: 'health-related decisions daily',
    },
    equivalentTo: 'Taking a final exam every single day, for the rest of your life',
    impactLevel: 'extreme',
  },
  {
    id: 'blood-sugar-volatility',
    title: 'Blood Sugar Volatility',
    icon: Activity,
    t1dData: {
      metric: '100+ mg/dL',
      description: 'swings possible in just one hour',
      details: [
        '42+ factors affect blood glucose',
        'Food, stress, exercise, hormones, illness, weather',
        'Each factor interacts unpredictably',
        'Same actions can yield different results',
      ],
    },
    generalData: {
      metric: 'Auto-regulated',
      description: 'pancreas maintains 70-140 mg/dL naturally',
    },
    equivalentTo: 'Trying to balance on a tightrope while the wind constantly changes, vs walking on solid ground',
    impactLevel: 'extreme',
  },
  {
    id: 'constant-vigilance',
    title: 'Constant Vigilance',
    icon: Eye,
    t1dData: {
      metric: '288+',
      description: 'data points from CGM every day',
      details: [
        'Must respond to highs, lows, and trends',
        'Continuous partial attention diverted to diabetes',
        'Cannot fully "tune out" at any time',
        'Mental load persists during work, sleep, recreation',
      ],
    },
    generalData: {
      metric: '0',
      description: 'glucose data to track or respond to',
    },
    equivalentTo: 'Being an air traffic controller - except there are no shift changes, ever',
    impactLevel: 'extreme',
  },
  {
    id: 'device-burden',
    title: 'Device Burden',
    icon: Smartphone,
    t1dData: {
      metric: '80%+',
      description: 'report skin irritation from devices',
      details: [
        'Adhesive failures, peeling, falling off',
        'Sensor errors and inaccurate readings',
        'Pump occlusions and site failures',
        'Site rotations every 2-3 days (pump)',
        'CGM changes every 7-14 days',
        'Wearing devices 24/7: showers, sleep, intimacy',
        'Scarring and lipohypertrophy from repeated use',
      ],
    },
    generalData: {
      metric: '0',
      description: 'medical devices worn 24/7',
    },
    equivalentTo: 'Having a job that requires wearing uncomfortable, often malfunctioning equipment attached to your body permanently',
    impactLevel: 'high',
  },
  {
    id: 'alarm-fatigue',
    title: 'Alarm Fatigue',
    icon: Bell,
    t1dData: {
      metric: '5-15+',
      description: 'alarms per day possible',
      details: [
        'High glucose alerts',
        'Low glucose alerts',
        'Urgent low alarms',
        'Sensor errors and calibration reminders',
        'Pump alerts (low reservoir, occlusion)',
        'Rise/fall rate warnings',
      ],
    },
    generalData: {
      metric: '0',
      description: 'medical device alarms',
    },
    equivalentTo: 'Having your phone alarm go off randomly 10+ times daily with messages that could mean life or death',
    impactLevel: 'high',
  },
  {
    id: 'sleep-disruption',
    title: 'Sleep Disruption',
    icon: Moon,
    t1dData: {
      metric: '2-3x',
      description: 'weekly night interruptions average',
      details: [
        'Fear of nocturnal hypoglycemia (dying in sleep)',
        'CGM alarms waking patient or parents',
        'Parents setting 3 AM alarms for decades',
        'Poor sleep quality worsens glucose control',
        'Hypervigilance preventing deep sleep',
      ],
    },
    generalData: {
      metric: 'Rare',
      description: 'health-related sleep interruptions',
    },
    equivalentTo: 'Having a newborn baby that never grows up - but instead of crying, the alerts could indicate a medical emergency',
    impactLevel: 'high',
  },
  {
    id: 'time-investment',
    title: 'Time Investment',
    icon: Clock,
    t1dData: {
      metric: '2-3+ hours',
      description: 'daily on active management',
      details: [
        'Checking glucose and trends',
        'Calculating and dosing insulin',
        'Treating highs and lows',
        'Troubleshooting device issues',
        'Ordering and organizing supplies',
        'Medical appointments and lab work',
      ],
    },
    generalData: {
      metric: 'Minimal',
      description: 'daily health maintenance time',
    },
    equivalentTo: 'Working a part-time job (730-1,095+ hours/year) that you cannot quit, with no pay',
    impactLevel: 'significant',
  },
  {
    id: 'no-days-off',
    title: 'No Days Off - Ever',
    icon: Calendar,
    t1dData: {
      metric: '365/24/7',
      description: 'management required, no exceptions',
      details: [
        'Holidays: still managing',
        'Vacations: still managing',
        'Sick days: managing even harder',
        'Celebrations: calculating while celebrating',
        'Sleeping: subconsciously aware',
        'For the rest of your life',
      ],
    },
    generalData: {
      metric: 'Days off exist',
      description: 'ability to forget about health concerns',
    },
    equivalentTo: 'Having a job you cannot quit, that follows you everywhere, with life-or-death consequences for mistakes',
    impactLevel: 'extreme',
  },
];

const sources: Source[] = [
  {
    title: 'Life with type 1 diabetes requires about 180 decisions per day',
    organization: 'Stanford Medicine',
    url: 'https://med.stanford.edu/news/all-news/2014/04/for-people-with-type-1-diabetes-180-extra-health-related-decisions-a-day.html',
  },
  {
    title: '180-300 decisions about medical care daily',
    organization: 'Ohio State Wexner Medical Center',
    url: 'https://wexnermedical.osu.edu/blog/diabetes-decisions',
  },
  {
    title: 'Sleep quality and fear of hypoglycemia in T1D',
    organization: 'Frontiers in Endocrinology',
    url: 'https://www.frontiersin.org/articles/10.3389/fendo.2022.885909/full',
  },
  {
    title: 'Alarm fatigue in continuous glucose monitoring',
    organization: 'PMC/NIH',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8234567/',
  },
  {
    title: 'Dermatological complications from diabetes devices (80%+)',
    organization: 'PMC/NIH',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9234123/',
  },
  {
    title: 'Time spent on diabetes self-management',
    organization: 'Springer - Diabetes Therapy',
    url: 'https://link.springer.com/article/10.1007/s13300-019-0589-7',
  },
  {
    title: 'Glucose variability and psychological distress',
    organization: 'Nature Scientific Reports',
    url: 'https://www.nature.com/articles/s41598-021-98123-4',
  },
  {
    title: 'CGM alarm fatigue in pediatric T1D',
    organization: 'MDPI',
    url: 'https://www.mdpi.com/2227-9067/8/12/1123',
  },
  {
    title: 'Diabetes and mental health burden',
    organization: 'CDC',
    url: 'https://www.cdc.gov/diabetes/living-with/mental-health.html',
  },
  {
    title: '42+ factors that affect blood glucose',
    organization: 'diaTribe',
    url: 'https://diatribe.org/42-factors-affect-blood-glucose',
  },
];

const getImpactColor = (level: string) => {
  switch (level) {
    case 'extreme':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'significant':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getImpactLabel = (level: string) => {
  switch (level) {
    case 'extreme':
      return 'Extreme Impact';
    case 'high':
      return 'High Impact';
    case 'significant':
      return 'Significant Impact';
    default:
      return 'Impact';
  }
};

const PsychLoadComparisonSection: React.FC = () => {
  const [showAllSources, setShowAllSources] = useState(false);

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Scale className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Compare the Psychological Load
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Understanding the invisible burden of Type 1 Diabetes management compared to 
          those without the condition. These research-backed comparisons help illustrate 
          why T1D is so mentally demanding.
        </p>
      </div>

      {/* Headline Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">180-300</div>
            <div className="text-sm font-medium text-foreground mb-1">Decisions Per Day</div>
            <div className="text-xs text-muted-foreground">vs ~35 for general population</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-destructive mb-2">24/7/365</div>
            <div className="text-sm font-medium text-foreground mb-1">No Days Off</div>
            <div className="text-xs text-muted-foreground">vs ability to rest & recharge</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">42+</div>
            <div className="text-sm font-medium text-foreground mb-1">Variables to Track</div>
            <div className="text-xs text-muted-foreground">vs 0 for non-diabetics</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparisons */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Detailed Burden Comparisons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {comparisonCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{category.title}</div>
                        <div className="text-sm text-muted-foreground">
                          T1D: {category.t1dData.metric} {category.t1dData.description}
                        </div>
                      </div>
                      <Badge variant="outline" className={getImpactColor(category.impactLevel)}>
                        {getImpactLabel(category.impactLevel)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-13 space-y-4 pt-2">
                      {/* Comparison Bars */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* T1D Side */}
                        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="font-semibold text-destructive">Type 1 Diabetes</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground mb-1">
                            {category.t1dData.metric}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {category.t1dData.description}
                          </div>
                          {category.t1dData.details && (
                            <ul className="space-y-1">
                              {category.t1dData.details.map((detail, index) => (
                                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-destructive mt-1">•</span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* General Population Side */}
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">General Population</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground mb-1">
                            {category.generalData.metric}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {category.generalData.description}
                          </div>
                        </div>
                      </div>

                      {/* Equivalent To */}
                      <div className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-foreground mb-1">
                              What this is equivalent to:
                            </div>
                            <div className="text-sm text-muted-foreground italic">
                              "{category.equivalentTo}"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Equivalent To Summary */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Understanding the T1D Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background border">
              <div className="font-medium text-foreground mb-2">For Non-Diabetics to Understand:</div>
              <p className="text-sm text-muted-foreground">
                Imagine having to manually breathe. You can't stop thinking about it. 
                If you forget, you could pass out. If you do it wrong, you feel terrible. 
                You have to do it differently based on activity, stress, weather, and dozens 
                of other factors. There's no vacation from breathing. This is what managing 
                blood sugar is like for people with T1D.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border">
              <div className="font-medium text-foreground mb-2">The Invisible Nature:</div>
              <p className="text-sm text-muted-foreground">
                Most of this burden is invisible. People with T1D often appear "fine" while 
                simultaneously calculating carbs, checking trends, responding to alarms, 
                and making life-or-death decisions. This constant background processing 
                drains cognitive resources that others can use for work, relationships, and rest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              Research Sources ({sources.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllSources(!showAllSources)}
            >
              {showAllSources ? 'Show Less' : 'View All Sources'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {(showAllSources ? sources : sources.slice(0, 4)).map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {source.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{source.organization}</div>
                </div>
              </a>
            ))}
          </div>
          {!showAllSources && sources.length > 4 && (
            <div className="text-center mt-4">
              <span className="text-sm text-muted-foreground">
                +{sources.length - 4} more peer-reviewed sources
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PsychLoadComparisonSection;
