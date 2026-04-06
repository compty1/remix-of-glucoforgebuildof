import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  raw_data?: Record<string, unknown>;
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

export const useClinicalTrialsDetailed = (phase?: string, statusFilter?: string): UseClinicalTrialsDetailedResult => {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['clinical-trials-detailed', phase, statusFilter],
    queryFn: async (): Promise<ClinicalTrialDetailed[]> => {
      let query = supabase
        .from('clinical_trials_detailed')
        .select('id, nct_id, title, brief_summary, phase, study_type, overall_status, primary_purpose, intervention_type, sponsor_name, lead_sponsor_class, start_date, completion_date, enrollment_count, location_countries, conditions, interventions, primary_outcomes, secondary_outcomes, eligibility_criteria, min_age, max_age, gender, source_registry, study_url, last_update_date, created_at, updated_at')
        .order('start_date', { ascending: false });

      if (phase) query = query.eq('phase', phase);
      if (statusFilter) query = query.eq('overall_status', statusFilter);

      const { data: dbData, error } = await query.limit(100);
      if (error) throw new Error(`Database error: ${error.message}`);
      return (dbData || []) as ClinicalTrialDetailed[];
    },
    staleTime: 15 * 60 * 1000,
  });

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      const { error: functionError } = await supabase.functions.invoke('clinical-trials-enhanced');
      if (functionError) throw new Error(`Failed to refresh clinical trials: ${functionError.message}`);
      await queryClient.invalidateQueries({ queryKey: ['clinical-trials-detailed'] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const getByPhase = useCallback((targetPhase: string) => data.filter(t => t.phase === targetPhase), [data]);
  const getByStatus = useCallback((status: string) => data.filter(t => t.overall_status === status), [data]);
  const getByCondition = useCallback((condition: string) =>
    data.filter(t => t.conditions?.some(c => c.toLowerCase().includes(condition.toLowerCase()))), [data]);

  return {
    data,
    loading: isLoading || refreshing,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch clinical trials data') : null,
    refreshData,
    getByPhase,
    getByStatus,
    getByCondition,
  };
};
