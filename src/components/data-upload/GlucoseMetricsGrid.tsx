import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';

interface DetailedAnalysis {
  readingsCount?: number;
  avgGlucose?: number;
  medianGlucose?: number;
  stdDev?: number;
  cv?: number;
  timeInRange?: number;
  timeInTightRange?: number;
  timeAbove180?: number;
  timeAbove250?: number;
  timeBelow70?: number;
  timeBelow54?: number;
  gmi?: number;
  gvi?: number;
  mage?: number;
  lowEvents?: number;
  severeLowEvents?: number;
  highEvents?: number;
  severeHighEvents?: number;
  dataStart?: string;
  dataEnd?: string;
  daysOfData?: number;
}

interface GlucoseMetricsGridProps {
  analysis: DetailedAnalysis;
}

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  target?: string;
  showProgress?: boolean;
  progressValue?: number;
}> = ({ icon, label, value, subValue, status = 'neutral', target, showProgress, progressValue }) => {
  const statusColors = {
    success: 'text-success border-success/30 bg-success/5',
    warning: 'text-warning border-warning/30 bg-warning/5',
    danger: 'text-destructive border-destructive/30 bg-destructive/5',
    neutral: 'text-primary border-primary/30 bg-primary/5'
  };

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-success/10' : status === 'warning' ? 'bg-warning/10' : status === 'danger' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
            {icon}
          </div>
          {target && (
            <Badge variant="outline" className="text-xs">
              Target: {target}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
        {showProgress && progressValue !== undefined && (
          <div className="mt-2">
            <Progress 
              value={Math.min(100, progressValue)} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GlucoseMetricsGrid: React.FC<GlucoseMetricsGridProps> = ({ analysis }) => {
  // Use default values for optional properties
  const safeAnalysis = {
    readingsCount: analysis.readingsCount ?? 0,
    avgGlucose: analysis.avgGlucose ?? 0,
    medianGlucose: analysis.medianGlucose ?? 0,
    stdDev: analysis.stdDev ?? 0,
    cv: analysis.cv ?? 0,
    timeInRange: analysis.timeInRange ?? 0,
    timeInTightRange: analysis.timeInTightRange ?? 0,
    timeAbove180: analysis.timeAbove180 ?? 0,
    timeAbove250: analysis.timeAbove250 ?? 0,
    timeBelow70: analysis.timeBelow70 ?? 0,
    timeBelow54: analysis.timeBelow54 ?? 0,
    gmi: analysis.gmi ?? 0,
    gvi: analysis.gvi ?? 0,
    mage: analysis.mage ?? 0,
    lowEvents: analysis.lowEvents ?? 0,
    severeLowEvents: analysis.severeLowEvents ?? 0,
    highEvents: analysis.highEvents ?? 0,
    severeHighEvents: analysis.severeHighEvents ?? 0,
    daysOfData: analysis.daysOfData ?? 0,
  };

  const getGMIStatus = (gmi: number) => {
    if (gmi < 7) return 'success';
    if (gmi < 8) return 'warning';
    return 'danger';
  };

  const getTIRStatus = (tir: number) => {
    if (tir >= 70) return 'success';
    if (tir >= 50) return 'warning';
    return 'danger';
  };

  const getCVStatus = (cv: number) => {
    if (cv < 36) return 'success';
    if (cv < 42) return 'warning';
    return 'danger';
  };

  const getLowStatus = (timeBelow: number) => {
    if (timeBelow < 4) return 'success';
    if (timeBelow < 8) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<Target className="h-4 w-4 text-success" />}
          label="Time in Range"
          value={`${safeAnalysis.timeInRange.toFixed(1)}%`}
          subValue="70-180 mg/dL"
          status={getTIRStatus(safeAnalysis.timeInRange)}
          target="≥70%"
          showProgress
          progressValue={safeAnalysis.timeInRange}
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4 text-primary" />}
          label="GMI (Est. A1C)"
          value={`${safeAnalysis.gmi.toFixed(1)}%`}
          subValue={safeAnalysis.avgGlucose > 0 ? `Avg: ${safeAnalysis.avgGlucose.toFixed(0)} mg/dL` : undefined}
          status={getGMIStatus(safeAnalysis.gmi)}
          target="<7%"
        />
        <MetricCard
          icon={<Activity className="h-4 w-4 text-warning" />}
          label="Variability (CV)"
          value={`${safeAnalysis.cv.toFixed(1)}%`}
          subValue={`SD: ${safeAnalysis.stdDev.toFixed(0)} mg/dL`}
          status={getCVStatus(safeAnalysis.cv)}
          target="<36%"
        />
        <MetricCard
          icon={<Calendar className="h-4 w-4 text-primary" />}
          label="Data Coverage"
          value={`${safeAnalysis.daysOfData} days`}
          subValue={`${safeAnalysis.readingsCount.toLocaleString()} readings`}
          status="neutral"
        />
      </div>

      {/* Second Row - Detailed Ranges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<TrendingDown className="h-4 w-4 text-destructive" />}
          label="Time Very Low"
          value={`${safeAnalysis.timeBelow54.toFixed(1)}%`}
          subValue={`<54 mg/dL • ${safeAnalysis.severeLowEvents} events`}
          status={safeAnalysis.timeBelow54 < 1 ? 'success' : 'danger'}
          target="<1%"
        />
        <MetricCard
          icon={<TrendingDown className="h-4 w-4 text-warning" />}
          label="Time Low"
          value={`${safeAnalysis.timeBelow70.toFixed(1)}%`}
          subValue={`<70 mg/dL • ${safeAnalysis.lowEvents} events`}
          status={getLowStatus(safeAnalysis.timeBelow70)}
          target="<4%"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4 text-warning" />}
          label="Time High"
          value={`${safeAnalysis.timeAbove180.toFixed(1)}%`}
          subValue={`>180 mg/dL • ${safeAnalysis.highEvents} events`}
          status={safeAnalysis.timeAbove180 < 25 ? 'success' : safeAnalysis.timeAbove180 < 40 ? 'warning' : 'danger'}
          target="<25%"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4 text-destructive" />}
          label="Time Very High"
          value={`${safeAnalysis.timeAbove250.toFixed(1)}%`}
          subValue={`>250 mg/dL • ${safeAnalysis.severeHighEvents} events`}
          status={safeAnalysis.timeAbove250 < 5 ? 'success' : 'danger'}
          target="<5%"
        />
      </div>

      {/* Third Row - Advanced Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          icon={<Target className="h-4 w-4 text-primary" />}
          label="Tight Range (70-140)"
          value={`${safeAnalysis.timeInTightRange.toFixed(1)}%`}
          subValue="More stringent target"
          status={safeAnalysis.timeInTightRange >= 50 ? 'success' : 'warning'}
          target="≥50%"
        />
        <MetricCard
          icon={<Zap className="h-4 w-4 text-warning" />}
          label="MAGE"
          value={`${safeAnalysis.mage.toFixed(0)} mg/dL`}
          subValue="Mean glucose swing amplitude"
          status={safeAnalysis.mage < 60 ? 'success' : safeAnalysis.mage < 80 ? 'warning' : 'danger'}
          target="<60"
        />
        <MetricCard
          icon={<Activity className="h-4 w-4 text-primary" />}
          label="GVI"
          value={safeAnalysis.gvi.toFixed(2)}
          subValue="Glycemic Variability Index"
          status={safeAnalysis.gvi < 1.0 ? 'success' : safeAnalysis.gvi < 1.5 ? 'warning' : 'danger'}
          target="<1.0"
        />
      </div>
    </div>
  );
};

export default GlucoseMetricsGrid;