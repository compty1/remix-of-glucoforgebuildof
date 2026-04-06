import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkNode {
  id: string;
  title: string;
  tldr?: string;
  abstract?: string;
  citationCount: number;
  influentialCount: number;
  sourceDatabase: string;
  fieldsOfStudy: string[];
  doi?: string;
  pdfUrl?: string;
  fullTextUrl?: string;
  authors?: string[];
  publicationDate?: string;
  journalName?: string;
  openAccess: boolean;
}

export interface NetworkLink {
  source: string;
  target: string;
  isInfluential: boolean;
}

export interface CitationNetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface UseCitationNetworkResult {
  networkData: CitationNetworkData;
  loading: boolean;
  error: string | null;
  refreshNetwork: () => Promise<void>;
  fetchCitationData: () => Promise<void>;
}

export const useCitationNetwork = (): UseCitationNetworkResult => {
  const queryClient = useQueryClient();

  const { data, isLoading, error: rawError } = useQuery({
    queryKey: ['citation-network'],
    queryFn: async () => {
      const [papersRes, citationsRes] = await Promise.all([
        supabase
          .from('medical_research_papers')
          .select('id, title, tldr_summary, abstract, citation_count, influential_citation_count, source_database, fields_of_study, doi, pdf_url, full_text_url, authors, publication_date, journal_name, open_access')
          .gt('citation_count', 0)
          .order('influential_citation_count', { ascending: false, nullsFirst: false })
          .limit(100),
        supabase
          .from('paper_citations')
          .select('citing_paper_id, cited_paper_id, is_influential')
          .limit(500),
      ]);

      if (papersRes.error) throw new Error(papersRes.error.message);
      if (citationsRes.error) throw new Error(citationsRes.error.message);

      const nodes: NetworkNode[] = (papersRes.data || []).map(p => ({
        id: p.id,
        title: p.title,
        tldr: p.tldr_summary || undefined,
        abstract: p.abstract || undefined,
        citationCount: p.citation_count || 0,
        influentialCount: p.influential_citation_count || 0,
        sourceDatabase: p.source_database,
        fieldsOfStudy: p.fields_of_study || [],
        doi: p.doi || undefined,
        pdfUrl: p.pdf_url || undefined,
        fullTextUrl: p.full_text_url || undefined,
        authors: p.authors || undefined,
        publicationDate: p.publication_date || undefined,
        journalName: p.journal_name || undefined,
        openAccess: p.open_access || false,
      }));

      const paperIds = new Set(nodes.map(n => n.id));
      const links: NetworkLink[] = (citationsRes.data || [])
        .filter(c => paperIds.has(c.citing_paper_id) && paperIds.has(c.cited_paper_id))
        .map(c => ({ source: c.citing_paper_id, target: c.cited_paper_id, isInfluential: c.is_influential }));

      return { nodes, links };
    },
    staleTime: 15 * 60 * 1000,
  });

  const networkData = useMemo((): CitationNetworkData => data || { nodes: [], links: [] }, [data]);

  const refreshNetwork = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['citation-network'] });
  }, [queryClient]);

  const fetchCitationData = useCallback(async () => {
    try {
      await supabase.functions.invoke('fetch-citation-network');
    } catch {
      // Ignore citation network fetch errors
    }
    await queryClient.invalidateQueries({ queryKey: ['citation-network'] });
  }, [queryClient]);

  return {
    networkData,
    loading: isLoading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch network data') : null,
    refreshNetwork,
    fetchCitationData,
  };
};
