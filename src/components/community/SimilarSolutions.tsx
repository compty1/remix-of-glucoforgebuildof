import React from 'react';
import { ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimilarPosts } from '@/hooks/useSimilarPosts';
import type { CommunityPost } from '@/hooks/useCommunitySearch';

interface SimilarSolutionsProps {
  post: CommunityPost;
  onPostClick?: (post: CommunityPost) => void;
}

export const SimilarSolutions: React.FC<SimilarSolutionsProps> = ({ post, onPostClick }) => {
  const { data: similarPosts = [], isLoading } = useSimilarPosts({
    currentPostId: post.id,
    topicTags: post.topic_tags,
    deviceMentioned: post.device_mentioned,
    limit: 4,
  });

  if (isLoading) {
    return (
      <div className="pt-3 border-t mt-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Similar Solutions</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-48 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (similarPosts.length === 0) {
    return null;
  }

  return (
    <div className="pt-3 border-t mt-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">Similar Solutions</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {similarPosts.map((similar) => (
          <div
            key={similar.id}
            className="flex-shrink-0 w-48 p-2 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onPostClick?.(similar)}
          >
            <div className="flex items-center gap-1 mb-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {similar.source}
              </Badge>
              {similar.device_mentioned && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {similar.device_mentioned}
                </Badge>
              )}
            </div>
            <p className="text-xs font-medium line-clamp-2 mb-1">{similar.title}</p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <ThumbsUp className="h-2.5 w-2.5" />
                {similar.score || 0}
              </span>
              <span className="flex items-center gap-0.5">
                <MessageSquare className="h-2.5 w-2.5" />
                {similar.num_comments || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
