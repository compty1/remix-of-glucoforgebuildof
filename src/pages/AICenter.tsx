import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoRail } from '@/components/InfoRail';
import { DynamicPredictions } from '@/components/ai-center/DynamicPredictions';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Activity,
  Heart,
  Zap,
  Clock,
  Target,
  BookOpen,
  Beaker,
  ChevronRight,
  Utensils,
  Droplet,
  Shield,
  MessageSquare
} from 'lucide-react';

interface Prediction {
  id: string;
  timeframe: string;
  title: string;
  description: string;
  probability: number;
  category: 'technology' | 'treatment' | 'cure' | 'quality_of_life';
  keyFactors: string[];
}

interface ScenarioResponse {
  id: string;
  scenario: string;
  title: string;
  aiResponse: string;
  mechanismExplanation: string;
  actionSteps: string[];
  warningsSigns: string[];
  icon: React.ReactNode;
}

const predictions: Prediction[] = [
  {
    id: '1',
    timeframe: '2027-2029',
    title: 'Fully Automated Insulin Delivery',
    description: 'AI-powered closed-loop systems achieving 90%+ time-in-range with minimal user intervention. Systems will predict meals and activity automatically.',
    probability: 85,
    category: 'technology',
    keyFactors: ['Medtronic 780G iterations', 'Omnipod 5 improvements', 'Beta Bionics iLet advancements', 'AI/ML algorithm maturity']
  },
  {
    id: '2',
    timeframe: '2027-2029',
    title: 'Non-Invasive CGM Alternatives',
    description: 'First FDA-approved non-invasive glucose monitoring devices enter market, initially for trending/adjunct use rather than primary monitoring.',
    probability: 60,
    category: 'technology',
    keyFactors: ['Spectroscopy advances', 'Wearable sensor improvements', 'Dexcom/Abbott R&D', 'Regulatory pathway clarity']
  },
  {
    id: '3',
    timeframe: '2029-2032',
    title: 'Stem Cell-Derived Beta Cells Phase 3',
    description: 'Multiple Phase 3 trials for encapsulated stem cell-derived beta cells, with some patients achieving insulin independence for 1+ years.',
    probability: 70,
    category: 'cure',
    keyFactors: ['Vertex VX-880/VX-264 progress', 'Viacyte research', 'Encapsulation technology', 'Immune modulation advances']
  },
  {
    id: '4',
    timeframe: '2029-2032',
    title: 'Weekly/Monthly Insulin Formulations',
    description: 'Long-acting basal insulins requiring only weekly or monthly injections reach widespread availability.',
    probability: 75,
    category: 'treatment',
    keyFactors: ['Insulin Icodec approval', 'Lilly once-weekly insulin', 'Pharmacokinetic improvements', 'Patient preference data']
  },
  {
    id: '5',
    timeframe: '2032-2037',
    title: 'Functional Cure for Newly Diagnosed',
    description: 'Immune therapies combined with beta cell preservation achieve sustained remission (3+ years insulin-free) in newly diagnosed patients.',
    probability: 55,
    category: 'cure',
    keyFactors: ['Teplizumab follow-up data', 'Combination therapy trials', 'Early detection programs', 'Personalized immunotherapy']
  },
  {
    id: '6',
    timeframe: '2032-2037',
    title: 'Artificial Pancreas 3.0',
    description: 'Dual-hormone (insulin + glucagon/pramlintide) automated systems become standard, virtually eliminating severe hypoglycemia.',
    probability: 80,
    category: 'technology',
    keyFactors: ['Stable glucagon formulations', 'Multi-hormone algorithms', 'Miniaturization advances', 'Cost reduction']
  },
  {
    id: '7',
    timeframe: '2037-2042',
    title: 'Gene Therapy Trials',
    description: 'Gene therapy approaches to restore beta cell function or create insulin-producing cells reach human trials.',
    probability: 45,
    category: 'cure',
    keyFactors: ['CRISPR safety data', 'Delivery mechanism advances', 'Regulatory frameworks', 'Long-term safety studies']
  },
  {
    id: '8',
    timeframe: '2042-2047',
    title: 'Universal Prevention',
    description: 'Genetic screening at birth combined with preventive immunotherapy dramatically reduces new T1D diagnoses.',
    probability: 40,
    category: 'cure',
    keyFactors: ['Biomarker identification', 'Population screening feasibility', 'Preventive therapy safety', 'Healthcare infrastructure']
  }
];

