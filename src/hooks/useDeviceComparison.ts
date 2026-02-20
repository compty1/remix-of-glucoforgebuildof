import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ComparisonDevice {
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
  metrics: {
    reliability_score: number | null;
    social_setting_score: number | null;
    total_reviews: number | null;
  } | null;
  userReviewStats: {
    averageRating: number;
    totalReviews: number;
  };
  issueCount: number;
}

interface UseDeviceComparisonReturn {
  selectedDeviceIds: string[];
  comparisonDevices: ComparisonDevice[];
  allDevices: { id: string; name: string; category: string | null }[];
  loading: boolean;
  error: string | null;
  addDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  clearAll: () => void;
  maxDevices: number;
}

const MAX_DEVICES = 4;

export const useDeviceComparison = (initialDeviceIds: string[] = []): UseDeviceComparisonReturn => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(initialDeviceIds);
  const [comparisonDevices, setComparisonDevices] = useState<ComparisonDevice[]>([]);
  const [allDevices, setAllDevices] = useState<{ id: string; name: string; category: string | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all devices for the selector
  useEffect(() => {
    const fetchAllDevices = async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('id, name, category')
        .order('name');

      if (error) {
        return;
      }

      setAllDevices(data || []);
    };

    fetchAllDevices();
  }, []);

  // Fetch comparison data when selection changes
  const fetchComparisonData = useCallback(async () => {
    if (selectedDeviceIds.length === 0) {
      setComparisonDevices([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch devices with metrics
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .in('id', selectedDeviceIds);

      if (devicesError) throw devicesError;

      // Fetch metrics for all selected devices
      const { data: metricsData } = await supabase
        .from('device_metrics')
        .select('*')
        .in('device_id', selectedDeviceIds);

      // Fetch user review stats
      const { data: reviewsData } = await supabase
        .from('device_reviews')
        .select('device_id, rating')
        .in('device_id', selectedDeviceIds);

      // Fetch issue counts
      const { data: issuesData } = await supabase
        .from('device_issues')
        .select('device_id')
        .in('device_id', selectedDeviceIds);

      // Build comparison devices
      const devices: ComparisonDevice[] = (devicesData || []).map(device => {
        const metrics = metricsData?.find(m => m.device_id === device.id);
        const deviceReviews = reviewsData?.filter(r => r.device_id === device.id) || [];
        const issueCount = issuesData?.filter(i => i.device_id === device.id).length || 0;

        const avgRating = deviceReviews.length > 0
          ? deviceReviews.reduce((sum, r) => sum + r.rating, 0) / deviceReviews.length
          : 0;

        return {
          ...device,
          metrics: metrics ? {
            reliability_score: metrics.reliability_score,
            social_setting_score: metrics.social_setting_score,
            total_reviews: metrics.total_reviews
          } : null,
          userReviewStats: {
            averageRating: avgRating,
            totalReviews: deviceReviews.length
          },
          issueCount
        };
      });

      // Sort by selectedDeviceIds order
      const orderedDevices = selectedDeviceIds
        .map(id => devices.find(d => d.id === id))
        .filter(Boolean) as ComparisonDevice[];

      setComparisonDevices(orderedDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceIds]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  const addDevice = (deviceId: string) => {
    if (selectedDeviceIds.length >= MAX_DEVICES) return;
    if (selectedDeviceIds.includes(deviceId)) return;
    setSelectedDeviceIds([...selectedDeviceIds, deviceId]);
  };

  const removeDevice = (deviceId: string) => {
    setSelectedDeviceIds(selectedDeviceIds.filter(id => id !== deviceId));
  };

  const clearAll = () => {
    setSelectedDeviceIds([]);
  };

  return {
    selectedDeviceIds,
    comparisonDevices,
    allDevices,
    loading,
    error,
    addDevice,
    removeDevice,
    clearAll,
    maxDevices: MAX_DEVICES
  };
};