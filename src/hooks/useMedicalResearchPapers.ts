import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  raw_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
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
  const queryClient = useQueryClient();

  const { data = [], isLoading, error: rawError } = useQuery({
    queryKey: ['medical-research-papers', minRelevanceScore, type1Only],
    queryFn: async (): Promise<MedicalResearchPaper[]> => {
      let query = supabase
        .from('medical_research_papers')
        .select('id, paper_id, title, abstract, authors, journal_name, publication_date, doi, pmid, pmc_id, europe_pmc_id, study_type, keywords, mesh_terms, citation_count, impact_factor, open_access, pdf_url, full_text_url, source_database, diabetes_relevance_score, device_mentions, drug_mentions, created_at, updated_at, is_type1_relevant, diabetes_type, classification_confidence')
        .order('publication_date', { ascending: false });

      if (minRelevanceScore) query = query.gte('diabetes_relevance_score', minRelevanceScore);
      if (type1Only) query = query.eq('is_type1_relevant', true);

      const { data, error } = await query.limit(100);
      if (error) throw new Error(`Database error: ${error.message}`);
      return (data || []) as MedicalResearchPaper[];
    },
    staleTime: 15 * 60 * 1000,
  });

  const refreshData = useCallback(async () => {
    const { error: functionError } = await supabase.functions.invoke('medical-research-aggregator');
    if (functionError) throw new Error(`Failed to fetch research papers: ${functionError.message}`);
    await queryClient.invalidateQueries({ queryKey: ['medical-research-papers'] });
  }, [queryClient]);

  const getByRelevanceScore = useCallback((minScore: number) =>
    data.filter(p => (p.diabetes_relevance_score || 0) >= minScore), [data]);
  const getByJournal = useCallback((journal: string) =>
    data.filter(p => p.journal_name?.toLowerCase().includes(journal.toLowerCase())), [data]);
  const getByDeviceMentions = useCallback((device: string) =>
    data.filter(p => p.device_mentions?.some(m => m.toLowerCase().includes(device.toLowerCase()))), [data]);
  const getOpenAccess = useCallback(() => data.filter(p => p.open_access === true), [data]);
  const getType1Only = useCallback(() => data.filter(p => p.is_type1_relevant === true), [data]);

  return { data, loading: isLoading, error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch research papers') : null, refreshData, getByRelevanceScore, getByJournal, getByDeviceMentions, getOpenAccess, getType1Only };
};
