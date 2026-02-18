import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Sun, Cloud, Snowflake, Leaf } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const MONTHLY_DATA = [
  { month: 'Jan', avgGlucose: 158, tir: 60, cv: 38, hypoEvents: 3.2 },
  { month: 'Feb', avgGlucose: 155, tir: 62, cv: 37, hypoEvents: 3.0 },
  { month: 'Mar', avgGlucose: 150, tir: 64, cv: 36, hypoEvents: 2.8 },
  { month: 'Apr', avgGlucose: 145, tir: 67, cv: 34, hypoEvents: 2.5 },
  { month: 'May', avgGlucose: 140, tir: 70, cv: 33, hypoEvents: 2.8 },
  { month: 'Jun', avgGlucose: 138, tir: 71, cv: 32, hypoEvents: 3.1 },
  { month: 'Jul', avgGlucose: 136, tir: 72, cv: 31, hypoEvents: 3.4 },
  { month: 'Aug', avgGlucose: 137, tir: 71, cv: 32, hypoEvents: 3.3 },
  { month: 'Sep', avgGlucose: 141, tir: 69, cv: 33, hypoEvents: 2.9 },
  { month: 'Oct', avgGlucose: 146, tir: 66, cv: 35, hypoEvents: 2.7 },
  { month: 'Nov', avgGlucose: 152, tir: 63, cv: 37, hypoEvents: 2.9 },
  { month: 'Dec', avgGlucose: 160, tir: 59, cv: 39, hypoEvents: 3.5 },
];

const SEASONAL_SUMMARY = [
  { season: 'Winter', avgGlucose: 158, tir: 60, cv: 38, icon: Snowflake, color: 'text-primary' },
  { season: 'Spring', avgGlucose: 145, tir: 67, cv: 34, icon: Leaf, color: 'text-success' },
  { season: 'Summer', avgGlucose: 137, tir: 71, cv: 32, icon: Sun, color: 'text-warning' },
  { season: 'Autumn', avgGlucose: 146, tir: 66, cv: 35, icon: Cloud, color: 'text-muted-foreground' },
];

const RADAR_DATA = [
  { metric: 'TIR', Winter: 60, Spring: 67, Summer: 71, Autumn: 66 },
  { metric: 'Low CV', Winter: 62, Spring: 66, Summer: 68, Autumn: 65 },
  { metric: 'Low Hypos', Winter: 58, Spring: 70, Summer: 64, Autumn: 68 },
  { metric: 'Stability', Winter: 55, Spring: 65, Summer: 72, Autumn: 63 },
  { metric: 'Avg Glucose', Winter: 58, Spring: 68, Summer: 74, Autumn: 66 },
];

export function SeasonalPatternsTab() {
  return (
    <div className="space-y-6">
      {/* Seasonal Overview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">About Seasonal Patterns (Reference Data)</p>
            <p className="text-muted-foreground">
              The seasonal data below is illustrative, based on published CGM research literature, and does not represent this platform's dataset.{' '}
              meteorological seasons (Winter: Dec–Feb, Spring: Mar–May, Summer: Jun–Aug, Autumn: Sep–Nov). Research from 
              the DCCT/EDIC trial and population-level CGM studies consistently show that glucose control varies seasonally 
              due to changes in physical activity, dietary patterns, daylight exposure affecting circadian rhythms, and 
              temperature-related insulin absorption rates. Warmer months typically see improved insulin sensitivity from 
              increased blood flow and activity levels.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Season Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SEASONAL_SUMMARY.map((season) => {
          const Icon = season.icon;
          return (
            <Card key={season.season}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${season.color}`} />
                <p className="font-semibold">{season.season}</p>
                <p className="text-2xl font-bold mt-1">{season.tir}%</p>
                <p className="text-xs text-muted-foreground">Avg TIR</p>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{season.avgGlucose} mg/dL</Badge>
                  <Badge variant="outline" className="text-xs">CV {season.cv}%</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Glucose Trends</CardTitle>
          <CardDescription>
            Average glucose and Time in Range plotted across all 12 calendar months. The left axis tracks average glucose (mg/dL) — 
            lower values indicate better glycemic control. The right axis shows TIR (%) — higher values are better. 
            Notice the inverse relationship: months with lower average glucose correspond to higher TIR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" domain={[120, 170]} />
              <YAxis yAxisId="right" orientation="right" domain={[50, 80]} unit="%" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgGlucose" stroke={COLORS[0]} strokeWidth={2} name="Avg Glucose (mg/dL)" />
              <Line yAxisId="right" type="monotone" dataKey="tir" stroke={COLORS[1]} strokeWidth={2} name="Time in Range %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seasonal Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seasonal Performance Radar</CardTitle>
            <CardDescription>
              Multi-metric comparison across seasons. Each axis represents a normalized score (0–100) for: TIR, 
              low CV (glucose stability), low hypo events, overall stability, and average glucose. 
              Larger area = better overall performance for that season.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[50, 80]} />
                <Radar name="Winter" dataKey="Winter" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.1} />
                <Radar name="Summer" dataKey="Summer" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.1} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hypo Events by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hypoglycemia Events by Month</CardTitle>
            <CardDescription>
              Average number of hypoglycemia episodes (&lt;70 mg/dL for ≥15 minutes) per user per month. 
              Summer months show slightly higher hypo rates due to increased physical activity and improved insulin sensitivity, 
              which can cause unexpected lows. December spikes reflect holiday meal irregularities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="hypoEvents" fill="hsl(var(--chart-3))" name="Hypo Events/User/Month" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insight */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Seasonal Insights</p>
            <p className="text-muted-foreground">
              Summer months show ~11% higher TIR than winter, likely due to increased physical activity, 
              more consistent routines, and improved insulin sensitivity. However, summer also shows slightly 
              higher hypoglycemia rates due to increased activity. Holiday seasons (Nov-Dec) typically show the 
              worst control, correlating with dietary changes and disrupted routines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
