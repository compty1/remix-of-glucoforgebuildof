import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface T1DResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  resource_type: string | null;
  external_url: string | null;
  is_internal_tool: boolean;
  internal_route: string | null;
  icon_name: string | null;
  featured: boolean;
  target_audience: string[];
  tags: string[];
  priority: number;
  created_at: string;
  updated_at: string;
}

export const useResources = (category?: string) => {
  return useQuery({
    queryKey: ['t1d-resources', category],
    queryFn: async () => {
      let query = supabase
        .from('t1d_resources')
        .select('*')
        .order('priority', { ascending: false })
        .order('title')
        .limit(200);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as T1DResource[];
    },
  });
};

export const useFeaturedResources = () => {
  return useQuery({
    queryKey: ['featured-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t1d_resources')
        .select('*')
        .eq('featured', true)
        .order('priority', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as T1DResource[];
    },
  });
};
