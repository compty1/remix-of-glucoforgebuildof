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

  const fetchFromDB = useCallback(async () => {
    let query = supabase
      .from('fda_device_events')
      .select('*')
      .order('event_date', { ascending: false });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: dbData, error: dbError } = await query.limit(100);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (dbData) {
      setData(dbData as FDADeviceEvent[]);
    }
    return dbData;
  }, [eventType]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: functionError } = await supabase.functions.invoke('fda-data-feed');

      if (functionError) {
        console.error('FDA data feed error:', functionError);
        throw new Error(`Failed to refresh FDA data: ${functionError.message}`);
      }

      // Re-query DB after refresh
      await fetchFromDB();
    } catch (err) {
      console.error('Error refreshing FDA data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh FDA data');
    } finally {
      setLoading(false);
    }
  }, [fetchFromDB]);

  const getByEventType = useCallback((type: string) => {
    return data.filter(event => event.event_type === type);
  }, [data]);

  const getByManufacturer = useCallback((manufacturer: string) => {
    return data.filter(event => 
      event.manufacturer_name?.toLowerCase().includes(manufacturer.toLowerCase())
    );
  }, [data]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchFromDB();
      } catch (err) {
        console.error('Error fetching FDA data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch FDA data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFromDB]);

  return {
    data,
    loading,
    error,
    refreshData,
    getByEventType,
    getByManufacturer,
  };
};
