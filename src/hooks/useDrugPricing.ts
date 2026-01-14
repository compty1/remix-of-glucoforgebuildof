import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DrugPricingData {
  id: string;
  drug_name: string;
  manufacturer: string | null;
  ndc_code: string | null;
  unit_price: number | null;
  medicare_price: number | null;
  year: number | null;
  data_source: string | null;
  created_at: string;
  updated_at: string;
}

export const useDrugPricing = () => {
  const [data, setData] = useState<DrugPricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get existing data
      const { data: existingData, error: dbError } = await supabase
        .from('drug_pricing_data')
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
          .from('drug_pricing_data')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (freshData) setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching drug pricing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drug pricing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};