import React from 'react';
import { TrendingUp, ThumbsUp, MessageSquare, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingSolutions, type CommunityPost } from '@/hooks/useCommunitySearch';
import { formatDistanceToNow } from 'date-fns';

interface TrendingSolutionsProps {
  onPostClick?: (post: CommunityPost) => void;
}

export const TrendingSolutions: React.FC<TrendingSolutionsProps> = ({ onPostClick }) => {
  const { data: trendingPosts, isLoading, error } = useTrendingSolutions(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !trendingPosts || trendingPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No trending posts yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingPosts.map((post, index) => (
          <div
            key={post.id}
            className="flex gap-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
            onClick={() => onPostClick?.(post)}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2 leading-tight">
                {post.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {post.score || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.num_comments || 0}
                </span>
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {post.source}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
