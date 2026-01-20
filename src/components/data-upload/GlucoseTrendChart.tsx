import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DailyStats {
  date: string;
  avg: number;
  min: number;
  max: number;
  tir: number;
  readings: number;
  lowEvents: number;
  highEvents: number;
}

interface GlucoseTrendChartProps {
  data: DailyStats[];
}

const GlucoseTrendChart: React.FC<GlucoseTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No trend data available
        </CardContent>
      </Card>
    );
  }

  // Format date for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{data.date}</p>
          <div className="space-y-1 text-sm">
            <p>Avg: <span className="font-medium">{data.avg.toFixed(0)} mg/dL</span></p>
            <p>Range: {data.min.toFixed(0)} - {data.max.toFixed(0)} mg/dL</p>
            <p>TIR: <span className="font-medium text-success">{data.tir.toFixed(1)}%</span></p>
            <p>Readings: {data.readings}</p>
            {data.lowEvents > 0 && <p className="text-warning">Low events: {data.lowEvents}</p>}
            {data.highEvents > 0 && <p className="text-destructive">High events: {data.highEvents}</p>}
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
          📈 Daily Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your glucose patterns over time
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="average" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="average">Average & Range</TabsTrigger>
            <TabsTrigger value="tir">Time in Range</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="average" className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[40, 300]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={180} stroke="hsl(var(--warning))" strokeDasharray="3 3" />
                <ReferenceLine y={70} stroke="hsl(var(--warning))" strokeDasharray="3 3" />
                
                <Area
                  type="monotone"
                  dataKey="max"
                  fill="url(#rangeGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="max"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Max"
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                  name="Average"
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Min"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="tir" className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'TIR']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="3 3" label={{ value: 'Target', fill: 'hsl(var(--success))', fontSize: 10 }} />
                <Bar
                  dataKey="tir"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                  name="Time in Range"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="events" className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="lowEvents"
                  fill="hsl(var(--warning))"
                  name="Low Events"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="highEvents"
                  fill="hsl(var(--destructive))"
                  name="High Events"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GlucoseTrendChart;