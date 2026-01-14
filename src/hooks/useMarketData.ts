import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get existing data
      const { data: existingData, error: dbError } = await supabase
        .from('market_data')
        .select('*')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      if (existingData && existingData.length > 0) {
        setData(existingData);
        setLoading(false);
      }

      // Then refresh from edge function
      const { error: functionError } = await supabase.functions.invoke('financial-market-feed');

      if (functionError) {
        console.error('Edge function error:', functionError);
        if (!existingData || existingData.length === 0) {
          throw functionError;
        }
      } else {
        // Refetch after update
        const { data: freshData } = await supabase
          .from('market_data')
          .select('*')
          .order('data_date', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (freshData) setData(freshData);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};