import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ResearchPaperWithTLDR {
  id: string;
  paper_id: string;
  title: string;
  abstract?: string;
  tldr_summary?: string;
  authors?: string[];
  journal_name?: string;
  publication_date?: string;
  doi?: string;
  citation_count?: number;
  influential_citation_count?: number;
  open_access?: boolean;
  pdf_url?: string;
  full_text_url?: string;
  source_database: string;
  diabetes_relevance_score?: number;
  fields_of_study?: string[];
  semantic_scholar_id?: string;
  created_at: string;
}

export interface ResearchInsightsStats {
  totalPapers: number;
  papersWithTLDR: number;
  totalCitations: number;
  totalInfluentialCitations: number;
  openAccessCount: number;
  averageRelevanceScore: number;
  topFieldsOfStudy: { field: string; count: number }[];
}

interface UseResearchInsightsResult {
  papers: ResearchPaperWithTLDR[];
  papersWithTLDR: ResearchPaperWithTLDR[];
  topInfluentialPapers: ResearchPaperWithTLDR[];
  stats: ResearchInsightsStats;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  filterByField: (field: string) => ResearchPaperWithTLDR[];
  filterByInfluentialThreshold: (minInfluential: number) => ResearchPaperWithTLDR[];
}

/**
 * Bug 220: Migrated from manual useState/useEffect to React Query.
 * Stats computed via useMemo from cached data.
 */
export const useResearchInsights = (): UseResearchInsightsResult => {
  const { data: papers = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['research-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_research_papers')
        .select('*')
        .order('influential_citation_count', { ascending: false, nullsFirst: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as ResearchPaperWithTLDR[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const refreshData = useCallback(async () => { await refetch(); }, [refetch]);

  const papersWithTLDR = useMemo(() =>
    papers.filter(p => p.tldr_summary && p.tldr_summary.trim().length > 0),
  [papers]);

  const topInfluentialPapers = useMemo(() =>
    papers
      .filter(p => (p.influential_citation_count || 0) > 0)
      .sort((a, b) => (b.influential_citation_count || 0) - (a.influential_citation_count || 0))
      .slice(0, 20),
  [papers]);

  const stats = useMemo((): ResearchInsightsStats => {
    const totalCitations = papers.reduce((sum, p) => sum + (p.citation_count || 0), 0);
    const totalInfluentialCitations = papers.reduce((sum, p) => sum + (p.influential_citation_count || 0), 0);
    const openAccessCount = papers.filter(p => p.open_access).length;
    const relevanceScores = papers.filter(p => p.diabetes_relevance_score != null).map(p => p.diabetes_relevance_score!);
    const averageRelevanceScore = relevanceScores.length > 0
      ? relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length
      : 0;

    const fieldCounts: Record<string, number> = {};
    papers.forEach(p => {
      (p.fields_of_study || []).forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });

    const topFieldsOfStudy = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalPapers: papers.length,
      papersWithTLDR: papersWithTLDR.length,
      totalCitations,
      totalInfluentialCitations,
      openAccessCount,
      averageRelevanceScore,
      topFieldsOfStudy,
    };
  }, [papers, papersWithTLDR]);

  const filterByField = useCallback((field: string) =>
    papers.filter(p => p.fields_of_study?.some(f => f.toLowerCase().includes(field.toLowerCase()))),
  [papers]);

  const filterByInfluentialThreshold = useCallback((minInfluential: number) =>
    papers.filter(p => (p.influential_citation_count || 0) >= minInfluential),
  [papers]);

  return {
    papers,
    papersWithTLDR,
    topInfluentialPapers,
    stats,
    loading,
    error: queryError ? String(queryError) : null,
    refreshData,
    filterByField,
    filterByInfluentialThreshold,
  };
};
