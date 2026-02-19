import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MedicalResearchPaper {
  id: string;
  paper_id: string;
  title: string;
  abstract?: string;
  authors?: string[];
  journal_name?: string;
  publication_date?: string;
  doi?: string;
  pmid?: string;
  pmc_id?: string;
  europe_pmc_id?: string;
  study_type?: string;
  keywords?: string[];
  mesh_terms?: string[];
  citation_count?: number;
  impact_factor?: number;
  open_access?: boolean;
  pdf_url?: string;
  full_text_url?: string;
  source_database: string;
  diabetes_relevance_score?: number;
  device_mentions?: string[];
  drug_mentions?: string[];
  raw_data?: any;
  created_at: string;
  updated_at: string;
  // T1D classification fields
  is_type1_relevant?: boolean;
  diabetes_type?: 'type1' | 'type2' | 'general' | 'gestational';
  classification_confidence?: number;
}

interface UseMedicalResearchPapersResult {
  data: MedicalResearchPaper[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getByRelevanceScore: (minScore: number) => MedicalResearchPaper[];
  getByJournal: (journal: string) => MedicalResearchPaper[];
  getByDeviceMentions: (device: string) => MedicalResearchPaper[];
  getOpenAccess: () => MedicalResearchPaper[];
  getType1Only: () => MedicalResearchPaper[];
}

interface UseMedicalResearchPapersOptions {
  minRelevanceScore?: number;
  type1Only?: boolean;
}

export const useMedicalResearchPapers = (options?: UseMedicalResearchPapersOptions): UseMedicalResearchPapersResult => {
  const { minRelevanceScore, type1Only = true } = options || {};
  const [data, setData] = useState<MedicalResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchPapers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get existing data from the database
      let query = supabase
        .from('medical_research_papers')
        .select('*')
        .order('publication_date', { ascending: false });

      if (minRelevanceScore) {
        query = query.gte('diabetes_relevance_score', minRelevanceScore);
      }

      // Filter for Type 1 diabetes relevant papers by default
      if (type1Only) {
        query = query.eq('is_type1_relevant', true);
      }

      const { data: existingData, error: dbError } = await query.limit(100);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (existingData && existingData.length > 0) {
        setData(existingData as MedicalResearchPaper[]);
        setLoading(false);
      }

      // Then fetch fresh data from the edge function in the background
      const { error: functionError } = await supabase.functions.invoke('medical-research-aggregator');

      if (functionError) {
        // Edge function error — use cached data if available
        if (!existingData || existingData.length === 0) {
          throw new Error(`Failed to fetch research papers: ${functionError.message}`);
        }
      } else {
        // Re-query DB to get canonical data after edge function updates
        let refreshQuery = supabase
          .from('medical_research_papers')
          .select('*')
          .order('publication_date', { ascending: false });
        if (minRelevanceScore) {
          refreshQuery = refreshQuery.gte('diabetes_relevance_score', minRelevanceScore);
        }
        if (type1Only) {
          refreshQuery = refreshQuery.eq('is_type1_relevant', true);
        }
        const { data: refreshedData } = await refreshQuery.limit(100);
        if (refreshedData && refreshedData.length > 0) {
          setData(refreshedData as MedicalResearchPaper[]);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research papers');
    } finally {
      setLoading(false);
    }
  }, [minRelevanceScore, type1Only]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchResearchPapers();
  }, [fetchResearchPapers]);

  const getByRelevanceScore = useCallback((minScore: number) => {
    return data.filter(paper => (paper.diabetes_relevance_score || 0) >= minScore);
  }, [data]);

  const getByJournal = useCallback((journal: string) => {
    return data.filter(paper => 
      paper.journal_name?.toLowerCase().includes(journal.toLowerCase())
    );
  }, [data]);

  const getByDeviceMentions = useCallback((device: string) => {
    return data.filter(paper => 
      paper.device_mentions?.some(mention => 
        mention.toLowerCase().includes(device.toLowerCase())
      )
    );
  }, [data]);

  const getOpenAccess = useCallback(() => {
    return data.filter(paper => paper.open_access === true);
  }, [data]);

  const getType1Only = useCallback(() => {
    return data.filter(paper => paper.is_type1_relevant === true);
  }, [data]);

  useEffect(() => {
    fetchResearchPapers();
  }, [fetchResearchPapers]);

  return {
    data,
    loading,
    error,
    refreshData,
    getByRelevanceScore,
    getByJournal,
    getByDeviceMentions,
    getOpenAccess,
    getType1Only,
  };
};