import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NutritionResult {
  name: string;
  barcode?: string;
  servingSize: string;
  carbs: number;
  fat: number;
  protein: number;
  fiber: number;
  calories: number;
  imageUrl?: string;
}

export function useNutritionLookup() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NutritionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (query: string, isBarcode = false) => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('nutrition-lookup', {
        body: isBarcode ? { barcode: query } : { query },
      });
      if (fnError) throw fnError;
      if (data?.results) {
        setResults(data.results);
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return { lookup, results, loading, error };
}
