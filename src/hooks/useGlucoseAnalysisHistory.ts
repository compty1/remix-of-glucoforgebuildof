import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface AnalysisEntry {
  id: string;
  filename: string;
  status: string;
  readings_count: number;
  insights: string[];
  detailed_analysis: {
    avgGlucose?: number;
    timeInRange?: number;
    gmi?: number;
    cv?: number;
    mage?: number;
    daysOfData?: number;
  } | null;
  patterns: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
  }>;
  created_at: string;
}

interface HistoryStats {
  totalUploads: number;
  avgTimeInRange: number;
  avgGlucose: number;
  totalReadings: number;
  improvementTrend: 'improving' | 'stable' | 'declining' | 'unknown';
  mostCommonPattern: string | null;
}

function computeStats(entries: AnalysisEntry[]): HistoryStats | null {
  if (entries.length === 0) return null;
  const validEntries = entries.filter(e => e.detailed_analysis);

  const avgTimeInRange = validEntries.length > 0
    ? validEntries.reduce((sum, e) => sum + (e.detailed_analysis?.timeInRange || 0), 0) / validEntries.length
    : 0;
  const avgGlucose = validEntries.length > 0
    ? validEntries.reduce((sum, e) => sum + (e.detailed_analysis?.avgGlucose || 0), 0) / validEntries.length
    : 0;
  const totalReadings = entries.reduce((sum, e) => sum + e.readings_count, 0);

  let improvementTrend: HistoryStats['improvementTrend'] = 'unknown';
  if (validEntries.length >= 2) {
    const half = Math.ceil(validEntries.length / 2);
    const recentAvg = validEntries.slice(0, half).reduce((s, e) => s + (e.detailed_analysis?.timeInRange || 0), 0) / half;
    const olderAvg = validEntries.slice(half).reduce((s, e) => s + (e.detailed_analysis?.timeInRange || 0), 0) / (validEntries.length - half);
    if (recentAvg > olderAvg + 3) improvementTrend = 'improving';
    else if (recentAvg < olderAvg - 3) improvementTrend = 'declining';
    else improvementTrend = 'stable';
  }

  const patternCounts: Record<string, number> = {};
  entries.forEach(e => e.patterns.forEach(p => { patternCounts[p.type] = (patternCounts[p.type] || 0) + 1; }));
  const mostCommonPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalUploads: entries.length,
    avgTimeInRange: Math.round(avgTimeInRange * 10) / 10,
    avgGlucose: Math.round(avgGlucose),
    totalReadings,
    improvementTrend,
    mostCommonPattern,
  };
}

export const useGlucoseAnalysisHistory = () => {
  const { user } = useAuthStore();

  const { data: history = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['glucose-analysis-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uploads')
        .select('id, file_name, status, readings_count, insights, detailed_analysis, patterns, uploaded_at')
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        filename: item.file_name,
        status: item.status,
        readings_count: item.readings_count || 0,
        insights: Array.isArray(item.insights) ? item.insights as string[] : [],
        detailed_analysis: item.detailed_analysis as AnalysisEntry['detailed_analysis'],
        patterns: Array.isArray(item.patterns) ? item.patterns as AnalysisEntry['patterns'] : [],
        created_at: item.uploaded_at,
      })) as AnalysisEntry[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const stats = useMemo(() => computeStats(history), [history]);

  const getAutoDetectedPatterns = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .contains('tags', ['auto-detected'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  };

  return {
    history,
    stats,
    loading,
    error: queryError ? String(queryError) : null,
    refresh: refetch,
    getAutoDetectedPatterns,
  };
};
