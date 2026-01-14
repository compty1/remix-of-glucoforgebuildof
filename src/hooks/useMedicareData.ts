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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get existing data
      const { data: existingData, error: dbError } = await supabase
        .from('medicare_coverage_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      if (existingData && existingData.length > 0) {
        setData(existingData);
        setLoading(false);
      }

      // Then refresh from edge function
      const { error: functionError } = await supabase.functions.invoke('medicare-data-feed');

      if (functionError) {
        console.error('Edge function error:', functionError);
        if (!existingData || existingData.length === 0) {
          throw functionError;
        }
      } else {
        // Refetch after update
        const { data: freshData } = await supabase
          .from('medicare_coverage_data')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (freshData) setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching Medicare data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Medicare coverage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};