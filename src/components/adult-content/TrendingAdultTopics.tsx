import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ThumbsUp, MessageSquare } from 'lucide-react';
import { useTrendingAdultTopics, type AdultPost } from '@/hooks/useAdultContentSearch';

interface TrendingAdultTopicsProps {
  onPostClick?: (post: AdultPost) => void;
}

export const TrendingAdultTopics: React.FC<TrendingAdultTopicsProps> = ({ onPostClick }) => {
  const { data: posts, isLoading } = useTrendingAdultTopics();

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Discussions
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : (
            posts?.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onPostClick?.(post)}
              >
                <p className="text-sm font-medium line-clamp-2 mb-1">{post.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {post.upvotes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {post.comments_count || 0}
                  </span>
                  {post.source_platform && (
                    <Badge variant="outline" className="text-[10px] h-4">{post.source_platform}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
