import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Circle, 
  ExternalLink,
  Calendar,
  Building2,
  Lightbulb,
  AlertTriangle,
  History,
  Target,
  Cpu,
  Pill,
  Heart,
  Sparkles
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

interface PredictionDetailModalProps {
  prediction: TimelinePrediction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extended details for each prediction
const predictionDetails: Record<string, {
  fullDescription: string;
  timelineBreakdown: { phase: string; year: string; description: string; status: 'complete' | 'in_progress' | 'upcoming' }[];
  researchLinks: { title: string; url: string }[];
  companies: { name: string; role: string }[];
  accelerators: string[];
  delays: string[];
  relatedPredictions: string[];
  historicalContext: string;
}> = {
  '3y-1': {
    fullDescription: 'Fully automated insulin delivery represents the next evolution of closed-loop systems. Current AID (Automated Insulin Delivery) systems require manual meal announcements and carb counting. Next-generation systems will use AI/ML to detect meals automatically through glucose patterns, accelerometer data, and potentially heart rate variability. These systems will also adapt to exercise, stress, and illness with minimal user input, achieving time-in-range values above 85% for most users.',
    timelineBreakdown: [
      { phase: 'Phase 1', year: '2024-2025', description: 'Improved algorithms with faster insulin action adaptation', status: 'complete' },
      { phase: 'Phase 2', year: '2025-2026', description: 'Meal detection without manual input via ML models', status: 'in_progress' },
      { phase: 'Phase 3', year: '2027-2028', description: 'Exercise and stress auto-detection integration', status: 'upcoming' },
      { phase: 'Phase 4', year: '2028-2029', description: 'FDA approval and widespread availability', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'NIH Artificial Pancreas Research', url: 'https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/artificial-pancreas' },
      { title: 'JDRF AID Progress', url: 'https://www.jdrf.org/our-research/research-areas/glucose-control/' },
      { title: 'Clinical Trials.gov - AID Studies', url: 'https://clinicaltrials.gov/search?term=automated%20insulin%20delivery' }
    ],
    companies: [
      { name: 'Medtronic', role: 'Leading with 780G algorithm improvements' },
      { name: 'Insulet (Omnipod)', role: 'Omnipod 5 horizontal expansion, Omnipod GO development' },
      { name: 'Tandem', role: 'Control-IQ updates with predictive bolusing' },
      { name: 'Beta Bionics', role: 'iLet bionic pancreas - fully automated approach' }
    ],
    accelerators: [
      'Faster-acting insulins (Lyumjev, Fiasp) improve algorithm performance',
      'Machine learning advances in pattern recognition',
      'Improved CGM accuracy reducing false readings',
      'Integration with smartwatches for activity data'
    ],
    delays: [
      'FDA regulatory requirements for meal detection claims',
      'Insurance coverage for premium systems',
      'User acceptance of fully automated control'
    ],
    relatedPredictions: ['3y-3', '5y-3'],
    historicalContext: 'The first commercial closed-loop system (Medtronic 670G) launched in 2016. Since then, systems have rapidly improved with Control-IQ (2020), Omnipod 5 (2022), and 780G (2022) each showing significant improvements in time-in-range.'
  },
  '3y-2': {
    fullDescription: 'Once-weekly basal insulins represent a major quality-of-life improvement for people with diabetes. Insulin icodec (Awiqli by Novo Nordisk) has completed Phase 3 trials showing non-inferiority to daily basal insulins with the convenience of just 52 injections per year instead of 365. This reduces injection burden by 85% while maintaining excellent glycemic control.',
    timelineBreakdown: [
      { phase: 'Clinical Trials', year: '2021-2023', description: 'ONWARDS trial program completed', status: 'complete' },
      { phase: 'EU Approval', year: '2024', description: 'EMA approval received', status: 'complete' },
      { phase: 'FDA Review', year: '2024-2025', description: 'FDA submission and review process', status: 'in_progress' },
      { phase: 'US Launch', year: '2025-2026', description: 'Commercial availability in US', status: 'upcoming' },
      { phase: 'T1D Adoption', year: '2027-2029', description: 'Widespread T1D-specific use and protocols', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'ONWARDS Trial Results', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2303208' },
      { title: 'Novo Nordisk Awiqli', url: 'https://www.novonordisk.com/science-and-technology/r-and-d-pipeline.html' }
    ],
    companies: [
      { name: 'Novo Nordisk', role: 'Developer of insulin icodec (Awiqli)' },
      { name: 'Eli Lilly', role: 'Developing competing weekly insulin' }
    ],
    accelerators: [
      'Strong Phase 3 trial results',
      'Growing focus on reducing injection burden',
      'Potential for improved adherence'
    ],
    delays: [
      'FDA approval timeline',
      'Insurance formulary placement',
      'Physician education on dosing adjustments'
    ],
    relatedPredictions: ['3y-1'],
    historicalContext: 'The evolution of basal insulin has moved from NPH (twice daily, peaked) to Lantus/Levemir (once daily) to Tresiba (ultra-long-acting). Weekly insulin represents the next step in reducing the burden of basal insulin delivery.'
  },
  '5y-1': {
    fullDescription: 'Stem cell-derived islet therapies represent the most promising path to insulin independence. Vertex\'s VX-880 program has already shown that patients can achieve complete insulin independence using stem cell-derived beta cells. The key challenges remain reducing or eliminating immunosuppression requirements while scaling manufacturing to treat millions of people.',
    timelineBreakdown: [
      { phase: 'Phase 1/2', year: '2021-2024', description: 'VX-880 proof of concept with full immunosuppression', status: 'complete' },
      { phase: 'Phase 2 Expansion', year: '2024-2025', description: 'Expanded enrollment, optimized dosing', status: 'in_progress' },
      { phase: 'Phase 3 Initiation', year: '2025-2026', description: 'Large-scale pivotal trials begin', status: 'upcoming' },
      { phase: 'Phase 3 Completion', year: '2028-2031', description: 'Primary endpoint data', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'Vertex VX-880 Results', url: 'https://investors.vrtx.com/news-releases/news-release-details/vertex-presents-new-data-vx-880-phase-12-clinical-trial' },
      { title: 'Nature - Stem Cell Beta Cells', url: 'https://www.nature.com/articles/s41586-022-04535-1' }
    ],
    companies: [
      { name: 'Vertex Pharmaceuticals', role: 'Leading with VX-880 (immunosuppressed) and VX-264 (encapsulated)' },
      { name: 'ViaCyte', role: 'Pioneer in encapsulated cell therapy' },
      { name: 'CRISPR Therapeutics', role: 'Gene-edited immune-evasive cells' }
    ],
    accelerators: [
      'Remarkable VX-880 Phase 1/2 results',
      'Multiple parallel approaches (encapsulation, gene editing)',
      'Manufacturing advances in stem cell production'
    ],
    delays: [
      'Long-term durability data requirements',
      'Immunosuppression concerns for widespread use',
      'Manufacturing scale-up challenges'
    ],
    relatedPredictions: ['10y-1', '15y-1'],
    historicalContext: 'The concept of replacing beta cells dates back to the Edmonton Protocol (2000) for islet transplantation. The breakthrough of creating functional beta cells from stem cells (2014, Douglas Melton lab) opened the door to unlimited cell supply.'
  },
  '5y-2': {
    fullDescription: 'Non-invasive glucose monitoring would eliminate the need for sensor insertions entirely. Multiple technologies are being pursued including optical spectroscopy, radio frequency sensing, and bioimpedance. While several companies have claimed success, achieving FDA-cleared accuracy that matches current CGMs remains challenging.',
    timelineBreakdown: [
      { phase: 'Research', year: '2015-2023', description: 'Multiple technology approaches developed', status: 'complete' },
      { phase: 'Clinical Studies', year: '2023-2025', description: 'Large-scale accuracy validation', status: 'in_progress' },
      { phase: 'FDA Adjunctive', year: '2026-2028', description: 'First FDA clearance for adjunctive use', status: 'upcoming' },
      { phase: 'Standalone Use', year: '2029-2031', description: 'Non-adjunctive FDA clearance', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'Know Labs Bio-RFID', url: 'https://knowlabs.co/' },
      { title: 'Apple Watch Glucose Rumors', url: 'https://www.bloomberg.com/news/articles/2023-02-22/apple-watch-blood-glucose-monitor-could-be-years-away' }
    ],
    companies: [
      { name: 'Know Labs', role: 'Bio-RFID spectroscopy technology' },
      { name: 'Dexcom', role: 'Acquired Afon Technology for optical sensing' },
      { name: 'Apple', role: 'Rumored optical glucose sensing in Apple Watch' }
    ],
    accelerators: [
      'Advances in optical sensing miniaturization',
      'Machine learning for signal processing',
      'Consumer demand for wearable health'
    ],
    delays: [
      'Accuracy achieving MARD <10%',
      'Interference from skin conditions, hydration',
      'Regulatory pathway for new technology type'
    ],
    relatedPredictions: ['3y-3'],
    historicalContext: 'Non-invasive glucose monitoring has been the "holy grail" for decades. The GlucoWatch (2001) was the first FDA-cleared device but was discontinued due to accuracy and skin irritation issues. Current CGMs have set a high accuracy bar.'
  },
  '10y-1': {
    fullDescription: 'Encapsulated cell therapy combines stem cell-derived beta cells with protective barriers that allow insulin to diffuse out while preventing immune cells from attacking. This could provide the benefits of cell therapy without chronic immunosuppression, making the treatment accessible to a much broader population.',
    timelineBreakdown: [
      { phase: 'VX-264 Phase 1', year: '2023-2025', description: 'Initial safety and feasibility', status: 'in_progress' },
      { phase: 'Device Optimization', year: '2025-2028', description: 'Improved encapsulation durability', status: 'upcoming' },
      { phase: 'Phase 2/3', year: '2028-2032', description: 'Large-scale efficacy trials', status: 'upcoming' },
      { phase: 'FDA Approval', year: '2033-2036', description: 'Commercial availability', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'Vertex VX-264 Program', url: 'https://www.vrtx.com/research-development/pipeline/' },
      { title: 'Sigilon Encapsulation', url: 'https://sigilon.com/technology/' }
    ],
    companies: [
      { name: 'Vertex', role: 'VX-264 encapsulated cell therapy' },
      { name: 'Sigilon', role: 'Afibromer encapsulation technology' },
      { name: 'Sernova', role: 'Cell Pouch vascularization approach' }
    ],
    accelerators: [
      'Success of VX-880 proving cell therapy works',
      'Advances in biocompatible materials',
      'Understanding of fibrotic response'
    ],
    delays: [
      'Long-term encapsulation durability',
      'Vascularization requirements',
      'Manufacturing complexity'
    ],
    relatedPredictions: ['5y-1', '15y-1'],
    historicalContext: 'Encapsulation approaches have been studied since the 1980s. The challenge has always been creating materials that allow nutrient/insulin exchange while blocking immune cells and avoiding fibrosis.'
  },
  '15y-1': {
    fullDescription: 'A functional cure for newly diagnosed patients would combine early immune intervention to stop the autoimmune attack with beta cell preservation or replacement. By treating at diagnosis when significant beta cell mass remains, remission periods of 5+ years could become routine.',
    timelineBreakdown: [
      { phase: 'Combination Trials', year: '2024-2028', description: 'Testing immune + cell therapies together', status: 'in_progress' },
      { phase: 'Optimal Protocols', year: '2028-2034', description: 'Identifying best treatment combinations', status: 'upcoming' },
      { phase: 'Population Trials', year: '2034-2038', description: 'Large-scale validation', status: 'upcoming' },
      { phase: 'Standard of Care', year: '2038-2041', description: 'Adoption as first-line treatment', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'TrialNet Prevention Studies', url: 'https://www.trialnet.org/' },
      { title: 'Breakthrough T1D Research', url: 'https://www.breakthrought1d.org/' }
    ],
    companies: [
      { name: 'Provention Bio/Sanofi', role: 'Tzield immune intervention' },
      { name: 'Vertex', role: 'Cell replacement component' },
      { name: 'Imcyse', role: 'Immune tolerance induction' }
    ],
    accelerators: [
      'Tzield approval proving delay is possible',
      'Better understanding of disease stages',
      'Personalized medicine approaches'
    ],
    delays: [
      'Individual variability in response',
      'Long trial durations needed',
      'Cost of combination therapies'
    ],
    relatedPredictions: ['10y-2', '20y-1'],
    historicalContext: 'The concept of a "honeymoon period" where newly diagnosed patients retain some insulin production has long suggested early intervention could be key. Tzield\'s 2022 FDA approval for delaying T1D onset was the first validation of this approach.'
  },
  '20y-1': {
    fullDescription: 'Universal prevention would involve screening all newborns for T1D genetic risk and autoantibodies, followed by safe preventive interventions for high-risk individuals. This population-level approach could reduce new T1D diagnoses by 70% or more in developed countries.',
    timelineBreakdown: [
      { phase: 'Screening Pilots', year: '2024-2030', description: 'Regional newborn screening programs', status: 'in_progress' },
      { phase: 'Safe Interventions', year: '2025-2035', description: 'Developing treatments safe for children', status: 'upcoming' },
      { phase: 'Policy Development', year: '2035-2040', description: 'Public health framework creation', status: 'upcoming' },
      { phase: 'Global Rollout', year: '2040-2046', description: 'Widespread implementation', status: 'upcoming' }
    ],
    researchLinks: [
      { title: 'ASK Study - Screening', url: 'https://www.askhealth.org/' },
      { title: 'TEDDY Study Results', url: 'https://teddy.epi.usf.edu/' }
    ],
    companies: [
      { name: 'Screening Programs', role: 'ASK, Fr1da, regional initiatives' },
      { name: 'WHO', role: 'Global policy coordination' },
      { name: 'TrialNet', role: 'Prevention trial infrastructure' }
    ],
    accelerators: [
      'Tzield pathway for prevention',
      'Cost-effective screening technologies',
      'Political will for public health investment'
    ],
    delays: [
      'Funding for population-level programs',
      'Intervention safety for healthy children',
      'Global healthcare inequity'
    ],
    relatedPredictions: ['10y-2', '15y-1'],
    historicalContext: 'Newborn screening programs for metabolic diseases have been successful since the 1960s. Applying this model to T1D prevention would require safe, accessible interventions that can be delivered at scale.'
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'technology': return <Cpu className="h-5 w-5" />;
    case 'treatment': return <Pill className="h-5 w-5" />;
    case 'cure': return <Heart className="h-5 w-5" />;
    case 'quality_of_life': return <Sparkles className="h-5 w-5" />;
    default: return <Target className="h-5 w-5" />;
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

export function PredictionDetailModal({ prediction, open, onOpenChange }: PredictionDetailModalProps) {
  if (!prediction) return null;

  const details = predictionDetails[prediction.id];
  const hasDetails = !!details;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className={getCategoryColor(prediction.category)}>
              {getCategoryIcon(prediction.category)}
              <span className="ml-1 capitalize">{prediction.category.replace('_', ' ')}</span>
            </Badge>
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {prediction.year}
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{prediction.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Probability */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Probability Assessment</span>
              <span className="text-2xl font-bold text-primary">{prediction.probability}%</span>
            </div>
            <Progress value={prediction.probability} className="h-3" />
          </div>

          {/* Full Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              Detailed Overview
            </h3>
            <p className="text-muted-foreground">
              {hasDetails ? details.fullDescription : prediction.description}
            </p>
          </div>

          {/* Current Status */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Current Status</h3>
              <p className="text-sm text-muted-foreground">{prediction.currentStatus}</p>
            </CardContent>
          </Card>

          {hasDetails && (
            <>
              {/* Timeline Breakdown */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Development Timeline
                </h3>
                <div className="space-y-3">
                  {details.timelineBreakdown.map((phase, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {phase.status === 'complete' ? (
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      ) : phase.status === 'in_progress' ? (
                        <Circle className="h-5 w-5 text-warning mt-0.5 animate-pulse" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{phase.phase}</span>
                          <Badge variant="outline" className="text-xs">{phase.year}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Key Players */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Key Companies & Institutions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {details.companies.map((company, idx) => (
                    <Card key={idx} className="bg-muted/20">
                      <CardContent className="p-3">
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.role}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Accelerators & Delays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    What Could Accelerate
                  </h3>
                  <ul className="space-y-1">
                    {details.accelerators.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    Potential Delays
                  </h3>
                  <ul className="space-y-1">
                    {details.delays.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-warning mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Historical Context */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Historical Context
                </h3>
                <p className="text-sm text-muted-foreground">{details.historicalContext}</p>
              </div>

              {/* Research Links */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Learn More
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.researchLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {link.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Milestones */}
          <div>
            <h3 className="font-semibold mb-2">Key Milestones</h3>
            <div className="flex flex-wrap gap-2">
              {prediction.milestones.map((milestone, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {milestone}
                </Badge>
              ))}
            </div>
          </div>

          {/* Key Players */}
          <div>
            <h3 className="font-semibold mb-2">Organizations Involved</h3>
            <div className="flex flex-wrap gap-2">
              {prediction.keyPlayers.map((player, idx) => (
                <Badge key={idx} variant="outline">
                  {player}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
