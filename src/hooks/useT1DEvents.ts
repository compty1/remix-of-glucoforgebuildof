import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface T1DEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  organizer: string;
  location_name: string;
  city: string;
  state: string;
  country: string;
  start_date: string;
  end_date?: string;
  cost_info: string;
  is_free: boolean;
  registration_url: string;
  website_url: string;
  is_virtual: boolean;
  tags: string[];
}

interface UseT1DEventsResult {
  events: T1DEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useT1DEvents = (): UseT1DEventsResult => {
  const [events, setEvents] = useState<T1DEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('t1d_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (dbError) {
        throw new Error(dbError.message);
      }

      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
};
