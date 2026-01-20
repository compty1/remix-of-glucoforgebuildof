import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionType = 'food' | 'biology' | 'device' | 'chemical' | 'environmental' | 'symptom' | 'treatment';
export type ValidationStatus = 'confirmed' | 'emerging' | 'hypothesis';

export interface SourcePaper {
  paper_id: string;
  title: string;
  relevance: string;
}

export interface SourcePost {
  post_id: string;
  title: string;
  source: string;
}

export interface SourceTrial {
  trial_id: string;
  title: string;
  phase: string;
}

export interface FoundConnection {
  id: string;
  title: string;
  description: string;
  connection_type: ConnectionType;
  source_papers: SourcePaper[];
  source_posts: SourcePost[];
  source_trials: SourceTrial[];
  source_fda_data: unknown[];
  confidence_score: number;
  novelty_score: number;
  community_mentions: number;
  research_citations: number;
  validation_status: ValidationStatus;
  cross_validation_count: number;
  biological_mechanism: string | null;
  practical_implications: string[];
  keywords: string[];
  created_at: string;
  updated_at: string;
}

interface UseFoundConnectionsResult {
  connections: FoundConnection[];
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  filterByType: (type: ConnectionType | 'all') => void;
  activeFilter: ConnectionType | 'all';
  searchConnections: (query: string) => void;
  searchQuery: string;
  triggerAnalysis: () => Promise<void>;
  refreshConnections: () => Promise<void>;
  sortBy: 'confidence' | 'novelty' | 'recent';
  setSortBy: (sort: 'confidence' | 'novelty' | 'recent') => void;
}

export const useFoundConnections = (): UseFoundConnectionsResult => {
  const [allConnections, setAllConnections] = useState<FoundConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ConnectionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'novelty' | 'recent'>('confidence');

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('ai_found_connections')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (dbError) throw new Error(dbError.message);

      const parsed = (data || []).map((conn): FoundConnection => ({
        id: conn.id,
        title: conn.title,
        description: conn.description,
        connection_type: conn.connection_type as ConnectionType,
        source_papers: (conn.source_papers as SourcePaper[]) || [],
        source_posts: (conn.source_posts as SourcePost[]) || [],
        source_trials: (conn.source_trials as SourceTrial[]) || [],
        source_fda_data: (conn.source_fda_data as unknown[]) || [],
        confidence_score: conn.confidence_score || 0,
        novelty_score: conn.novelty_score || 0,
        community_mentions: conn.community_mentions || 0,
        research_citations: conn.research_citations || 0,
        validation_status: (conn.validation_status as ValidationStatus) || 'hypothesis',
        cross_validation_count: conn.cross_validation_count || 0,
        biological_mechanism: conn.biological_mechanism,
        practical_implications: conn.practical_implications || [],
        keywords: conn.keywords || [],
        created_at: conn.created_at,
        updated_at: conn.updated_at,
      }));

      setAllConnections(parsed);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerAnalysis = useCallback(async () => {
    try {
      setAnalyzing(true);
      setError(null);

      const { error: fnError } = await supabase.functions.invoke('ai-connection-analyzer');

      if (fnError) throw new Error(fnError.message);

      // Refresh data after analysis
      await fetchConnections();
    } catch (err) {
      console.error('Error triggering analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze connections');
    } finally {
      setAnalyzing(false);
    }
  }, [fetchConnections]);

  const filterByType = useCallback((type: ConnectionType | 'all') => {
    setActiveFilter(type);
  }, []);

  const searchConnections = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const connections = useMemo(() => {
    let filtered = allConnections;

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.connection_type === activeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.keywords.some(k => k.toLowerCase().includes(query)) ||
        c.biological_mechanism?.toLowerCase().includes(query)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence_score - a.confidence_score;
        case 'novelty':
          return b.novelty_score - a.novelty_score;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [allConnections, activeFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    loading,
    analyzing,
    error,
    filterByType,
    activeFilter,
    searchConnections,
    searchQuery,
    triggerAnalysis,
    refreshConnections: fetchConnections,
    sortBy,
    setSortBy,
  };
};
