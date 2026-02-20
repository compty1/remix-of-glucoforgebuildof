import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes - news refreshes more often
let newsCache: { data: any[]; fetchedAt: number } | null = null;

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
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNewsFromDB = useCallback(async () => {
    const now = Date.now();
    if (newsCache && now - newsCache.fetchedAt < STALE_TIME_MS && newsCache.data.length > 0) {
      setAllArticles(newsCache.data as NewsArticle[]);
      return;
    }
    try {
      const { data, error: dbError } = await supabase
        .from('t1d_news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(100);

      if (dbError) throw dbError;

      // Defensive coding: filter and map with null checks
      const validArticles = (data || [])
        .filter((article): article is NewsArticle => 
          article !== null && 
          typeof article.id === 'string' && 
          typeof article.title === 'string'
        )
        .map(article => ({
          ...article,
          description: article.description || 'No description available',
          image_url: article.image_url || null,
          category: article.category || 'general',
          source_name: article.source_name || 'Unknown Source',
          relevance_score: article.relevance_score ?? 0,
          is_featured: article.is_featured ?? false
        }));

      newsCache = { data: validArticles, fetchedAt: Date.now() };
      setAllArticles(validArticles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    }
  }, []);

  const refreshNews = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('fetch-t1d-news');

      if (funcError) {
        throw funcError;
      }

      if (data?.data) {
        setAllArticles(data.data);
      } else {
        await fetchNewsFromDB();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh news');
      // Try to load from DB as fallback
      await fetchNewsFromDB();
    } finally {
      setRefreshing(false);
    }
  }, [fetchNewsFromDB]);

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      await fetchNewsFromDB();
      setLoading(false);
    };

    loadNews();
  }, [fetchNewsFromDB]);

  const filteredArticles = allArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);
  const regularArticles = filteredArticles.filter(article => !article.is_featured);

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
    loading,
    refreshing,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    refreshNews,
    getCategoryCounts,
  };
};
