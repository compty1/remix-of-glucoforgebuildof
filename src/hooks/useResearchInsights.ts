import { useState, useEffect, useCallback, useMemo } from 'react';
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

export const useResearchInsights = (): UseResearchInsightsResult => {
  const [papers, setPapers] = useState<ResearchPaperWithTLDR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('medical_research_papers')
        .select('*')
        .order('influential_citation_count', { ascending: false, nullsFirst: false })
        .limit(500);

      if (dbError) throw new Error(dbError.message);
      
      setPapers((data || []) as ResearchPaperWithTLDR[]);
    } catch (err) {
      console.error('Error fetching research insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch research data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchPapers();
  }, [fetchPapers]);

  const papersWithTLDR = useMemo(() => {
    return papers.filter(p => p.tldr_summary && p.tldr_summary.trim().length > 0);
  }, [papers]);

  const topInfluentialPapers = useMemo(() => {
    return papers
      .filter(p => (p.influential_citation_count || 0) > 0)
      .sort((a, b) => (b.influential_citation_count || 0) - (a.influential_citation_count || 0))
      .slice(0, 20);
  }, [papers]);

  const stats = useMemo((): ResearchInsightsStats => {
    const totalCitations = papers.reduce((sum, p) => sum + (p.citation_count || 0), 0);
    const totalInfluentialCitations = papers.reduce((sum, p) => sum + (p.influential_citation_count || 0), 0);
    const openAccessCount = papers.filter(p => p.open_access).length;
    
    const relevanceScores = papers.filter(p => p.diabetes_relevance_score != null).map(p => p.diabetes_relevance_score!);
    const averageRelevanceScore = relevanceScores.length > 0 
      ? relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length 
      : 0;

    // Count fields of study
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

  const filterByField = useCallback((field: string) => {
    return papers.filter(p => 
      p.fields_of_study?.some(f => f.toLowerCase().includes(field.toLowerCase()))
    );
  }, [papers]);

  const filterByInfluentialThreshold = useCallback((minInfluential: number) => {
    return papers.filter(p => (p.influential_citation_count || 0) >= minInfluential);
  }, [papers]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  return {
    papers,
    papersWithTLDR,
    topInfluentialPapers,
    stats,
    loading,
    error,
    refreshData,
    filterByField,
    filterByInfluentialThreshold,
  };
};
