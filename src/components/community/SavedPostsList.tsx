import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommunityPost } from '@/hooks/useCommunitySearch';
import { SolutionCard } from './SolutionCard';

interface SavedPostsListProps {
  onAskAI?: (post: CommunityPost) => void;
}

export const SavedPostsList: React.FC<SavedPostsListProps> = ({ onAskAI }) => {
  const { savedPosts, isLoading: isSavedLoading, unsavePost } = useSavedPosts();

  // Fetch full post data for saved posts
  const { data: fullPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['saved-posts-full', savedPosts.map(p => p.community_post_id)],
    queryFn: async () => {
      if (savedPosts.length === 0) return [];
      
      const ids = savedPosts
        .map(p => p.community_post_id)
        .filter(Boolean) as string[];
      
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .in('id', ids);

      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];
    },
    enabled: savedPosts.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isSavedLoading || isPostsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (fullPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Saved Posts</h3>
          <p className="text-muted-foreground">
            Save community posts to reference them later. Click the bookmark icon on any post to save it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Posts ({fullPosts.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fullPosts.map((post) => (
          <SolutionCard
            key={post.id}
            post={post}
            onAskAI={onAskAI}
            showSaveButton
          />
        ))}
      </div>
    </div>
  );
};
