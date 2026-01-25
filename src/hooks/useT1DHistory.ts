import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface T1DHistoryEvent {
  id: string;
  year: number;
  year_end: number | null;
  era: string | null;
  title: string;
  short_description: string;
  detailed_description: string;
  category: string;
  subcategory: string | null;
  image_url: string | null;
  image_caption: string | null;
  sources: string[] | null;
  interesting_facts: string[] | null;
  impact_score: number | null;
  decade: string | null;
  decade_summary: string | null;
  created_at: string;
  updated_at: string;
}

interface UseT1DHistoryOptions {
  era?: string;
  category?: string;
  minImpact?: number;
  decade?: string;
}

export function useT1DHistory(options?: UseT1DHistoryOptions) {
  return useQuery({
    queryKey: ['t1d-history', options],
    queryFn: async () => {
      let query = supabase
        .from('t1d_history_events')
        .select('*')
        .order('year', { ascending: true });

      if (options?.era) {
        query = query.eq('era', options.era);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.minImpact) {
        query = query.gte('impact_score', options.minImpact);
      }
      if (options?.decade) {
        query = query.eq('decade', options.decade);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as T1DHistoryEvent[];
    },
  });
}

export function useT1DHistoryEras() {
  return useQuery({
    queryKey: ['t1d-history-eras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t1d_history_events')
        .select('era')
        .not('era', 'is', null);

      if (error) throw error;
      const uniqueEras = [...new Set(data.map(d => d.era))].filter(Boolean);
      return uniqueEras as string[];
    },
  });
}

export function useT1DHistoryDecades() {
  return useQuery({
    queryKey: ['t1d-history-decades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t1d_history_events')
        .select('decade, decade_summary')
        .not('decade', 'is', null)
        .not('decade_summary', 'is', null);

      if (error) throw error;
      
      // Get unique decades with their summaries
      const decadeMap = new Map<string, string>();
      data.forEach(d => {
        if (d.decade && d.decade_summary && !decadeMap.has(d.decade)) {
          decadeMap.set(d.decade, d.decade_summary);
        }
      });
      
      return Array.from(decadeMap.entries()).map(([decade, summary]) => ({
        decade,
        summary
      })).sort((a, b) => a.decade.localeCompare(b.decade));
    },
  });
}
