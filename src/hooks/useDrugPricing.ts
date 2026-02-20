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

  const fetchFromDB = async () => {
    const { data: dbData, error: dbError } = await supabase
      .from('drug_pricing_data')
      .select('*')
      .order('created_at', { ascending: false });

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
        throw functionError;
      }

      await fetchFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh drug pricing data');
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
        setError(err instanceof Error ? err.message : 'Failed to fetch drug pricing data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading, error, refetch };
};
