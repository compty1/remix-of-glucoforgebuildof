import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  refetch: () => void;
}

const QUERY_KEY = ['t1d-events'];

export const useT1DEvents = (): UseT1DEventsResult => {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, error: rawError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from('t1d_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (dbError) throw new Error(dbError.message);
      return (data || []) as T1DEvent[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const error = rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch events') : null;
  const refetch = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  return { events, loading, error, refetch };
};
