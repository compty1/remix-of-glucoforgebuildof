import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityPost {
  id: string;
  source: string;
  post_id: string;
  title: string;
  content: string | null;
  author_anonymous: string | null;
  score: number | null;
  num_comments: number | null;
  device_mentioned: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  published_at: string | null;
  fetched_at: string;
  topic_tags: string[] | null;
  is_solution: boolean | null;
  post_type: string | null;
  parent_post_id: string | null;
  url: string | null;
}

export interface SearchFilters {
  query: string;
  sources: string[];
  topics: string[];
  devices: string[];
  sentiment: 'all' | 'positive' | 'neutral' | 'negative';
  timeRange: 'all' | 'day' | 'week' | 'month';
  hasSolutions: boolean;
  sortBy: 'relevance' | 'score' | 'date';
}

const defaultFilters: SearchFilters = {
  query: '',
  sources: [],
  topics: [],
  devices: [],
  sentiment: 'all',
  timeRange: 'all',
  hasSolutions: false,
  sortBy: 'score',
};

export const useCommunitySearch = (initialFilters?: Partial<SearchFilters>) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchPosts = async () => {
    let query = supabase
      .from('community_posts')
      .select('*', { count: 'exact' });

    // Apply text search if query exists
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
    }

    // Apply source filter
    if (filters.sources.length > 0) {
      query = query.in('source', filters.sources);
    }

    // Apply device filter
    if (filters.devices.length > 0) {
      query = query.in('device_mentioned', filters.devices);
    }

    // Apply sentiment filter
    if (filters.sentiment !== 'all') {
      query = query.eq('sentiment', filters.sentiment);
    }

    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('published_at', startDate.toISOString());
    }

    // Apply solution filter
    if (filters.hasSolutions) {
      query = query.eq('is_solution', true);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'score':
        query = query.order('score', { ascending: false, nullsFirst: false });
        break;
      case 'date':
        query = query.order('published_at', { ascending: false, nullsFirst: false });
        break;
      case 'relevance':
      default:
        query = query.order('score', { ascending: false, nullsFirst: false });
        break;
    }

    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      posts: (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
        is_solution: post.is_solution || false,
        post_type: post.post_type || 'post',
      })) as CommunityPost[],
      totalCount: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize,
    };
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['community-search', filters, page],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset pagination when filters change
  }, []);

  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(0);
  }, []);

  return {
    posts: data?.posts || [],
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error: error?.message || null,
    filters,
    updateFilters,
    loadMore,
    resetFilters,
    refetch,
    page,
    setPage,
  };
};

// Hook for fetching trending solutions
export const useTrendingSolutions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['trending-solutions', limit],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .gte('published_at', oneDayAgo)
        .order('score', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for fetching available sources
export const useAvailableSources = () => {
  return useQuery({
    queryKey: ['community-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('source')
        .limit(1000);

      if (error) throw error;

      const sources = [...new Set((data || []).map(p => p.source))];
      return sources.sort();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for triggering data refresh
export const useRefreshCommunityData = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      // First try to fetch live data from Reddit
      const { data, error } = await supabase.functions.invoke('community-feed');
      
      // Check if we got any posts
      const insertedCount = data?.inserted || 0;
      
      // If Reddit fetch failed or returned no posts, seed with curated data
      if (error || insertedCount === 0) {
        console.log('Reddit fetch failed or empty, seeding curated data...');
        const { data: seedData, error: seedError } = await supabase.functions.invoke('seed-community-posts');
        
        if (seedError) throw seedError;
        return seedData;
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh data';
      setRefreshError(message);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    triggerRefresh,
    isRefreshing,
    refreshError,
  };
};

// Hook for fetching comments/replies for a specific post
export const usePostComments = (postId: string | null) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('parent_post_id', postId)
        .order('score', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};
