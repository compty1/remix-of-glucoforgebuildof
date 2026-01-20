import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface AnalysisResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  insights: string[];
  readingsCount: number;
}

const AnalysisResultsModal: React.FC<AnalysisResultsModalProps> = ({
  open,
  onOpenChange,
  fileName,
  insights,
  readingsCount,
}) => {
  // Parse insights to extract key metrics
  const getMetricFromInsight = (keyword: string): string | null => {
    const insight = insights.find(i => i.toLowerCase().includes(keyword.toLowerCase()));
    if (insight) {
      const match = insight.match(/[\d.]+/);
      return match ? match[0] : null;
    }
    return null;
  };

  const avgGlucose = getMetricFromInsight('average glucose');
  const timeInRange = getMetricFromInsight('time in range');
  const estimatedA1c = getMetricFromInsight('estimated a1c');
  const variability = getMetricFromInsight('variability');

  const getInsightIcon = (insight: string) => {
    const lowerInsight = insight.toLowerCase();
    if (lowerInsight.includes('low') || lowerInsight.includes('below')) {
      return <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />;
    }
    if (lowerInsight.includes('high') || lowerInsight.includes('above')) {
      return <TrendingUp className="h-4 w-4 text-destructive flex-shrink-0" />;
    }
    if (lowerInsight.includes('good') || lowerInsight.includes('target')) {
      return <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />;
    }
    return <Activity className="h-4 w-4 text-primary flex-shrink-0" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Glucose Analysis Results
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Analysis for: {fileName}
          </p>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
          <Card className="bg-muted/50">
            <CardContent className="p-3 text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Readings</p>
              <p className="text-lg font-bold">{readingsCount.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          {avgGlucose && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Avg Glucose</p>
                <p className="text-lg font-bold">{avgGlucose} <span className="text-xs font-normal">mg/dL</span></p>
              </CardContent>
            </Card>
          )}
          
          {timeInRange && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" />
                <p className="text-xs text-muted-foreground">Time in Range</p>
                <p className="text-lg font-bold">{timeInRange}%</p>
              </CardContent>
            </Card>
          )}
          
          {estimatedA1c && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">Est. A1C</p>
                <p className="text-lg font-bold">{estimatedA1c}%</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Time in Range Progress Bar */}
        {timeInRange && (
          <div className="my-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Time in Range (70-180 mg/dL)</span>
              <span className="font-medium">{timeInRange}%</span>
            </div>
            <Progress 
              value={parseFloat(timeInRange)} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: 70% or higher
            </p>
          </div>
        )}

        {/* All Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analysis Insights
          </h3>
          
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  {getInsightIcon(insight)}
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No insights available.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-medium mb-2">💡 Next Steps</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Review patterns with your healthcare provider</li>
            <li>• Upload more data for comprehensive trend analysis</li>
            <li>• Consider using the T1D Companion for personalized tips</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisResultsModal;
