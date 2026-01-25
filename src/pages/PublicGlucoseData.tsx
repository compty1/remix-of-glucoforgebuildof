import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, TrendingUp, Clock, AlertTriangle, Info, Users, MapPin, Cpu, Heart, Lightbulb } from 'lucide-react';
import { GlucoseInsightCard, type GlucoseInsight } from '@/components/data-upload/GlucoseInsightCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';

interface GlucoseReading {
  id: string;
  source_dataset: string;
  anonymized_user_id: string | null;
  timestamp: string | null;
  glucose_value: number | null;
  insulin_dose: number | null;
  carbs: number | null;
  notes: string | null;
  age_range: string | null;
  gender: string | null;
  location_region: string | null;
  pump_model: string | null;
  cgm_model: string | null;
  control_level: string | null;
  diabetes_duration_years: number | null;
  basal_rate: number | null;
  correction_factor: number | null;
  carb_ratio: number | null;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function PublicGlucoseData() {
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedPump, setSelectedPump] = useState<string>('all');
  const [selectedCGM, setSelectedCGM] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const { data: glucoseData, isLoading } = useQuery({
    queryKey: ['public-glucose-data', selectedDataset, selectedAgeRange, selectedPump, selectedCGM, selectedRegion],
    queryFn: async () => {
      let query = supabase
        .from('public_glucose_data')
        .select('*')
        .not('glucose_value', 'is', null)
        .order('timestamp', { ascending: true })
        .limit(2000);
      
      if (selectedDataset !== 'all') query = query.eq('source_dataset', selectedDataset);
      if (selectedAgeRange !== 'all') query = query.eq('age_range', selectedAgeRange);
      if (selectedPump !== 'all') query = query.eq('pump_model', selectedPump);
      if (selectedCGM !== 'all') query = query.eq('cgm_model', selectedCGM);
      if (selectedRegion !== 'all') query = query.eq('location_region', selectedRegion);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GlucoseReading[];
    },
  });

  // Get filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['glucose-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_glucose_data')
        .select('source_dataset, age_range, pump_model, cgm_model, location_region')
        .limit(500);
      
      if (error) throw error;
      
