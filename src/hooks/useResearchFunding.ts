import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [data, setData] = useState<ResearchFunding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
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
        setData(existingData);
        setLoading(false);
      }

      // Then refresh from edge function
      const { error: functionError } = await supabase.functions.invoke('funding-research-feed');

      if (functionError) {
        console.error('Edge function error:', functionError);
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
        
        if (freshData) setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching research funding data:', err);
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