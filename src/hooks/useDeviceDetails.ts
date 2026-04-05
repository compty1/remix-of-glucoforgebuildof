import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

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
  device_type?: string | null;
  price_range?: string | null;
  availability?: string | null;
  fda_status?: string | null;
  specifications?: unknown;
  avg_rating?: number | null;
  review_count?: number | null;
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

async function fetchDeviceDetails(deviceId: string): Promise<DeviceDetails | null> {
  // Fetch device basic info first (needed for dependent queries)
  const { data: deviceData, error: deviceError } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId)
    .maybeSingle();

  if (deviceError) throw deviceError;
  if (!deviceData) return null;

  // Build community post search filter
  const deviceNameLower = deviceData.name.toLowerCase();
  const deviceParts = deviceNameLower.split(' ');
  const brand = deviceParts[0];
  const model = deviceParts.slice(1).join(' ');
  let searchFilter = `device_mentioned.ilike.%${brand}%,title.ilike.%${deviceNameLower}%`;
  if (model && model.length > 1) {
    searchFilter += `,title.ilike.%${model}%,content.ilike.%${model}%`;
  }

  // C41: Fetch all dependent data in parallel with Promise.all
  const [
    { data: metricsData },
    { data: issuesData },
    { data: postsData },
    { data: fdaData },
    { data: resourcesData },
    { data: relatedData },
  ] = await Promise.all([
    supabase
      .from('device_metrics')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle(),
    supabase
      .from('device_issues')
      .select('*')
      .eq('device_id', deviceId)
      .order('community_reports', { ascending: false }),
    supabase
      .from('community_posts')
      .select('*')
      .or(searchFilter)
      .order('published_at', { ascending: false })
      .limit(100),
    supabase
      .from('fda_device_events')
      .select('*')
      .or(`device_name.ilike.%${deviceData.name}%,manufacturer_name.ilike.%${deviceData.manufacturer}%`)
      .order('event_date', { ascending: false })
      .limit(20),
    supabase
      .from('manufacturer_support_resources')
      .select('*')
      .eq('manufacturer', deviceData.manufacturer || '')
      .order('resource_type'),
    supabase
      .from('devices')
      .select('*')
      .eq('category', deviceData.category || '')
      .neq('id', deviceId)
      .limit(4),
  ]);

  const posts = postsData || [];
  const reviewStats = {
    positive: posts.filter(p => p.sentiment === 'positive').length,
    neutral: posts.filter(p => p.sentiment === 'neutral').length,
    negative: posts.filter(p => p.sentiment === 'negative').length,
    total: posts.length,
  };

  return {
    device: deviceData as Device,
    metrics: metricsData || null,
    issues: issuesData || [],
    communityPosts: posts,
    fdaEvents: fdaData || [],
    supportResources: resourcesData || [],
    relatedDevices: (relatedData || []) as Device[],
    reviewStats,
  };
}

// C42: Migrated to React Query — replaces manual module-level cache
export const useDeviceDetails = (deviceId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['device-details', deviceId],
    queryFn: () => fetchDeviceDetails(deviceId!),
    enabled: !!deviceId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // C35: refresh now properly works via React Query invalidation
  const refresh = () => {
    if (deviceId) {
      queryClient.invalidateQueries({ queryKey: ['device-details', deviceId] });
    }
  };

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : 'Failed to load device details') : null,
    refresh,
  };
};
