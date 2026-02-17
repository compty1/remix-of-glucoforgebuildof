import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface UseSurveyDemographicsResult {
  demographics: Demographics | null;
  hasDemographics: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSurveyDemographics = (): UseSurveyDemographicsResult => {
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemographics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDemographics(null);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('survey_demographics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to fetch demographics: ${fetchError.message}`);
      }

      setDemographics(data as Demographics | null);
    } catch (err) {
      console.error('Error fetching demographics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch demographics');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchDemographics();
  };

  useEffect(() => {
    fetchDemographics();
  }, []);

  return {
    demographics,
    hasDemographics: demographics !== null,
    loading,
    error,
    refetch,
  };
};
