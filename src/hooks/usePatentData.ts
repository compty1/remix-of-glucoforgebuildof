import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PatentData {
  id: string;
  patent_id: string;
  title: string;
  abstract: string | null;
  inventors: string[] | null;
  assignee: string | null;
  patent_date: string | null;
  diabetes_relevance_score: number | null;
  patent_url: string | null;
  created_at: string;
  updated_at: string;
}

export const usePatentData = () => {
  const [data, setData] = useState<PatentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get existing data
      const { data: existingData, error: dbError } = await supabase
        .from('patent_data')
        .select('*')
        .order('patent_date', { ascending: false });

      if (dbError) throw dbError;

      if (existingData && existingData.length > 0) {
        setData(existingData);
        setLoading(false);
      }

      // Then refresh from edge function
      const { error: functionError } = await supabase.functions.invoke('patent-innovation-feed');

      if (functionError) {
        console.error('Edge function error:', functionError);
        if (!existingData || existingData.length === 0) {
          throw functionError;
        }
      } else {
        // Refetch after update
        const { data: freshData } = await supabase
          .from('patent_data')
          .select('*')
          .order('patent_date', { ascending: false });
        
        if (freshData) setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching patent data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};