import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch top papers for network visualization with all details
      const { data: papers, error: papersError } = await supabase
        .from('medical_research_papers')
        .select(`
          id, 
          title, 
          tldr_summary, 
          abstract,
          citation_count, 
          influential_citation_count, 
          source_database, 
          fields_of_study, 
          doi, 
          pdf_url,
          full_text_url,
          authors,
          publication_date,
          journal_name,
          open_access
        `)
        .gt('citation_count', 0)
        .order('influential_citation_count', { ascending: false, nullsFirst: false })
        .limit(100);

      if (papersError) throw new Error(papersError.message);

      // Fetch citation relationships
      const { data: citations, error: citationsError } = await supabase
        .from('paper_citations')
        .select('citing_paper_id, cited_paper_id, is_influential')
        .limit(500);

      if (citationsError) throw new Error(citationsError.message);

      // Transform papers to nodes with all details
      const paperNodes: NetworkNode[] = (papers || []).map(p => ({
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

      // Transform citations to links
      const paperIds = new Set(paperNodes.map(n => n.id));
      const citationLinks: NetworkLink[] = (citations || [])
        .filter(c => paperIds.has(c.citing_paper_id) && paperIds.has(c.cited_paper_id))
        .map(c => ({
          source: c.citing_paper_id,
          target: c.cited_paper_id,
          isInfluential: c.is_influential,
        }));

      setNodes(paperNodes);
      setLinks(citationLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch network data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCitationData = useCallback(async () => {
    try {
      // Call edge function to populate citation relationships
      const { error } = await supabase.functions.invoke('fetch-citation-network');
      if (error) {
        console.error('Error fetching citation data:', error);
      }
      // Refresh the local data
      await fetchPapers();
    } catch (err) {
      console.error('Error in fetchCitationData:', err);
    }
  }, [fetchPapers]);

  const refreshNetwork = useCallback(async () => {
    await fetchPapers();
  }, [fetchPapers]);

  const networkData = useMemo((): CitationNetworkData => ({
    nodes,
    links,
  }), [nodes, links]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  return {
    networkData,
    loading,
    error,
    refreshNetwork,
    fetchCitationData,
  };
};
