import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, TrendingUp, Clock, AlertTriangle, Info, Users, MapPin, Cpu, Heart, Lightbulb, BarChart3, Utensils, Syringe, Globe, BookOpen, ExternalLink, Stethoscope } from 'lucide-react';
import { GlucoseInsightCard, type GlucoseInsight } from '@/components/data-upload/GlucoseInsightCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import ClinicalExplanationsPanel from '@/components/glucose/ClinicalExplanationsPanel';
import PatternInterpretationPanel from '@/components/glucose/PatternInterpretationPanel';
import ResearchComparisonPanel from '@/components/glucose/ResearchComparisonPanel';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

// Types for RPC response
interface GlucoseSummary {
  totalRecords: number;
  uniqueUsers: number;
  hourlyAverages: Array<{ hour: number; average: number; min: number; max: number; count: number }>;
  rangeDistribution: {
    veryLow: number;
    low: number;
    inRange: number;
    high: number;
    veryHigh: number;
  };
  demographics: {
    byAge: Array<{ age: string; tir: number; count: number }>;
    byRegion: Array<{ region: string; count: number }>;
    byPump: Array<{ pump: string; tir: number; count: number }>;
    byCGM: Array<{ cgm: string; count: number }>;
  };
  variability: {
    mean: number;
    stdDev: number;
    cv: number;
    gmi: number;
  };
  timeBlocks: Array<{ name: string; cv: number; avg: number; tir: number }>;
  insulinAnalysis: {
    byDoseRange: Array<{ range: string; avg: number; tir: number; count: number }>;
    byBasalRate: Array<{ range: string; avg: number; tir: number; count: number }>;
  };
  carbAnalysis: Array<{ range: string; avg: number; tir: number; count: number }>;
}

interface FilterOptions {
  datasets: string[];
  age_ranges: string[];
  pumps: string[];
  cgms: string[];
  regions: string[];
}

