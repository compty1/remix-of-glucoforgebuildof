import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

export interface AdultPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  source_url: string | null;
  source_platform: string | null;
  author_username: string | null;
  comments_count: number | null;
  upvotes: number | null;
  tips: string[] | null;
  warnings: string[] | null;
  created_at: string | null;
  topic_tags: string[] | null;
  sentiment: string | null;
  confidence_score: number | null;
  post_type: string | null;
  is_featured: boolean | null;
  source_type: string | null;
}

export interface AdultSearchFilters {
  query: string;
  category: string;
  sentiment: string;
  sourceType: string;
  sortBy: 'upvotes' | 'date' | 'relevance';
  postType: string;
}

const defaultFilters: AdultSearchFilters = {
  query: '',
  category: 'all',
  sentiment: 'all',
  sourceType: 'all',
  sortBy: 'upvotes',
  postType: 'all',
};

export const useAdultContentSearch = (initialFilters?: Partial<AdultSearchFilters>) => {
  const [filters, setFilters] = useState<AdultSearchFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [page, setPage] = useState(0);
  const [accumulatedPosts, setAccumulatedPosts] = useState<AdultPost[]>([]);
  const pageSize = 20;

  const fetchPosts = async () => {
    let query = supabase
      .from('adult_content_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
    }

    if (filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.sentiment !== 'all') {
      query = query.eq('sentiment', filters.sentiment);
    }

    if (filters.sourceType !== 'all') {
      query = query.eq('source_type', filters.sourceType);
    }

    if (filters.postType !== 'all') {
      query = query.eq('post_type', filters.postType);
    }

    switch (filters.sortBy) {
      case 'upvotes':
        query = query.order('upvotes', { ascending: false, nullsFirst: false });
        break;
      case 'date':
        query = query.order('created_at', { ascending: false, nullsFirst: false });
        break;
      default:
        query = query.order('upvotes', { ascending: false, nullsFirst: false });
    }

    query = query.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      posts: (data || []) as AdultPost[],
      totalCount: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize,
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adult-content-search', filters, page],
    queryFn: fetchPosts,
    staleTime: 5 * 60 * 1000,
  });

  const updateFilters = useCallback((newFilters: Partial<AdultSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
    setAccumulatedPosts([]);
  }, []);

  const loadMore = useCallback(() => {
    if (data?.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isLoading]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(0);
    setAccumulatedPosts([]);
  }, []);

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
    } else if (page === 0) {
      setAccumulatedPosts([]);
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
  };
};

export const useFeaturedAdultContent = () => {
  return useQuery({
    queryKey: ['adult-content-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adult_content_posts')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('upvotes', { ascending: false })
        .limit(6);

      if (error) throw error;
      return (data || []) as AdultPost[];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useTrendingAdultTopics = () => {
  return useQuery({
    queryKey: ['adult-content-trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adult_content_posts')
        .select('*')
        .eq('is_published', true)
        .order('upvotes', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as AdultPost[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export interface AdultComment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_anonymous: string | null;
  content: string;
  score: number | null;
  created_at: string;
}

export const useAdultPostComments = (postId: string | null, limit: number = 5) => {
  return useQuery({
    queryKey: ['adult-content-comments', postId, limit],
    queryFn: async () => {
      if (!postId) return { comments: [], totalCount: 0, hasMore: false };

      const { data, error, count } = await supabase
        .from('adult_content_comments')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)
        .order('score', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;

      return {
        comments: (data || []) as AdultComment[],
        totalCount: count || 0,
        hasMore: (count || 0) > limit,
      };
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};
