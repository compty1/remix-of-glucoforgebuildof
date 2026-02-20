import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 15 * 60 * 1000; // 15 minutes
const cache: Record<string, { data: any[]; fetchedAt: number }> = {};

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
  const cacheKey = phase || 'all';
  const [data, setData] = useState<ClinicalTrialDetailed[]>(cache[cacheKey]?.data || []);
  const [loading, setLoading] = useState(!cache[cacheKey]?.data?.length);
  const [error, setError] = useState<string | null>(null);

  const fetchFromDB = useCallback(async () => {
    let query = supabase
      .from('clinical_trials_detailed')
      .select('*')
      .order('start_date', { ascending: false });

    if (phase) {
      query = query.eq('phase', phase);
    }

    const { data: dbData, error: dbError } = await query.limit(100);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (dbData) {
      cache[cacheKey] = { data: dbData, fetchedAt: Date.now() };
      setData(dbData as ClinicalTrialDetailed[]);
    }
    return dbData;
  }, [phase]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: functionError } = await supabase.functions.invoke('clinical-trials-enhanced');

      if (functionError) {
        throw new Error(`Failed to refresh clinical trials: ${functionError.message}`);
      }

      await fetchFromDB();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh clinical trials data');
    } finally {
      setLoading(false);
    }
  }, [fetchFromDB]);

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
    const now = Date.now();
    const cached = cache[cacheKey];
    if (cached && now - cached.fetchedAt < STALE_TIME_MS && cached.data.length > 0) {
      setData(cached.data as ClinicalTrialDetailed[]);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchFromDB();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clinical trials data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFromDB]);

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