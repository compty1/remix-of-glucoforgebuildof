import { useState, useEffect, useCallback, useRef } from 'react';
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
  minScore: 'all' | '50' | '100' | '200' | '500';
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
  minScore: 'all',
};

export const useCommunitySearch = (initialFilters?: Partial<SearchFilters>) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [page, setPage] = useState(0);
  const [accumulatedPosts, setAccumulatedPosts] = useState<CommunityPost[]>([]);
  const pageSize = 50; // Increased from 20 to show more posts

  const fetchPosts = async () => {
    let query = supabase
      .from('community_posts')
      .select('*', { count: 'exact' })
      .eq('post_type', 'post');

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

    // Apply minimum score filter
    if (filters.minScore !== 'all') {
      query = query.gte('score', parseInt(filters.minScore));
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
    setAccumulatedPosts([]); // Clear accumulated posts on filter change
  }, []);

  const loadMore = useCallback(() => {
    if (data?.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isLoading]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(0);
    setAccumulatedPosts([]); // Clear accumulated posts on reset
  }, []);

  // Accumulate posts as pages load
  useEffect(() => {
    if (data?.posts && data.posts.length > 0) {
      if (page === 0) {
        setAccumulatedPosts(data.posts);
      } else {
        setAccumulatedPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
    }
  }, [data?.posts, page]);

  return {
    posts: accumulatedPosts,
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    isLoadingMore: isLoading && page > 0,
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
        .eq('post_type', 'post')
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

// Hook for fetching a single post by post_id
export const useSinglePost = (postId: string | null) => {
  return useQuery({
    queryKey: ['community-post', postId],
    queryFn: async () => {
      if (!postId) return null;
      
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('post_id', postId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        sentiment: data.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: data.topic_tags || [],
      } as CommunityPost;
    },
    enabled: !!postId,
  });
};

// Hook for fetching comments/replies for a specific post
// Supports both the community_posts table (parent_post_id approach) and community_comments table
// Returns { comments, totalCount, hasMore } with pagination support
export const usePostComments = (postId: string | null, limit: number = 10) => {
  return useQuery({
    queryKey: ['post-comments', postId, limit],
    queryFn: async () => {
      if (!postId) return { comments: [] as CommunityPost[], totalCount: 0, hasMore: false };

      // Step 1: Resolve the post's UUID from the string post_id
      const { data: postData } = await supabase
        .from('community_posts')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle();

      // Step 2: Query community_posts children (parent_post_id = string post_id)
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('parent_post_id', postId)
        .order('score', { ascending: false, nullsFirst: false })
        .limit(100);

      if (postsError) throw postsError;

      // Step 3: Query community_comments using the resolved UUID
      let commentsData: any[] = [];
      if (postData?.id) {
        const { data } = await supabase
          .from('community_comments')
          .select('*')
          .eq('post_id', postData.id)
          .order('score', { ascending: false, nullsFirst: false })
          .limit(100);
        commentsData = data || [];
      }

      // Map community_comments to CommunityPost format
      const mappedComments = commentsData.map(comment => ({
        id: comment.id,
        source: 'community',
        post_id: comment.id,
        title: 'Comment',
        content: comment.content,
        author_anonymous: comment.author_anonymous,
        score: comment.score,
        num_comments: 0,
        device_mentioned: null,
        sentiment: null as 'positive' | 'neutral' | 'negative' | null,
        published_at: comment.created_at,
        fetched_at: comment.created_at,
        topic_tags: [] as string[],
        is_solution: false,
        post_type: 'comment',
        parent_post_id: postId,
        url: null,
      }));

      const mappedPosts = (postsData || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];

      // Combine, deduplicate by id, sort by score
      const seen = new Set<string>();
      const allComments = [...mappedPosts, ...mappedComments]
        .filter(c => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      const totalCount = allComments.length;
      const limitedComments = allComments.slice(0, limit);

      return {
        comments: limitedComments,
        totalCount,
        hasMore: totalCount > limit,
      };
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};