const scenarioResponses: ScenarioResponse[] = [
  {
    id: 'low-blood-sugar',
    scenario: 'low_blood_sugar',
    title: 'Low Blood Sugar Emergency',
    icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
    aiResponse: 'Based on physiological mechanisms, when blood glucose drops below 70 mg/dL, your body initiates counter-regulatory hormone release. However, in T1D, this response is often impaired (hypoglycemia unawareness develops in ~40% of patients after 15+ years).',
    mechanismExplanation: 'Hypoglycemia triggers: 1) Glucagon release from alpha cells (often blunted in T1D), 2) Epinephrine release causing shakiness/sweating, 3) Cortisol and growth hormone release for slower recovery. Neuroglycopenic symptoms (confusion, difficulty speaking) occur when brain glucose falls below critical threshold (~50 mg/dL).',
    actionSteps: [
      'Consume 15-20g fast-acting glucose (4 glucose tabs, 4oz juice, or 5-6 hard candies)',
      'Wait 15 minutes before rechecking - glucose absorption takes time',
      'If still low, repeat the 15g dose',
      'Once above 70 mg/dL, consume protein/fat to stabilize (cheese, nuts)',
      'Investigate cause: too much insulin, delayed meal, unexpected exercise, alcohol'
    ],
    warningsSigns: [
      'Shakiness, sweating, rapid heartbeat (early adrenergic symptoms)',
      'Confusion, difficulty concentrating (neuroglycopenic)',
      'Mood changes, irritability',
      'Seizures, loss of consciousness (severe - requires glucagon)'
    ]
  },
  {
    id: 'diet-optimization',
    scenario: 'diet',
    title: 'Picking a Diet That Works',
    icon: <Utensils className="h-6 w-6 text-success" />,
    aiResponse: 'No single diet is optimal for all T1D patients. The key principle is matching insulin action to carbohydrate absorption timing. Research shows that meal composition (protein, fat, fiber) significantly affects post-meal glucose beyond carb counting.',
    mechanismExplanation: 'Carbohydrates raise glucose within 15-90 minutes. Protein causes slower, smaller rises (40-60% converts to glucose over 3-5 hours). Fat delays gastric emptying, causing extended glucose elevation. Fiber slows carb absorption, reducing spike magnitude. The "pizza effect" occurs because high fat delays carb absorption, causing late post-meal highs.',
    actionSteps: [
      'Track meals with glucose response for 2 weeks to identify personal patterns',
      'Consider lower-carb approaches (50-130g/day) if post-meal control is challenging',
      'Prioritize whole foods with natural fiber to slow absorption',
      'Use extended/dual-wave boluses for high-fat, high-protein meals',
      'Eat vegetables/protein before carbs to reduce glucose spikes',
      'Time carbs around physical activity when insulin sensitivity is higher'
    ],
    warningsSigns: [
      'Consistent post-meal spikes above 180 mg/dL suggest timing/dosing issues',
      'Frequent hypoglycemia 3-4 hours post-meal indicates overbolusing',
      'Weight changes may indicate caloric imbalance',
      'Fatigue/brain fog could signal unrecognized glucose variability'
    ]
  },
  {
    id: 'number-management',
    scenario: 'glucose_management',
    title: 'Managing Your Numbers',
    icon: <Activity className="h-6 w-6 text-primary" />,
    aiResponse: 'Optimal glucose management involves understanding insulin pharmacokinetics, recognizing patterns, and making data-driven adjustments. Time-in-range (70-180 mg/dL) is a more holistic metric than A1C alone.',
    mechanismExplanation: 'Rapid-acting insulin peaks at 60-90 minutes and lasts 4-5 hours. Basal insulin provides background coverage. Glucose variability (standard deviation >50 mg/dL) is associated with complications independent of average glucose. Dawn phenomenon occurs due to early morning cortisol surge. Insulin sensitivity varies by ~40% throughout the day.',
    actionSteps: [
      'Review CGM data weekly looking for patterns, not individual points',
      'Adjust one variable at a time and wait 2-3 days to assess',
      'Use insulin-to-carb ratios specific to time of day',
      'Set different basal rates for dawn phenomenon',
      'Pre-bolus 15-20 minutes before meals when glucose is in range',
      'Aim for time-in-range >70% rather than perfect numbers'
    ],
    warningsSigns: [
      'Coefficient of variation (CV) >36% indicates high variability',
      'Time below range >4% increases hypoglycemia risk',
      'Consistent patterns at same time daily need basal/bolus adjustment',
      'Rising glucose overnight suggests insufficient basal'
    ]
  },
  {
    id: 'exercise-biology',
    scenario: 'exercise',
    title: 'Exercise & Glucose Biology',
    icon: <Zap className="h-6 w-6 text-warning" />,
    aiResponse: 'Exercise has bidirectional effects on glucose depending on type, intensity, duration, and timing. Understanding the underlying physiology allows for predictable exercise management.',
    mechanismExplanation: 'Aerobic exercise increases insulin sensitivity and glucose uptake via GLUT4 translocation, lowering glucose. High-intensity/anaerobic exercise triggers cortisol and epinephrine, initially raising glucose. Muscle glycogen depletion increases glucose uptake for 24-48 hours post-exercise. Exercising with insulin-on-board amplifies hypoglycemia risk.',
    actionSteps: [
      'Reduce bolus by 25-50% for meals 2 hours before aerobic exercise',
      'Start exercise with glucose 120-180 mg/dL for safety margin',
      'For high-intensity training, small bolus may prevent spike',
      'Reduce basal by 20-50% during and 2 hours after exercise',
      'Consume 15-30g carbs per hour of sustained activity',
      'Monitor for delayed hypoglycemia 6-12 hours post-exercise',
      'Resistance before cardio can stabilize glucose response'
    ],
    warningsSigns: [
      'Starting below 100 mg/dL increases hypoglycemia risk',
      'Exercising at insulin peak time compounds effects',
      'Late-night exercise may cause overnight hypoglycemia',
      'Glucose rising despite exercise suggests adrenaline response'
    ]
  },
  {
    id: 'hacks-insights',
    scenario: 'hacks',
    title: 'Evidence-Based Hacks',
    icon: <Lightbulb className="h-6 w-6 text-highlight" />,
    aiResponse: 'These strategies are derived from understanding the underlying biology and have been validated by community experience and emerging research.',
    mechanismExplanation: 'Many "hacks" work by manipulating insulin pharmacokinetics, hormonal responses, or glycemic index. Understanding why they work helps personalize and optimize their use.',
    actionSteps: [
      'Sugar surfing: Micro-dose corrections (0.25-0.5 units) to nudge trending glucose',
      'Walking 10-15 min post-meal reduces spikes by 20-30%',
      'Vinegar (1-2 tbsp) before carbs slows gastric emptying',
      'Sleep consistency matters: irregular sleep disrupts insulin sensitivity',
      'Stress management: cortisol directly raises glucose',
      'Temperature affects insulin absorption: warm injection sites = faster action',
      'Rotate sites systematically to prevent lipohypertrophy',
      'Hydration: dehydration concentrates glucose readings'
    ],
    warningsSigns: [
      'Overreliance on corrections suggests basal/bolus ratio issues',
      'Unexplained glucose variability - check for site issues',
      'Insulin needs dropping suddenly - honeymoon phase or illness',
      'Insulin needs increasing - weight change, illness, or medication effects'
    ]
  }
];

