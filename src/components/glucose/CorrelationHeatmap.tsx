import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CorrelationData {
  variable1: string;
  variable2: string;
  correlation: number; // -1 to 1
  pValue: number;
  sampleSize: number;
}

interface CorrelationHeatmapProps {
  correlations: CorrelationData[];
  title?: string;
  description?: string;
}

export function CorrelationHeatmap({ correlations, title, description }: CorrelationHeatmapProps) {
  const getCorrelationColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue < 0.2) return 'bg-muted';
    if (value > 0) {
      if (absValue < 0.4) return 'bg-green-200 dark:bg-green-900/40';
      if (absValue < 0.6) return 'bg-green-400 dark:bg-green-700/60';
      if (absValue < 0.8) return 'bg-green-500 dark:bg-green-600';
      return 'bg-green-600 dark:bg-green-500';
    } else {
      if (absValue < 0.4) return 'bg-red-200 dark:bg-red-900/40';
      if (absValue < 0.6) return 'bg-red-400 dark:bg-red-700/60';
      if (absValue < 0.8) return 'bg-red-500 dark:bg-red-600';
      return 'bg-red-600 dark:bg-red-500';
    }
  };

  const getTextColor = (value: number): string => {
    const absValue = Math.abs(value);
    return absValue >= 0.6 ? 'text-white' : 'text-foreground';
  };

  const getStrengthLabel = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue < 0.2) return 'Very Weak';
    if (absValue < 0.4) return 'Weak';
    if (absValue < 0.6) return 'Moderate';
    if (absValue < 0.8) return 'Strong';
    return 'Very Strong';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title || 'Correlation Matrix'}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-2">
            {correlations.map((corr, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-help">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {corr.variable1} ↔ {corr.variable2}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        n = {corr.sampleSize.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`px-3 py-1 rounded-md ${getCorrelationColor(corr.correlation)} ${getTextColor(corr.correlation)}`}
                      >
                        <span className="text-sm font-mono font-semibold">
                          {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant={corr.pValue < 0.05 ? 'default' : 'secondary'} className="text-xs">
                        {getStrengthLabel(corr.correlation)}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{corr.variable1} vs {corr.variable2}</p>
                    <p>Correlation: {corr.correlation.toFixed(3)}</p>
                    <p>p-value: {corr.pValue < 0.001 ? '< 0.001' : corr.pValue.toFixed(3)}</p>
                    <p>Sample size: {corr.sampleSize.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {corr.correlation > 0 
                        ? 'Positive correlation: as one increases, the other tends to increase'
                        : corr.correlation < 0
                        ? 'Negative correlation: as one increases, the other tends to decrease'
                        : 'No significant correlation'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Correlation Strength:</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span>Strong +</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700/60"></div>
              <span>Moderate +</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded bg-muted"></div>
              <span>Weak/None</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded bg-red-400 dark:bg-red-700/60"></div>
              <span>Moderate -</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span>Strong -</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CorrelationHeatmap;
