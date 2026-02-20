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

  const fetchFromDB = async () => {
    const { data: dbData, error: dbError } = await supabase
      .from('patent_data')
      .select('*')
      .order('patent_date', { ascending: false });

    if (dbError) throw dbError;
    if (dbData) setData(dbData);
    return dbData;
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: functionError } = await supabase.functions.invoke('patent-innovation-feed');

      if (functionError) {
        throw functionError;
      }

      await fetchFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh patent data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchFromDB();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch patent data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading, error, refetch };
};
