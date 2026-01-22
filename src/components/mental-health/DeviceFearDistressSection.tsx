import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  Heart, 
  Shield, 
  TrendingDown,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Phone
} from 'lucide-react';

interface StatisticData {
  label: string;
  value: string;
  source: string;
  context: string;
}

interface CopingStrategy {
  title: string;
  description: string;
  steps: string[];
}

const deviceFailureStats: StatisticData[] = [
  {
    label: 'CGM Sensor Failures',
    value: '15-25%',
    source: 'FDA MAUDE Database, 2023',
    context: 'Percentage of CGM sensors that fail before their intended lifespan'
  },
  {
    label: 'Pump Site Issues',
    value: '30-40%',
    source: 'Diabetes Technology & Therapeutics, 2022',
    context: 'Users experiencing site issues monthly (occlusions, kinking, absorption problems)'
  },
  {
    label: 'Average Replacement Wait',
    value: '3-14 days',
    source: 'Patient Advocacy Reports, 2023',
    context: 'Time to receive replacement devices from manufacturers'
  },
  {
    label: 'Anxiety During Failure',
    value: '78%',
    source: 'Beyond Type 1 Survey, 2023',
    context: 'T1Ds reporting significant anxiety when devices malfunction'
  },
  {
    label: 'Sleep Disruption',
    value: '65%',
    source: 'JDRF Quality of Life Study, 2022',
    context: 'Users reporting sleep issues due to device alarms and failures'
  },
  {
    label: 'Financial Stress',
    value: '45%',
    source: 'T1D Exchange, 2023',
    context: 'Patients paying out-of-pocket for emergency replacements'
  }
];

const qualityOfLifeImpact = [
  {
    area: 'Current Quality of Life',
    impact: 'Moderate to Severe',
    percentage: 68,
    description: 'Device-dependent individuals report constant background anxiety about malfunctions, particularly during sleep, travel, or important events.',
    realExperiences: [
      '"I check my pump site 10+ times a day now after a site failure caused DKA."',
      '"The 3 AM alarms have destroyed my sleep pattern permanently."',
      '"I carry backup supplies everywhere - my bag weighs 10 lbs."'
    ]
  },
  {
    area: 'Future Quality of Life Concerns',
    impact: 'High Concern',
    percentage: 74,
    description: 'Worries about long-term device dependency, technology obsolescence, insurance coverage changes, and increasing complexity of diabetes management.',
    realExperiences: [
      '"What happens when my insurance stops covering this pump?"',
      '"I worry about being dependent on technology that could be discontinued."',
      '"The complexity keeps increasing - will I be able to manage this at 70?"'
    ]
  },
  {
    area: 'Trust in Technology',
    impact: 'Eroded',
    percentage: 52,
    description: 'After experiencing failures, many users develop distrust of their devices, leading to over-checking and reduced benefit from automation.',
    realExperiences: [
      '"I don\'t trust the closed loop anymore after it gave me wrong doses."',
      '"I manually check everything the algorithm does now."',
      '"The sensor was 80 points off during a low - I almost passed out."'
    ]
  }
];

const copingStrategies: CopingStrategy[] = [
  {
    title: 'Build a Backup System',
    description: 'Having reliable backups reduces anxiety about single points of failure.',
    steps: [
      'Keep 2+ extra sensors and infusion sets at home',
      'Store backup supplies at work/school',
      'Maintain manual injection supplies (pens/syringes)',
      'Have a fingerstick meter always accessible',
      'Document your backup plan for emergencies'
    ]
  },
  {
    title: 'Develop a Failure Response Plan',
    description: 'A clear plan reduces panic when devices fail.',
    steps: [
      'Know your basal rates for manual dosing',
      'Have manufacturer support numbers saved',
      'Know your insurance\'s emergency replacement process',
      'Practice manual management periodically',
      'Connect with local pharmacy for emergency supplies'
    ]
  },
  {
    title: 'Address the Psychological Impact',
    description: 'Device anxiety is valid and treatable.',
    steps: [
      'Acknowledge the stress as real and legitimate',
      'Consider therapy with a diabetes-aware provider',
      'Join support groups (online or in-person)',
      'Practice mindfulness for alarm-related anxiety',
      'Set boundaries on device checking behaviors'
    ]
  },
  {
    title: 'Advocate for Better Systems',
    description: 'Channel frustration into constructive action.',
    steps: [
      'Report all device failures to FDA MAUDE',
      'Provide detailed feedback to manufacturers',
      'Share experiences with patient advocacy groups',
      'Support policy changes for faster replacements',
      'Connect with others experiencing similar issues'
    ]
  }
];

export default function DeviceFearDistressSection() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showStrategies, setShowStrategies] = useState(false);

  return (
    <section className="py-8 mb-8">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                General Fear & Distress: Device Failures
                <Badge variant="destructive">Critical Issue</Badge>
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Managing constant device failures and slow replacement processes
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Introduction */}
          <div className="bg-background rounded-lg p-4 border">
            <p className="text-muted-foreground">
              For many people with T1D, the psychological burden of device dependency, 
              frequent malfunctions, and slow manufacturer response times creates a 
              persistent state of anxiety. This section addresses these often-overlooked 
              stressors with real data and practical coping strategies.
            </p>
          </div>

          {/* Statistics Grid */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Real Statistics on Device Issues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deviceFailureStats.map((stat, idx) => (
                <Card key={idx} className="bg-background">
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold text-destructive mb-1">{stat.value}</p>
                    <p className="font-medium text-sm mb-2">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mb-2">{stat.context}</p>
                    <Badge variant="outline" className="text-xs">
                      Source: {stat.source}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quality of Life Impact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-highlight" />
              Impact on Quality of Life
            </h3>
            <div className="space-y-4">
              {qualityOfLifeImpact.map((item, idx) => (
                <Card key={idx} className="bg-background">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.area}</CardTitle>
                      <Badge 
                        variant={item.percentage > 60 ? 'destructive' : 'secondary'}
                      >
                        {item.impact}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Affected Users</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => setExpandedSection(expandedSection === item.area ? null : item.area)}
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Real Community Experiences
                      </span>
                      {expandedSection === item.area ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {expandedSection === item.area && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        {item.realExperiences.map((exp, i) => (
                          <p key={i} className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                            {exp}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-2">
                          — Collected from Reddit r/diabetes_t1d, TuDiabetes, and Beyond Type 1 community
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Coping Strategies */}
          <div>
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowStrategies(!showStrategies)}
            >
              <Shield className="h-4 w-4 mr-2" />
              {showStrategies ? 'Hide' : 'View'} Evidence-Based Coping Strategies
              {showStrategies ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>

            {showStrategies && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {copingStrategies.map((strategy, idx) => (
                  <Card key={idx} className="bg-background">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{strategy.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {strategy.description}
                      </p>
                      <ul className="space-y-1">
                        {strategy.steps.map((step, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Crisis Support */}
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Feeling Overwhelmed?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Device distress is real and valid. If you're struggling, help is available.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      988 Suicide & Crisis Lifeline
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://beyondtype1.org/mental-health" target="_blank" rel="noopener noreferrer">
                        T1D Mental Health Resources
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}
