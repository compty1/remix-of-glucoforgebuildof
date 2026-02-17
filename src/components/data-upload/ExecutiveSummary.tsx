import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Heart,
  Sparkles
} from 'lucide-react';
import type { ExecutiveSummary as ExecutiveSummaryType } from '@/types/glucose-analysis';
import ConfidenceScoreBadge from './ConfidenceScoreBadge';

interface ExecutiveSummaryProps {
  summary: ExecutiveSummaryType;
  confidenceBand?: 'high' | 'moderate' | 'low' | 'unreliable' | 'unknown';
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  confidenceBand = 'unknown'
}) => {
  const {
    overallTIR,
    tirTarget,
    topRisks,
    confidencePercent,
    encouragement,
    keyMetrics,
    dataQualityNote
  } = summary;

  const tirProgress = Math.min(100, (overallTIR / tirTarget) * 100);
  const tirMet = overallTIR >= tirTarget;

  const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      default:
        return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardContent className="p-6 space-y-5">
        {/* Header with TIR and Confidence */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Executive Summary</h3>
            </div>
            
            {/* TIR Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time in Range (70-180)</span>
                <span className={`font-bold ${tirMet ? 'text-success' : 'text-warning'}`}>
                  {overallTIR.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={tirProgress} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">Target: {tirTarget}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <ConfidenceScoreBadge 
              score={confidencePercent} 
              band={confidenceBand}
              showDetails={false}
              size="sm"
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Avg Glucose</p>
            <p className="font-bold text-lg">{keyMetrics.avgGlucose.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">mg/dL</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">GMI</p>
            <p className="font-bold text-lg">{keyMetrics.gmi.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">est. A1C</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">CV</p>
            <p className={`font-bold text-lg ${keyMetrics.cv <= 36 ? 'text-success' : 'text-warning'}`}>
              {keyMetrics.cv.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.cv <= 36 ? 'stable' : 'variable'}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Time Low</p>
            <p className={`font-bold text-lg ${keyMetrics.timeBelow70 <= 4 ? 'text-success' : 'text-destructive'}`}>
              {keyMetrics.timeBelow70.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.timeBelow70 <= 4 ? 'good' : 'review'}
            </p>
          </div>
        </div>

        {/* Top Risks */}
        {topRisks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Top Priorities
            </h4>
            <div className="space-y-2">
              {topRisks.slice(0, 2).map((risk, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${getSeverityStyles(risk.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(risk.severity)}
                    <div>
                      <p className="font-medium text-sm">{risk.title}</p>
                      <p className="text-xs opacity-80">{risk.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement */}
        {encouragement && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <Sparkles className="h-4 w-4 text-success mt-0.5" />
            <p className="text-sm text-success">
              {encouragement}
            </p>
          </div>
        )}

        {/* Data Quality Note */}
        {dataQualityNote && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            {dataQualityNote}
          </p>
        )}

        {/* Clinical Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t flex items-center justify-center gap-1">
          <Heart className="h-3 w-3" />
          Always discuss findings with your healthcare provider before making changes
        </p>
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummary;
