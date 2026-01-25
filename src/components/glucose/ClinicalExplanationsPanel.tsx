import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, Target, TrendingUp, TrendingDown, Activity, 
  AlertTriangle, CheckCircle, Info, BookOpen, ExternalLink
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricExplanation {
  metric: string;
  value: string | number;
  target: string;
  status: 'good' | 'warning' | 'concern';
  clinicalMeaning: string;
  interpretation: string;
  actionableAdvice: string;
  reference?: string;
  referenceUrl?: string;
}

interface ClinicalExplanationsPanelProps {
  tir?: number;
  tirBelow70?: number;
  tirAbove180?: number;
  cv?: number;
  stdDev?: number;
  avgGlucose?: number;
  estimatedA1c?: string;
  readingsCount?: number;
}

const ClinicalExplanationsPanel: React.FC<ClinicalExplanationsPanelProps> = ({
  tir = 0,
  tirBelow70 = 0,
  tirAbove180 = 0,
  cv = 0,
  stdDev = 0,
  avgGlucose = 0,
  estimatedA1c = '0',
  readingsCount = 0
}) => {
  const explanations: MetricExplanation[] = [
    {
      metric: 'Time in Range (TIR)',
      value: `${tir}%`,
      target: '≥70%',
      status: tir >= 70 ? 'good' : tir >= 50 ? 'warning' : 'concern',
      clinicalMeaning: 'Percentage of time glucose stays between 70-180 mg/dL',
      interpretation: tir >= 70 
        ? 'Excellent! This correlates with an estimated A1C below 7% and significantly reduced complication risk.'
        : tir >= 50 
        ? 'Moderate control. Each 5% TIR improvement is clinically meaningful and reduces complication risk.'
        : 'Below target. Focus on identifying and addressing patterns causing glucose excursions.',
      actionableAdvice: tir >= 70 
        ? 'Maintain current strategies. Consider tightening to 70-140 mg/dL for even better outcomes.'
        : 'Review CGM patterns for recurring highs/lows. Pre-bolusing and consistent timing help.',
      reference: 'ATTD Consensus 2019',
      referenceUrl: 'https://doi.org/10.1089/dia.2019.0028'
    },
    {
      metric: 'Time Below Range',
      value: `${tirBelow70}%`,
      target: '<4%',
      status: tirBelow70 < 4 ? 'good' : tirBelow70 < 8 ? 'warning' : 'concern',
      clinicalMeaning: 'Time spent with glucose below 70 mg/dL (hypoglycemia)',
      interpretation: tirBelow70 < 4 
        ? 'Low hypoglycemia risk. Great balance between tight control and safety.'
        : tirBelow70 < 8 
        ? 'Some hypoglycemia present. Review timing of insulin doses and meal patterns.'
        : 'Frequent hypoglycemia. Priority should be reducing lows before tightening targets.',
      actionableAdvice: tirBelow70 >= 4 
        ? 'Consider reducing basal rates, extending pre-bolus time, or adjusting correction factors.'
        : 'Current approach is working well for hypoglycemia prevention.',
      reference: 'ADA Standards of Care 2024',
      referenceUrl: 'https://doi.org/10.2337/dc24-S006'
    },
    {
      metric: 'Time Above Range',
      value: `${tirAbove180}%`,
      target: '<25%',
      status: tirAbove180 < 25 ? 'good' : tirAbove180 < 40 ? 'warning' : 'concern',
      clinicalMeaning: 'Time spent with glucose above 180 mg/dL (hyperglycemia)',
      interpretation: tirAbove180 < 25 
        ? 'Well-controlled hyperglycemia, associated with reduced long-term complication risk.'
        : tirAbove180 < 40 
        ? 'Moderate hyperglycemia. Focus on post-meal spikes and overnight patterns.'
        : 'Significant hyperglycemia. Review insulin timing, dosing, and carbohydrate counting.',
      actionableAdvice: tirAbove180 >= 25 
        ? 'Pre-bolus 15-20 minutes before meals. Consider adjusting carb ratios or correction factors.'
        : 'Continue current strategies that are effectively managing post-meal glucose.',
      reference: 'International Consensus on TIR',
      referenceUrl: 'https://doi.org/10.2337/dc19-1009'
    },
    {
      metric: 'Coefficient of Variation (CV)',
      value: `${cv.toFixed(1)}%`,
      target: '<36%',
      status: cv < 36 ? 'good' : cv < 42 ? 'warning' : 'concern',
      clinicalMeaning: 'Measure of glucose variability (how much glucose fluctuates)',
      interpretation: cv < 36 
        ? 'Stable glucose patterns with minimal swings. Lower CV is associated with fewer complications.'
        : cv < 42 
        ? 'Moderate variability. Some patterns may be causing larger-than-ideal swings.'
        : 'High variability indicating significant glucose swings that stress the body.',
      actionableAdvice: cv >= 36 
        ? 'Focus on consistent meal timing, reduce high-glycemic foods, and optimize basal rates.'
        : 'Excellent stability. Maintain consistent routines that are working.',
      reference: 'Diabetes Care - CV Consensus',
      referenceUrl: 'https://doi.org/10.2337/dc19-1009'
    },
    {
      metric: 'Glucose Management Indicator (GMI)',
      value: `${estimatedA1c}%`,
      target: '<7.0%',
      status: parseFloat(estimatedA1c) < 7.0 ? 'good' : parseFloat(estimatedA1c) < 8.0 ? 'warning' : 'concern',
      clinicalMeaning: 'Estimated A1C based on average glucose from CGM data',
      interpretation: parseFloat(estimatedA1c) < 7.0 
        ? 'Excellent glucose management correlating with reduced complication risk per DCCT/EDIC.'
        : parseFloat(estimatedA1c) < 8.0 
        ? 'Reasonable control with room for improvement. Each 0.5% reduction is clinically significant.'
        : 'Above target. Focus on overall glucose exposure reduction.',
      actionableAdvice: 'GMI may differ from lab A1C due to red blood cell turnover and timing. Use CGM metrics for day-to-day decisions.',
      reference: 'DCCT/EDIC Long-term Outcomes',
      referenceUrl: 'https://doi.org/10.1056/NEJMoa052187'
    },
    {
      metric: 'Standard Deviation',
      value: `${stdDev} mg/dL`,
      target: '<50 mg/dL',
      status: stdDev < 50 ? 'good' : stdDev < 70 ? 'warning' : 'concern',
      clinicalMeaning: 'Average deviation of glucose readings from the mean',
      interpretation: stdDev < 50 
        ? 'Tight glucose control with minimal swings from baseline.'
        : stdDev < 70 
        ? 'Some glucose excursions present but within acceptable range for many patients.'
        : 'Significant variability that may benefit from lifestyle or therapy adjustments.',
      actionableAdvice: stdDev >= 50 
        ? 'Identify specific triggers for glucose excursions using CGM pattern analysis.'
        : 'Current approach is producing stable results.',
      reference: 'ADA Guidelines 2024'
    }
  ];

  const getStatusIcon = (status: 'good' | 'warning' | 'concern') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'concern': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'concern') => {
    switch (status) {
      case 'good': return <Badge className="bg-success/10 text-success border-success/20">On Target</Badge>;
      case 'warning': return <Badge className="bg-warning/10 text-warning border-warning/20">Needs Attention</Badge>;
      case 'concern': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Priority Focus</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Clinical Interpretations & Explanations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Understand what each metric means and how to interpret the results based on current clinical guidelines.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {explanations.map((exp, index) => (
          <Card key={index} className={`border ${
            exp.status === 'good' ? 'border-success/30 bg-success/5' :
            exp.status === 'warning' ? 'border-warning/30 bg-warning/5' :
            'border-destructive/30 bg-destructive/5'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(exp.status)}
                  <h4 className="font-semibold">{exp.metric}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{exp.clinicalMeaning}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{exp.value}</span>
                  <span className="text-sm text-muted-foreground">Target: {exp.target}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  {getStatusBadge(exp.status)}
                </div>
                
                <div className="bg-background/50 rounded-lg p-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Interpretation</p>
                    <p className="text-sm">{exp.interpretation}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">What You Can Do</p>
                    <p className="text-sm text-primary">{exp.actionableAdvice}</p>
                  </div>
                </div>

                {exp.reference && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>Reference: {exp.reference}</span>
                    {exp.referenceUrl && (
                      <a 
                        href={exp.referenceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-0.5"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary Box */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Key Takeaways from This Analysis</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Based on {readingsCount.toLocaleString()} readings analyzed:
                </p>
                <ul className="text-sm space-y-1">
                  {tir >= 70 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Time in Range is excellent, correlating with good long-term outcomes
                    </li>
                  )}
                  {cv < 36 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Glucose variability is low, indicating stable patterns
                    </li>
                  )}
                  {tirBelow70 >= 4 && (
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      Hypoglycemia prevention should be prioritized
                    </li>
                  )}
                  {tirAbove180 >= 25 && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-warning" />
                      Post-meal or overnight highs may need attention
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ClinicalExplanationsPanel;
