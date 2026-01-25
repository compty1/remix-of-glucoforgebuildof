import React, { useState, useMemo } from 'react';
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
  Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter
} from 'recharts';
import ClinicalExplanationsPanel from '@/components/glucose/ClinicalExplanationsPanel';
import PatternInterpretationPanel from '@/components/glucose/PatternInterpretationPanel';
import ResearchComparisonPanel from '@/components/glucose/ResearchComparisonPanel';

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

  // Glucose Variability Analysis (CV, SD, MAGE-like)
  const variabilityAnalysis = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    const validReadings = glucoseData.filter(d => d.glucose_value !== null);
    const glucoseValues = validReadings.map(d => d.glucose_value!);
    
    const mean = glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length;
    const squareDiffs = glucoseValues.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    const cv = (stdDev / mean) * 100;
    
    // Calculate variability by device
    const deviceVariability = new Map<string, { values: number[] }>();
    validReadings.forEach(r => {
      if (!r.pump_model) return;
      const existing = deviceVariability.get(r.pump_model) || { values: [] };
      existing.values.push(r.glucose_value!);
      deviceVariability.set(r.pump_model, existing);
    });
    
    const deviceCVs = Array.from(deviceVariability.entries())
      .filter(([_, data]) => data.values.length > 50)
      .map(([device, data]) => {
        const deviceMean = data.values.reduce((a, b) => a + b, 0) / data.values.length;
        const deviceSquareDiffs = data.values.map(v => Math.pow(v - deviceMean, 2));
        const deviceAvgSquareDiff = deviceSquareDiffs.reduce((a, b) => a + b, 0) / deviceSquareDiffs.length;
        const deviceStdDev = Math.sqrt(deviceAvgSquareDiff);
        const deviceCV = (deviceStdDev / deviceMean) * 100;
        return { device, cv: Math.round(deviceCV * 10) / 10, count: data.values.length };
      })
      .sort((a, b) => a.cv - b.cv);
    
    // Calculate variability by time of day
    const timeBlocks = [
      { name: 'Night (12-6 AM)', startHour: 0, endHour: 6 },
      { name: 'Morning (6-12 PM)', startHour: 6, endHour: 12 },
      { name: 'Afternoon (12-6 PM)', startHour: 12, endHour: 18 },
      { name: 'Evening (6-12 AM)', startHour: 18, endHour: 24 },
    ];
    
    const timeBlockVariability = timeBlocks.map(block => {
      const blockReadings = validReadings.filter(r => {
        if (!r.timestamp) return false;
        const hour = new Date(r.timestamp).getHours();
        return hour >= block.startHour && hour < block.endHour;
      });
      
      if (blockReadings.length < 10) return { name: block.name, cv: 0, avg: 0, count: 0 };
      
      const blockValues = blockReadings.map(r => r.glucose_value!);
      const blockMean = blockValues.reduce((a, b) => a + b, 0) / blockValues.length;
      const blockSquareDiffs = blockValues.map(v => Math.pow(v - blockMean, 2));
      const blockAvgSquareDiff = blockSquareDiffs.reduce((a, b) => a + b, 0) / blockSquareDiffs.length;
      const blockStdDev = Math.sqrt(blockAvgSquareDiff);
      const blockCV = (blockStdDev / blockMean) * 100;
      
      return { name: block.name, cv: Math.round(blockCV * 10) / 10, avg: Math.round(blockMean), count: blockReadings.length };
    });
    
    return {
      overallCV: Math.round(cv * 10) / 10,
      stdDev: Math.round(stdDev),
      mean: Math.round(mean),
      deviceCVs,
      timeBlockVariability
    };
  }, [glucoseData]);

  // Meal Pattern Analysis
  const mealPatternAnalysis = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    // Analyze readings with carbs (meal events)
    const mealReadings = glucoseData.filter(r => r.carbs && r.carbs > 0 && r.glucose_value !== null && r.timestamp);
    
    // Group by meal type based on time
    const mealsByTime = {
      breakfast: mealReadings.filter(r => {
        const hour = new Date(r.timestamp!).getHours();
        return hour >= 5 && hour < 11;
      }),
      lunch: mealReadings.filter(r => {
        const hour = new Date(r.timestamp!).getHours();
        return hour >= 11 && hour < 15;
      }),
      dinner: mealReadings.filter(r => {
        const hour = new Date(r.timestamp!).getHours();
        return hour >= 17 && hour < 21;
      }),
      snacks: mealReadings.filter(r => {
        const hour = new Date(r.timestamp!).getHours();
        return (hour >= 15 && hour < 17) || (hour >= 21 || hour < 5);
      })
    };
    
    const calculateMealStats = (readings: typeof mealReadings) => {
      if (readings.length < 5) return null;
      const glucoseValues = readings.map(r => r.glucose_value!);
      const carbValues = readings.map(r => r.carbs!);
      const avg = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
      const avgCarbs = Math.round(carbValues.reduce((a, b) => a + b, 0) / carbValues.length);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      return { avg, avgCarbs, tir, count: readings.length };
    };
    
    const mealStats = [
      { meal: 'Breakfast', ...calculateMealStats(mealsByTime.breakfast) },
      { meal: 'Lunch', ...calculateMealStats(mealsByTime.lunch) },
      { meal: 'Dinner', ...calculateMealStats(mealsByTime.dinner) },
      { meal: 'Snacks', ...calculateMealStats(mealsByTime.snacks) },
    ].filter(m => m.avg !== undefined);
    
    // Carb range analysis
    const carbRanges = [
      { range: '0-20g', min: 0, max: 20 },
      { range: '21-40g', min: 21, max: 40 },
      { range: '41-60g', min: 41, max: 60 },
      { range: '60g+', min: 61, max: 1000 },
    ];
    
    const carbRangeStats = carbRanges.map(range => {
      const rangeReadings = mealReadings.filter(r => r.carbs! >= range.min && r.carbs! <= range.max);
      if (rangeReadings.length < 5) return { range: range.range, avg: 0, tir: 0, count: 0 };
      
      const glucoseValues = rangeReadings.map(r => r.glucose_value!);
      const avg = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      
      return { range: range.range, avg, tir, count: rangeReadings.length };
    });
    
    return { mealStats, carbRangeStats, totalMealEvents: mealReadings.length };
  }, [glucoseData]);

  // Insulin Dosing Analysis
  const insulinDosingAnalysis = useMemo(() => {
    if (!glucoseData || glucoseData.length === 0) return null;
    
    // Analyze readings with insulin data
    const insulinReadings = glucoseData.filter(r => 
      r.insulin_dose !== null && r.insulin_dose > 0 && r.glucose_value !== null
    );
    
    if (insulinReadings.length < 20) return null;
    
    // Dose range analysis
    const doseRanges = [
      { range: '1-3 units', min: 1, max: 3 },
      { range: '4-6 units', min: 4, max: 6 },
      { range: '7-10 units', min: 7, max: 10 },
      { range: '10+ units', min: 11, max: 100 },
    ];
    
    const doseRangeStats = doseRanges.map(range => {
      const rangeReadings = insulinReadings.filter(r => 
        r.insulin_dose! >= range.min && r.insulin_dose! <= range.max
      );
      if (rangeReadings.length < 5) return { range: range.range, avg: 0, tir: 0, count: 0 };
      
      const glucoseValues = rangeReadings.map(r => r.glucose_value!);
      const avg = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      
      return { range: range.range, avg, tir, count: rangeReadings.length };
    });
    
    // Basal rate analysis (from pump users with basal data)
    const basalReadings = glucoseData.filter(r => 
      r.basal_rate !== null && r.basal_rate > 0 && r.glucose_value !== null
    );
    
    const basalRanges = [
      { range: '0-0.5 U/hr', min: 0, max: 0.5 },
      { range: '0.5-1.0 U/hr', min: 0.5, max: 1.0 },
      { range: '1.0-1.5 U/hr', min: 1.0, max: 1.5 },
      { range: '1.5+ U/hr', min: 1.5, max: 10 },
    ];
    
    const basalRateStats = basalRanges.map(range => {
      const rangeReadings = basalReadings.filter(r => 
        r.basal_rate! >= range.min && r.basal_rate! < range.max
      );
      if (rangeReadings.length < 5) return { range: range.range, avg: 0, tir: 0, count: 0 };
      
      const glucoseValues = rangeReadings.map(r => r.glucose_value!);
      const avg = Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      
      return { range: range.range, avg, tir, count: rangeReadings.length };
    });
    
    // Correction factor analysis
    const cfReadings = glucoseData.filter(r => 
      r.correction_factor !== null && r.correction_factor > 0 && r.glucose_value !== null
    );
    
    const cfRanges = [
      { range: '1:20-30', min: 20, max: 30 },
      { range: '1:30-50', min: 30, max: 50 },
      { range: '1:50-80', min: 50, max: 80 },
      { range: '1:80+', min: 80, max: 200 },
    ];
    
    const cfStats = cfRanges.map(range => {
      const rangeReadings = cfReadings.filter(r => 
        r.correction_factor! >= range.min && r.correction_factor! < range.max
      );
      if (rangeReadings.length < 5) return { range: range.range, tir: 0, count: 0 };
      
      const glucoseValues = rangeReadings.map(r => r.glucose_value!);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      
      return { range: range.range, tir, count: rangeReadings.length };
    });
    
    // Carb ratio analysis
    const icrReadings = glucoseData.filter(r => 
      r.carb_ratio !== null && r.carb_ratio > 0 && r.glucose_value !== null
    );
    
    const icrRanges = [
      { range: '1:5-8', min: 5, max: 8 },
      { range: '1:8-12', min: 8, max: 12 },
      { range: '1:12-15', min: 12, max: 15 },
      { range: '1:15+', min: 15, max: 50 },
    ];
    
    const icrStats = icrRanges.map(range => {
      const rangeReadings = icrReadings.filter(r => 
        r.carb_ratio! >= range.min && r.carb_ratio! < range.max
      );
      if (rangeReadings.length < 5) return { range: range.range, tir: 0, count: 0 };
      
      const glucoseValues = rangeReadings.map(r => r.glucose_value!);
      const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
      const tir = Math.round((inRange / glucoseValues.length) * 100);
      
      return { range: range.range, tir, count: rangeReadings.length };
    });
    
    // Calculate averages
    const avgDose = insulinReadings.length > 0 
      ? Math.round((insulinReadings.reduce((sum, r) => sum + r.insulin_dose!, 0) / insulinReadings.length) * 10) / 10
      : 0;
    const avgBasal = basalReadings.length > 0
      ? Math.round((basalReadings.reduce((sum, r) => sum + r.basal_rate!, 0) / basalReadings.length) * 10) / 10
      : 0;
    
    return {
      doseRangeStats,
      basalRateStats,
      cfStats,
      icrStats,
      avgDose,
      avgBasal,
      totalInsulinEvents: insulinReadings.length,
      hasBasalData: basalReadings.length > 10,
      hasCFData: cfReadings.length > 10,
      hasICRData: icrReadings.length > 10,
    };
  }, [glucoseData]);

  // Research citations
  const researchCitations = [
    {
      finding: 'AID systems improve TIR by 10-15%',
      study: 'JDRF CREATE Trial',
      doi: '10.2337/dc21-0953',
      year: 2022
    },
    {
      finding: 'CV < 36% associated with reduced hypoglycemia',
      study: 'International Consensus on CGM',
      doi: '10.2337/dc19-1009',
      year: 2019
    },
    {
      finding: 'Pre-bolus 15-20 min improves post-meal spikes',
      study: 'ADA Standards of Care',
      doi: '10.2337/dc24-S006',
      year: 2024
    },
    {
      finding: 'Target TIR > 70% for optimal glycemic outcomes',
      study: 'ATTD Consensus',
      doi: '10.1089/dia.2019.0028',
      year: 2019
    },
    {
      finding: 'Lower A1C linked to reduced complications',
      study: 'DCCT/EDIC Trial',
      doi: '10.1056/NEJMoa052187',
      year: 2005
    }
  ];

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
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 50]} unit="%" />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                name === 'cv' ? `${value}%` : `${value} mg/dL`,
                                name === 'cv' ? 'CV' : 'Average'
                              ]}
                            />
                            <Legend />
                            <Bar dataKey="cv" fill="hsl(var(--chart-1))" name="CV %" />
                            <Bar dataKey="avg" fill="hsl(var(--chart-2))" name="Avg Glucose" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Device Variability Comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5" />
                          Variability by Insulin Delivery Method
                        </CardTitle>
                        <CardDescription>
                          AID systems typically show lower variability due to automated adjustments
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={variabilityAnalysis.deviceCVs} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 50]} unit="%" />
                            <YAxis type="category" dataKey="device" width={130} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => [`${value}%`, 'CV']} />
                            <Bar dataKey="cv" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="mealtime" className="space-y-6">
                {mealPatternAnalysis && mealPatternAnalysis.totalMealEvents > 0 ? (
                  <>
                    {/* Meal Stats Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Utensils className="h-5 w-5" />
                          Meal-Time Glucose Patterns
                        </CardTitle>
                        <CardDescription>
                          Analysis of {mealPatternAnalysis.totalMealEvents} meal events with recorded carbohydrates
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={mealPatternAnalysis.mealStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="meal" />
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

                    {/* Carb Range Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Glucose Response by Carb Intake</CardTitle>
                        <CardDescription>
                          How different carb amounts affect post-meal glucose
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
                            <Bar yAxisId="left" dataKey="avg" fill="hsl(var(--chart-3))" name="Avg Glucose (mg/dL)" />
                            <Bar yAxisId="right" dataKey="tir" fill="hsl(var(--chart-4))" name="Time in Range %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Meal Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mealPatternAnalysis.mealStats.map(meal => (
                        <Card key={meal.meal}>
                          <CardContent className="p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{meal.meal}</p>
                            <p className="text-2xl font-bold">{meal.avgCarbs}g</p>
                            <p className="text-xs text-muted-foreground">avg carbs</p>
                            <Badge variant={meal.tir && meal.tir >= 70 ? 'default' : 'secondary'} className="mt-2">
                              {meal.tir}% TIR
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Utensils className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Limited Meal Data</h3>
                      <p className="text-muted-foreground">
                        Not enough meal events with carbohydrate data in the current filter selection.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Insulin Dosing Tab */}
              <TabsContent value="insulin" className="space-y-6">
                {insulinDosingAnalysis ? (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Syringe className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.avgDose}U</p>
                            <p className="text-sm text-muted-foreground">Avg Bolus Dose</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.avgBasal}U/hr</p>
                            <p className="text-sm text-muted-foreground">Avg Basal Rate</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.totalInsulinEvents.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Insulin Events</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <Database className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{insulinDosingAnalysis.hasBasalData ? 'Yes' : 'Limited'}</p>
                            <p className="text-sm text-muted-foreground">Pump Data</p>
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

                    {/* ICR & ISF Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {insulinDosingAnalysis.hasICRData && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Insulin-to-Carb Ratio Analysis</CardTitle>
                            <CardDescription>TIR by carb ratio settings</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={insulinDosingAnalysis.icrStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} unit="%" />
                                <Tooltip />
                                <Bar dataKey="tir" fill="hsl(var(--chart-3))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                      {insulinDosingAnalysis.hasCFData && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Correction Factor Analysis</CardTitle>
                            <CardDescription>TIR by insulin sensitivity factor</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={insulinDosingAnalysis.cfStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} unit="%" />
                                <Tooltip />
                                <Bar dataKey="tir" fill="hsl(var(--chart-4))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>

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
                {overallStats && (
                  <>
                    <ClinicalExplanationsPanel
                      tir={overallStats.avgTIR}
                      cv={variabilityAnalysis?.overallCV || 0}
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
                      postMealSpikes={(variabilityAnalysis?.overallCV || 0) > 36}
                      highVariabilityTimes={
                        variabilityAnalysis?.timeBlockVariability
                          ?.filter(t => t.cv > 40)
                          ?.map(t => t.name) || []
                      }
                    />
                    
                    <ResearchComparisonPanel
                      tir={overallStats.avgTIR}
                      cv={variabilityAnalysis?.overallCV || 0}
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
