import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: any; // This handles the Json type from Supabase
  created_at: string;
  updated_at: string;
  // New research-grade fields
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
  metadata?: any;
}

interface UseSurveysResult {
  surveys: Survey[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSurveys = (): UseSurveysResult => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch surveys: ${fetchError.message}`);
      }

      // Type assertion to handle the Json type from Supabase
      setSurveys((data as Survey[]) || []);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchSurveys();
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return {
    surveys,
    loading,
    error,
    refetch,
  };
};
