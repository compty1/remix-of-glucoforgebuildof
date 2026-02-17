import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Zap,
  Repeat,
  Gauge
} from 'lucide-react';
import type { NovelSignals, MissedBolusEvent, RecurringPattern } from '@/types/glucose-analysis';

interface NovelSignalsCardProps {
  novelSignals: NovelSignals;
}

const NovelSignalsCard: React.FC<NovelSignalsCardProps> = ({ novelSignals }) => {
  const {
    missedBoluses,
    mealTimingScore,
    sensorDrift,
    autoModeMetrics,
    insulinStackingEvents,
    recurringPatterns,
    weekdayVsWeekendDiff
  } = novelSignals;

  const hasMissedBoluses = missedBoluses.length > 0;
  const hasStackingRisk = insulinStackingEvents.length > 0;
  const hasAutoMode = autoModeMetrics !== null;
  const hasSensorDrift = sensorDrift !== null && Math.abs(sensorDrift.driftIndex) > 5;
  const hasRecurringPatterns = recurringPatterns.length > 0;
  const hasWeekendDiff = weekdayVsWeekendDiff?.significantDifference;

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const getMealTimingScoreLabel = (score: number) => {
    if (score < 20) return { label: 'Excellent Timing', color: 'text-success' };
    if (score < 40) return { label: 'Good Timing', color: 'text-primary' };
    if (score < 60) return { label: 'Needs Improvement', color: 'text-warning' };
    return { label: 'Poor Timing', color: 'text-destructive' };
  };

  const timingInfo = getMealTimingScoreLabel(mealTimingScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          Advanced Insights
          <Badge variant="outline" className="ml-auto text-xs">
            Novel Signals
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Missed Bolus Detection */}
        {hasMissedBoluses && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">
                  Potential Missed Boluses Detected
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {missedBoluses.length} glucose rises consistent with missed meal boluses
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {missedBoluses.slice(0, 3).map((event, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={getSeverityColor(event.severity)}
                    >
                      {event.timeOfDay} (+{event.riseMagnitude.toFixed(0)} mg/dL)
                    </Badge>
                  ))}
                  {missedBoluses.length > 3 && (
                    <Badge variant="secondary">
                      +{missedBoluses.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meal-Insulin Timing Score */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Meal-Insulin Timing</span>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${timingInfo.color}`}>
                {timingInfo.label}
              </span>
              <p className="text-xs text-muted-foreground">
                Score: {mealTimingScore.toFixed(0)}/100
              </p>
            </div>
          </div>
          {mealTimingScore > 40 && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Pre-bolusing 10-15 minutes before meals can improve post-meal control
            </p>
          )}
        </div>

        {/* Sensor Drift Warning */}
        {hasSensorDrift && sensorDrift && (
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-warning" />
              <div>
                <h4 className="font-medium text-warning-foreground">
                  Sensor Drift Detected
                </h4>
                <p className="text-sm text-muted-foreground">
                  {sensorDrift.direction === 'high' ? 'Reading high' : 'Reading low'} by ~{Math.abs(sensorDrift.driftIndex).toFixed(1)} mg/dL/day
                </p>
              </div>
            </div>
            {sensorDrift.recommendation && (
              <p className="text-xs text-muted-foreground mt-2">
                {sensorDrift.recommendation}
              </p>
            )}
          </div>
        )}

        {/* Auto-Mode Behavior */}
        {hasAutoMode && autoModeMetrics && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Auto-Mode Performance</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Auto-Mode Active</p>
                <p className="font-semibold">{autoModeMetrics.autoModeActivePercent.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Manual Overrides</p>
                <p className="font-semibold">{autoModeMetrics.overrideFrequencyPerDay.toFixed(1)}/day</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rescue Events</p>
                <p className="font-semibold">{autoModeMetrics.rescueEventCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Basal Volatility</p>
                <p className="font-semibold">
                  {autoModeMetrics.autoBasalVolatility < 0.3 ? 'Low' : 
                   autoModeMetrics.autoBasalVolatility < 0.6 ? 'Moderate' : 'High'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insulin Stacking Risk */}
        {hasStackingRisk && (
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium text-orange-700 dark:text-orange-400">
                  Insulin Stacking Risk
                </h4>
                <p className="text-sm text-muted-foreground">
                  {insulinStackingEvents.length} instances of multiple boluses within short intervals
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recurring Patterns */}
        {hasRecurringPatterns && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Recurring Patterns</h4>
            </div>
            <div className="space-y-2">
              {recurringPatterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pattern.dayOfWeek} {pattern.timeWindow}
                  </span>
                  <Badge variant={pattern.patternType === 'low' ? 'destructive' : 'secondary'}>
                    {pattern.patternType === 'low' ? (
                      <><TrendingDown className="h-3 w-3 mr-1" /> Low</>
                    ) : pattern.patternType === 'high' ? (
                      <><TrendingUp className="h-3 w-3 mr-1" /> High</>
                    ) : (
                      'Variable'
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekday vs Weekend */}
        {hasWeekendDiff && weekdayVsWeekendDiff && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weekday vs Weekend</span>
              <div className="flex gap-2">
                <Badge variant="outline">
                  Weekday: {weekdayVsWeekendDiff.weekdayTIR.toFixed(0)}% TIR
                </Badge>
                <Badge variant="outline">
                  Weekend: {weekdayVsWeekendDiff.weekendTIR.toFixed(0)}% TIR
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.abs(weekdayVsWeekendDiff.weekdayTIR - weekdayVsWeekendDiff.weekendTIR).toFixed(0)}% difference suggests schedule changes may affect control
            </p>
          </div>
        )}

        {/* No Novel Signals */}
        {!hasMissedBoluses && !hasStackingRisk && !hasAutoMode && !hasSensorDrift && !hasRecurringPatterns && mealTimingScore < 20 && (
          <div className="text-center py-4 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No significant novel patterns detected</p>
            <p className="text-xs">Your glucose management appears consistent</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NovelSignalsCard;
