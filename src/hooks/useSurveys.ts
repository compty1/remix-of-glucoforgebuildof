import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Json;
  created_at: string;
  updated_at: string;
  survey_type?: string;
  research_category?: string;
  institution_partner?: string;
  irb_number?: string;
  consent_text?: string;
  estimated_time_minutes?: number;
  is_anonymous?: boolean;
  requires_demographics?: boolean;
  version?: number;
  status?: string;
  target_responses?: number;
  metadata?: Json;
}

interface UseSurveysResult {
  surveys: Survey[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSurveys = (): UseSurveysResult => {
  const queryClient = useQueryClient();

  const { data: surveys = [], isLoading, error: rawError } = useQuery({
    queryKey: ['surveys'],
    queryFn: async (): Promise<Survey[]> => {
      const { data, error } = await supabase
        .from('surveys')
        .select('id, title, description, category, questions, created_at, updated_at, survey_type, research_category, institution_partner, irb_number, consent_text, estimated_time_minutes, is_anonymous, requires_demographics, version, status, target_responses, metadata')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw new Error(`Failed to fetch surveys: ${error.message}`);
      return (data || []) as Survey[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['surveys'] });
  };

  return {
    surveys,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch surveys') : null,
    refetch,
  };
};