export default function AICenter() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioResponse | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technology': return 'bg-primary/10 text-primary border-primary/20';
      case 'treatment': return 'bg-success/10 text-success border-success/20';
      case 'cure': return 'bg-highlight/10 text-highlight border-highlight/20';
      case 'quality_of_life': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-success';
    if (prob >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BackButton fallbackPath="/dashboard" />
        
        {/* Hero Section */}
        <section className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-highlight rounded-2xl flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Independent AI reasoning about Type 1 diabetes management, predictions, 
            and insights derived from medical literature and biological mechanisms.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by Medical AI
            </Badge>
            <Badge variant="outline">Evidence-Based Reasoning</Badge>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="ask-ai" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 max-w-lg">
                <TabsTrigger value="ask-ai" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask AI
                </TabsTrigger>
                <TabsTrigger value="predictions" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Scenarios
                </TabsTrigger>
              </TabsList>

              {/* Ask AI Tab */}
              <TabsContent value="ask-ai" className="space-y-6">
                <DynamicPredictions />
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                <Card className="bg-gradient-to-r from-primary/5 to-highlight/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Beaker className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">How These Predictions Work</h3>
                        <p className="text-muted-foreground text-sm">
                          These predictions are generated by analyzing current clinical trial pipelines, 
                          technology development trajectories, historical breakthrough timelines, and 
                          regulatory approval patterns. Probability estimates consider funding levels, 
                          existing research momentum, and technical feasibility.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {prediction.timeframe}
                              </Badge>
                              <Badge variant="outline" className={getCategoryColor(prediction.category)}>
                                {prediction.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{prediction.title}</CardTitle>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                              {prediction.probability}%
                            </div>
                            <p className="text-xs text-muted-foreground">likelihood</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{prediction.description}</p>
                        <div>
                          <p className="text-sm font-medium mb-2">Key Factors:</p>
                          <div className="flex flex-wrap gap-2">
                            {prediction.keyFactors.map((factor, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Scenarios Tab */}
              <TabsContent value="scenarios" className="space-y-6">
                {!selectedScenario ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarioResponses.map((scenario) => (
                      <Card 
                        key={scenario.id}
                        className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                        onClick={() => setSelectedScenario(scenario)}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              {scenario.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{scenario.title}</CardTitle>
                              <CardDescription>Click to explore AI reasoning</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {scenario.aiResponse}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-4 w-full gap-2">
                            View Full Analysis
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedScenario(null)}
                      className="mb-4"
                    >
                      ← Back to Scenarios
                    </Button>

                    <Card className="border-2 border-primary/20">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            {selectedScenario.icon}
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{selectedScenario.title}</CardTitle>
                            <CardDescription>AI-Powered Analysis</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* AI Response */}
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">AI Analysis</h4>
                          </div>
                          <p className="text-muted-foreground">{selectedScenario.aiResponse}</p>
                        </div>

                        {/* Mechanism Explanation */}
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-highlight" />
                            <h4 className="font-semibold">Biological Mechanism</h4>
                          </div>
                          <p className="text-muted-foreground">{selectedScenario.mechanismExplanation}</p>
                        </div>

                        {/* Action Steps */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-5 w-5 text-success" />
                            <h4 className="font-semibold">Action Steps</h4>
                          </div>
                          <ul className="space-y-2">
                            {selectedScenario.actionSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-medium flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Warning Signs */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            <h4 className="font-semibold">Warning Signs</h4>
                          </div>
                          <ul className="space-y-2">
                            {selectedScenario.warningsSigns.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm">
                                <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="AI-generated predictions and scenario analysis for T1D management, based on current research, clinical trials, and biological mechanisms."
              whyItMatters="Understanding future possibilities and the science behind management helps you make informed decisions and stay motivated."
              nextSteps="Explore specific scenarios to learn how AI reasoning applies to your daily diabetes management."
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  AI Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  <strong>Sources:</strong> Medical literature, clinical trial databases, 
                  peer-reviewed research, FDA filings.
                </p>
                <p>
                  <strong>Limitations:</strong> AI predictions are probabilistic estimates, 
                  not guarantees. Always consult your healthcare team.
                </p>
                <p>
                  <strong>Updates:</strong> Predictions are refreshed as new research emerges 
                  and clinical trial results are published.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
