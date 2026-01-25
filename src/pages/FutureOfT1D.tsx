import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { InfoRail } from '@/components/InfoRail';
import { PredictionDetailModal } from '@/components/future/PredictionDetailModal';
import { 
  Rocket, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Heart,
  Pill,
  Cpu,
  Syringe,
  Shield,
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  Circle
} from 'lucide-react';

interface TimelinePrediction {
  id: string;
  timeframe: string;
  year: number;
  title: string;
  description: string;
  probability: number;
  category: 'technology' | 'treatment' | 'cure' | 'quality_of_life';
  milestones: string[];
  currentStatus: string;
  keyPlayers: string[];
}

const predictions: TimelinePrediction[] = [
  // 3 Years (2029)
  {
    id: '3y-1',
    timeframe: '3 Years',
    year: 2029,
    title: 'Fully Automated Insulin Delivery',
    description: 'AI-powered closed-loop systems achieving 85%+ time-in-range with meal detection and minimal user input. Systems will automatically adjust for exercise, stress, and illness.',
    probability: 90,
    category: 'technology',
    milestones: ['FDA approval of advanced algorithms', 'Meal detection without manual input', 'Integration with smartwatches'],
    currentStatus: 'Medtronic 780G, Omnipod 5, and Tandem Control-IQ already achieving 70-75% TIR',
    keyPlayers: ['Medtronic', 'Insulet (Omnipod)', 'Tandem', 'Beta Bionics']
  },
  {
    id: '3y-2',
    timeframe: '3 Years',
    year: 2029,
    title: 'Once-Weekly Basal Insulin',
    description: 'Insulin icodec (Awiqli) and similar ultra-long-acting insulins become standard care, reducing injection burden by 85%.',
    probability: 95,
    category: 'treatment',
    milestones: ['FDA approval (expected 2024-2025)', 'Insurance coverage expansion', 'T1D-specific trials completion'],
    currentStatus: 'Insulin icodec approved in EU, FDA submission pending',
    keyPlayers: ['Novo Nordisk', 'Eli Lilly']
  },
  {
    id: '3y-3',
    timeframe: '3 Years',
    year: 2029,
    title: '14+ Day CGM Sensors',
    description: 'Extended-wear CGM sensors lasting 14-21 days with improved accuracy and no fingerstick calibrations.',
    probability: 85,
    category: 'technology',
    milestones: ['Dexcom G8 launch', 'Abbott Libre 4', 'Reduced sensor costs'],
    currentStatus: 'Dexcom G7 at 10 days, Libre 3 at 14 days',
    keyPlayers: ['Dexcom', 'Abbott', 'Medtronic']
  },

  // 5 Years (2031)
  {
    id: '5y-1',
    timeframe: '5 Years',
    year: 2031,
    title: 'Stem Cell Therapy Phase 3 Results',
    description: 'Multiple stem cell-derived islet therapies complete Phase 3 trials with patients achieving 1+ year insulin independence.',
    probability: 70,
    category: 'cure',
    milestones: ['VX-880 Phase 3 completion', 'Encapsulation device improvements', 'Reduced immunosuppression protocols'],
    currentStatus: 'VX-880 showing promising Phase 1/2 results with full insulin independence',
    keyPlayers: ['Vertex Pharmaceuticals', 'ViaCyte', 'CRISPR Therapeutics']
  },
  {
    id: '5y-2',
    timeframe: '5 Years',
    year: 2031,
    title: 'Non-Invasive Glucose Monitoring',
    description: 'First FDA-approved non-invasive glucose monitoring devices for adjunctive use, reducing sensor insertions.',
    probability: 55,
    category: 'technology',
    milestones: ['Spectroscopy accuracy improvements', 'Wearable device miniaturization', 'Regulatory pathway established'],
    currentStatus: 'Multiple companies in clinical trials (Know Labs, Afon Technology)',
    keyPlayers: ['Know Labs', 'Dexcom', 'Apple (rumored)']
  },
  {
    id: '5y-3',
    timeframe: '5 Years',
    year: 2031,
    title: 'Dual-Hormone Artificial Pancreas',
    description: 'Commercially available insulin + glucagon (or pramlintide) systems virtually eliminating severe hypoglycemia.',
    probability: 75,
    category: 'technology',
    milestones: ['Stable glucagon formulations', 'iLet bionic pancreas expansion', 'Multi-hormone algorithms'],
    currentStatus: 'Beta Bionics iLet approved for insulin-only, dual-hormone trials ongoing',
    keyPlayers: ['Beta Bionics', 'Zealand Pharma', 'Xeris']
  },

  // 10 Years (2036)
  {
    id: '10y-1',
    timeframe: '10 Years',
    year: 2036,
    title: 'Encapsulated Cell Therapy Available',
    description: 'FDA-approved encapsulated stem cell therapies available without chronic immunosuppression, providing years of insulin independence.',
    probability: 60,
    category: 'cure',
    milestones: ['Immune-evasive cell engineering', 'Durable encapsulation devices', 'Scalable manufacturing'],
    currentStatus: 'VX-264 (encapsulated) in early trials',
    keyPlayers: ['Vertex', 'Sigilon', 'Sernova']
  },
  {
    id: '10y-2',
    timeframe: '10 Years',
    year: 2036,
    title: 'Teplizumab-like Prevention Therapies',
    description: 'Multiple immune therapies available to delay T1D onset by 5+ years in at-risk individuals.',
    probability: 65,
    category: 'cure',
    milestones: ['Population screening programs', 'Combination therapy protocols', 'Earlier intervention trials'],
    currentStatus: 'Tzield (teplizumab) approved for delay, more drugs in trials',
    keyPlayers: ['Provention Bio/Sanofi', 'Imcyse', 'Diamyd Medical']
  },
  {
    id: '10y-3',
    timeframe: '10 Years',
    year: 2036,
    title: 'Implantable Insulin Pumps',
    description: 'Long-term implantable insulin delivery systems requiring only monthly reservoir refills.',
    probability: 50,
    category: 'technology',
    milestones: ['Biocompatible materials advances', 'Miniaturized pumps', 'Wireless refilling technology'],
    currentStatus: 'Research phase, building on past implantable pump experience',
    keyPlayers: ['PhysioLogic Devices', 'Academic research centers']
  },

  // 15 Years (2041)
  {
    id: '15y-1',
    timeframe: '15 Years',
    year: 2041,
    title: 'Functional Cure for New Diagnosis',
    description: 'Combination of immune therapy + beta cell preservation achieves 5+ year remission in most newly diagnosed patients.',
    probability: 50,
    category: 'cure',
    milestones: ['Personalized immunotherapy protocols', 'Early detection programs', 'Beta cell regeneration'],
    currentStatus: 'Combination trials starting',
    keyPlayers: ['Multiple academic centers', 'Breakthrough T1D initiatives']
  },
  {
    id: '15y-2',
    timeframe: '15 Years',
    year: 2041,
    title: 'Gene Therapy Trials',
    description: 'CRISPR-based gene therapies in human trials to restore insulin production or create insulin-producing cells.',
    probability: 45,
    category: 'cure',
    milestones: ['Safe gene editing delivery', 'Durable expression', 'Off-target effect elimination'],
    currentStatus: 'Preclinical research, building on T1D gene therapy concepts',
    keyPlayers: ['CRISPR Therapeutics', 'Beam Therapeutics', 'Academic centers']
  },
  {
    id: '15y-3',
    timeframe: '15 Years',
    year: 2041,
    title: 'Smart Insulin',
    description: 'Glucose-responsive insulin formulations that activate only when glucose is elevated, mimicking natural insulin secretion.',
    probability: 55,
    category: 'treatment',
    milestones: ['Glucose-sensing molecules', 'Rapid on/off kinetics', 'Safety profiles established'],
    currentStatus: 'Multiple academic and pharma programs in early research',
    keyPlayers: ['Novo Nordisk', 'Eli Lilly', 'MIT research']
  },

  // 20 Years (2046)
  {
    id: '20y-1',
    timeframe: '20 Years',
    year: 2046,
    title: 'Universal Prevention',
    description: 'Routine newborn screening + preventive therapy reduces new T1D cases by 70%+ in developed countries.',
    probability: 40,
    category: 'cure',
    milestones: ['Global screening infrastructure', 'Safe neonatal interventions', 'Public health policy adoption'],
    currentStatus: 'Screening pilots underway, prevention proof of concept established',
    keyPlayers: ['Public health systems', 'WHO initiatives']
  },
  {
    id: '20y-2',
    timeframe: '20 Years',
    year: 2046,
    title: 'Complete Biological Cure',
    description: 'Gene therapy or xenotransplantation provides permanent restoration of normal glucose regulation for established T1D.',
    probability: 35,
    category: 'cure',
    milestones: ['Xenograft immune tolerance', 'Gene editing permanence', 'Long-term safety data'],
    currentStatus: 'Foundational research ongoing',
    keyPlayers: ['Research institutions worldwide']
  }
];

