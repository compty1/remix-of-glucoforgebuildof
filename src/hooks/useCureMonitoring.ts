import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CureTherapy {
  id: string;
  name: string;
  description: string;
  phase: string;
  category: string;
  sponsor: string;
  progress_percentage: number;
  confidence_score: number;
  estimated_completion: string;
  status: string;
  website_url: string;
  milestones?: CureMilestone[];
  // Enhanced fields
  approach_type?: string;
  mechanism?: string;
  advantages?: string[];
  risks?: string[];
  current_status_text?: string;
  estimated_availability_text?: string;
  life_after_treatment?: string;
  requirements?: string[];
  clinical_trial_ids?: string[];
  is_featured?: boolean;
}

export interface CureMilestone {
  id: string;
  therapy_id: string;
  title: string;
  description: string;
  target_date: string;
  completed_date: string | null;
  status: string;
}

export interface CureMonitoringData {
  therapies: CureTherapy[];
  stats: {
    activeTrials: number;
    avgYearsToMarket: number;
    successRate: number;
    topConfidence: number;
  };
  overallProgress: number;
}

export const useCureMonitoring = () => {
  const [data, setData] = useState<CureMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCureMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: therapies, error: therapiesError } = await supabase
        .from('cure_therapies')
        .select(`
          *,
          cure_milestones (
            id,
            therapy_id,
            title,
            description,
            target_date,
            completed_date,
            status
          )
        `)
        .order('progress_percentage', { ascending: false });

      if (therapiesError) throw therapiesError;

      const activeTrials = therapies?.filter(t => t.status === 'Active').length || 0;
      
      const currentDate = new Date();
      const therapiesWithDates = therapies?.filter(t => t.estimated_completion) || [];
      const avgYearsToMarket = therapiesWithDates.length > 0 
        ? therapiesWithDates.reduce((sum, therapy) => {
            const completionDate = new Date(therapy.estimated_completion);
            const yearsToCompletion = Math.max(0, (completionDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
            return sum + yearsToCompletion;
          }, 0) / therapiesWithDates.length
        : 0;

      const advancedTherapies = therapies?.filter(t => 
        t.phase === 'Approved' || t.phase === 'Phase III' || t.phase === 'FDA Review'
      ).length || 0;
      const successRate = therapies?.length ? (advancedTherapies / therapies.length) * 100 : 0;

      const topConfidence = Math.max(...(therapies?.map(t => t.confidence_score) || [0]));

      const overallProgress = therapies?.length 
        ? therapies.reduce((sum, therapy) => sum + therapy.progress_percentage, 0) / therapies.length
        : 0;

      setData({
        therapies: therapies || [],
        stats: {
          activeTrials,
          avgYearsToMarket: Math.round(avgYearsToMarket * 10) / 10,
          successRate: Math.round(successRate),
          topConfidence,
        },
        overallProgress: Math.round(overallProgress),
      });
    } catch (err) {
      console.error('Error fetching cure monitoring data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCureMonitoringData();
  }, []);

  return { data, loading, error, refetch: fetchCureMonitoringData };
};