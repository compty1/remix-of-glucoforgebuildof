import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ResearchItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  impact_level: string;
  created_at: string;
  updated_at: string;
}

interface UseResearchFeedResult {
  data: ResearchItem[];
  loading: boolean;
  error: string | null;
  refreshFeed: () => Promise<void>;
}

export const useResearchFeed = (): UseResearchFeedResult => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['research-feed'],
    queryFn: async (): Promise<ResearchItem[]> => {
      const { data, error } = await supabase
        .from('research_items')
        .select('id, title, link, summary, source, impact_level, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(`Database error: ${error.message}`);
      return (data || []) as ResearchItem[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const refreshFeed = async () => {
    const { error: functionError } = await supabase.functions.invoke('research-feed');
    if (functionError) {
      throw new Error(`Failed to fetch research feed: ${functionError.message}`);
    }
    await queryClient.invalidateQueries({ queryKey: ['research-feed'] });
  };

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch research data') : null,
    refreshFeed,
  };
};
