import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  author: string | null;
  published_at: string | null;
  category: string;
  relevance_score: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface UseT1DNewsResult {
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshNews: () => Promise<void>;
  getCategoryCounts: () => Record<string, number>;
}

export const useT1DNews = (): UseT1DNewsResult => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: allArticles = [], isLoading, error: rawError } = useQuery({
    queryKey: ['t1d-news'],
    queryFn: async (): Promise<NewsArticle[]> => {
      const { data, error } = await supabase
        .from('t1d_news_articles')
        .select('id, title, description, url, image_url, source_name, source_url, author, published_at, category, relevance_score, is_featured, created_at, updated_at, content')
        .order('published_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || [])
        .filter((article): article is NewsArticle =>
          article !== null &&
          typeof article.id === 'string' &&
          typeof article.title === 'string'
        )
        .map(article => ({
          ...article,
          description: article.description || 'No description available',
          category: article.category || 'general',
          source_name: article.source_name || 'Unknown Source',
          relevance_score: article.relevance_score ?? 0,
          is_featured: article.is_featured ?? false,
        }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const refreshNews = useCallback(async () => {
    setRefreshing(true);
    try {
      const { error: funcError } = await supabase.functions.invoke('fetch-t1d-news');
      if (funcError) throw funcError;
      await queryClient.invalidateQueries({ queryKey: ['t1d-news'] });
    } catch {
      // Fallback: just invalidate to show DB data
      await queryClient.invalidateQueries({ queryKey: ['t1d-news'] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  const featuredArticles = useMemo(() => filteredArticles.filter(a => a.is_featured), [filteredArticles]);
  const regularArticles = useMemo(() => filteredArticles.filter(a => !a.is_featured), [filteredArticles]);

  const getCategoryCounts = useCallback(() => {
    const counts: Record<string, number> = { all: allArticles.length };
    allArticles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    return counts;
  }, [allArticles]);

  return {
    articles: regularArticles,
    featuredArticles,
    loading: isLoading,
    refreshing,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch news') : null,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshNews,
    getCategoryCounts,
  };
};
