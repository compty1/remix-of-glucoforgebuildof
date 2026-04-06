import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['drug-pricing'],
    queryFn: async (): Promise<DrugPricingData[]> => {
      const { data, error } = await supabase
        .from('drug_pricing_data')
        .select('id, drug_name, manufacturer, ndc_code, unit_price, medicare_price, year, data_source, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as DrugPricingData[];
    },
    staleTime: 20 * 60 * 1000,
  });

  const refetch = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('medicare-data-feed');
    if (functionError) throw functionError;
    await queryClient.invalidateQueries({ queryKey: ['drug-pricing'] });
  }, [queryClient]);

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch drug pricing data') : null,
    refetch,
  };
};
