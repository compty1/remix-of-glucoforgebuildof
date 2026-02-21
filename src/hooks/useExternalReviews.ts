import { useQuery } from '@tanstack/react-query';
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

// Filter out scraped navigation/junk content from external reviews
const JUNK_MARKERS = [
  'skip to main content',
  'keyboard shortcuts',
  'save up to',
  'a-z list of drugs',
  'a-z list',
  'pill identifier',
  'page you were looking',
  'find treatment options',
  'the page you were looking could not be found',
  'skip to fda search',
  'skip to footer links',
  'skip to in this section',
  'in this section:',
  'drug interaction checker',
  'cookie policy',
  'sign up for',
  'advertisement',
  'check for [drug interactions]',
  'latest drug news',
  'start over on our',
  'complete sitemap',
  'home page](https://',
];

const isValidReviewContent = (content: string): boolean => {
  if (!content || content.length < 50) return false;
  const lower = content.substring(0, 500).toLowerCase();
  return !JUNK_MARKERS.some(marker => lower.includes(marker));
};

const computeStats = (reviews: ExternalReview[]): ExternalReviewStats => {
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;
  const sourceCounts = reviews.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sources = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));
  return { total: reviews.length, positive, neutral, negative, sources };
};

const EMPTY_STATS: ExternalReviewStats = { total: 0, positive: 0, neutral: 0, negative: 0, sources: [] };

export const useExternalReviews = (deviceId: string | undefined) => {
  const query = useQuery({
    queryKey: ['external-reviews', deviceId],
    staleTime: 10 * 60 * 1000, // 10 minutes — external reviews don't change often
    queryFn: async (): Promise<ExternalReview[]> => {
      if (!deviceId) return [];
      const { data, error } = await supabase
        .from('external_device_reviews')
        .select('*')
        .eq('device_id', deviceId)
        .order('helpful_count', { ascending: false });
      if (error) throw error;
      // Filter out scraped navigation/junk content (Issue #2)
      return ((data || []) as ExternalReview[]).filter(r => isValidReviewContent(r.content));
    },
    enabled: !!deviceId,
  });

  const reviews = query.data || [];
  const stats = query.data ? computeStats(query.data) : EMPTY_STATS;

  const filterBySource = (source: string) => {
    if (source === 'all') return reviews;
    return reviews.filter(r => r.source === source);
  };

  const filterBySentiment = (sentiment: string) => {
    if (sentiment === 'all') return reviews;
    return reviews.filter(r => r.sentiment === sentiment);
  };

  return {
    reviews,
    stats,
    loading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refresh: query.refetch,
    filterBySource,
    filterBySentiment,
  };
};