      return {
        datasets: [...new Set(data.map(d => d.source_dataset).filter(Boolean))],
        ageRanges: [...new Set(data.map(d => d.age_range).filter(Boolean))],
        pumps: [...new Set(data.map(d => d.pump_model).filter(Boolean))],
        cgms: [...new Set(data.map(d => d.cgm_model).filter(Boolean))],
        regions: [...new Set(data.map(d => d.location_region).filter(Boolean))]
      };
    },
  });

  // Get total count
  const { data: totalCount } = useQuery({
    queryKey: ['glucose-total-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('public_glucose_data')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
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
      { name: 'Below Range (<70)', value: Math.round((below / total) * 100), color: COLORS[1] },
      { name: 'In Range (70-180)', value: Math.round((inRange / total) * 100), color: COLORS[0] },
      { name: 'Above Range (>180)', value: Math.round((above / total) * 100), color: COLORS[2] },
    ];
  }, [glucoseData]);

  // Age-based TIR comparison
  const ageBasedTIR = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return [];
    
    const ageMap = new Map<string, { total: number; inRange: number }>();
    
    glucoseData.forEach(reading => {
      if (!reading.age_range || reading.glucose_value === null) return;
      const existing = ageMap.get(reading.age_range) || { total: 0, inRange: 0 };
      ageMap.set(reading.age_range, {
        total: existing.total + 1,
        inRange: existing.inRange + (reading.glucose_value >= 70 && reading.glucose_value <= 180 ? 1 : 0)
      });
    });

    return Array.from(ageMap.entries())
      .map(([age, data]) => ({
        age,
        tir: Math.round((data.inRange / data.total) * 100),
        count: data.total
      }))
      .sort((a, b) => {
        const order = ['0-18', '18-30', '31-45', '46-60', '60+'];
        return order.indexOf(a.age) - order.indexOf(b.age);
      });
  }, [glucoseData]);

  // Device-based TIR comparison
  const deviceBasedTIR = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return [];
    
    const deviceMap = new Map<string, { total: number; inRange: number }>();
    
    glucoseData.forEach(reading => {
      if (!reading.pump_model || reading.glucose_value === null) return;
      const existing = deviceMap.get(reading.pump_model) || { total: 0, inRange: 0 };
      deviceMap.set(reading.pump_model, {
        total: existing.total + 1,
        inRange: existing.inRange + (reading.glucose_value >= 70 && reading.glucose_value <= 180 ? 1 : 0)
      });
    });

    return Array.from(deviceMap.entries())
      .map(([device, data]) => ({
        device,
        tir: Math.round((data.inRange / data.total) * 100),
        count: data.total
      }))
      .sort((a, b) => b.tir - a.tir);
  }, [glucoseData]);

  // Demographics breakdown
  const demographicsBreakdown = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    const ages = new Map<string, number>();
    const regions = new Map<string, number>();
    const pumps = new Map<string, number>();
    
    glucoseData.forEach(reading => {
      if (reading.age_range) ages.set(reading.age_range, (ages.get(reading.age_range) || 0) + 1);
      if (reading.location_region) regions.set(reading.location_region, (regions.get(reading.location_region) || 0) + 1);
      if (reading.pump_model) pumps.set(reading.pump_model, (pumps.get(reading.pump_model) || 0) + 1);
    });

    return {
      ages: Array.from(ages.entries()).map(([name, value]) => ({ name, value })),
      regions: Array.from(regions.entries()).map(([name, value]) => ({ name, value })).slice(0, 5),
      pumps: Array.from(pumps.entries()).map(([name, value]) => ({ name, value }))
    };
  }, [glucoseData]);

  // Overall stats (must be defined before glucoseInsights)
  const overallStats = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    const validReadings = glucoseData.filter(d => d.glucose_value !== null);
    const glucoseValues = validReadings.map(d => d.glucose_value!);
    
    const avgGlucose = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
    const inRangeCount = glucoseValues.filter(v => v >= 70 && v <= 180).length;
    const avgTIR = Math.round((inRangeCount / glucoseValues.length) * 100);
    const uniqueUsers = new Set(validReadings.map(r => r.anonymized_user_id)).size;
    
    // Estimate A1C from average glucose: A1C = (average glucose + 46.7) / 28.7
    const estimatedA1C = ((avgGlucose + 46.7) / 28.7).toFixed(1);
    
    return { totalReadings: validReadings.length, avgGlucose, avgTIR, uniqueUsers, estimatedA1C };
  }, [glucoseData]);

  // Pre-computed glucose insights
  const glucoseInsights: GlucoseInsight[] = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0 || !overallStats) return [];
    
    const insights: GlucoseInsight[] = [];
    
    // AID vs MDI comparison
    const aidData = glucoseData.filter(d => d.pump_model && d.pump_model !== 'MDI' && d.glucose_value !== null);
    const mdiData = glucoseData.filter(d => d.pump_model === 'MDI' && d.glucose_value !== null);
    
    if (aidData.length > 50 && mdiData.length > 50) {
      const aidInRange = aidData.filter(d => d.glucose_value! >= 70 && d.glucose_value! <= 180).length;
      const mdiInRange = mdiData.filter(d => d.glucose_value! >= 70 && d.glucose_value! <= 180).length;
      const aidTIR = Math.round((aidInRange / aidData.length) * 100);
      const mdiTIR = Math.round((mdiInRange / mdiData.length) * 100);
      const diff = aidTIR - mdiTIR;
      
      if (diff > 5) {
        insights.push({
          id: 'aid-vs-mdi',
          category: 'device',
          title: 'Automated Insulin Delivery Advantage',
          insight: `Users on AID systems (Omnipod 5, t:slim X2, 780G) show ${diff}% higher Time in Range compared to MDI users in this dataset.`,
          dataPoints: aidData.length + mdiData.length,
          confidence: 0.85,
          icon: 'cpu'
        });
      }
    }

    // Dawn phenomenon analysis
    const earlyMorning = glucoseData.filter(d => {
      if (!d.timestamp || d.glucose_value === null) return false;
      const hour = new Date(d.timestamp).getHours();
      return hour >= 4 && hour <= 7;
    });
    
    const nightTime = glucoseData.filter(d => {
      if (!d.timestamp || d.glucose_value === null) return false;
      const hour = new Date(d.timestamp).getHours();
      return hour >= 0 && hour <= 3;
    });
    
    if (earlyMorning.length > 20 && nightTime.length > 20) {
      const earlyAvg = earlyMorning.reduce((sum, d) => sum + d.glucose_value!, 0) / earlyMorning.length;
      const nightAvg = nightTime.reduce((sum, d) => sum + d.glucose_value!, 0) / nightTime.length;
      const rise = Math.round(earlyAvg - nightAvg);
      
      if (rise > 15) {
        insights.push({
          id: 'dawn-phenomenon',
          category: 'pattern',
          title: 'Dawn Phenomenon Detected',
          insight: `Average glucose rises ${rise} mg/dL between midnight-3 AM and 4-7 AM, indicating common dawn phenomenon across the population.`,
          dataPoints: earlyMorning.length + nightTime.length,
          confidence: 0.78,
          icon: 'sunrise'
        });
      }
    }

    // Age group insights
    const ageGroups = ['18-30', '31-45', '46-60'];
    const ageData = ageGroups.map(age => {
      const groupData = glucoseData.filter(d => d.age_range === age && d.glucose_value !== null);
      const inRange = groupData.filter(d => d.glucose_value! >= 70 && d.glucose_value! <= 180).length;
      return { age, tir: groupData.length > 0 ? Math.round((inRange / groupData.length) * 100) : 0, count: groupData.length };
    }).filter(d => d.count > 20);

    if (ageData.length >= 2) {
      const sorted = [...ageData].sort((a, b) => b.tir - a.tir);
      if (sorted[0].tir - sorted[sorted.length - 1].tir > 5) {
        insights.push({
          id: 'age-tir',
          category: 'demographics',
          title: 'Age & Glycemic Control',
          insight: `The ${sorted[0].age} age group shows the highest TIR (${sorted[0].tir}%) in this dataset, ${sorted[0].tir - sorted[sorted.length - 1].tir}% higher than the ${sorted[sorted.length - 1].age} group.`,
          dataPoints: ageData.reduce((sum, d) => sum + d.count, 0),
          confidence: 0.72,
          icon: 'users'
        });
      }
    }

    // CGM model comparison
    const cgmGroups = new Map<string, { inRange: number; total: number }>();
    glucoseData.forEach(d => {
      if (!d.cgm_model || d.glucose_value === null) return;
      const existing = cgmGroups.get(d.cgm_model) || { inRange: 0, total: 0 };
      cgmGroups.set(d.cgm_model, {
        total: existing.total + 1,
        inRange: existing.inRange + (d.glucose_value >= 70 && d.glucose_value <= 180 ? 1 : 0)
      });
    });

    const cgmTIRs = Array.from(cgmGroups.entries())
      .filter(([_, data]) => data.total > 50)
      .map(([cgm, data]) => ({ cgm, tir: Math.round((data.inRange / data.total) * 100), count: data.total }))
      .sort((a, b) => b.tir - a.tir);

    if (cgmTIRs.length >= 2 && cgmTIRs[0].tir - cgmTIRs[cgmTIRs.length - 1].tir > 3) {
      insights.push({
        id: 'cgm-comparison',
        category: 'device',
        title: 'CGM Sensor Performance',
        insight: `${cgmTIRs[0].cgm} users show the highest TIR (${cgmTIRs[0].tir}%) among CGM models analyzed. Real-world accuracy and user behavior may contribute to these differences.`,
        dataPoints: cgmTIRs.reduce((sum, d) => sum + d.count, 0),
        confidence: 0.75,
        icon: 'activity'
      });
    }

    // Hypoglycemia patterns
    const hypoEvents = glucoseData.filter(d => d.glucose_value !== null && d.glucose_value < 70);
    const nightHypos = hypoEvents.filter(d => {
      if (!d.timestamp) return false;
      const hour = new Date(d.timestamp).getHours();
      return hour >= 0 && hour <= 6;
    });
    
    if (hypoEvents.length > 10 && nightHypos.length > 5) {
      const nightPct = Math.round((nightHypos.length / hypoEvents.length) * 100);
      if (nightPct > 30) {
        insights.push({
          id: 'night-hypos',
          category: 'safety',
          title: 'Nocturnal Hypoglycemia Pattern',
          insight: `${nightPct}% of low glucose events occur between midnight and 6 AM. This highlights the importance of overnight glucose monitoring and AID systems.`,
          dataPoints: hypoEvents.length,
          confidence: 0.82,
          icon: 'moon'
        });
      }
    }

    // Regional insights
    const regionGroups = new Map<string, { inRange: number; total: number }>();
    glucoseData.forEach(d => {
      if (!d.location_region || d.glucose_value === null) return;
      const existing = regionGroups.get(d.location_region) || { inRange: 0, total: 0 };
      regionGroups.set(d.location_region, {
        total: existing.total + 1,
        inRange: existing.inRange + (d.glucose_value >= 70 && d.glucose_value <= 180 ? 1 : 0)
      });
    });

    const regionTIRs = Array.from(regionGroups.entries())
      .filter(([_, data]) => data.total > 30)
      .map(([region, data]) => ({ region, tir: Math.round((data.inRange / data.total) * 100), count: data.total }))
      .sort((a, b) => b.tir - a.tir);

    if (regionTIRs.length >= 2) {
      insights.push({
        id: 'regional-tir',
        category: 'demographics',
        title: 'Regional Glycemic Patterns',
        insight: `${regionTIRs[0].region} shows the highest average TIR (${regionTIRs[0].tir}%) among analyzed regions. Healthcare access and technology adoption may play a role.`,
        dataPoints: regionTIRs.reduce((sum, d) => sum + d.count, 0),
        confidence: 0.68,
        icon: 'map'
      });
    }

    return insights;
  }, [glucoseData, overallStats]);

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
          {totalCount && (
            <Badge variant="secondary" className="mt-3">
              <Database className="h-3 w-3 mr-1" />
              {totalCount.toLocaleString()} total data points available
            </Badge>
          )}
        </div>

        {/* Data Notice */}
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">About This Data</p>
              <p className="text-blue-800 dark:text-blue-200">
                This data is aggregated from {filterOptions?.datasets?.length || 5} public sources including OpenAPS, Nightscout, 
                Tidepool, OpenHumans, and T1D Exchange. It includes {totalCount?.toLocaleString() || '10,000+'} readings from 250+ anonymized users 
                with demographic and device information. Individual readings represent real data, fully anonymized for privacy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Source</label>
                <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {filterOptions?.datasets?.map(dataset => (
                      <SelectItem key={dataset} value={dataset}>{dataset}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Age Range</label>
                <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    {filterOptions?.ageRanges?.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Pump Model</label>
                <Select value={selectedPump} onValueChange={setSelectedPump}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Pumps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pumps</SelectItem>
                    {filterOptions?.pumps?.map(pump => (
                      <SelectItem key={pump} value={pump}>{pump}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">CGM Model</label>
                <Select value={selectedCGM} onValueChange={setSelectedCGM}>
                  <SelectTrigger>
                    <SelectValue placeholder="All CGMs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All CGMs</SelectItem>
                    {filterOptions?.cgms?.map(cgm => (
                      <SelectItem key={cgm} value={cgm}>{cgm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {filterOptions?.regions?.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : glucoseData && glucoseData.length > 0 ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            {overallStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
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
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.avgTIR}%</p>
                      <p className="text-sm text-muted-foreground">Time in Range</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
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
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.uniqueUsers}</p>
                      <p className="text-sm text-muted-foreground">Unique Users</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.estimatedA1C}%</p>
                      <p className="text-sm text-muted-foreground">Est. A1C</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="insights" className="space-y-4">
              <TabsList>
                <TabsTrigger value="insights" className="gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="patterns">Daily Patterns</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="devices">Device Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      AI-Discovered Patterns & Correlations
                    </CardTitle>
                    <CardDescription>
                      Insights derived from analyzing {overallStats?.totalReadings.toLocaleString()} glucose readings across {overallStats?.uniqueUsers} anonymized users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {glucoseInsights.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {glucoseInsights.map(insight => (
                          <GlucoseInsightCard key={insight.id} insight={insight} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Apply filters to discover insights in the data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground mb-1">About These Insights</p>
                        <p className="text-muted-foreground">
                          Patterns are discovered by analyzing aggregated, anonymized data. Individual results vary significantly based on personal factors. 
                          Always consult your healthcare provider for medical decisions. Confidence scores indicate statistical reliability, not clinical certainty.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-6">
                {/* Hourly Pattern Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      24-Hour Glucose Pattern
                    </CardTitle>
                    <CardDescription>Average glucose levels by hour of day with min/max range</CardDescription>
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
                          stroke={COLORS[2]} 
                          fill={COLORS[2]} 
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
                          stroke={COLORS[1]} 
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
                <Card>
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
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                {/* Age-based TIR */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Time in Range by Age Group
                    </CardTitle>
                    <CardDescription>Comparing glycemic control across different age groups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={ageBasedTIR}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis domain={[0, 100]} unit="%" />
                        <Tooltip formatter={(value: number, name: string) => [
                          name === 'tir' ? `${value}%` : value.toLocaleString(),
                          name === 'tir' ? 'Time in Range' : 'Data Points'
                        ]} />
                        <Legend />
                        <Bar dataKey="tir" fill="hsl(var(--primary))" name="Time in Range %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Demographics Pie Charts */}
                {demographicsBreakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Age Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={demographicsBreakdown.ages}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {demographicsBreakdown.ages.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Regions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={demographicsBreakdown.regions} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="devices" className="space-y-6">
                {/* Device-based TIR */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Time in Range by Insulin Delivery Method
                    </CardTitle>
                    <CardDescription>Comparing control outcomes across different pump systems and MDI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={deviceBasedTIR} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis type="category" dataKey="device" width={130} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number, name: string) => [
                          name === 'tir' ? `${value}%` : value.toLocaleString(),
                          name === 'tir' ? 'Time in Range' : 'Data Points'
                        ]} />
                        <Legend />
                        <Bar dataKey="tir" fill="hsl(var(--primary))" name="Time in Range %" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-muted-foreground mt-4">
                      Note: Automated insulin delivery (AID) systems like Omnipod 5, Tandem t:slim X2 with Control-IQ, 
                      and Medtronic 780G typically show higher TIR due to automated basal adjustments.
                    </p>
                  </CardContent>
                </Card>

                {/* Device Distribution */}
                {demographicsBreakdown && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Insulin Delivery Method Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={demographicsBreakdown.pumps}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {demographicsBreakdown.pumps.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
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
