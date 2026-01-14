import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<DeviceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch devices with their metrics and issues
        const { data: devices, error: devicesError } = await supabase
          .from('devices')
          .select(`
            *,
            device_metrics (
              id,
              device_id,
              reliability_score,
              social_setting_score,
              total_reviews,
              last_updated
            ),
            device_issues (
              id,
              device_id,
              issue_title,
              description,
              severity,
              frequency_percentage,
              solution,
              workaround,
              community_reports
            )
          `)
          .order('name');

        if (devicesError) throw devicesError;

        // Process the data
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

        // Calculate analytics
        const totalDevices = processedDevices.length;
        const avgReliabilityScore = processedDevices.reduce((sum, device) => 
          sum + (device.metrics?.reliability_score || 0), 0
        ) / totalDevices;

        // Find most reported issue
        const allIssues = processedDevices.flatMap(device => device.issues || []);
        const mostReportedIssue = allIssues.reduce((max, issue) => 
          issue.community_reports > (max?.community_reports || 0) ? issue : max,
          allIssues[0]
        )?.issue_title || 'No issues reported';

        setData({
          devices: processedDevices,
          totalDevices,
          avgReliabilityScore: Math.round(avgReliabilityScore),
          mostReportedIssue,
        });
      } catch (err) {
        console.error('Error fetching device analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch device data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceAnalytics();
  }, []);

  const refreshCommunityFeed = async () => {
    try {
      console.log('Triggering community feed refresh...');
      const { data, error } = await supabase.functions.invoke('community-feed');
      
      if (error) {
        console.error('Error refreshing community feed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Community feed refresh result:', data);
      return { success: true, data };
    } catch (err) {
      console.error('Error calling community feed function:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refreshCommunityFeed,
    refetch: () => window.location.reload() 
  };
};