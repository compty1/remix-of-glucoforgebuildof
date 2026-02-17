import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResearchItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  impact_level: string;
  created_at: string;
  updated_at: string;
}

interface UseResearchFeedResult {
  data: ResearchItem[];
  loading: boolean;
  error: string | null;
  refreshFeed: () => Promise<void>;
}

export const useResearchFeed = (): UseResearchFeedResult => {
  const [data, setData] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get existing data from the database
      const { data: existingData, error: dbError } = await supabase
        .from('research_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // If we have existing data, show it immediately
      if (existingData && existingData.length > 0) {
        setData(existingData);
        setLoading(false);
      }

      // Then fetch fresh data from the edge function in the background
      const { error: functionError } = await supabase.functions.invoke('research-feed');

      if (functionError) {
        console.error('Edge function error:', functionError);
        // Don't throw here if we already have data - just log the error
        if (!existingData || existingData.length === 0) {
          throw new Error(`Failed to fetch research feed: ${functionError.message}`);
        }
      } else {
        // Re-query DB to get canonical data after edge function updates
        const { data: refreshedData } = await supabase
          .from('research_items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (refreshedData && refreshedData.length > 0) {
          setData(refreshedData);
        }
      }

    } catch (err) {
      console.error('Error fetching research feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch research data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    setLoading(true);
    await fetchResearchData();
  }, [fetchResearchData]);

  useEffect(() => {
    fetchResearchData();
  }, [fetchResearchData]);

  return {
    data,
    loading,
    error,
    refreshFeed,
  };
};