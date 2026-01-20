import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ThumbsUp, MessageSquare, Sparkles } from 'lucide-react';
import { useSimilarPosts } from '@/hooks/useSimilarPosts';
import { formatDistanceToNow } from 'date-fns';

interface RelatedPostsProps {
  currentPostId: string;
  topicTags: string[] | null;
  deviceMentioned: string | null;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  currentPostId,
  topicTags,
  deviceMentioned,
}) => {
  const navigate = useNavigate();
  const { data: relatedPosts, isLoading } = useSimilarPosts({
    currentPostId,
    topicTags,
    deviceMentioned,
    limit: 6,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-64 flex-shrink-0" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  const getTimeAgo = (date: string | null) => {
    if (!date) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Related Solutions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Similar posts based on {deviceMentioned ? `device (${deviceMentioned})` : ''} 
          {deviceMentioned && topicTags && topicTags.length > 0 ? ' and ' : ''}
          {topicTags && topicTags.length > 0 ? 'topics' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {relatedPosts.map(post => (
              <Card
                key={post.id}
                className="w-72 flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/community-solutions/${post.post_id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {post.source}
                    </Badge>
                    {post.device_mentioned && (
                      <Badge variant="secondary" className="text-xs">
                        {post.device_mentioned}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2 whitespace-normal">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.score || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.num_comments || 0}
                    </span>
                    <span>{getTimeAgo(post.published_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
