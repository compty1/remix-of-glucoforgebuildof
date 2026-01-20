import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HourlyStats {
  hour: number;
  avg: number;
  min: number;
  max: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  count: number;
}

interface GlucoseHeatmapProps {
  data: HourlyStats[];
}

const GlucoseHeatmap: React.FC<GlucoseHeatmapProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hourly data available
        </CardContent>
      </Card>
    );
  }

  // Get color based on glucose value
  const getColor = (value: number): string => {
    if (value === 0) return 'bg-muted/20';
    if (value < 54) return 'bg-red-600';
    if (value < 70) return 'bg-amber-500';
    if (value <= 140) return 'bg-emerald-500';
    if (value <= 180) return 'bg-emerald-400';
    if (value <= 250) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getIntensity = (value: number): number => {
    if (value === 0) return 0.2;
    // Scale intensity based on how far from target
    const target = 110;
    const diff = Math.abs(value - target);
    return Math.min(1, 0.4 + (diff / 140) * 0.6);
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12a';
    if (hour === 12) return '12p';
    if (hour < 12) return `${hour}a`;
    return `${hour - 12}p`;
  };

  // Group hours into time periods
  const periods = [
    { name: 'Night', start: 0, end: 6, icon: '🌙' },
    { name: 'Morning', start: 6, end: 12, icon: '🌅' },
    { name: 'Afternoon', start: 12, end: 18, icon: '☀️' },
    { name: 'Evening', start: 18, end: 24, icon: '🌆' }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🔥 Hourly Pattern Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Average glucose levels by hour of day
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {periods.map((period) => (
              <div key={period.name} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>{period.icon}</span>
                  <span className="font-medium">{period.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({formatHour(period.start)} - {formatHour(period.end === 24 ? 0 : period.end)})
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {data
                    .filter(h => h.hour >= period.start && h.hour < period.end)
                    .map((hourData) => (
                      <Tooltip key={hourData.hour}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-10 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-transform hover:scale-105 ${getColor(hourData.avg)}`}
                            style={{ opacity: getIntensity(hourData.avg) }}
                          >
                            <span className="text-white drop-shadow-sm">
                              {hourData.avg > 0 ? Math.round(hourData.avg) : '-'}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="p-3">
                          <div className="space-y-1">
                            <p className="font-medium">{formatHour(hourData.hour)}</p>
                            <p>Average: {hourData.avg.toFixed(0)} mg/dL</p>
                            <p>Range: {hourData.min.toFixed(0)} - {hourData.max.toFixed(0)}</p>
                            <p>Median: {hourData.p50.toFixed(0)} mg/dL</p>
                            <p className="text-xs text-muted-foreground">{hourData.count} readings</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Color Legend:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span>&lt;54 Very Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span>54-70 Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span>70-140 Optimal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-emerald-400"></div>
              <span>140-180 In Range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-orange-400"></div>
              <span>180-250 High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>&gt;250 Very High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlucoseHeatmap;