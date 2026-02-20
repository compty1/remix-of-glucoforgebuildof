import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface UserMetrics {
  avgGlucose: number;
  timeInRange: number;
  timeBelowRange: number;
  timeAboveRange: number;
  cv: number;
  gmi: number;
  stdDev: number;
  timeBlocks?: Array<{ name: string; avg: number; cv: number; tir: number }>;
}

interface BenchmarkMetrics {
  count: number;
  avg_glucose: number;
  tir: number;
  time_below_70: number;
  time_below_54: number;
  time_above_180: number;
  time_above_250: number;
  cv: number;
  gmi: number;
  std_dev: number;
}

interface TimeBlock {
  name: string;
  avg: number;
  cv: number;
  tir: number;
}

interface DeviceInfo {
  name: string;
  count: number;
  tir: number;
}

interface AgeInfo {
  name: string;
  users: number;
  avg_glucose: number;
  tir: number;
}

interface DistributionBucket {
  tir_bucket: string;
  user_count: number;
}

export interface HighPerformerBenchmarks {
  highPerformers: BenchmarkMetrics;
  timeOfDay: TimeBlock[];
  topPumps: DeviceInfo[];
  topCGMs: DeviceInfo[];
  ageBreakdown: AgeInfo[];
  populationDistribution: DistributionBucket[];
}

export interface ComparisonMetric {
  label: string;
  userValue: number;
  benchmarkValue: number;
  delta: number;
  unit: string;
  betterWhen: 'higher' | 'lower';
  isUserBetter: boolean;
  category: string;
}

export interface ComparisonResult {
  metrics: ComparisonMetric[];
  radarData: Array<{ metric: string; user: number; topPerformers: number; fullMark: number }>;
  strengths: string[];
  improvements: string[];
  percentile: number;
  userMetrics: UserMetrics | null;
  benchmarks: HighPerformerBenchmarks | null;
  timeOfDayComparison: Array<{ name: string; userTIR: number; benchTIR: number; userAvg: number; benchAvg: number }>;
}

function computePercentile(userTIR: number, distribution: DistributionBucket[]): number {
  if (!distribution || distribution.length === 0) return 50;
  const total = distribution.reduce((sum, d) => sum + d.user_count, 0);
  let below = 0;
  const bucketMidpoints: Record<string, number> = {
    'Below 30%': 15, '30-50%': 40, '50-60%': 55, '60-70%': 65,
    '70-80%': 75, '80-90%': 85, '90-100%': 95,
  };
  for (const bucket of distribution) {
    const mid = bucketMidpoints[bucket.tir_bucket] || 50;
    if (userTIR > mid) {
      below += bucket.user_count;
    } else if (userTIR >= mid - 5) {
      below += bucket.user_count / 2;
    }
  }
  return Math.round((below / total) * 100);
}

