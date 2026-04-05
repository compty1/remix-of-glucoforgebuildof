import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Discovery {
  id: string;
  title: string;
  summary: string;
  full_text?: string;
  discovery_type: 'cure_breakthrough' | 'clinical_trial' | 'research_paper' | 'community_symptom' | 'ai_correlation';
  category?: string;
  impact_level?: 'Breakthrough' | 'High' | 'Medium' | 'Low';
  credibility_score: number;
  credibility_factors?: any;
  primary_source?: string;
  source_urls?: string[];
  publication_date?: string;
  ai_analysis?: any;
  cross_references?: any[];
  discovered_at: string;
}

export const useDiscoveries = (filters?: {
  type?: string;
  impact?: string;
  minCredibility?: number;
  limit?: number;
  offset?: number;
}) => {
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const { data: discoveries = [], isLoading: loading, error: rawError } = useQuery({
    queryKey: ['discoveries', filters?.type, filters?.impact, filters?.minCredibility, limit, offset],
    queryFn: async () => {
      let query = supabase
        .from('discoveries')
        .select('*', { count: 'exact' })
        .order('credibility_score', { ascending: false })
        .order('discovered_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('discovery_type', filters.type);
      }
      if (filters?.impact && filters.impact !== 'all') {
        query = query.eq('impact_level', filters.impact);
      }
      if (filters?.minCredibility) {
        query = query.gte('credibility_score', filters.minCredibility);
      }

      const { data, error: fetchError, count } = await query.range(offset, offset + limit - 1);
      if (fetchError) throw fetchError;
      return { items: (data || []) as Discovery[], totalCount: count ?? 0 };
    },
    staleTime: 15 * 60 * 1000,
  });

  const error = rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch discoveries') : null;
  const totalCount = (discoveries as any)?.totalCount ?? 0;
  const items = (discoveries as any)?.items ?? discoveries;
  return { discoveries: Array.isArray(items) ? items : [], loading, error, totalCount };
};
