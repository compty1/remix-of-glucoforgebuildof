import { useState, useEffect } from 'react';
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

export const useGlucoseAnalysisHistory = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<AnalysisEntry[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('uploads')
        .select('id, file_name, status, readings_count, insights, detailed_analysis, patterns, uploaded_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      const entries: AnalysisEntry[] = (data || []).map(item => ({
        id: item.id,
        filename: item.file_name,
        status: item.status,
        readings_count: item.readings_count || 0,
        insights: Array.isArray(item.insights) ? item.insights as string[] : [],
        detailed_analysis: item.detailed_analysis as AnalysisEntry['detailed_analysis'],
        patterns: Array.isArray(item.patterns) ? item.patterns as AnalysisEntry['patterns'] : [],
        created_at: item.uploaded_at
      }));

      setHistory(entries);
      calculateStats(entries);
    } catch (err) {
      console.error('Error fetching glucose analysis history:', err);
      setError('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: AnalysisEntry[]) => {
    if (entries.length === 0) {
      setStats(null);
      return;
    }

    const validEntries = entries.filter(e => e.detailed_analysis);
    
    // Calculate averages
    const avgTimeInRange = validEntries.length > 0
      ? validEntries.reduce((sum, e) => sum + (e.detailed_analysis?.timeInRange || 0), 0) / validEntries.length
      : 0;

    const avgGlucose = validEntries.length > 0
      ? validEntries.reduce((sum, e) => sum + (e.detailed_analysis?.avgGlucose || 0), 0) / validEntries.length
      : 0;

    const totalReadings = entries.reduce((sum, e) => sum + e.readings_count, 0);

    // Calculate trend (comparing recent vs older entries)
    let improvementTrend: HistoryStats['improvementTrend'] = 'unknown';
    if (validEntries.length >= 2) {
      const recentAvg = validEntries.slice(0, Math.ceil(validEntries.length / 2))
        .reduce((sum, e) => sum + (e.detailed_analysis?.timeInRange || 0), 0) / Math.ceil(validEntries.length / 2);
      const olderAvg = validEntries.slice(Math.ceil(validEntries.length / 2))
        .reduce((sum, e) => sum + (e.detailed_analysis?.timeInRange || 0), 0) / Math.floor(validEntries.length / 2);
      
      if (recentAvg > olderAvg + 3) {
        improvementTrend = 'improving';
      } else if (recentAvg < olderAvg - 3) {
        improvementTrend = 'declining';
      } else {
        improvementTrend = 'stable';
      }
    }

    // Find most common pattern
    const patternCounts: Record<string, number> = {};
    entries.forEach(e => {
      e.patterns.forEach(p => {
        patternCounts[p.type] = (patternCounts[p.type] || 0) + 1;
      });
    });
    const mostCommonPattern = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    setStats({
      totalUploads: entries.length,
      avgTimeInRange: Math.round(avgTimeInRange * 10) / 10,
      avgGlucose: Math.round(avgGlucose),
      totalReadings,
      improvementTrend,
      mostCommonPattern
    });
  };

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
    } catch (err) {
      console.error('Error fetching auto-detected patterns:', err);
      return [];
    }
  };

  return {
    history,
    stats,
    loading,
    error,
    refresh: fetchHistory,
    getAutoDetectedPatterns
  };
};
