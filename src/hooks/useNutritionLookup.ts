import { useMutation } from '@tanstack/react-query';
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

/**
 * Nutrition lookup hook using useMutation for on-demand queries.
 * Bug 219: Added proper error handling, removed manual useState pattern.
 */
export function useNutritionLookup() {
  const mutation = useMutation({
    mutationFn: async ({ query, isBarcode = false }: { query: string; isBarcode?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('nutrition-lookup', {
        body: isBarcode ? { barcode: query } : { query },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.results || []) as NutritionResult[];
    },
  });

  const lookup = async (query: string, isBarcode = false) => {
    mutation.mutate({ query, isBarcode });
  };

  return {
    lookup,
    results: mutation.data || [],
    loading: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}
