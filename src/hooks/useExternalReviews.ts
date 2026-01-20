import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExternalReview {
  id: string;
  device_id: string;
  source: string;
  external_id: string;
  author_anonymous: string | null;
  rating: number | null;
  title: string | null;
  content: string;
  sentiment: string | null;
  helpful_count: number;
  published_at: string | null;
  source_url: string | null;
  device_mentioned: string | null;
  verified_purchase: boolean;
  subreddit: string | null;
  fetched_at: string;
  created_at: string;
}

export interface ExternalReviewStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  sources: { source: string; count: number }[];
}

export const useExternalReviews = (deviceId: string | undefined) => {
  const [reviews, setReviews] = useState<ExternalReview[]>([]);
  const [stats, setStats] = useState<ExternalReviewStats>({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    sources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!deviceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('external_device_reviews')
        .select('*')
        .eq('device_id', deviceId)
        .order('helpful_count', { ascending: false });

      if (fetchError) throw fetchError;

      const reviewData = data || [];
      setReviews(reviewData);

      // Calculate stats
      const positive = reviewData.filter(r => r.sentiment === 'positive').length;
      const neutral = reviewData.filter(r => r.sentiment === 'neutral').length;
      const negative = reviewData.filter(r => r.sentiment === 'negative').length;

      // Group by source
      const sourceCounts = reviewData.reduce((acc, review) => {
        const source = review.source;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sources = Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count
      }));

      setStats({
        total: reviewData.length,
        positive,
        neutral,
        negative,
        sources
      });
    } catch (err) {
      console.error('Error fetching external reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filterBySource = useCallback((source: string) => {
    if (source === 'all') return reviews;
    return reviews.filter(r => r.source === source);
  }, [reviews]);

  const filterBySentiment = useCallback((sentiment: string) => {
    if (sentiment === 'all') return reviews;
    return reviews.filter(r => r.sentiment === sentiment);
  }, [reviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    refresh: fetchReviews,
    filterBySource,
    filterBySentiment
  };
};