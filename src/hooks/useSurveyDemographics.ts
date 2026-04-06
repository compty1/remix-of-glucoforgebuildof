import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface Demographics {
  id: string;
  user_id: string;
  age_range: string | null;
  gender: string | null;
  diagnosis_year: number | null;
  diabetes_type: string | null;
  therapy_type: string | null;
  cgm_usage: string | null;
  pump_usage: string | null;
  a1c_range: string | null;
  years_with_diabetes: number | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Survey demographics hook.
 * Bug 222: Replaced supabase.auth.getUser() with useAuthStore, migrated to React Query.
 */
export const useSurveyDemographics = () => {
  const { user } = useAuthStore();

  const { data: demographics = null, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['survey-demographics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_demographics')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Demographics | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    demographics,
    hasDemographics: demographics !== null,
    loading,
    error: queryError ? String(queryError) : null,
    refetch: async () => { await refetch(); },
  };
};
