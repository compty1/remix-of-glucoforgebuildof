import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 15 * 60 * 1000; // 15 minutes
let lastFetchedAt: number | null = null;
let cachedData: ResearchFunding[] = [];

interface ResearchFunding {
  id: string;
  project_number: string;
  project_title: string;
  principal_investigator: string | null;
  organization: string | null;
  funding_amount: number | null;
  fiscal_year: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  abstract: string | null;
  created_at: string;
  updated_at: string;
}

export const useResearchFunding = () => {
  const [data, setData] = useState<ResearchFunding[]>(cachedData);
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < STALE_TIME_MS && cachedData.length > 0) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // First get existing data
      const { data: existingData, error: dbError } = await supabase
        .from('research_funding')
        .select('*')
        .order('fiscal_year', { ascending: false })
        .order('funding_amount', { ascending: false });

      if (dbError) throw dbError;

      if (existingData && existingData.length > 0) {
        cachedData = existingData;
        lastFetchedAt = Date.now();
        setData(existingData);
        setLoading(false);
      }

      // Then refresh from edge function
      const { error: functionError } = await supabase.functions.invoke('funding-research-feed');

      if (functionError) {
        if (!existingData || existingData.length === 0) {
          throw functionError;
        }
      } else {
        // Refetch after update
        const { data: freshData } = await supabase
          .from('research_funding')
          .select('*')
          .order('fiscal_year', { ascending: false })
          .order('funding_amount', { ascending: false });
        
        if (freshData) {
          cachedData = freshData;
          lastFetchedAt = Date.now();
          setData(freshData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research funding data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
