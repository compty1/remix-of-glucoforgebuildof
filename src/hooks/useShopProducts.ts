import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  images: string[];
  stripe_price_id: string | null;
  stock_status: string;
  customization_options: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useShopProducts = (category?: string) => {
  return useQuery({
    queryKey: ['shop-products', category],
    queryFn: async () => {
      let query = supabase
        .from('shop_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShopProduct[];
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['shop-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_products')
        .select('category');

      if (error) throw error;
      const categories = [...new Set(data?.map(p => p.category) || [])];
      return categories.sort();
    },
  });
};
