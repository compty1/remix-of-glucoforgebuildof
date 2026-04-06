import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

function parseConnection(conn: Record<string, unknown>): FoundConnection {
  return {
    id: conn.id as string,
    title: conn.title as string,
    description: conn.description as string,
    connection_type: conn.connection_type as ConnectionType,
    source_papers: (conn.source_papers as SourcePaper[] | null) || [],
    source_posts: (conn.source_posts as SourcePost[] | null) || [],
    source_trials: (conn.source_trials as SourceTrial[] | null) || [],
    source_fda_data: (conn.source_fda_data as unknown[] | null) || [],
    confidence_score: (conn.confidence_score as number) || 0,
    novelty_score: (conn.novelty_score as number) || 0,
    community_mentions: (conn.community_mentions as number) || 0,
    research_citations: (conn.research_citations as number) || 0,
    validation_status: (conn.validation_status as ValidationStatus) || 'hypothesis',
    cross_validation_count: (conn.cross_validation_count as number) || 0,
    biological_mechanism: conn.biological_mechanism as string | null,
    practical_implications: (conn.practical_implications as string[]) || [],
    keywords: (conn.keywords as string[]) || [],
    created_at: conn.created_at as string,
    updated_at: conn.updated_at as string,
  };
}

export const useFoundConnections = (): UseFoundConnectionsResult => {
  const [analyzing, setAnalyzing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConnectionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'novelty' | 'recent'>('confidence');
  const queryClient = useQueryClient();

  const { data: allConnections = [], isLoading, error: rawError } = useQuery({
    queryKey: ['found-connections'],
    queryFn: async (): Promise<FoundConnection[]> => {
      const { data, error } = await supabase
        .from('ai_found_connections')
        .select('*')
        .order('confidence_score', { ascending: false })
        .limit(200);

      if (error) throw new Error(error.message);
      return (data || []).map(conn => parseConnection(conn as Record<string, unknown>));
    },
    staleTime: 10 * 60 * 1000,
  });

  const triggerAnalysis = useCallback(async () => {
    try {
      setAnalyzing(true);
      const { error: fnError } = await supabase.functions.invoke('ai-connection-analyzer');
      if (fnError) throw new Error(fnError.message);
      await queryClient.invalidateQueries({ queryKey: ['found-connections'] });
    } finally {
      setAnalyzing(false);
    }
  }, [queryClient]);

  const connections = useMemo(() => {
    let filtered = allConnections;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.connection_type === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.keywords.some(k => k.toLowerCase().includes(query)) ||
        c.biological_mechanism?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'confidence': return b.confidence_score - a.confidence_score;
        case 'novelty': return b.novelty_score - a.novelty_score;
        case 'recent': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });
  }, [allConnections, activeFilter, searchQuery, sortBy]);

  const refreshConnections = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['found-connections'] });
  }, [queryClient]);

  return {
    connections,
    loading: isLoading,
    analyzing,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch connections') : null,
    filterByType: setActiveFilter,
    activeFilter,
    searchConnections: setSearchQuery,
    searchQuery,
    triggerAnalysis,
    refreshConnections,
    sortBy,
    setSortBy,
  };
};
