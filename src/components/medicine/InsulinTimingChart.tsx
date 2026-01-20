import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsulinData {
  name: string;
  onset: number; // in minutes
  peak: number; // in minutes
  duration: number; // in minutes
  color: string;
}

interface InsulinTimingChartProps {
  insulins: InsulinData[];
}

const generateActivityCurve = (insulin: InsulinData) => {
  const points: { time: number; [key: string]: number }[] = [];
  const { onset, peak, duration, name } = insulin;
  
  // Generate points every 15 minutes
  for (let time = 0; time <= duration + 60; time += 15) {
    let activity = 0;
    
    if (time < onset) {
      // Before onset - minimal activity
      activity = 0;
    } else if (time < peak) {
      // Rising phase
      const progress = (time - onset) / (peak - onset);
      activity = Math.sin(progress * Math.PI / 2) * 100;
    } else if (time <= duration) {
      // Declining phase
      const progress = (time - peak) / (duration - peak);
      activity = Math.cos(progress * Math.PI / 2) * 100;
    } else {
      activity = 0;
    }
    
    points.push({ time, [name]: Math.max(0, activity) });
  }
  
  return points;
};

const mergeActivityData = (insulins: InsulinData[]) => {
  if (insulins.length === 0) return [];
  
  const allPoints: Map<number, { time: number; [key: string]: number }> = new Map();
  
  insulins.forEach(insulin => {
    const curve = generateActivityCurve(insulin);
    curve.forEach(point => {
      const existing = allPoints.get(point.time) || { time: point.time };
      allPoints.set(point.time, { ...existing, ...point });
    });
  });
  
  return Array.from(allPoints.values()).sort((a, b) => a.time - b.time);
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export function InsulinTimingChart({ insulins }: InsulinTimingChartProps) {
  const data = mergeActivityData(insulins);

  if (insulins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insulin Action Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select insulins to compare their action profiles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insulin Action Profiles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                tickFormatter={formatTime}
                label={{ value: 'Time After Injection', position: 'insideBottom', offset: -10 }}
                className="text-muted-foreground"
              />
              <YAxis 
                label={{ value: 'Activity %', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
                className="text-muted-foreground"
              />
              <Tooltip 
                labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                formatter={(value: number, name: string) => [`${value.toFixed(0)}%`, name]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              {insulins.map((insulin) => (
                <Line
                  key={insulin.name}
                  type="monotone"
                  dataKey={insulin.name}
                  stroke={insulin.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with timing info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insulins.map((insulin) => (
            <div 
              key={insulin.name}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: insulin.color }}
              />
              <div className="text-sm">
                <span className="font-medium">{insulin.name}</span>
                <span className="text-muted-foreground ml-2">
                  {formatTime(insulin.onset)} → {formatTime(insulin.peak)} → {formatTime(insulin.duration)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
