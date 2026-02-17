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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  FlaskConical, 
  Lightbulb, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  FileText,
  Share2,
  BookOpen,
  Target
} from 'lucide-react';

interface PatternDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pattern: {
    id: string;
    name: string;
    detected: boolean;
    confidence: number;
    description: string;
    clinicalSignificance: string;
    possibleCauses: string[];
    recommendedActions: string[];
    affectedTimeframe?: string;
    severity: 'mild' | 'moderate' | 'significant';
  } | null;
  dataPointsUsed?: number;
}

// Comprehensive methodology explanations for each pattern
const patternMethodology: Record<string, {
  algorithm: string;
  thresholds: { name: string; value: string; description: string }[];
  dataRequirements: string;
  confidenceCalculation: string;
  clinicalBasis: { citation: string; finding: string }[];
  relatedPatterns: string[];
  actionPriorities: { action: string; priority: 'high' | 'medium' | 'low'; difficulty: 'easy' | 'moderate' | 'complex'; timeframe: string }[];
}> = {
  'dawn-phenomenon': {
    algorithm: 'Time-series analysis comparing mean glucose values in 4-7 AM window vs 12-4 AM baseline window. A sustained rise of >15 mg/dL that is not preceded by carbohydrate intake or preceded by hypoglycemia is flagged as Dawn Phenomenon.',
    thresholds: [
      { name: 'Minimum Rise', value: '15 mg/dL', description: 'Glucose increase from overnight nadir to morning peak' },
      { name: 'Time Window', value: '4:00-7:00 AM', description: 'Primary detection window for hormonal surge' },
      { name: 'Baseline Window', value: '12:00-4:00 AM', description: 'Reference period for comparison (should be stable)' },
      { name: 'Exclusion Criteria', value: '<70 mg/dL overnight', description: 'Somogyi effect ruled out if no prior low' }
    ],
    dataRequirements: 'Minimum 7 days of continuous CGM data with >80% wear time overnight. More data improves confidence.',
    confidenceCalculation: 'Confidence = (consistency across nights × magnitude of rise × absence of confounders) / 100. Rise >40 mg/dL on >80% of nights yields >90% confidence.',
    clinicalBasis: [
      { citation: 'Diabetes Care 2019; 42:1121-1128', finding: 'Dawn Phenomenon affects 54% of T1D patients with average rise of 24 mg/dL' },
      { citation: 'J Clin Endocrinol Metab 2020', finding: 'Cortisol peak at 6-8 AM drives hepatic glucose production independent of meals' },
      { citation: 'Diabetes Technology & Therapeutics 2021', finding: 'AID systems reduce Dawn Phenomenon impact by 65% vs MDI' }
    ],
    relatedPatterns: ['Nocturnal Hypoglycemia (rule out Somogyi)', 'High Fasting Glucose', 'Morning Insulin Resistance'],
    actionPriorities: [
      { action: 'Increase basal rate 2-3 hours before typical rise starts', priority: 'high', difficulty: 'moderate', timeframe: '1-2 weeks to optimize' },
      { action: 'Switch to or optimize AID system', priority: 'high', difficulty: 'complex', timeframe: '2-4 weeks transition' },
      { action: 'Time-shift long-acting insulin (MDI users)', priority: 'medium', difficulty: 'moderate', timeframe: '1 week trial' },
      { action: 'Eat lower-carb breakfast', priority: 'low', difficulty: 'easy', timeframe: 'Immediate' }
    ]
  },
  'nocturnal-hypoglycemia': {
    algorithm: 'Identify glucose readings <70 mg/dL occurring between 12:00 AM and 6:00 AM. Calculate percentage of nights affected and average nadir. Cross-reference with pre-bed glucose and evening insulin doses.',
    thresholds: [
      { name: 'Hypoglycemia Threshold', value: '<70 mg/dL', description: 'ADA-defined hypoglycemia level' },
      { name: 'Severe Threshold', value: '<54 mg/dL', description: 'Level 2 hypoglycemia requiring immediate action' },
      { name: 'Time Window', value: '12:00-6:00 AM', description: 'Nocturnal period when awareness is reduced' },
      { name: 'Frequency Concern', value: '>30% of nights', description: 'Threshold for pattern classification' }
    ],
    dataRequirements: 'Minimum 14 days of overnight CGM data. Insulin dose logs improve analysis accuracy.',
    confidenceCalculation: 'Based on frequency (nights affected / total nights) × severity factor (deeper lows = higher weight) × duration factor.',
    clinicalBasis: [
      { citation: 'Diabetes Care 2017; 40:655-662', finding: 'Nocturnal hypoglycemia occurs on 8.5% of nights in T1D; often undetected without CGM' },
      { citation: 'JDRF CGM Study', finding: 'CGM reduces nocturnal hypoglycemia by 50% through predictive alerts' },
      { citation: 'Lancet Diabetes Endocrinol 2020', finding: 'Recurrent nocturnal lows associated with hypoglycemia unawareness development' }
    ],
    relatedPatterns: ['Dawn Phenomenon (distinguish from Somogyi)', 'Insulin Stacking Risk', 'Post-Exercise Delayed Lows'],
    actionPriorities: [
      { action: 'Reduce overnight basal rates by 10-20%', priority: 'high', difficulty: 'moderate', timeframe: '3-5 days to assess' },
      { action: 'Set CGM low alert at 80-85 mg/dL for earlier warning', priority: 'high', difficulty: 'easy', timeframe: 'Immediate' },
      { action: 'Review evening correction factor accuracy', priority: 'medium', difficulty: 'moderate', timeframe: '1-2 weeks' },
      { action: 'Consider small bedtime snack with protein/fat', priority: 'low', difficulty: 'easy', timeframe: 'Immediate trial' }
    ]
  },
  'post-meal-spikes': {
    algorithm: 'Identify post-prandial glucose excursions >180 mg/dL within 2 hours of logged meals or detected carbohydrate intake. Calculate delta from pre-meal baseline and time to peak.',
    thresholds: [
      { name: 'Spike Threshold', value: '>180 mg/dL', description: 'Post-meal glucose exceeding target range' },
      { name: 'Delta Threshold', value: '>60 mg/dL rise', description: 'Significant increase from pre-meal baseline' },
      { name: 'Time to Peak', value: '60-90 minutes', description: 'Typical post-meal peak timing' },
      { name: 'Recovery Time', value: '<3 hours', description: 'Time to return to pre-meal range' }
    ],
    dataRequirements: 'CGM data with meal logging. At least 14 meals logged for pattern analysis.',
    confidenceCalculation: 'Frequency of spikes × consistency of spike pattern × meal data quality. More logged meals = higher confidence.',
    clinicalBasis: [
      { citation: 'Diabetes Care 2024 Standards', finding: 'Post-meal targets: <180 mg/dL at 1-2 hours for most T1D adults' },
      { citation: 'Cardiovascular Diabetology 2020', finding: 'Post-prandial hyperglycemia independently predicts cardiovascular events' },
      { citation: 'Diabetes Technol Ther 2019', finding: 'Pre-bolusing 15-20 minutes reduces post-meal peaks by 40%' }
    ],
    relatedPatterns: ['Fat/Protein Delayed Spikes', 'Carbohydrate Counting Accuracy', 'Insulin Timing Issues'],
    actionPriorities: [
      { action: 'Pre-bolus 15-20 minutes before eating', priority: 'high', difficulty: 'easy', timeframe: 'Immediate' },
      { action: 'Review carbohydrate counting accuracy', priority: 'high', difficulty: 'moderate', timeframe: '1-2 weeks' },
      { action: 'Choose lower glycemic index carbohydrates', priority: 'medium', difficulty: 'moderate', timeframe: 'Ongoing' },
      { action: 'Use extended bolus for high-fat meals', priority: 'medium', difficulty: 'moderate', timeframe: 'Per-meal basis' }
    ]
  },
  'high-variability-periods': {
    algorithm: 'Calculate coefficient of variation (CV) and standard deviation for each 4-hour block. Identify periods with CV >36% or SD >50 mg/dL as high variability.',
    thresholds: [
      { name: 'Target CV', value: '<36%', description: 'Recommended glucose variability target' },
      { name: 'High CV', value: '>36%', description: 'Indicates unstable glucose patterns' },
      { name: 'Target SD', value: '<50 mg/dL', description: 'Standard deviation goal' },
      { name: 'Time Block', value: '4 hours', description: 'Analysis window for variability calculation' }
    ],
    dataRequirements: 'Minimum 14 days of CGM data for reliable variability assessment.',
    confidenceCalculation: 'Based on data density in identified periods × consistency of variability pattern.',
    clinicalBasis: [
      { citation: 'Diabetes Care 2020', finding: 'CV >36% associated with increased hypoglycemia risk and complications' },
      { citation: 'J Diabetes Sci Technol 2021', finding: 'Glycemic variability independent predictor of retinopathy progression' }
    ],
    relatedPatterns: ['Insulin Timing Issues', 'Carbohydrate Inconsistency', 'Exercise Effects'],
    actionPriorities: [
      { action: 'Establish consistent meal and activity routines', priority: 'high', difficulty: 'moderate', timeframe: '2-4 weeks' },
      { action: 'Review CGM data specifically for high-variability periods', priority: 'high', difficulty: 'easy', timeframe: '1 week' },
      { action: 'Consider temp basal adjustments during high-risk times', priority: 'medium', difficulty: 'moderate', timeframe: 'Ongoing' }
    ]
  },
  'insulin-stacking': {
    algorithm: 'Analyze correction boluses given within 3 hours of previous bolus. Flag when active insulin on board exceeds calculated correction needs, leading to subsequent hypoglycemia.',
    thresholds: [
      { name: 'IOB Window', value: '3-4 hours', description: 'Typical rapid insulin action duration' },
      { name: 'Stacking Risk', value: '>50% IOB', description: 'Remaining active insulin when new correction given' },
      { name: 'Resultant Low', value: '<70 mg/dL', description: 'Hypoglycemia within 4 hours of stacked doses' }
    ],
    dataRequirements: 'Detailed insulin dosing logs with timestamps. CGM data for outcome tracking.',
    confidenceCalculation: 'Pattern identified when correction + IOB exceeds needs AND followed by hypoglycemia within 4 hours.',
    clinicalBasis: [
      { citation: 'Diabetes Technol Ther 2018', finding: 'Insulin stacking accounts for 15-20% of severe hypoglycemic events' },
      { citation: 'J Diabetes Sci Technol 2020', finding: 'Pump IOB calculators reduce stacking-related hypoglycemia by 40%' }
    ],
    relatedPatterns: ['Nocturnal Hypoglycemia', 'Post-Correction Lows', 'Aggressive Correction Factor'],
    actionPriorities: [
      { action: 'Wait 3-4 hours between corrections', priority: 'high', difficulty: 'easy', timeframe: 'Immediate' },
      { action: 'Always check IOB before correcting', priority: 'high', difficulty: 'easy', timeframe: 'Immediate' },
      { action: 'Understand your insulin action curve', priority: 'medium', difficulty: 'moderate', timeframe: '1-2 weeks learning' }
    ]
  }
};

