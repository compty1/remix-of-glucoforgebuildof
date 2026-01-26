import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Moon, Sunrise, TrendingUp, AlertTriangle } from 'lucide-react';

interface SleepGlucoseData {
  sleepHours: string;
  morningAvg: number;
  morningTir: number;
  dawnPhenomenonSeverity: number; // mg/dL rise
  count: number;
}

interface SleepGlucoseCardProps {
  data: SleepGlucoseData[];
}

export function SleepGlucoseCard({ data }: SleepGlucoseCardProps) {
  const optimalSleep = data.find(d => d.sleepHours === '7-8 hours');
  const shortSleep = data.find(d => d.sleepHours === '<6 hours');
  
  const dawnDiff = shortSleep && optimalSleep 
    ? shortSleep.dawnPhenomenonSeverity - optimalSleep.dawnPhenomenonSeverity 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Sleep Duration & Morning Glucose
        </CardTitle>
        <CardDescription>
          How sleep duration correlates with dawn phenomenon severity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sleepHours" tick={{ fontSize: 11 }} />
            <YAxis 
              yAxisId="left" 
              domain={[0, 50]} 
              label={{ value: 'Dawn Rise (mg/dL)', angle: -90, position: 'insideLeft', fontSize: 10 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[60, 100]} 
              label={{ value: 'Morning TIR %', angle: 90, position: 'insideRight', fontSize: 10 }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = data.find(item => item.sleepHours === label);
                return (
                  <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{d?.sleepHours}</p>
                    <p>Dawn Rise: +{d?.dawnPhenomenonSeverity} mg/dL</p>
                    <p>Morning TIR: {d?.morningTir}%</p>
                    <p>Morning Avg: {d?.morningAvg} mg/dL</p>
                  </div>
                );
              }}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="dawnPhenomenonSeverity" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Dawn Rise"
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="morningTir" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Morning TIR"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Key findings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Optimal Sleep</span>
            </div>
            <p className="text-lg font-bold">7-8 hours</p>
            <p className="text-xs text-muted-foreground">
              Lowest dawn phenomenon severity
            </p>
          </div>
          
          {dawnDiff > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Short Sleep Impact</span>
              </div>
              <p className="text-lg font-bold">+{dawnDiff.toFixed(0)} mg/dL</p>
              <p className="text-xs text-muted-foreground">
                Higher morning rise with &lt;6h sleep
              </p>
            </div>
          )}
        </div>

        {/* Research note */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-medium mb-1">📚 Research Context</p>
          <p>
            Sleep deprivation affects insulin sensitivity and cortisol levels, contributing to higher 
            morning glucose. Studies recommend 7-9 hours of sleep for optimal metabolic health.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SleepGlucoseCard;
