import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Device {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  model_number: string;
  description: string;
  key_features: string[];
  pros: string[];
  cons: string[];
  retail_price_usd: number;
  image_url: string;
  website_url: string;
  metrics?: DeviceMetrics;
  issues?: DeviceIssue[];
}

export interface DeviceMetrics {
  id: string;
  device_id: string;
  reliability_score: number;
  social_setting_score: number;
  total_reviews: number;
  last_updated: string;
}

export interface DeviceIssue {
  id: string;
  device_id: string;
  issue_title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  frequency_percentage: number;
  solution: string;
  workaround: string;
  community_reports: number;
}

export interface DeviceAnalyticsData {
  devices: Device[];
  totalDevices: number;
  avgReliabilityScore: number;
  mostReportedIssue: string;
}

export const useDeviceAnalytics = () => {
  const queryClient = useQueryClient();

  const { data, isLoading: loading, error: rawError } = useQuery({
    queryKey: ['device-analytics'],
    queryFn: async (): Promise<DeviceAnalyticsData> => {
      const { data: devices, error: devicesError } = await supabase
        .from('devices')
        .select(`
          *,
          device_metrics (id, device_id, reliability_score, social_setting_score, total_reviews, last_updated),
          device_issues (id, device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports)
        `)
        .order('name')
        .limit(200);

      if (devicesError) throw devicesError;

      const processedDevices: Device[] = (devices || []).map(device => {
        const metricsArr = device.device_metrics as DeviceMetrics[] | null;
        const issuesArr = device.device_issues as Array<Record<string, unknown>> | null;
        return {
          ...device,
          key_features: device.key_features || [],
          pros: device.pros || [],
          cons: device.cons || [],
          metrics: metricsArr && metricsArr.length > 0 ? metricsArr[0] : undefined,
          issues: (issuesArr || []).map(issue => ({
            ...issue,
            severity: issue.severity as 'Low' | 'Medium' | 'High' | 'Critical',
          })) as DeviceIssue[],
        };
      });

      const totalDevices = processedDevices.length;
      const avgReliabilityScore = totalDevices > 0
        ? Math.round(processedDevices.reduce((sum, d) => sum + (d.metrics?.reliability_score || 0), 0) / totalDevices)
        : 0;

      const allIssues = processedDevices.flatMap(d => d.issues || []);
      const mostReportedIssue = allIssues.reduce((max, issue) =>
        issue.community_reports > (max?.community_reports || 0) ? issue : max,
        allIssues[0]
      )?.issue_title || 'No issues reported';

      return { devices: processedDevices, totalDevices, avgReliabilityScore, mostReportedIssue };
    },
    staleTime: 10 * 60 * 1000,
  });

  const refreshCommunityFeed = useCallback(async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('community-feed');
      if (error) return { success: false, error: error.message };
      await queryClient.invalidateQueries({ queryKey: ['device-analytics'] });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['device-analytics'] });
  }, [queryClient]);

  return {
    data: data || null,
    loading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch device data') : null,
    refreshCommunityFeed,
    refetch,
  };
};
