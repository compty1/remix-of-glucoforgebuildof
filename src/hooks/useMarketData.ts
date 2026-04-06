import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MarketData {
  id: string;
  company_name: string;
  ticker_symbol: string;
  current_price: number | null;
  market_cap: number | null;
  change_percent: number | null;
  volume: number | null;
  data_date: string;
  created_at: string;
  updated_at: string;
}

export const useMarketData = () => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['market-data'],
    queryFn: async (): Promise<MarketData[]> => {
      const { data, error } = await supabase
        .from('market_data')
        .select('id, company_name, ticker_symbol, current_price, market_cap, change_percent, volume, data_date, created_at, updated_at')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as MarketData[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const refetch = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('financial-market-feed');
    if (functionError) throw functionError;
    await queryClient.invalidateQueries({ queryKey: ['market-data'] });
  }, [queryClient]);

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch market data') : null,
    refetch,
  };
};