export function useGlucoseComparison() {
  const { user } = useAuthStore();

  const { data: userMetrics, isLoading: userLoading } = useQuery({
    queryKey: ['user-latest-analysis', user?.id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('uploads')
        .select('detailed_analysis')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('uploaded_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return null;
      const analysis = data[0].detailed_analysis as any;
      if (!analysis) return null;
      const metrics = analysis.metrics || analysis.rawMetrics || analysis;
      return {
        avgGlucose: metrics.avgGlucose || metrics.averageGlucose || metrics.mean || 0,
        timeInRange: metrics.timeInRange || metrics.tir || 0,
        timeBelowRange: metrics.timeBelowRange || metrics.timeBelow70 || 0,
        timeAboveRange: metrics.timeAboveRange || metrics.timeAbove180 || 0,
        cv: metrics.cv || metrics.coefficientOfVariation || 0,
        gmi: metrics.gmi || metrics.glucoseManagementIndicator || 0,
        stdDev: metrics.stdDev || metrics.standardDeviation || 0,
        timeBlocks: analysis.timeBlocks || [],
      } as UserMetrics;
    },
    enabled: !!user,
  });

  const { data: benchmarks, isLoading: benchLoading } = useQuery({
    queryKey: ['high-performer-benchmarks'],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_high_performer_benchmarks');
      if (error) throw error;
      return data as unknown as HighPerformerBenchmarks;
    },
  });

  const comparison: ComparisonResult | null = userMetrics && benchmarks ? (() => {
    const hp = benchmarks.highPerformers;

    const metricsArr: ComparisonMetric[] = [
      {
        label: 'Time in Range',
        userValue: userMetrics.timeInRange,
        benchmarkValue: hp.tir,
        delta: +(userMetrics.timeInRange - hp.tir).toFixed(1),
        unit: '%',
        betterWhen: 'higher',
        isUserBetter: userMetrics.timeInRange >= hp.tir,
        category: 'Core',
      },
      {
        label: 'Average Glucose',
        userValue: userMetrics.avgGlucose,
        benchmarkValue: hp.avg_glucose,
        delta: +(userMetrics.avgGlucose - hp.avg_glucose).toFixed(1),
        unit: 'mg/dL',
        betterWhen: 'lower',
        isUserBetter: userMetrics.avgGlucose <= hp.avg_glucose,
        category: 'Core',
      },
      {
        label: 'CV (Variability)',
        userValue: userMetrics.cv,
        benchmarkValue: hp.cv,
        delta: +(userMetrics.cv - hp.cv).toFixed(1),
        unit: '%',
        betterWhen: 'lower',
        isUserBetter: userMetrics.cv <= hp.cv,
        category: 'Core',
      },
      {
        label: 'GMI',
        userValue: userMetrics.gmi,
        benchmarkValue: hp.gmi,
        delta: +(userMetrics.gmi - hp.gmi).toFixed(1),
        unit: '%',
        betterWhen: 'lower',
        isUserBetter: userMetrics.gmi <= hp.gmi,
        category: 'Core',
      },
      {
        label: 'Time Below Range',
        userValue: userMetrics.timeBelowRange,
        benchmarkValue: hp.time_below_70,
        delta: +(userMetrics.timeBelowRange - hp.time_below_70).toFixed(1),
        unit: '%',
        betterWhen: 'lower',
        isUserBetter: userMetrics.timeBelowRange <= hp.time_below_70,
        category: 'Safety',
      },
      {
        label: 'Time Above Range',
        userValue: userMetrics.timeAboveRange,
        benchmarkValue: hp.time_above_180,
        delta: +(userMetrics.timeAboveRange - hp.time_above_180).toFixed(1),
        unit: '%',
        betterWhen: 'lower',
        isUserBetter: userMetrics.timeAboveRange <= hp.time_above_180,
        category: 'Safety',
      },
    ];

    // Radar chart data (normalized to 0-100 scale)
    const radarData = [
      { metric: 'TIR', user: userMetrics.timeInRange, topPerformers: hp.tir, fullMark: 100 },
      { metric: 'Low CV', user: Math.max(0, 100 - userMetrics.cv * 2), topPerformers: Math.max(0, 100 - hp.cv * 2), fullMark: 100 },
      { metric: 'Low Hypos', user: Math.max(0, 100 - userMetrics.timeBelowRange * 10), topPerformers: Math.max(0, 100 - hp.time_below_70 * 10), fullMark: 100 },
      { metric: 'Low Highs', user: Math.max(0, 100 - userMetrics.timeAboveRange * 2), topPerformers: Math.max(0, 100 - hp.time_above_180 * 2), fullMark: 100 },
      { metric: 'Avg Glucose', user: Math.max(0, 100 - Math.abs(userMetrics.avgGlucose - 120) / 2), topPerformers: Math.max(0, 100 - Math.abs(hp.avg_glucose - 120) / 2), fullMark: 100 },
      { metric: 'GMI', user: Math.max(0, 100 - (userMetrics.gmi - 5) * 15), topPerformers: Math.max(0, 100 - (hp.gmi - 5) * 15), fullMark: 100 },
    ];

    const strengths = metricsArr.filter(m => m.isUserBetter).map(m => {
      const absDelta = Math.abs(m.delta);
      return `Your ${m.label} (${m.userValue}${m.unit}) is ${absDelta}${m.unit} better than high performers`;
    });

    const improvements = metricsArr.filter(m => !m.isUserBetter).map(m => {
      const absDelta = Math.abs(m.delta);
      return `${m.label}: ${m.userValue}${m.unit} → Target ${m.benchmarkValue}${m.unit} (${absDelta}${m.unit} gap)`;
    });

    // Time of day comparison
    const userBlocks = userMetrics.timeBlocks || [];
    const benchBlocks = benchmarks.timeOfDay || [];
    const timeOfDayComparison = ['Morning', 'Afternoon', 'Evening', 'Night'].map(name => {
      const ub = userBlocks.find(b => b.name === name);
      const bb = benchBlocks.find(b => b.name === name);
      return {
        name,
        userTIR: ub?.tir || 0,
        benchTIR: bb?.tir || 0,
        userAvg: ub?.avg || 0,
        benchAvg: bb?.avg || 0,
      };
    });

    const percentile = computePercentile(userMetrics.timeInRange, benchmarks.populationDistribution);

    return {
      metrics: metricsArr,
      radarData,
      strengths,
      improvements,
      percentile,
      userMetrics,
      benchmarks,
      timeOfDayComparison,
    };
  })() : null;

  return {
    comparison,
    isLoading: userLoading || benchLoading,
    hasUserData: !!userMetrics,
    benchmarks,
  };
}
