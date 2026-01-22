import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Database, Activity, TrendingUp, Clock, AlertTriangle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';

interface GlucoseDataPoint {
  hour_of_day: number;
  age_group: string;
  device_type: string;
  a1c_range: string;
  average_glucose: number;
  min_glucose: number;
  max_glucose: number;
  std_deviation: number;
  sample_size: number;
  time_in_range_percent: number;
  time_below_range_percent: number;
  time_above_range_percent: number;
  data_source: string;
}

export default function PublicGlucoseData() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedA1C, setSelectedA1C] = useState<string>('all');

  const { data: glucoseData, isLoading } = useQuery({
    queryKey: ['public-glucose-data', selectedAgeGroup, selectedDevice, selectedA1C],
    queryFn: async () => {
      let query = supabase.from('public_glucose_data').select('*');
      
      if (selectedAgeGroup !== 'all') {
        query = query.eq('age_group', selectedAgeGroup);
      }
      if (selectedDevice !== 'all') {
        query = query.eq('device_type', selectedDevice);
      }
      if (selectedA1C !== 'all') {
        query = query.eq('a1c_range', selectedA1C);
      }
      
      const { data, error } = await query.order('hour_of_day', { ascending: true });
      if (error) throw error;
      return data as GlucoseDataPoint[];
    },
  });

  // Aggregate hourly data
  const hourlyAverages = React.useMemo(() => {
    if (!glucoseData) return [];
    
    const hourlyMap = new Map<number, { sum: number; count: number; min: number; max: number }>();
    
    glucoseData.forEach(point => {
      const existing = hourlyMap.get(point.hour_of_day) || { sum: 0, count: 0, min: Infinity, max: -Infinity };
      hourlyMap.set(point.hour_of_day, {
        sum: existing.sum + point.average_glucose,
        count: existing.count + 1,
        min: Math.min(existing.min, point.min_glucose),
        max: Math.max(existing.max, point.max_glucose),
      });
    });

    return Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        average: Math.round(data.sum / data.count),
        min: data.min,
        max: data.max,
        range: data.max - data.min,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [glucoseData]);

  // Time in range by A1C
  const timeInRangeByA1C = React.useMemo(() => {
    if (!glucoseData) return [];
    
    const a1cMap = new Map<string, { tir: number; below: number; above: number; count: number }>();
    
    glucoseData.forEach(point => {
      const existing = a1cMap.get(point.a1c_range) || { tir: 0, below: 0, above: 0, count: 0 };
      a1cMap.set(point.a1c_range, {
        tir: existing.tir + point.time_in_range_percent,
        below: existing.below + point.time_below_range_percent,
        above: existing.above + point.time_above_range_percent,
        count: existing.count + 1,
      });
    });

    const order = ["<6.0", "6.0-6.5", "6.5-7.0", "7.0-7.5", "7.5-8.0", ">8.0"];
    return Array.from(a1cMap.entries())
      .map(([a1c, data]) => ({
        a1c,
        timeInRange: Math.round(data.tir / data.count),
        timeBelowRange: Math.round(data.below / data.count),
        timeAboveRange: Math.round(data.above / data.count),
      }))
      .sort((a, b) => order.indexOf(a.a1c) - order.indexOf(b.a1c));
  }, [glucoseData]);

  // Calculate overall stats
  const overallStats = React.useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    const totalSamples = glucoseData.reduce((acc, d) => acc + d.sample_size, 0);
    const avgGlucose = Math.round(glucoseData.reduce((acc, d) => acc + d.average_glucose, 0) / glucoseData.length);
    const avgTIR = Math.round(glucoseData.reduce((acc, d) => acc + d.time_in_range_percent, 0) / glucoseData.length);
    
    return { totalSamples, avgGlucose, avgTIR };
  }, [glucoseData]);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Public Glucose Data</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Explore anonymized glucose patterns from public repositories. Discover population-wide trends 
            and see how different factors affect glucose control.
          </p>
        </div>

        {/* Data Notice */}
        <Card className="command-center-widget mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">About This Data</p>
              <p className="text-blue-800 dark:text-blue-200">
                This data is aggregated and anonymized from public sources including OpenAPS, Nightscout, 
                and Tidepool. Individual data points represent population averages, not individual patients.
                Data collection period: 2023-2024.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Age Group</label>
            <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Groups</SelectItem>
                <SelectItem value="0-17">0-17 (Pediatric)</SelectItem>
                <SelectItem value="18-30">18-30 (Young Adult)</SelectItem>
                <SelectItem value="31-45">31-45 (Adult)</SelectItem>
                <SelectItem value="46-60">46-60 (Middle Age)</SelectItem>
                <SelectItem value="61+">61+ (Senior)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Device Type</label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger>
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="Dexcom">Dexcom</SelectItem>
                <SelectItem value="Libre">Freestyle Libre</SelectItem>
                <SelectItem value="Medtronic">Medtronic</SelectItem>
                <SelectItem value="Multiple">Multiple Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">A1C Range</label>
            <Select value={selectedA1C} onValueChange={setSelectedA1C}>
              <SelectTrigger>
                <SelectValue placeholder="All A1C Ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All A1C Ranges</SelectItem>
                <SelectItem value="<6.0">&lt;6.0%</SelectItem>
                <SelectItem value="6.0-6.5">6.0-6.5%</SelectItem>
                <SelectItem value="6.5-7.0">6.5-7.0%</SelectItem>
                <SelectItem value="7.0-7.5">7.0-7.5%</SelectItem>
                <SelectItem value="7.5-8.0">7.5-8.0%</SelectItem>
                <SelectItem value=">8.0">&gt;8.0%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : glucoseData && glucoseData.length > 0 ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            {overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="command-center-widget">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.avgGlucose} mg/dL</p>
                      <p className="text-sm text-muted-foreground">Average Glucose</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="command-center-widget">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.avgTIR}%</p>
                      <p className="text-sm text-muted-foreground">Avg Time in Range (70-180)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="command-center-widget">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.totalSamples.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Data Points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Hourly Pattern Chart */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  24-Hour Glucose Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={hourlyAverages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis domain={[50, 250]} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} mg/dL`,
                        name === 'average' ? 'Average' : name === 'min' ? 'Min' : 'Max'
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="max" 
                      stackId="1"
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))" 
                      fillOpacity={0.2}
                      name="Max"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="average" 
                      stackId="2"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                      name="Average"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="min" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={false}
                      name="Min"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Dawn phenomenon typically visible 4-7 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span>Post-meal spikes visible after 8 AM, 12 PM, 6 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time in Range by A1C */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Time in Range by A1C Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeInRangeByA1C} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="a1c" width={80} />
                    <Tooltip formatter={(value: number) => [`${value}%`]} />
                    <Legend />
                    <Bar dataKey="timeBelowRange" stackId="a" fill="hsl(var(--chart-2))" name="Below Range (<70)" />
                    <Bar dataKey="timeInRange" stackId="a" fill="hsl(var(--chart-1))" name="In Range (70-180)" />
                    <Bar dataKey="timeAboveRange" stackId="a" fill="hsl(var(--chart-3))" name="Above Range (>180)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No glucose data matches your selected filters. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
