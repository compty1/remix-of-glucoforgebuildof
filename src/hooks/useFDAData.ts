import { useState, useEffect, useCallback } from 'react';
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
  raw_data?: any;
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
  const [data, setData] = useState<FDADeviceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFDAData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get existing data from the database
      let query = supabase
        .from('fda_device_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data: existingData, error: dbError } = await query.limit(100);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (existingData && existingData.length > 0) {
        setData(existingData as FDADeviceEvent[]);
        setLoading(false);
      }

      // Then fetch fresh data from the edge function in the background
      const { data: freshData, error: functionError } = await supabase.functions.invoke('fda-data-feed');

      if (functionError) {
        console.error('FDA data feed error:', functionError);
        if (!existingData || existingData.length === 0) {
          throw new Error(`Failed to fetch FDA data: ${functionError.message}`);
        }
      } else if (freshData?.data) {
        setData(freshData.data);
      }

    } catch (err) {
      console.error('Error fetching FDA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FDA data');
    } finally {
      setLoading(false);
    }
  }, [eventType]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchFDAData();
  }, [fetchFDAData]);

  const getByEventType = useCallback((type: string) => {
    return data.filter(event => event.event_type === type);
  }, [data]);

  const getByManufacturer = useCallback((manufacturer: string) => {
    return data.filter(event => 
      event.manufacturer_name?.toLowerCase().includes(manufacturer.toLowerCase())
    );
  }, [data]);

  useEffect(() => {
    fetchFDAData();
  }, [fetchFDAData]);

  return {
    data,
    loading,
    error,
    refreshData,
    getByEventType,
    getByManufacturer,
  };
};