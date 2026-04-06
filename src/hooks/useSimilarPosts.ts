import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommunityPost } from './useCommunitySearch';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

interface UseSimilarPostsOptions {
  currentPostId: string;
  topicTags: string[] | null;
  deviceMentioned: string | null;
  limit?: number;
}

export const useSimilarPosts = ({
  currentPostId,
  topicTags,
  deviceMentioned,
  limit = 5,
}: UseSimilarPostsOptions) => {
  return useQuery({
    queryKey: ['similar-posts', currentPostId, topicTags, deviceMentioned],
    queryFn: async () => {
      // Build OR conditions for matching
      const conditions: string[] = [];
      
      // Match by device
      if (deviceMentioned) {
        conditions.push(`device_mentioned.eq.${sanitizeForIlike(deviceMentioned)}`);
      }
      
      // Match by topic tags (overlap)
      if (topicTags && topicTags.length > 0) {
        conditions.push(`topic_tags.ov.{${topicTags.join(',')}}`);
      }

      // If no conditions, return empty
      if (conditions.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .neq('id', currentPostId)
        .neq('post_type', 'reply')
        .or(conditions.join(','))
        .order('score', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];
    },
    enabled: !!currentPostId && (!!deviceMentioned || (topicTags && topicTags.length > 0)),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
