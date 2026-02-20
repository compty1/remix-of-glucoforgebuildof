import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QualityOfLifeExperience {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  source: string;
  source_url: string | null;
  upvotes: number;
  verified: boolean;
  created_at: string;
}

export function useQualityOfLifeExperiences(category?: string) {
  return useQuery({
    queryKey: ['quality-of-life-experiences', category],
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      let query = supabase
        .from('quality_of_life_experiences')
        .select('*')
        .order('upvotes', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(100);
      
      if (error) {
        throw error;
      }
      
      // Deduplicate by title — seeded data can contain identical entries
      const seen = new Set<string>();
      const deduplicated = (data || []).filter((item) => {
        const key = `${item.title}__${item.category}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return deduplicated as QualityOfLifeExperience[];
    },
  });
}

export function useQualityOfLifeCategories() {
  return useQuery({
    queryKey: ['quality-of-life-categories'],
    staleTime: 30 * 60 * 1000, // 30 minutes — categories rarely change
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_of_life_experiences')
        .select('category');

      if (error) throw error;
      
      const categories = [...new Set(data?.map(d => d.category) || [])];
      return categories;
    },
  });
}
