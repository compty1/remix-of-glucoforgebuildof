import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PatentData {
  id: string;
  patent_id: string;
  title: string;
  abstract: string | null;
  inventors: string[] | null;
  assignee: string | null;
  patent_date: string | null;
  diabetes_relevance_score: number | null;
  patent_url: string | null;
  created_at: string;
  updated_at: string;
}

export const usePatentData = () => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['patent-data'],
    queryFn: async (): Promise<PatentData[]> => {
      const { data, error } = await supabase
        .from('patent_data')
        .select('id, patent_id, title, abstract, inventors, assignee, patent_date, diabetes_relevance_score, patent_url, created_at, updated_at')
        .order('patent_date', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as PatentData[];
    },
    staleTime: 15 * 60 * 1000,
  });

  const refetch = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('patent-innovation-feed');
    if (functionError) throw functionError;
    await queryClient.invalidateQueries({ queryKey: ['patent-data'] });
  }, [queryClient]);

  return {
    data,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch patent data') : null,
    refetch,
  };
};
