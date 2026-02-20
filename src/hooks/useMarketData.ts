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

  const fetchFromDB = async () => {
    const { data: dbData, error: dbError } = await supabase
      .from('market_data')
      .select('*')
      .order('data_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;
    if (dbData) setData(dbData);
    return dbData;
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: functionError } = await supabase.functions.invoke('financial-market-feed');

      if (functionError) {
        throw functionError;
      }

      await fetchFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh market data');
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
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading, error, refetch };
};
