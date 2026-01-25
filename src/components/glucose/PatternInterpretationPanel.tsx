import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sunrise, Moon, Utensils, Activity, Zap, TrendingUp, 
  TrendingDown, AlertTriangle, Lightbulb, Brain, Clock
} from 'lucide-react';

interface Pattern {
  id: string;
  name: string;
  icon: React.ReactNode;
  detected: boolean;
  confidence: number;
  description: string;
  clinicalSignificance: string;
  possibleCauses: string[];
  recommendedActions: string[];
  affectedTimeframe?: string;
  severity: 'mild' | 'moderate' | 'significant';
}

interface PatternInterpretationPanelProps {
  dawnPhenomenonRise?: number;
  nightHypoPercentage?: number;
  postMealSpikes?: boolean;
  highVariabilityTimes?: string[];
  insulinStackingRisk?: boolean;
}

const PatternInterpretationPanel: React.FC<PatternInterpretationPanelProps> = ({
  dawnPhenomenonRise = 0,
  nightHypoPercentage = 0,
  postMealSpikes = false,
  highVariabilityTimes = [],
  insulinStackingRisk = false
}) => {
  const patterns: Pattern[] = [
    {
      id: 'dawn-phenomenon',
      name: 'Dawn Phenomenon',
      icon: <Sunrise className="h-5 w-5" />,
      detected: dawnPhenomenonRise > 15,
      confidence: dawnPhenomenonRise > 30 ? 0.9 : dawnPhenomenonRise > 20 ? 0.75 : 0.6,
      description: `Glucose rises by approximately ${dawnPhenomenonRise} mg/dL between 4-7 AM due to hormonal changes.`,
      clinicalSignificance: 'Common physiological response caused by cortisol and growth hormone release before waking. Affects up to 75% of T1Ds.',
      possibleCauses: [
        'Natural cortisol awakening response',
        'Growth hormone release during sleep',
        'Insufficient overnight basal insulin',
        'Waning insulin from evening dose'
      ],
      recommendedActions: [
        'Increase basal rate starting 2-3 hours before rise begins',
        'Consider closed-loop/AID system for automated adjustments',
        'Eat lower-carb breakfast if morning insulin resistance is high',
        'Time-shift long-acting insulin if on MDI'
      ],
      affectedTimeframe: '4:00 AM - 8:00 AM',
      severity: dawnPhenomenonRise > 40 ? 'significant' : dawnPhenomenonRise > 25 ? 'moderate' : 'mild'
    },
    {
      id: 'nocturnal-hypoglycemia',
      name: 'Nocturnal Hypoglycemia',
      icon: <Moon className="h-5 w-5" />,
      detected: nightHypoPercentage > 30,
      confidence: nightHypoPercentage > 40 ? 0.85 : 0.7,
      description: `${nightHypoPercentage}% of low glucose events occur between midnight and 6 AM.`,
      clinicalSignificance: 'Nocturnal lows are dangerous as symptom awareness is reduced during sleep. Associated with hypoglycemia unawareness over time.',
      possibleCauses: [
        'Excessive basal insulin overnight',
        'Late evening exercise without carb adjustment',
        'Dinner bolus stacking with bedtime correction',
        'Alcohol consumption reducing hepatic glucose output'
      ],
      recommendedActions: [
        'Reduce overnight basal rates by 10-20%',
        'Set CGM low alert at 80-85 mg/dL for earlier warning',
        'Consider small bedtime snack with protein/fat',
        'Review evening correction factor for accuracy'
      ],
      affectedTimeframe: '12:00 AM - 6:00 AM',
      severity: nightHypoPercentage > 50 ? 'significant' : nightHypoPercentage > 35 ? 'moderate' : 'mild'
    },
    {
      id: 'post-meal-spikes',
      name: 'Post-Meal Glucose Spikes',
      icon: <Utensils className="h-5 w-5" />,
      detected: postMealSpikes,
      confidence: 0.75,
      description: 'Glucose frequently exceeds 180 mg/dL within 2 hours after meals.',
      clinicalSignificance: 'Post-prandial hyperglycemia contributes significantly to overall glucose exposure and A1C. Strongly linked to cardiovascular risk.',
      possibleCauses: [
        'Insufficient pre-bolus timing',
        'Carbohydrate underestimation',
        'High glycemic index food choices',
        'Gastroparesis or delayed gastric emptying'
      ],
      recommendedActions: [
        'Pre-bolus 15-20 minutes before eating',
        'Use accurate carb counting or weigh portions',
        'Choose lower-GI carbohydrate sources',
        'Consider extended/square bolus for high-fat meals'
      ],
      affectedTimeframe: 'Post-meal (1-3 hours)',
      severity: 'moderate'
    },
    {
      id: 'high-variability-periods',
      name: 'High Variability Time Blocks',
      icon: <Activity className="h-5 w-5" />,
      detected: highVariabilityTimes.length > 0,
      confidence: 0.7,
      description: `Glucose variability is notably higher during: ${highVariabilityTimes.join(', ') || 'N/A'}.`,
      clinicalSignificance: 'Time periods with high CV indicate unpredictable glucose patterns that increase both hyper and hypoglycemia risk.',
      possibleCauses: [
        'Inconsistent meal timing or composition',
        'Variable exercise patterns',
        'Stress or hormonal fluctuations',
        'Insulin absorption variability'
      ],
      recommendedActions: [
        'Establish consistent meal and activity routines',
        'Review CGM data specifically for these periods',
        'Consider temp basal adjustments during high-risk times',
        'Use closed-loop system to automate adjustments'
      ],
      severity: highVariabilityTimes.length >= 2 ? 'moderate' : 'mild'
    },
    {
      id: 'insulin-stacking',
      name: 'Insulin Stacking Risk',
      icon: <Zap className="h-5 w-5" />,
      detected: insulinStackingRisk,
      confidence: 0.65,
      description: 'Patterns suggest possible overlapping correction doses leading to unexpected lows.',
      clinicalSignificance: 'Stacking insulin corrections before previous doses have completed their action causes dangerous hypoglycemia.',
      possibleCauses: [
        'Correcting too soon after meal bolus',
        'Ignoring active insulin on board',
        'Impatience with slow glucose descent',
        'Inaccurate pump IOB calculation'
      ],
      recommendedActions: [
        'Wait 3-4 hours between corrections',
        'Use pump IOB display before correcting',
        'Understand your insulin action curve',
        'Set pump to show remaining active insulin'
      ],
      severity: 'significant'
    }
  ];

  const detectedPatterns = patterns.filter(p => p.detected);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'significant': return 'border-destructive/30 bg-destructive/5';
      case 'moderate': return 'border-warning/30 bg-warning/5';
      case 'mild': return 'border-primary/30 bg-primary/5';
      default: return 'border-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'significant': return <Badge variant="destructive">Significant</Badge>;
      case 'moderate': return <Badge className="bg-warning/10 text-warning border-warning/20">Moderate</Badge>;
      case 'mild': return <Badge className="bg-primary/10 text-primary border-primary/20">Mild</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Pattern Detection & Clinical Interpretation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-detected patterns from the glucose data with clinical context and actionable recommendations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {detectedPatterns.length === 0 ? (
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-success">No Concerning Patterns Detected</p>
                <p className="text-sm text-muted-foreground">
                  The analyzed data shows stable glucose patterns without significant concerning trends.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          detectedPatterns.map((pattern) => (
            <Card key={pattern.id} className={`border ${getSeverityColor(pattern.severity)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      pattern.severity === 'significant' ? 'bg-destructive/10 text-destructive' :
                      pattern.severity === 'moderate' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {pattern.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{pattern.name}</h4>
                      {pattern.affectedTimeframe && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {pattern.affectedTimeframe}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(pattern.severity)}
                    <Badge variant="outline" className="text-xs">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>

                <p className="text-sm mb-3">{pattern.description}</p>

                <div className="bg-background/50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Clinical Significance
                    </p>
                    <p className="text-sm">{pattern.clinicalSignificance}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                      Possible Causes
                    </p>
                    <ul className="text-sm space-y-1">
                      {pattern.possibleCauses.slice(0, 3).map((cause, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-primary uppercase mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Recommended Actions
                    </p>
                    <ul className="text-sm space-y-1">
                      {pattern.recommendedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-primary">
                          <span>→</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Educational Note */}
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">About Pattern Detection</p>
              <p>
                These patterns are detected algorithmically from glucose data. Confidence scores indicate 
                how certain the analysis is. Always consult with your healthcare provider before making 
                significant therapy changes. Individual responses vary based on many factors.
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default PatternInterpretationPanel;
