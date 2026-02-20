import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 10 * 60 * 1000; // 10 minutes
let lastFetchedAt: number | null = null;
let cachedData: any[] = [];

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
  const [data, setData] = useState<ResearchItem[]>(cachedData);
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchData = useCallback(async () => {
    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < STALE_TIME_MS && cachedData.length > 0) {
      setData(cachedData);
      setLoading(false);
      return;
    }
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
        cachedData = existingData;
        lastFetchedAt = Date.now();
        setData(existingData);
        setLoading(false);
      }

      // Then fetch fresh data from the edge function in the background
      const { error: functionError } = await supabase.functions.invoke('research-feed');

      if (functionError) {
        // Don't throw here if we already have cached data — just surface the error if empty
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
          cachedData = refreshedData;
          lastFetchedAt = Date.now();
          setData(refreshedData);
        }
      }

    } catch (err) {
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
