import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Activity, TrendingUp, Clock, AlertTriangle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';

interface GlucoseReading {
  id: string;
  source_dataset: string;
  anonymized_user_id: string | null;
  timestamp: string | null;
  glucose_value: number | null;
  insulin_dose: number | null;
  carbs: number | null;
  notes: string | null;
}

export default function PublicGlucoseData() {
  const [selectedDataset, setSelectedDataset] = useState<string>('all');

  const { data: glucoseData, isLoading } = useQuery({
    queryKey: ['public-glucose-data', selectedDataset],
    queryFn: async () => {
      let query = supabase
        .from('public_glucose_data')
        .select('*')
        .not('glucose_value', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(500);
      
      if (selectedDataset !== 'all') {
        query = query.eq('source_dataset', selectedDataset);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GlucoseReading[];
    },
  });

  // Get unique datasets
  const { data: datasets } = useQuery({
    queryKey: ['glucose-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_glucose_data')
        .select('source_dataset')
        .limit(100);
      
      if (error) throw error;
      const unique = [...new Set(data.map(d => d.source_dataset))];
      return unique;
    },
  });

  // Aggregate hourly data
  const hourlyAverages = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return [];
    
    const hourlyMap = new Map<number, { sum: number; count: number; min: number; max: number }>();
    
    glucoseData.forEach(reading => {
      if (!reading.timestamp || reading.glucose_value === null) return;
      
      const hour = new Date(reading.timestamp).getHours();
      const existing = hourlyMap.get(hour) || { sum: 0, count: 0, min: Infinity, max: -Infinity };
      hourlyMap.set(hour, {
        sum: existing.sum + reading.glucose_value,
        count: existing.count + 1,
        min: Math.min(existing.min, reading.glucose_value),
        max: Math.max(existing.max, reading.glucose_value),
      });
    });

    return Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        average: Math.round(data.sum / data.count),
        min: data.min,
        max: data.max,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [glucoseData]);

  // Time in range distribution
  const rangeDistribution = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return [];
    
    let below = 0, inRange = 0, above = 0;
    
    glucoseData.forEach(reading => {
      if (reading.glucose_value === null) return;
      if (reading.glucose_value < 70) below++;
      else if (reading.glucose_value <= 180) inRange++;
      else above++;
    });

    const total = below + inRange + above;
    return [
      { name: 'Below Range (<70)', value: Math.round((below / total) * 100), color: 'hsl(var(--chart-2))' },
      { name: 'In Range (70-180)', value: Math.round((inRange / total) * 100), color: 'hsl(var(--chart-1))' },
      { name: 'Above Range (>180)', value: Math.round((above / total) * 100), color: 'hsl(var(--chart-3))' },
    ];
  }, [glucoseData]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    const validReadings = glucoseData.filter(d => d.glucose_value !== null);
    const glucoseValues = validReadings.map(d => d.glucose_value!);
    
    const avgGlucose = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
    const inRangeCount = glucoseValues.filter(v => v >= 70 && v <= 180).length;
    const avgTIR = Math.round((inRangeCount / glucoseValues.length) * 100);
    
    return { totalReadings: validReadings.length, avgGlucose, avgTIR };
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
                and Tidepool. Individual data points represent real readings, anonymized for privacy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Source</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {datasets?.map(dataset => (
                  <SelectItem key={dataset} value={dataset}>{dataset}</SelectItem>
                ))}
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
                      <p className="text-sm text-muted-foreground">Time in Range (70-180)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="command-center-widget">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.totalReadings.toLocaleString()}</p>
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
                      stroke="hsl(var(--chart-3))" 
                      fill="hsl(var(--chart-3))" 
                      fillOpacity={0.2}
                      name="Max"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="average" 
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

            {/* Time in Range Distribution */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Time in Range Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rangeDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip formatter={(value: number) => [`${value}%`]} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
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
                No glucose data matches your selected filters. Try adjusting your filters or seed data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
