import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClinicalTrialDetailed {
  id: string;
  nct_id: string;
  title: string;
  brief_summary?: string;
  detailed_description?: string;
  phase?: string;
  study_type?: string;
  overall_status?: string;
  primary_purpose?: string;
  intervention_type?: string;
  sponsor_name?: string;
  lead_sponsor_class?: string;
  start_date?: string;
  completion_date?: string;
  enrollment_count?: number;
  location_countries?: string[];
  conditions?: string[];
  interventions?: string[];
  primary_outcomes?: string[];
  secondary_outcomes?: string[];
  eligibility_criteria?: string;
  min_age?: string;
  max_age?: string;
  gender?: string;
  source_registry: string;
  study_url?: string;
  last_update_date?: string;
  raw_data?: any;
  created_at: string;
  updated_at: string;
}

interface UseClinicalTrialsDetailedResult {
  data: ClinicalTrialDetailed[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getByPhase: (phase: string) => ClinicalTrialDetailed[];
  getByStatus: (status: string) => ClinicalTrialDetailed[];
  getByCondition: (condition: string) => ClinicalTrialDetailed[];
}

export const useClinicalTrialsDetailed = (phase?: string): UseClinicalTrialsDetailedResult => {
  const [data, setData] = useState<ClinicalTrialDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClinicalTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get existing data from the database
      let query = supabase
        .from('clinical_trials_detailed')
        .select('*')
        .order('start_date', { ascending: false });

      if (phase) {
        query = query.eq('phase', phase);
      }

      const { data: existingData, error: dbError } = await query.limit(100);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (existingData && existingData.length > 0) {
        setData(existingData as ClinicalTrialDetailed[]);
        setLoading(false);
      }

      // Then fetch fresh data from the edge function in the background
      const { error: functionError } = await supabase.functions.invoke('clinical-trials-enhanced');

      if (functionError) {
        console.error('Clinical trials enhanced error:', functionError);
        if (!existingData || existingData.length === 0) {
          throw new Error(`Failed to fetch clinical trials: ${functionError.message}`);
        }
      } else {
        // Re-query the database to get canonical data (Issue 47)
        let refreshQuery = supabase
          .from('clinical_trials_detailed')
          .select('*')
          .order('start_date', { ascending: false });

        if (phase) {
          refreshQuery = refreshQuery.eq('phase', phase);
        }

        const { data: refreshedData } = await refreshQuery.limit(100);
        if (refreshedData && refreshedData.length > 0) {
          setData(refreshedData as ClinicalTrialDetailed[]);
        }
      }

    } catch (err) {
      console.error('Error fetching clinical trials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clinical trials data');
    } finally {
      setLoading(false);
    }
  }, [phase]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchClinicalTrials();
  }, [fetchClinicalTrials]);

  const getByPhase = useCallback((targetPhase: string) => {
    return data.filter(trial => trial.phase === targetPhase);
  }, [data]);

  const getByStatus = useCallback((status: string) => {
    return data.filter(trial => trial.overall_status === status);
  }, [data]);

  const getByCondition = useCallback((condition: string) => {
    return data.filter(trial => 
      trial.conditions?.some(c => 
        c.toLowerCase().includes(condition.toLowerCase())
      )
    );
  }, [data]);

  useEffect(() => {
    fetchClinicalTrials();
  }, [fetchClinicalTrials]);

  return {
    data,
    loading,
    error,
    refreshData,
    getByPhase,
    getByStatus,
    getByCondition,
  };
};