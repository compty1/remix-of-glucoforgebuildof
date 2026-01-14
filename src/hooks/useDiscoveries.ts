import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Discovery {
  id: string;
  title: string;
  summary: string;
  full_text?: string;
  discovery_type: 'cure_breakthrough' | 'clinical_trial' | 'research_paper' | 'community_symptom' | 'ai_correlation';
  category?: string;
  impact_level?: 'Breakthrough' | 'High' | 'Medium' | 'Low';
  credibility_score: number;
  credibility_factors?: any;
  primary_source?: string;
  source_urls?: string[];
  publication_date?: string;
  ai_analysis?: any;
  cross_references?: any[];
  discovered_at: string;
}

export const useDiscoveries = (filters?: {
  type?: string;
  impact?: string;
  minCredibility?: number;
}) => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('discoveries')
          .select('*')
          .order('credibility_score', { ascending: false })
          .order('discovered_at', { ascending: false });

        if (filters?.type && filters.type !== 'all') {
          query = query.eq('discovery_type', filters.type);
        }

        if (filters?.impact && filters.impact !== 'all') {
          query = query.eq('impact_level', filters.impact);
        }

        if (filters?.minCredibility) {
          query = query.gte('credibility_score', filters.minCredibility);
        }

        const { data, error: fetchError } = await query.limit(50);

        if (fetchError) throw fetchError;
        setDiscoveries((data || []) as Discovery[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch discoveries');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveries();
  }, [filters?.type, filters?.impact, filters?.minCredibility]);

  return { discoveries, loading, error };
};
