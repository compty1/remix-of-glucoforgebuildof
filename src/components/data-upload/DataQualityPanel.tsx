import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Timer
} from 'lucide-react';
import type { DataQuality, GapInfo } from '@/types/glucose-analysis';

interface DataQualityPanelProps {
  dataQuality: DataQuality;
  gapAnalysis?: GapInfo[];
}

const DataQualityPanel: React.FC<DataQualityPanelProps> = ({
  dataQuality,
  gapAnalysis = []
}) => {
  const {
    percentCGMActive,
    actualReadings,
    totalExpectedReadings,
    gapCount,
    largestGapMinutes,
    medianIntervalMinutes,
    dataStartDate,
    dataEndDate,
    daysOfData,
    isSufficientForAnalysis
  } = dataQuality;

  const wearTimeColor = percentCGMActive >= 70 
    ? 'text-success' 
    : percentCGMActive >= 50 
      ? 'text-warning' 
      : 'text-destructive';

  const wearTimeProgressColor = percentCGMActive >= 70 
    ? 'bg-success' 
    : percentCGMActive >= 50 
      ? 'bg-warning' 
      : 'bg-destructive';

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Data Quality
          </div>
          <Badge 
            variant={isSufficientForAnalysis ? 'default' : 'destructive'}
            className="text-xs"
          >
            {isSufficientForAnalysis ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> Sufficient</>
            ) : (
              <><AlertTriangle className="h-3 w-3 mr-1" /> Limited</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wear Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">CGM Wear Time</span>
            </div>
            <span className={`font-bold ${wearTimeColor}`}>
              {percentCGMActive.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={percentCGMActive} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{actualReadings.toLocaleString()} of {totalExpectedReadings.toLocaleString()} readings</span>
            <span>Target: ≥70%</span>
          </div>
        </div>

        {/* Data Range */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Data Range</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatDate(dataStartDate)} — {formatDate(dataEndDate)}
            </span>
            <Badge variant="outline">{daysOfData} days</Badge>
          </div>
        </div>

        {/* Sampling Interval */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sampling</span>
            </div>
            <p className="font-semibold">
              {medianIntervalMinutes.toFixed(1)} min
            </p>
            <p className="text-xs text-muted-foreground">median interval</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Gaps</span>
            </div>
            <p className="font-semibold">{gapCount}</p>
            <p className="text-xs text-muted-foreground">gaps detected</p>
          </div>
        </div>

        {/* Gap Analysis */}
        {gapCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gap Analysis</span>
              <span className="text-xs text-muted-foreground">
                Largest: {formatDuration(largestGapMinutes)}
              </span>
            </div>
            {gapAnalysis.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {gapAnalysis.slice(0, 5).map((gap, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/30"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(gap.startTime).split(',')[0]} {new Date(gap.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(gap.durationMinutes)}
                    </Badge>
                  </div>
                ))}
                {gapAnalysis.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground">
                    +{gapAnalysis.length - 5} more gaps
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interpretation */}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          {percentCGMActive >= 70 && daysOfData >= 14 ? (
            <p className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Meets clinical standards for reliable CGM analysis (≥70% wear over ≥14 days)
            </p>
          ) : percentCGMActive >= 70 && daysOfData >= 7 ? (
            <p className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-yellow-500" />
              Good wear time but limited duration. 14+ days recommended for pattern detection.
            </p>
          ) : percentCGMActive < 70 ? (
            <p className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              Low wear time may affect accuracy. Aim for consistent sensor wear.
            </p>
          ) : (
            <p className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              Insufficient data for reliable analysis. Upload more CGM data.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataQualityPanel;