const defaultMethodology = {
  algorithm: 'Pattern detected using standard glucose analysis algorithms.',
  thresholds: [],
  dataRequirements: 'Minimum 7-14 days of CGM data recommended.',
  confidenceCalculation: 'Based on frequency and consistency of pattern occurrence.',
  clinicalBasis: [],
  relatedPatterns: [],
  actionPriorities: []
};

export function PatternDetailModal({ open, onOpenChange, pattern, dataPointsUsed = 0 }: PatternDetailModalProps) {
  if (!pattern) return null;

  const methodology = patternMethodology[pattern.id] || defaultMethodology;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'significant': return 'text-destructive';
      case 'moderate': return 'text-warning';
      case 'mild': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High Priority</Badge>;
      case 'medium': return <Badge className="bg-warning/10 text-warning">Medium</Badge>;
      case 'low': return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: 'easy' | 'moderate' | 'complex') => {
    switch (difficulty) {
      case 'easy': return <Badge variant="outline" className="text-success">Easy</Badge>;
      case 'moderate': return <Badge variant="outline" className="text-warning">Moderate</Badge>;
      case 'complex': return <Badge variant="outline" className="text-destructive">Complex</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              pattern.severity === 'significant' ? 'bg-destructive/10' :
              pattern.severity === 'moderate' ? 'bg-warning/10' : 'bg-primary/10'
            }`}>
              <Brain className={`h-6 w-6 ${getSeverityColor(pattern.severity)}`} />
            </div>
            <div>
              <DialogTitle className="text-2xl">{pattern.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {Math.round(pattern.confidence * 100)}% Confidence
                </Badge>
                <Badge className={`capitalize ${
                  pattern.severity === 'significant' ? 'bg-destructive/10 text-destructive' :
                  pattern.severity === 'moderate' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                }`}>
                  {pattern.severity} Severity
                </Badge>
                {pattern.affectedTimeframe && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {pattern.affectedTimeframe}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="methodology" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="methodology" className="gap-1">
              <FlaskConical className="h-3 w-3" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="clinical" className="gap-1">
              <BookOpen className="h-3 w-3" />
              Clinical
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1">
              <Target className="h-3 w-3" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Your Data
            </TabsTrigger>
          </TabsList>

          {/* Methodology Tab */}
          <TabsContent value="methodology" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Detection Algorithm
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {methodology.algorithm}
                </p>
              </CardContent>
            </Card>

            {methodology.thresholds.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Detection Thresholds</h4>
                  <div className="space-y-3">
                    {methodology.thresholds.map((threshold, i) => (
                      <div key={i} className="flex items-start justify-between p-2 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{threshold.name}</p>
                          <p className="text-xs text-muted-foreground">{threshold.description}</p>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {threshold.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Confidence Calculation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {methodology.confidenceCalculation}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Confidence</span>
                    <span className="font-bold">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                  <Progress value={pattern.confidence * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Data Requirements</h4>
                <p className="text-sm">{methodology.dataRequirements}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Tab */}
          <TabsContent value="clinical" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Clinical Significance</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {pattern.clinicalSignificance}
                </p>
              </CardContent>
            </Card>

            {methodology.clinicalBasis.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Research Citations
                  </h4>
                  <div className="space-y-3">
                    {methodology.clinicalBasis.map((study, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">{study.finding}</p>
                        <p className="text-xs text-muted-foreground mt-1">{study.citation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Possible Causes</h4>
                <ul className="space-y-2">
                  {pattern.possibleCauses.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {methodology.relatedPatterns.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Related Patterns</h4>
                  <div className="flex flex-wrap gap-2">
                    {methodology.relatedPatterns.map((related, i) => (
                      <Badge key={i} variant="outline">{related}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            {methodology.actionPriorities.length > 0 ? (
              <div className="space-y-3">
                {methodology.actionPriorities.map((action, i) => (
                  <Card key={i} className={`${
                    action.priority === 'high' ? 'border-destructive/30' :
                    action.priority === 'medium' ? 'border-warning/30' : ''
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{action.action}</p>
                        <div className="flex gap-2">
                          {getPriorityBadge(action.priority)}
                          {getDifficultyBadge(action.difficulty)}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {action.timeframe}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {pattern.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="border-dashed">
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Share with Healthcare Provider</p>
                    <p className="text-xs text-muted-foreground">Export this analysis as a PDF report</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Your Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Analysis Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{dataPointsUsed || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Data Points Analyzed</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(pattern.confidence * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Detection Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">{pattern.description}</h4>
                {pattern.affectedTimeframe && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <Clock className="h-4 w-4" />
                    Primarily affects: {pattern.affectedTimeframe}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-4 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Important Note</p>
                  <p className="text-muted-foreground">
                    This analysis is based on the available glucose data. For personalized medical 
                    advice, please consult with your endocrinologist or diabetes care team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
