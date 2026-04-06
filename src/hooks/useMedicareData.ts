import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MedicareCoverageData {
  id: string;
  device_name: string;
  coverage_status: string | null;
  coverage_details: any;
  ncd_number: string | null;
  effective_date: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useMedicareData = () => {
  const [data, setData] = useState<MedicareCoverageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFromDB = async () => {
    const { data: dbData, error: dbError } = await supabase
      .from('medicare_coverage_data')
      .select('*')
      .order('created_at', { ascending: false })
     .limit(500);

    if (dbError) throw dbError;
    if (dbData) setData(dbData);
    return dbData;
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: functionError } = await supabase.functions.invoke('medicare-data-feed');

      if (functionError) {
        // Edge function error — will use cached data
        throw functionError;
      }

      await fetchFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh Medicare data');
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
        setError(err instanceof Error ? err.message : 'Failed to fetch Medicare coverage data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading, error, refetch };
};