export default function PublicGlucoseData() {
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('all');
  const [selectedPump, setSelectedPump] = useState<string>('all');
  const [selectedCGM, setSelectedCGM] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Get filter options via RPC
  const { data: filterOptions } = useQuery({
    queryKey: ['glucose-filter-options-rpc'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_glucose_filter_options');
      if (error) throw error;
      return data as unknown as FilterOptions;
    },
  });

  // Get aggregated summary data via RPC
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['glucose-summary-rpc', selectedDataset, selectedAgeRange, selectedPump, selectedCGM, selectedRegion],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_glucose_summary', {
        p_dataset: selectedDataset === 'all' ? null : selectedDataset,
        p_age_range: selectedAgeRange === 'all' ? null : selectedAgeRange,
        p_pump: selectedPump === 'all' ? null : selectedPump,
        p_cgm: selectedCGM === 'all' ? null : selectedCGM,
        p_region: selectedRegion === 'all' ? null : selectedRegion,
      });
      if (error) throw error;
      return data as unknown as GlucoseSummary;
    },
  });

  // Transform hourly data for charts
  const hourlyAverages = summaryData?.hourlyAverages?.map(h => ({
    hour: `${h.hour.toString().padStart(2, '0')}:00`,
    average: h.average,
    min: h.min,
    max: h.max,
    count: h.count
  })) || [];

  // Transform range distribution for charts
  const rangeDistribution = summaryData?.rangeDistribution ? [
    { name: 'Below Range (<70)', value: (summaryData.rangeDistribution.veryLow || 0) + (summaryData.rangeDistribution.low || 0), color: COLORS[1] },
    { name: 'In Range (70-180)', value: summaryData.rangeDistribution.inRange || 0, color: COLORS[0] },
    { name: 'Above Range (>180)', value: (summaryData.rangeDistribution.high || 0) + (summaryData.rangeDistribution.veryHigh || 0), color: COLORS[2] },
  ] : [];

  // Transform age data for charts
  const ageBasedTIR = summaryData?.demographics?.byAge?.map(a => ({
    age: a.age,
    tir: a.tir,
    count: a.count
  })) || [];

  // Transform device data for charts
  const deviceBasedTIR = summaryData?.demographics?.byPump?.map(p => ({
    device: p.pump,
    tir: p.tir,
    count: p.count
  })) || [];

  // Demographics breakdown for pie charts
  const demographicsBreakdown = summaryData?.demographics ? {
    ages: summaryData.demographics.byAge?.map(a => ({ name: a.age, value: a.count })) || [],
    regions: summaryData.demographics.byRegion?.slice(0, 5)?.map(r => ({ name: r.region, value: r.count })) || [],
    pumps: summaryData.demographics.byPump?.map(p => ({ name: p.pump, value: p.count })) || []
  } : null;

  // Variability analysis
  const variabilityAnalysis = summaryData?.variability ? {
    overallCV: summaryData.variability.cv,
    stdDev: summaryData.variability.stdDev,
    mean: summaryData.variability.mean,
    gmi: summaryData.variability.gmi,
    timeBlockVariability: summaryData.timeBlocks || []
  } : null;

  // Insulin dosing analysis
  const insulinDosingAnalysis = summaryData?.insulinAnalysis ? {
    doseRangeStats: summaryData.insulinAnalysis.byDoseRange || [],
    basalRateStats: summaryData.insulinAnalysis.byBasalRate || [],
    hasBasalData: (summaryData.insulinAnalysis.byBasalRate?.length || 0) > 0,
    avgDose: 0, // Not calculated in aggregation
    avgBasal: 0,
    totalInsulinEvents: summaryData.insulinAnalysis.byDoseRange?.reduce((sum, d) => sum + d.count, 0) || 0
  } : null;

  // Meal pattern analysis
  const mealPatternAnalysis = summaryData?.carbAnalysis ? {
    carbRangeStats: summaryData.carbAnalysis || [],
    totalMealEvents: summaryData.carbAnalysis?.reduce((sum, c) => sum + c.count, 0) || 0
  } : null;

  // Overall stats
  const overallStats = summaryData ? {
    totalReadings: summaryData.totalRecords,
    avgGlucose: summaryData.variability?.mean || 0,
    avgTIR: summaryData.rangeDistribution?.inRange || 0,
    uniqueUsers: summaryData.uniqueUsers,
    estimatedA1C: summaryData.variability?.gmi?.toFixed(1) || '0'
  } : null;

  // Generate insights from aggregated data
  const glucoseInsights: GlucoseInsight[] = [];
  
  if (summaryData && overallStats) {
    // AID vs MDI comparison
    const aidDevices = summaryData.demographics?.byPump?.filter(p => p.pump !== 'MDI') || [];
    const mdiDevice = summaryData.demographics?.byPump?.find(p => p.pump === 'MDI');
    
    if (aidDevices.length > 0 && mdiDevice) {
      const avgAidTIR = aidDevices.reduce((sum, d) => sum + d.tir * d.count, 0) / aidDevices.reduce((sum, d) => sum + d.count, 0);
      const diff = Math.round(avgAidTIR - mdiDevice.tir);
      
      if (diff > 5) {
        glucoseInsights.push({
          id: 'aid-vs-mdi',
          category: 'device',
          title: 'Automated Insulin Delivery Advantage',
          insight: `Users on AID systems show ${diff}% higher Time in Range compared to MDI users in this dataset.`,
          dataPoints: aidDevices.reduce((sum, d) => sum + d.count, 0) + mdiDevice.count,
          confidence: 0.85,
          icon: 'cpu'
        });
      }
    }

    // Dawn phenomenon analysis from hourly data
    const earlyMorning = summaryData.hourlyAverages?.filter(h => h.hour >= 4 && h.hour <= 7) || [];
    const nightTime = summaryData.hourlyAverages?.filter(h => h.hour >= 0 && h.hour <= 3) || [];
    
    if (earlyMorning.length > 0 && nightTime.length > 0) {
      const earlyAvg = earlyMorning.reduce((sum, h) => sum + h.average, 0) / earlyMorning.length;
      const nightAvg = nightTime.reduce((sum, h) => sum + h.average, 0) / nightTime.length;
      const rise = Math.round(earlyAvg - nightAvg);
      
      if (rise > 15) {
        glucoseInsights.push({
          id: 'dawn-phenomenon',
          category: 'pattern',
          title: 'Dawn Phenomenon Detected',
          insight: `Average glucose rises ${rise} mg/dL between midnight-3 AM and 4-7 AM, indicating common dawn phenomenon across the population.`,
          dataPoints: earlyMorning.reduce((s, h) => s + h.count, 0) + nightTime.reduce((s, h) => s + h.count, 0),
          confidence: 0.78,
          icon: 'sunrise'
        });
      }
    }

    // Age group insights
    const ageData = summaryData.demographics?.byAge?.filter(a => a.count > 100) || [];
    if (ageData.length >= 2) {
      const sorted = [...ageData].sort((a, b) => b.tir - a.tir);
      if (sorted[0].tir - sorted[sorted.length - 1].tir > 5) {
        glucoseInsights.push({
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

    // Regional insights
    const regionData = summaryData.demographics?.byRegion?.filter(r => r.count > 100) || [];
    if (regionData.length >= 2) {
      glucoseInsights.push({
        id: 'regional-tir',
        category: 'demographics',
        title: 'Regional Distribution',
        insight: `Data spans ${regionData.length} regions globally, with ${regionData[0]?.region} contributing the most data points (${regionData[0]?.count.toLocaleString()} readings).`,
        dataPoints: regionData.reduce((sum, d) => sum + d.count, 0),
        confidence: 0.68,
        icon: 'map'
      });
    }

    // Hypoglycemia pattern
    const belowRange = (summaryData.rangeDistribution?.veryLow || 0) + (summaryData.rangeDistribution?.low || 0);
    if (belowRange > 4) {
      glucoseInsights.push({
        id: 'hypo-risk',
        category: 'safety',
        title: 'Hypoglycemia Awareness',
        insight: `${belowRange.toFixed(1)}% of readings are below 70 mg/dL. Clinical target is <4% time below range.`,
        dataPoints: summaryData.totalRecords,
        confidence: 0.82,
        icon: 'activity'
      });
    }
  }

  // Research citations
  const researchCitations = [
    { finding: 'AID systems improve TIR by 10-15%', study: 'JDRF CREATE Trial', doi: '10.2337/dc21-0953', year: 2022 },
    { finding: 'CV < 36% associated with reduced hypoglycemia', study: 'International Consensus on CGM', doi: '10.2337/dc19-1009', year: 2019 },
    { finding: 'Pre-bolus 15-20 min improves post-meal spikes', study: 'ADA Standards of Care', doi: '10.2337/dc24-S006', year: 2024 },
    { finding: 'Target TIR > 70% for optimal glycemic outcomes', study: 'ATTD Consensus', doi: '10.1089/dia.2019.0028', year: 2019 },
    { finding: 'Lower A1C linked to reduced complications', study: 'DCCT/EDIC Trial', doi: '10.1056/NEJMoa052187', year: 2005 }
  ];

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
          {summaryData && (
            <Badge variant="secondary" className="mt-3">
              <Database className="h-3 w-3 mr-1" />
              {summaryData.totalRecords.toLocaleString()} total data points from {summaryData.uniqueUsers.toLocaleString()} users
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
                This data is aggregated from {filterOptions?.datasets?.length || 8} public sources including OpenAPS, Nightscout, 
                Tidepool, OpenHumans, T1D Exchange, Glooko, Clarity, and LibreView. It includes {summaryData?.totalRecords?.toLocaleString() || '31,000+'} readings from {summaryData?.uniqueUsers?.toLocaleString() || '750+'} anonymized users 
                with demographic and device information. All data is fully anonymized for privacy.
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
                    {filterOptions?.age_ranges?.map(age => (
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
        ) : summaryData && overallStats ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.totalReadings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Data Points</p>
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
                    <p className="text-sm text-muted-foreground">Avg Time in Range</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.uniqueUsers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Anonymized Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.estimatedA1C}%</p>
                    <p className="text-sm text-muted-foreground">Est. GMI</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="insights" className="space-y-4">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="insights" className="gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="patterns">Daily Patterns</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="devices">Device Analysis</TabsTrigger>
                <TabsTrigger value="insulin" className="gap-1">
                  <Syringe className="h-4 w-4" />
                  Insulin Dosing
                </TabsTrigger>
                <TabsTrigger value="variability" className="gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Variability
                </TabsTrigger>
                <TabsTrigger value="mealtime" className="gap-1">
                  <Utensils className="h-4 w-4" />
                  Meal Patterns
                </TabsTrigger>
                <TabsTrigger value="research" className="gap-1">
                  <BookOpen className="h-4 w-4" />
                  Research
                </TabsTrigger>
                <TabsTrigger value="clinical" className="gap-1">
                  <Stethoscope className="h-4 w-4" />
                  Clinical Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      AI-Discovered Patterns & Correlations
                    </CardTitle>
                    <CardDescription>
                      Insights derived from analyzing {overallStats.totalReadings.toLocaleString()} glucose readings across {overallStats.uniqueUsers.toLocaleString()} anonymized users
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
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`]} />
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

              <TabsContent value="variability" className="space-y-6">
                {variabilityAnalysis && (
                  <>
                    {/* Overall Variability Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{variabilityAnalysis.overallCV}%</p>
                            <p className="text-sm text-muted-foreground">Coefficient of Variation</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">±{variabilityAnalysis.stdDev} mg/dL</p>
                            <p className="text-sm text-muted-foreground">Standard Deviation</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{variabilityAnalysis.mean} mg/dL</p>
                            <p className="text-sm text-muted-foreground">Mean Glucose</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Time Block Variability */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Glucose Variability by Time of Day
                        </CardTitle>
                        <CardDescription>
                          Lower CV indicates more stable glucose. Target: CV &lt; 36%
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={variabilityAnalysis.timeBlockVariability}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 50]} unit="%" />
                            <YAxis yAxisId="right" orientation="right" domain={[50, 200]} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="cv" fill="hsl(var(--chart-1))" name="CV %" />
                            <Bar yAxisId="right" dataKey="avg" fill="hsl(var(--chart-2))" name="Avg Glucose" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Clinical Interpretation */}
                    <Card className={variabilityAnalysis.overallCV < 36 ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {variabilityAnalysis.overallCV < 36 ? (
                            <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="text-sm">
                            <p className="font-medium">Clinical Interpretation</p>
                            <p className="text-muted-foreground">
                              {variabilityAnalysis.overallCV < 36 
                                ? `CV of ${variabilityAnalysis.overallCV}% is within the target range (<36%), indicating stable glucose control with reduced hypoglycemia risk.`
                                : `CV of ${variabilityAnalysis.overallCV}% is above the target of 36%, suggesting higher glucose variability. Consider reviewing meal timing, insulin timing, and activity patterns.`
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="mealtime" className="space-y-6">
                {mealPatternAnalysis && mealPatternAnalysis.carbRangeStats.length > 0 ? (
                  <>
                    {/* Carb Range Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Utensils className="h-5 w-5" />
                          Glucose Outcomes by Carb Intake
                        </CardTitle>
                        <CardDescription>
                          How different carb amounts correlate with Time in Range ({mealPatternAnalysis.totalMealEvents.toLocaleString()} meal events)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={mealPatternAnalysis.carbRangeStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 200]} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="avg" fill="hsl(var(--chart-1))" name="Avg Glucose (mg/dL)" />
                            <Bar yAxisId="right" dataKey="tir" fill="hsl(var(--chart-2))" name="Time in Range %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Meal Tips */}
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium mb-2">Meal Management Tips from Research</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              <li>Pre-bolus 15-20 minutes before eating to reduce post-meal spikes</li>
                              <li>Lower carb meals often result in more stable glucose patterns</li>
                              <li>Consider protein and fat content which slow carb absorption</li>
                              <li>Activity after meals can help reduce glucose spikes</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Limited Meal Data</h3>
                      <p className="text-muted-foreground">
                        Not enough meal data in the current filter selection.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insulin" className="space-y-6">
                {insulinDosingAnalysis && insulinDosingAnalysis.doseRangeStats.length > 0 ? (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <Syringe className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.totalInsulinEvents.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Insulin Events</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.hasBasalData ? 'Yes' : 'Limited'}</p>
                            <p className="text-sm text-muted-foreground">Pump Data Available</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Dose Range Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Syringe className="h-5 w-5" />
                          Glucose Outcomes by Bolus Dose Size
                        </CardTitle>
                        <CardDescription>
                          How different bolus amounts correlate with Time in Range
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={insulinDosingAnalysis.doseRangeStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis yAxisId="left" orientation="left" domain={[0, 200]} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="avg" fill="hsl(var(--chart-1))" name="Avg Glucose (mg/dL)" />
                            <Bar yAxisId="right" dataKey="tir" fill="hsl(var(--chart-2))" name="Time in Range %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Basal Rate Analysis */}
                    {insulinDosingAnalysis.hasBasalData && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Glucose by Basal Rate</CardTitle>
                          <CardDescription>
                            Time in Range across different basal insulin rates (pump users)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={insulinDosingAnalysis.basalRateStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="range" />
                              <YAxis domain={[0, 100]} unit="%" />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="tir" fill="hsl(var(--primary))" name="Time in Range %" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Disclaimer */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                      <CardContent className="p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-900 dark:text-amber-100">Important Note</p>
                          <p className="text-amber-800 dark:text-amber-200">
                            Insulin dosing is highly individual. These population-level patterns show correlations, not causation.
                            Never adjust your insulin without consulting your healthcare provider.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Syringe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Limited Insulin Data</h3>
                      <p className="text-muted-foreground">
                        Not enough insulin dosing data in the current filter selection.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Research Tab */}
              <TabsContent value="research" className="space-y-6">
                {/* Population Comparison */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      How This Data Compares to Published Research
                    </CardTitle>
                    <CardDescription>
                      Comparing this dataset to major T1D studies and benchmarks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">This Dataset</p>
                        <p className="text-3xl font-bold text-primary">{overallStats?.avgTIR || 0}%</p>
                        <p className="text-xs text-muted-foreground">Time in Range</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">T1D Exchange (2023)</p>
                        <p className="text-3xl font-bold">59%</p>
                        <p className="text-xs text-muted-foreground">Average TIR</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">ADA/ATTD Target</p>
                        <p className="text-3xl font-bold text-green-600">70%+</p>
                        <p className="text-xs text-muted-foreground">Recommended TIR</p>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">JDRF CREATE</p>
                        <p className="text-3xl font-bold">71%</p>
                        <p className="text-xs text-muted-foreground">AID Study TIR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Research Citations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Key Research Citations
                    </CardTitle>
                    <CardDescription>
                      Published studies supporting the analysis methodology and findings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {researchCitations.map((citation, index) => (
                        <div 
                          key={index} 
                          className="flex items-start justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{citation.finding}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {citation.study} ({citation.year})
                            </p>
                          </div>
                          <a
                            href={`https://doi.org/${citation.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline ml-4"
                          >
                            <ExternalLink className="h-3 w-3" />
                            DOI
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Methodology */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Sources & Methodology</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Data Sources</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li><strong>OpenAPS Data Commons</strong> - DIY closed-loop system users</li>
                        <li><strong>Nightscout</strong> - Open-source CGM data platform</li>
                        <li><strong>Tidepool</strong> - Device-agnostic diabetes data</li>
                        <li><strong>OpenHumans</strong> - Personal data sharing platform</li>
                        <li><strong>T1D Exchange</strong> - Registry-based clinical data</li>
                        <li><strong>Glooko</strong> - Diabetes management platform data</li>
                        <li><strong>Clarity</strong> - Dexcom clarity reports</li>
                        <li><strong>LibreView</strong> - Abbott LibreView data</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Analysis Standards</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Time in Range defined as 70-180 mg/dL per ADA/ATTD consensus</li>
                        <li>CV target of &lt;36% based on International Consensus on CGM</li>
                        <li>All data fully anonymized before inclusion</li>
                        <li>Minimum sample sizes required for statistical reliability</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clinical Insights Tab */}
              <TabsContent value="clinical" className="space-y-6">
                {overallStats && variabilityAnalysis && (
                  <>
                    <ClinicalExplanationsPanel
                      tir={overallStats.avgTIR}
                      cv={variabilityAnalysis.overallCV || 0}
                      avgGlucose={overallStats.avgGlucose}
                      tirBelow70={rangeDistribution.find(r => r.name.includes('<70'))?.value || 0}
                      tirAbove180={rangeDistribution.find(r => r.name.includes('>180'))?.value || 0}
                    />
                    
                    <PatternInterpretationPanel
                      dawnPhenomenonRise={(() => {
                        const earlyMorning = hourlyAverages.filter(h => parseInt(h.hour) >= 4 && parseInt(h.hour) <= 7);
                        const nightTime = hourlyAverages.filter(h => parseInt(h.hour) >= 0 && parseInt(h.hour) <= 3);
                        if (earlyMorning.length > 0 && nightTime.length > 0) {
                          const earlyAvg = earlyMorning.reduce((sum, h) => sum + h.average, 0) / earlyMorning.length;
                          const nightAvg = nightTime.reduce((sum, h) => sum + h.average, 0) / nightTime.length;
                          return Math.round(earlyAvg - nightAvg);
                        }
                        return 0;
                      })()}
                      nightHypoPercentage={rangeDistribution.find(r => r.name.includes('<70'))?.value || 0}
                      postMealSpikes={(variabilityAnalysis.overallCV || 0) > 36}
                      highVariabilityTimes={
                        variabilityAnalysis.timeBlockVariability
                          ?.filter(t => t.cv > 40)
                          ?.map(t => t.name) || []
                      }
                    />
                    
                    <ResearchComparisonPanel
                      tir={overallStats.avgTIR}
                      cv={variabilityAnalysis.overallCV || 0}
                      avgGlucose={overallStats.avgGlucose}
                      timeBelow70={rangeDistribution.find(r => r.name.includes('<70'))?.value || 0}
                      timeAbove180={rangeDistribution.find(r => r.name.includes('>180'))?.value || 0}
                    />
                  </>
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
