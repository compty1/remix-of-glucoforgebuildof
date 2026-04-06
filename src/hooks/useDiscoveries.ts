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
  credibility_factors?: Record<string, unknown>;
  primary_source?: string;
  source_urls?: string[];
  publication_date?: string;
  ai_analysis?: Record<string, unknown>;
  cross_references?: Record<string, unknown>[];
  discovered_at: string;
}

interface DiscoveriesResult {
  items: Discovery[];
  totalCount: number;
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

  const { data, isLoading: loading, error: rawError } = useQuery<DiscoveriesResult>({
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
  return {
    discoveries: data?.items ?? [],
    loading,
    error,
    totalCount: data?.totalCount ?? 0,
  };
};
