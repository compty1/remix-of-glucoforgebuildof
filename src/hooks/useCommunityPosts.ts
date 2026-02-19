import { useState, useEffect } from 'react';
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
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('community_posts')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(50);

        // Filter by device if specified
        if (deviceName) {
          const deviceKey = deviceName.toLowerCase().split(' ')[0]; // Extract "dexcom", "omnipod", etc.
          query = query.eq('device_mentioned', deviceKey);
        }

        const { data, error: postsError } = await query;

        if (postsError) throw postsError;

        setPosts((data || []).map(post => ({
          ...post,
          sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch community posts');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityPosts();
  }, [deviceName]);

  return { posts, loading, error };
};