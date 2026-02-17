import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Moon, 
  Sun,
  Activity,
  Target,
  Lightbulb,
  Stethoscope,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ClinicalSuggestionsPanelProps {
  summary: {
    rangeDistribution?: {
      veryLow?: number;
      low?: number;
      inRange?: number;
      high?: number;
      veryHigh?: number;
    };
    variability?: {
      mean?: number;
      cv?: number;
      gmi?: number;
    };
    timeBlocks?: Array<{
      name: string;
      avg: number;
      cv: number;
      tir: number;
    }>;
    hourlyAverages?: Array<{
      hour: number;
      average: number;
    }>;
  } | null;
}

interface Suggestion {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'hypoglycemia' | 'hyperglycemia' | 'variability' | 'pattern' | 'optimization';
  title: string;
  description: string;
  explanation: string;
  action: string;
  icon: React.ReactNode;
  research?: string;
}

export const ClinicalSuggestionsPanel: React.FC<ClinicalSuggestionsPanelProps> = ({ summary }) => {
  const suggestions: Suggestion[] = [];

  if (!summary) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data available for clinical suggestions</p>
        </CardContent>
      </Card>
    );
  }

  const { rangeDistribution, variability, timeBlocks, hourlyAverages } = summary;

  // Analyze for Dawn Phenomenon (glucose rise 4-7 AM)
  if (hourlyAverages && hourlyAverages.length > 0) {
    const earlyMorningHours = hourlyAverages.filter(h => h.hour >= 4 && h.hour <= 7);
    const nightHours = hourlyAverages.filter(h => h.hour >= 0 && h.hour <= 3);
    
    if (earlyMorningHours.length > 0 && nightHours.length > 0) {
      const earlyMorningAvg = earlyMorningHours.reduce((sum, h) => sum + h.average, 0) / earlyMorningHours.length;
      const nightAvg = nightHours.reduce((sum, h) => sum + h.average, 0) / nightHours.length;
      
      if (earlyMorningAvg - nightAvg > 20) {
        suggestions.push({
          id: 'dawn-phenomenon',
          priority: 'high',
          category: 'pattern',
          title: 'Dawn Phenomenon Detected',
          description: `Average glucose rises ${Math.round(earlyMorningAvg - nightAvg)} mg/dL between midnight and early morning.`,
          explanation: 'The Dawn Phenomenon is a natural rise in blood glucose that occurs in the early morning hours (typically 4-8 AM) due to hormonal changes. Growth hormone, cortisol, and glucagon levels increase to prepare your body for waking, which can cause the liver to release glucose.',
          action: 'Consider discussing basal rate adjustments, extended-release insulin timing, or protein-rich evening snacks with your endocrinologist. AID systems may need custom settings for this time window.',
          icon: <Sun className="h-5 w-5 text-warning" />,
          research: 'PMID: 31006812 - Circadian Regulation of Glucose Metabolism'
        });
      }
    }
  }

  // Check for nocturnal hypoglycemia patterns
  if (timeBlocks) {
    const nightBlock = timeBlocks.find(b => b.name === 'Night');
    if (nightBlock && nightBlock.tir < 60) {
      const isLowRisk = rangeDistribution && ((rangeDistribution.veryLow || 0) + (rangeDistribution.low || 0)) > 5;
      
      if (isLowRisk) {
        suggestions.push({
          id: 'nocturnal-hypo',
          priority: 'critical',
          category: 'hypoglycemia',
          title: 'Nocturnal Hypoglycemia Risk',
          description: `Nighttime glucose control shows ${nightBlock.tir}% time in range with elevated low glucose events.`,
          explanation: 'Nocturnal hypoglycemia is particularly dangerous because symptoms may not wake you. This can lead to prolonged low glucose exposure, which affects cognitive function and increases cardiovascular risk. Warning signs include morning headaches, night sweats, and restless sleep.',
          action: 'Review evening insulin doses, consider bedtime snacks with complex carbohydrates and protein, and ensure CGM alerts are set appropriately. Discuss adjusting overnight basal rates with your care team.',
          icon: <Moon className="h-5 w-5 text-primary" />,
          research: 'PMID: 26628415 - Nocturnal Hypoglycemia and Cardiovascular Risk'
        });
      }
    }
  }

  // Analyze Time Below Range (TBR)
  if (rangeDistribution) {
    const totalLow = (rangeDistribution.veryLow || 0) + (rangeDistribution.low || 0);
    
    if (totalLow > 4) {
      suggestions.push({
        id: 'high-tbr',
        priority: totalLow > 10 ? 'critical' : 'high',
        category: 'hypoglycemia',
        title: 'Elevated Time Below Range',
        description: `${totalLow.toFixed(1)}% of readings are below 70 mg/dL (target: <4%).`,
        explanation: 'Time Below Range (TBR) above 4% indicates frequent hypoglycemic episodes. The international consensus recommends keeping TBR under 4%, with less than 1% below 54 mg/dL. Frequent lows increase the risk of hypoglycemia unawareness and can impair cognitive function.',
        action: 'Prioritize reducing hypoglycemia before optimizing Time in Range. Consider reducing insulin doses, reviewing carb ratios, and adjusting targets in automated insulin delivery systems.',
        icon: <TrendingDown className="h-5 w-5 text-destructive" />,
        research: 'PMID: 31628595 - International Consensus on TIR Targets'
      });
    }
  }

  // Analyze Time Above Range (TAR)
  if (rangeDistribution) {
    const totalHigh = (rangeDistribution.high || 0) + (rangeDistribution.veryHigh || 0);
    
    if (totalHigh > 25) {
      suggestions.push({
        id: 'high-tar',
        priority: totalHigh > 50 ? 'critical' : 'high',
        category: 'hyperglycemia',
        title: 'Elevated Time Above Range',
        description: `${totalHigh.toFixed(1)}% of readings are above 180 mg/dL (target: <25%).`,
        explanation: 'Time Above Range (TAR) reflects periods of hyperglycemia that contribute to long-term complications. The international consensus recommends keeping TAR below 25% for adults. Sustained hyperglycemia is associated with microvascular complications including retinopathy, nephropathy, and neuropathy.',
        action: 'Focus on post-meal management, pre-bolus timing, and reviewing carb counting accuracy. Consider whether insulin-to-carb ratios or correction factors need adjustment.',
        icon: <TrendingUp className="h-5 w-5 text-warning" />,
        research: 'PMID: 31628595 - International Consensus on TIR Targets'
      });
    }
  }

  // Analyze Coefficient of Variation (CV)
  if (variability && variability.cv) {
    if (variability.cv > 36) {
      suggestions.push({
        id: 'high-cv',
        priority: variability.cv > 50 ? 'critical' : 'high',
        category: 'variability',
        title: 'High Glucose Variability',
        description: `CV of ${variability.cv.toFixed(1)}% exceeds the recommended target of <36%.`,
        explanation: 'Coefficient of Variation (CV) measures glucose variability relative to your average. A CV above 36% indicates unstable glucose levels with frequent swings. High variability is an independent risk factor for hypoglycemia and is associated with oxidative stress that may accelerate complications.',
        action: 'Focus on consistent meal timing and composition, regular physical activity patterns, and stress management. Consider whether insulin timing or dosing patterns are contributing to swings.',
        icon: <Activity className="h-5 w-5 text-chart-5" />,
        research: 'PMID: 28774944 - Glycemic Variability as Risk Factor'
      });
    } else if (variability.cv <= 36 && variability.cv > 0) {
      suggestions.push({
        id: 'good-cv',
        priority: 'low',
        category: 'optimization',
        title: 'Glucose Variability Within Target',
        description: `CV of ${variability.cv.toFixed(1)}% is within the recommended target of <36%.`,
        explanation: 'Your glucose variability is well-controlled, indicating stable patterns. This reduces hypoglycemia risk and suggests your current management approach is effective for minimizing glucose swings.',
        action: 'Continue current strategies for consistent glucose patterns. Focus on maintaining Time in Range while preserving this stability.',
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
        research: 'PMID: 31628595 - International Consensus on TIR Targets'
      });
    }
  }

  // Analyze Time in Range (TIR)
  if (rangeDistribution && rangeDistribution.inRange !== undefined) {
    const tir = rangeDistribution.inRange;
    
    if (tir >= 70) {
      suggestions.push({
        id: 'excellent-tir',
        priority: 'low',
        category: 'optimization',
        title: 'Excellent Time in Range',
        description: `${tir.toFixed(1)}% Time in Range meets or exceeds the 70% target.`,
        explanation: 'Achieving 70%+ Time in Range (70-180 mg/dL) is the primary glycemic goal for most adults with Type 1 diabetes. This level is associated with reduced risk of microvascular complications and is equivalent to approximately 7% HbA1c.',
        action: 'Maintain current management strategies. Consider whether tighter targets (like time in tight range 70-140 mg/dL) are appropriate for your goals without increasing hypoglycemia.',
        icon: <Target className="h-5 w-5 text-success" />,
        research: 'PMID: 31628595 - International Consensus on TIR Targets'
      });
    } else if (tir >= 50 && tir < 70) {
      suggestions.push({
        id: 'moderate-tir',
        priority: 'medium',
        category: 'optimization',
        title: 'Time in Range Improvement Opportunity',
        description: `${tir.toFixed(1)}% TIR is below the 70% target but shows good foundation.`,
        explanation: 'Time in Range between 50-70% indicates room for improvement. Each 5% increase in TIR corresponds to meaningful clinical benefits. Focus on identifying specific patterns or times of day where glucose tends to go out of range.',
        action: 'Use pattern analysis to identify specific times or situations where glucose leaves range. Address one problem area at a time, such as post-breakfast spikes or overnight drift.',
        icon: <Target className="h-5 w-5 text-warning" />,
        research: 'PMID: 31628595 - International Consensus on TIR Targets'
      });
    }
  }

  // Analyze post-meal patterns (afternoon block typically reflects meals)
  if (timeBlocks) {
    const afternoonBlock = timeBlocks.find(b => b.name === 'Afternoon');
    const morningBlock = timeBlocks.find(b => b.name === 'Morning');
    
    if (afternoonBlock && afternoonBlock.avg > 180) {
      suggestions.push({
        id: 'postmeal-spikes',
        priority: 'medium',
        category: 'hyperglycemia',
        title: 'Post-Meal Hyperglycemia Pattern',
        description: `Afternoon average of ${afternoonBlock.avg} mg/dL suggests post-meal spikes.`,
        explanation: 'Post-meal glucose spikes (postprandial hyperglycemia) typically occur 1-2 hours after eating. While some rise is normal, sustained highs indicate that meal insulin is not matching carbohydrate intake in timing or amount.',
        action: 'Consider pre-bolusing 15-20 minutes before meals, reviewing carb counting accuracy, and checking insulin-to-carb ratios. Low-glycemic foods and adding protein/fat can help flatten post-meal curves.',
        icon: <Clock className="h-5 w-5 text-orange-400" />,
        research: 'PMID: 28506000 - Pre-bolus Timing Impact on Postprandial Glucose'
      });
    }
    
    if (morningBlock && morningBlock.cv > 40) {
      suggestions.push({
        id: 'morning-variability',
        priority: 'medium',
        category: 'variability',
        title: 'Morning Glucose Variability',
        description: `Morning CV of ${morningBlock.cv.toFixed(1)}% indicates inconsistent patterns.`,
        explanation: 'High morning variability often reflects inconsistent breakfast timing, varying carbohydrate content, or the interaction between dawn phenomenon and morning routine. This can make insulin dosing challenging.',
        action: 'Try to maintain consistent breakfast timing and composition. Consider whether coffee, morning exercise, or stress affect your patterns. Pre-bolusing for breakfast can help with morning spikes.',
        icon: <Sun className="h-5 w-5 text-amber-400" />,
        research: 'PMID: 29358469 - Lifestyle Factors and Glucose Variability'
      });
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500 hover:bg-green-600">Optimization</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const criticalSuggestions = suggestions.filter(s => s.priority === 'critical');
  const highSuggestions = suggestions.filter(s => s.priority === 'high');
  const mediumSuggestions = suggestions.filter(s => s.priority === 'medium');
  const lowSuggestions = suggestions.filter(s => s.priority === 'low');

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Clinical Suggestions & Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-analyzed patterns from aggregated community data with evidence-based recommendations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {suggestions.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Insufficient Data for Analysis</AlertTitle>
              <AlertDescription>
                More data points are needed to generate meaningful clinical suggestions.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Critical Issues */}
              {criticalSuggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="font-semibold text-destructive">Priority Issues Requiring Attention</h3>
                  </div>
                  {criticalSuggestions.map(suggestion => (
                    <Alert key={suggestion.id} variant="destructive" className="border-destructive/50">
                      <div className="flex items-start gap-3">
                        {suggestion.icon}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AlertTitle className="mb-0">{suggestion.title}</AlertTitle>
                            {getPriorityBadge(suggestion.priority)}
                          </div>
                          <AlertDescription className="text-sm">
                            {suggestion.description}
                          </AlertDescription>
                          <div className="bg-background/50 rounded-lg p-3 mt-2">
                            <p className="text-sm font-medium mb-1">What This Means:</p>
                            <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                          </div>
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm font-medium mb-1">Recommended Action:</p>
                            <p className="text-sm text-muted-foreground">{suggestion.action}</p>
                          </div>
                          {suggestion.research && (
                            <p className="text-xs text-muted-foreground italic">
                              Research Reference: {suggestion.research}
                            </p>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}

              {/* High Priority */}
              {highSuggestions.length > 0 && (
                <div className="space-y-4">
                  {criticalSuggestions.length > 0 && <Separator />}
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400">High Priority Recommendations</h3>
                  {highSuggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {suggestion.icon}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{suggestion.title}</h4>
                              {getPriorityBadge(suggestion.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            <div className="bg-background/70 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">What This Means:</p>
                              <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                            </div>
                            <div className="bg-background/70 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Recommended Action:</p>
                              <p className="text-sm text-muted-foreground">{suggestion.action}</p>
                            </div>
                            {suggestion.research && (
                              <p className="text-xs text-muted-foreground italic">
                                Research Reference: {suggestion.research}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Medium Priority */}
              {mediumSuggestions.length > 0 && (
                <div className="space-y-4">
                  {(criticalSuggestions.length > 0 || highSuggestions.length > 0) && <Separator />}
                  <h3 className="font-semibold text-amber-600 dark:text-amber-400">Pattern-Based Insights</h3>
                  {mediumSuggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {suggestion.icon}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{suggestion.title}</h4>
                              {getPriorityBadge(suggestion.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            <details className="group">
                              <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                                Learn more & recommendations
                              </summary>
                              <div className="mt-2 space-y-2">
                                <div className="bg-background/70 rounded-lg p-3">
                                  <p className="text-sm font-medium mb-1">What This Means:</p>
                                  <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                                </div>
                                <div className="bg-background/70 rounded-lg p-3">
                                  <p className="text-sm font-medium mb-1">Recommended Action:</p>
                                  <p className="text-sm text-muted-foreground">{suggestion.action}</p>
                                </div>
                                {suggestion.research && (
                                  <p className="text-xs text-muted-foreground italic">
                                    Research Reference: {suggestion.research}
                                  </p>
                                )}
                              </div>
                            </details>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Positive / Optimization */}
              {lowSuggestions.length > 0 && (
                <div className="space-y-4">
                  {(criticalSuggestions.length > 0 || highSuggestions.length > 0 || mediumSuggestions.length > 0) && <Separator />}
                  <h3 className="font-semibold text-green-600 dark:text-green-400">Positive Patterns & Optimization</h3>
                  {lowSuggestions.map(suggestion => (
                    <Card key={suggestion.id} className="border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {suggestion.icon}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{suggestion.title}</h4>
                              {getPriorityBadge(suggestion.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            <details className="group">
                              <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                                Details & next steps
                              </summary>
                              <div className="mt-2 space-y-2">
                                <div className="bg-background/70 rounded-lg p-3">
                                  <p className="text-sm">{suggestion.explanation}</p>
                                </div>
                                <div className="bg-background/70 rounded-lg p-3">
                                  <p className="text-sm font-medium mb-1">Next Steps:</p>
                                  <p className="text-sm text-muted-foreground">{suggestion.action}</p>
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Provider Discussion Note */}
              <Alert className="mt-6 bg-primary/5 border-primary/20">
                <Stethoscope className="h-4 w-4" />
                <AlertTitle>Discuss with Your Healthcare Provider</AlertTitle>
                <AlertDescription>
                  These suggestions are based on aggregated community patterns and general clinical guidelines. 
                  Always consult with your endocrinologist or diabetes care team before making changes to your 
                  insulin regimen or management approach. Individual factors may require personalized adjustments.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
