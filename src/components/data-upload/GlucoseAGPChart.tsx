import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AGPDataPoint {
  time: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

interface GlucoseAGPChartProps {
  data: AGPDataPoint[];
}

const GlucoseAGPChart: React.FC<GlucoseAGPChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No AGP data available
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-destructive">95th: {payload[0]?.payload.p95?.toFixed(0)} mg/dL</p>
            <p className="text-warning">75th: {payload[0]?.payload.p75?.toFixed(0)} mg/dL</p>
            <p className="text-primary font-medium">Median: {payload[0]?.payload.p50?.toFixed(0)} mg/dL</p>
            <p className="text-warning">25th: {payload[0]?.payload.p25?.toFixed(0)} mg/dL</p>
            <p className="text-success">5th: {payload[0]?.payload.p5?.toFixed(0)} mg/dL</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          📊 Ambulatory Glucose Profile (AGP)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows glucose patterns across a typical 24-hour day with percentile bands
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="agpOuter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="agpInner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              
              {/* Target Range Background */}
              <ReferenceArea y1={70} y2={180} fill="hsl(var(--success))" fillOpacity={0.1} />
              
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[40, 300]}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* 5th-95th percentile band (lightest) */}
              <Area
                type="monotone"
                dataKey="p95"
                stroke="none"
                fill="url(#agpOuter)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="p5"
                stroke="none"
                fill="hsl(var(--background))"
                fillOpacity={1}
              />
              
              {/* 25th-75th percentile band */}
              <Area
                type="monotone"
                dataKey="p75"
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeOpacity={0.5}
                fill="url(#agpInner)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="p25"
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeOpacity={0.5}
                fill="hsl(var(--background))"
                fillOpacity={1}
              />
              
              {/* Median line (darkest) */}
              <Area
                type="monotone"
                dataKey="p50"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="none"
              />
              
              {/* Target range lines */}
              <ReferenceLine y={180} stroke="hsl(var(--warning))" strokeDasharray="5 5" strokeWidth={1.5} />
              <ReferenceLine y={70} stroke="hsl(var(--warning))" strokeDasharray="5 5" strokeWidth={1.5} />
              <ReferenceLine y={250} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={54} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary rounded"></div>
            <span className="text-muted-foreground">Median (50th)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-warning/30 rounded"></div>
            <span className="text-muted-foreground">25th-75th %ile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-muted/30 rounded"></div>
            <span className="text-muted-foreground">5th-95th %ile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-success/20 rounded"></div>
            <span className="text-muted-foreground">Target (70-180)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlucoseAGPChart;