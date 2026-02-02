import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeviceMetrics {
  reliability_score: number | null;
  social_setting_score: number | null;
  total_reviews: number | null;
}

export interface DeviceIssue {
  id: string;
  issue_title: string;
  description: string | null;
  severity: string | null;
  frequency_percentage: number | null;
  community_reports: number | null;
  solution: string | null;
  workaround: string | null;
  fda_maude_count?: number | null;
  fda_recall_count?: number | null;
  issue_category?: string | null;
  source_url?: string | null;
  last_fda_update?: string | null;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string | null;
  source: string;
  sentiment: string | null;
  score: number | null;
  num_comments: number | null;
  published_at: string | null;
  post_id: string;
}

export interface FDAEvent {
  id: string;
  event_type: string;
  device_name: string | null;
  manufacturer_name: string | null;
  event_description: string | null;
  event_date: string | null;
  severity_level: string | null;
  source_url: string | null;
}

export interface ManufacturerResource {
  id: string;
  manufacturer: string;
  resource_type: string;
  title: string;
  url: string | null;
  phone_number: string | null;
  description: string | null;
}

export interface Device {
  id: string;
  name: string;
  manufacturer: string | null;
  category: string | null;
  description: string | null;
  model_number: string | null;
  retail_price_usd: number | null;
  image_url: string | null;
  website_url: string | null;
  key_features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  // Extended specs - use unknown for JSON fields to allow casting
  fda_clearance_date?: string | null;
  fda_510k_number?: string | null;
  fda_pma_number?: string | null;
  regulatory_class?: string | null;
  sensor_wear_days?: number | null;
  warmup_time?: string | null;
  accuracy_mard?: string | null;
  battery_life?: string | null;
  waterproof_rating?: string | null;
  compatibility?: unknown;
  app_compatibility?: unknown;
  insurance_coverage?: string | null;
  user_manual_url?: string | null;
  support_phone?: string | null;
  support_email?: string | null;
  // New enhanced fields
  device_type?: string | null;
  price_range?: string | null;
  availability?: string | null;
  fda_status?: string | null;
  specifications?: unknown;
}

export interface DeviceDetails {
  device: Device;
  metrics: DeviceMetrics | null;
  issues: DeviceIssue[];
  communityPosts: CommunityPost[];
  fdaEvents: FDAEvent[];
  supportResources: ManufacturerResource[];
  relatedDevices: Device[];
  reviewStats: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  };
}

export const useDeviceDetails = (deviceId: string | undefined) => {
  const [data, setData] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      if (!deviceId) {
        setError('Device ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch device basic info
        const { data: deviceData, error: deviceError } = await supabase
          .from('devices')
          .select('*')
          .eq('id', deviceId)
          .maybeSingle();

        if (deviceError) throw deviceError;
        if (!deviceData) {
          setError('Device not found. The device may have been updated or removed.');
          setLoading(false);
          return;
        }

        // Fetch device metrics
        const { data: metricsData } = await supabase
          .from('device_metrics')
          .select('*')
          .eq('device_id', deviceId)
          .single();

        // Fetch device issues
        const { data: issuesData } = await supabase
          .from('device_issues')
          .select('*')
          .eq('device_id', deviceId)
          .order('community_reports', { ascending: false });

        // Fetch community posts mentioning this device
        // Search for both the full device name AND just the brand to catch more results
        const deviceNameLower = deviceData.name.toLowerCase();
        const deviceParts = deviceNameLower.split(' ');
        const brand = deviceParts[0]; // e.g., "dexcom"
        const model = deviceParts.slice(1).join(' '); // e.g., "g7"
        
        // Build search query that matches brand OR model OR full name
        let searchFilter = `device_mentioned.ilike.%${brand}%,title.ilike.%${deviceNameLower}%`;
        if (model && model.length > 1) {
          searchFilter += `,title.ilike.%${model}%,content.ilike.%${model}%`;
        }
        
        const { data: postsData } = await supabase
          .from('community_posts')
          .select('*')
          .or(searchFilter)
          .order('published_at', { ascending: false })
          .limit(100);

        // Fetch FDA events for this device/manufacturer
        const { data: fdaData } = await supabase
          .from('fda_device_events')
          .select('*')
          .or(`device_name.ilike.%${deviceData.name}%,manufacturer_name.ilike.%${deviceData.manufacturer}%`)
          .order('event_date', { ascending: false })
          .limit(20);

        // Fetch manufacturer support resources
        const { data: resourcesData } = await supabase
          .from('manufacturer_support_resources')
          .select('*')
          .eq('manufacturer', deviceData.manufacturer || '')
          .order('resource_type');

        // Fetch related devices in same category
        const { data: relatedData } = await supabase
          .from('devices')
          .select('*')
          .eq('category', deviceData.category || '')
          .neq('id', deviceId)
          .limit(4);

        // Calculate review sentiment stats
        const posts = postsData || [];
        const reviewStats = {
          positive: posts.filter(p => p.sentiment === 'positive').length,
          neutral: posts.filter(p => p.sentiment === 'neutral').length,
          negative: posts.filter(p => p.sentiment === 'negative').length,
          total: posts.length
        };

        setData({
          device: deviceData,
          metrics: metricsData || null,
          issues: issuesData || [],
          communityPosts: posts,
          fdaEvents: fdaData || [],
          supportResources: resourcesData || [],
          relatedDevices: relatedData || [],
          reviewStats
        });
      } catch (err) {
        console.error('Error fetching device details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load device details');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceDetails();
  }, [deviceId]);

  const refresh = () => {
    if (deviceId) {
      setLoading(true);
      // Trigger re-fetch by re-running useEffect
    }
  };

  return { data, loading, error, refresh };
};
