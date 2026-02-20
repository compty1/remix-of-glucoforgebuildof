import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityPost {
  id: string;
  source: string;
  post_id: string;
  title: string;
  content: string | null;
  author_anonymous: string;
  score: number;
  num_comments: number;
  device_mentioned: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  published_at: string;
  fetched_at: string;
  url: string | null;
  topic_tags: string[] | null;
}

export const useCommunityPosts = (deviceName?: string) => {
  const { data: posts = [], isLoading: loading, error: rawError } = useQuery({
    queryKey: ['community-posts', deviceName],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(50);

      if (deviceName) {
        const deviceKey = deviceName.toLowerCase().split(' ')[0];
        query = query.eq('device_mentioned', deviceKey);
      }

      const { data, error: postsError } = await query;
      if (postsError) throw postsError;

      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch community posts') : null;
  return { posts, loading, error };
};
