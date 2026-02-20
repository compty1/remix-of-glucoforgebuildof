import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 10 * 60 * 1000; // 10 minutes
let lastFetchedAt: number | null = null;
let cachedAnalytics: DeviceAnalyticsData | null = null;

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
  const [data, setData] = useState<DeviceAnalyticsData | null>(cachedAnalytics);
  const [loading, setLoading] = useState(cachedAnalytics === null);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceData = async () => {
    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < STALE_TIME_MS && cachedAnalytics !== null) {
      setData(cachedAnalytics);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const { data: devices, error: devicesError } = await supabase
        .from('devices')
        .select(`
          *,
          device_metrics (id, device_id, reliability_score, social_setting_score, total_reviews, last_updated),
          device_issues (id, device_id, issue_title, description, severity, frequency_percentage, solution, workaround, community_reports)
        `)
        .order('name');

      if (devicesError) throw devicesError;

      const processedDevices: Device[] = (devices || []).map(device => ({
        ...device,
        key_features: device.key_features || [],
        pros: device.pros || [],
        cons: device.cons || [],
        metrics: device.device_metrics?.[0] || null,
        issues: (device.device_issues || []).map(issue => ({
          ...issue,
          severity: issue.severity as 'Low' | 'Medium' | 'High' | 'Critical'
        })),
      }));

      const totalDevices = processedDevices.length;
      const avgReliabilityScore = totalDevices > 0
        ? processedDevices.reduce((sum, device) => sum + (device.metrics?.reliability_score || 0), 0) / totalDevices
        : 0;

      const allIssues = processedDevices.flatMap(device => device.issues || []);
      const mostReportedIssue = allIssues.reduce((max, issue) =>
        issue.community_reports > (max?.community_reports || 0) ? issue : max,
        allIssues[0]
      )?.issue_title || 'No issues reported';

      const result = {
        devices: processedDevices,
        totalDevices,
        avgReliabilityScore: Math.round(avgReliabilityScore),
        mostReportedIssue,
      };

      cachedAnalytics = result;
      lastFetchedAt = Date.now();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch device data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const refreshCommunityFeed = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke('community-feed');
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      cachedAnalytics = null; // invalidate cache
      await fetchDeviceData();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refreshCommunityFeed,
    refetch: fetchDeviceData 
  };
};
