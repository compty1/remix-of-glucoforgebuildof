import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FDADeviceEvent {
  id: string;
  event_type: string;
  fda_event_id: string;
  device_name?: string;
  manufacturer_name?: string;
  event_date?: string;
  event_description?: string;
  severity_level?: string;
  status: string;
  source_url?: string;
  raw_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface UseFDADataResult {
  data: FDADeviceEvent[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getByEventType: (eventType: string) => FDADeviceEvent[];
  getByManufacturer: (manufacturer: string) => FDADeviceEvent[];
}

export const useFDAData = (eventType?: string): UseFDADataResult => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['fda-data', eventType],
    queryFn: async (): Promise<FDADeviceEvent[]> => {
      let query = supabase
        .from('fda_device_events')
        .select('id, event_type, fda_event_id, device_name, manufacturer_name, event_date, event_description, severity_level, status, source_url, created_at, updated_at')
        .order('event_date', { ascending: false });

      if (eventType) query = query.eq('event_type', eventType);

      const { data, error } = await query.limit(100);
      if (error) throw new Error(`Database error: ${error.message}`);
      return (data || []) as FDADeviceEvent[];
    },
    staleTime: 15 * 60 * 1000,
  });

  const refreshData = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('fda-data-feed');
    if (functionError) throw new Error(`Failed to refresh FDA data: ${functionError.message}`);
    await queryClient.invalidateQueries({ queryKey: ['fda-data'] });
  }, [queryClient]);

  const getByEventType = useCallback((type: string) => data.filter(e => e.event_type === type), [data]);
  const getByManufacturer = useCallback((manufacturer: string) =>
    data.filter(e => e.manufacturer_name?.toLowerCase().includes(manufacturer.toLowerCase())), [data]);

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch FDA data') : null,
    refreshData,
    getByEventType,
    getByManufacturer,
  };
};