const qualityOfLifeProjections = [
  {
    timeframe: '3 Years',
    metrics: [
      { label: 'Average Time in Range', current: '55%', projected: '75%' },
      { label: 'Severe Hypos per Year', current: '1.5', projected: '0.5' },
      { label: 'Daily Device Interactions', current: '8-12', projected: '3-5' },
      { label: 'A1C without Hypos', current: '7.2%', projected: '6.8%' }
    ]
  },
  {
    timeframe: '10 Years',
    metrics: [
      { label: 'Average Time in Range', current: '55%', projected: '85%' },
      { label: 'Severe Hypos per Year', current: '1.5', projected: '0.1' },
      { label: 'Daily Device Interactions', current: '8-12', projected: '1-2' },
      { label: 'Complications Rate', current: '30%', projected: '10%' }
    ]
  }
];

export default function FutureOfT1D() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('3 Years');
  const [selectedPrediction, setSelectedPrediction] = useState<TimelinePrediction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const timeframes = ['3 Years', '5 Years', '10 Years', '15 Years', '20 Years'];
  
  const filteredPredictions = predictions.filter(p => p.timeframe === selectedTimeframe);

  const handlePredictionClick = (prediction: TimelinePrediction) => {
    setSelectedPrediction(prediction);
    setModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return <Cpu className="h-4 w-4" />;
      case 'treatment': return <Pill className="h-4 w-4" />;
      case 'cure': return <Heart className="h-4 w-4" />;
      case 'quality_of_life': return <Sparkles className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

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
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-highlight to-success rounded-2xl flex items-center justify-center">
              <Rocket className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">The Future of Type 1 Diabetes</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based predictions for T1D treatment, technology, and cure based on 
            current research, clinical trials, and innovation trajectories.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Research-Based Projections
            </Badge>
            <Badge variant="outline">Updated January 2026</Badge>
          </div>
        </section>

        {/* Timeline Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(tf)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {tf}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Year Header */}
            <Card className="bg-gradient-to-r from-primary/5 to-highlight/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedTimeframe} from Now ({predictions.find(p => p.timeframe === selectedTimeframe)?.year})
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {filteredPredictions.length} major predictions across technology, treatment, and cure research
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Average Probability</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(filteredPredictions.reduce((sum, p) => sum + p.probability, 0) / filteredPredictions.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Predictions */}
            <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
                <Card 
                  key={prediction.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getCategoryColor(prediction.category)}>
                            {getCategoryIcon(prediction.category)}
                            <span className="ml-1 capitalize">{prediction.category.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{prediction.title}</CardTitle>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-3xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                          {prediction.probability}%
                        </div>
                        <p className="text-xs text-muted-foreground">likelihood</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{prediction.description}</p>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Confidence Level</span>
                        <span className="font-medium">{prediction.probability}%</span>
                      </div>
                      <Progress value={prediction.probability} className="h-2" />
                    </div>

                    {/* Current Status */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Current Status</p>
                      <p className="text-sm text-muted-foreground">{prediction.currentStatus}</p>
                    </div>

                    {/* Milestones */}
                    <div>
                      <p className="text-sm font-medium mb-2">Key Milestones</p>
                      <div className="space-y-1">
                        {prediction.milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Circle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Players */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">Key Players:</span>
                      {prediction.keyPlayers.map((player, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quality of Life Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-highlight" />
                  Quality of Life Projections
                </CardTitle>
                <CardDescription>
                  Expected improvements in daily diabetes management metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {qualityOfLifeProjections.map((projection) => (
                    <div key={projection.timeframe} className="space-y-4">
                      <h4 className="font-semibold text-lg">{projection.timeframe}</h4>
                      {projection.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{metric.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{metric.current}</span>
                            <ChevronRight className="h-4 w-4 text-success" />
                            <span className="font-semibold text-success">{metric.projected}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <InfoRail
              whatThisShows="Evidence-based predictions for the future of T1D treatment and cure, organized by timeline."
              whyItMatters="Understanding the research pipeline helps you stay informed and hopeful about upcoming advances."
              nextSteps="Stay engaged with clinical trials and advocacy to help accelerate these timelines."
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Methodology
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Predictions based on:
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Current clinical trial phases</li>
                  <li>Historical approval timelines</li>
                  <li>Research funding levels</li>
                  <li>Technical feasibility</li>
                  <li>Regulatory environment</li>
                </ul>
                <p className="text-xs italic">
                  Probabilities are estimates and subject to change as research evolves.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Rocket className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Help Accelerate Progress</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Support research, join trials, and advocate for funding.
                </p>
                <Button size="sm" className="mt-3 w-full" asChild>
                  <a href="/donate">Donate to Research</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prediction Detail Modal */}
        <PredictionDetailModal
          prediction={selectedPrediction}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </Layout>
  );
}
