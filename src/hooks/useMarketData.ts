import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 10 * 60 * 1000; // 10 minutes
let lastFetchedAt: number | null = null;
let cachedData: MarketData[] = [];

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
  const [data, setData] = useState<MarketData[]>(cachedData);
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchFromDB = async () => {
    const { data: dbData, error: dbError } = await supabase
      .from('market_data')
      .select('*')
      .order('data_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;
    if (dbData) {
      cachedData = dbData;
      lastFetchedAt = Date.now();
      setData(dbData);
    }
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
    const now = Date.now();
    if (lastFetchedAt && now - lastFetchedAt < STALE_TIME_MS && cachedData.length > 0) {
      setData(cachedData);
      setLoading(false);
      return;
    }
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
