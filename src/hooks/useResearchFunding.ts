import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ResearchFunding {
  id: string;
  project_number: string;
  project_title: string;
  principal_investigator: string | null;
  organization: string | null;
  funding_amount: number | null;
  fiscal_year: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  abstract: string | null;
  created_at: string;
  updated_at: string;
}

export const useResearchFunding = () => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['research-funding'],
    queryFn: async (): Promise<ResearchFunding[]> => {
      const { data, error } = await supabase
        .from('research_funding')
        .select('id, project_number, project_title, principal_investigator, organization, funding_amount, fiscal_year, project_start_date, project_end_date, created_at, updated_at')
        .order('fiscal_year', { ascending: false })
        .order('funding_amount', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as ResearchFunding[];
    },
    staleTime: 15 * 60 * 1000,
  });

  const refetch = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('funding-research-feed');
    if (functionError) throw functionError;
    await queryClient.invalidateQueries({ queryKey: ['research-funding'] });
  }, [queryClient]);

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch research funding data') : null,
    refetch,
  };
};
