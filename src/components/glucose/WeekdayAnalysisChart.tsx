import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface WeekdayData {
  day: string;
  fullDay: string;
  avgGlucose: number;
  tir: number;
  cv: number;
  count: number;
}

interface WeekdayAnalysisChartProps {
  data: WeekdayData[];
}

export function WeekdayAnalysisChart({ data }: WeekdayAnalysisChartProps) {
  const overallAvgTir = data.reduce((sum, d) => sum + d.tir * d.count, 0) / data.reduce((sum, d) => sum + d.count, 0);
  
  const bestDay = data.reduce((best, d) => d.tir > best.tir ? d : best, data[0]);
  const worstDay = data.reduce((worst, d) => d.tir < worst.tir ? d : worst, data[0]);

  const weekdayAvg = data.filter(d => !['Sat', 'Sun'].includes(d.day)).reduce((sum, d) => sum + d.tir, 0) / 5;
  const weekendAvg = data.filter(d => ['Sat', 'Sun'].includes(d.day)).reduce((sum, d) => sum + d.tir, 0) / 2;
  const weekendDiff = weekendAvg - weekdayAvg;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekday vs Weekend Analysis
        </CardTitle>
        <CardDescription>
          Compare glucose control patterns across different days of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            Best: {bestDay.fullDay} ({bestDay.tir}% TIR)
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-red-500" />
            Challenging: {worstDay.fullDay} ({worstDay.tir}% TIR)
          </Badge>
          <Badge variant={weekendDiff > 0 ? 'default' : 'secondary'}>
            Weekend {weekendDiff > 0 ? '+' : ''}{weekendDiff.toFixed(1)}% vs Weekday
          </Badge>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]} 
              unit="%" 
              label={{ value: 'TIR %', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[80, 180]} 
              label={{ value: 'Avg mg/dL', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = data.find(day => day.day === label);
                return (
                  <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{d?.fullDay}</p>
                    <p>Time in Range: {d?.tir}%</p>
                    <p>Avg Glucose: {d?.avgGlucose.toFixed(0)} mg/dL</p>
                    <p>Variability (CV): {d?.cv.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{d?.count.toLocaleString()} readings</p>
                  </div>
                );
              }}
            />
            <Legend />
            <ReferenceLine yAxisId="left" y={overallAvgTir} stroke="hsl(var(--primary))" strokeDasharray="5 5" label="Avg" />
            <Bar yAxisId="left" dataKey="tir" fill="hsl(var(--chart-1))" name="Time in Range %" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="avgGlucose" fill="hsl(var(--chart-2))" name="Avg Glucose" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-1">💼 Weekday Average</p>
            <p className="text-2xl font-bold">{weekdayAvg.toFixed(1)}% TIR</p>
            <p className="text-xs text-muted-foreground">Monday through Friday</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm font-medium mb-1">🌴 Weekend Average</p>
            <p className="text-2xl font-bold">{weekendAvg.toFixed(1)}% TIR</p>
            <p className="text-xs text-muted-foreground">Saturday and Sunday</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeekdayAnalysisChart;
