import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommunityPost } from '@/hooks/useDeviceDetails';
import { 
  MessageSquare, 
  ThumbsUp, 
  ExternalLink,
  Filter,
  Clock,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { format } from 'date-fns';

interface DeviceReviewsTabProps {
  posts: CommunityPost[];
  reviewStats: {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  };
}

export const DeviceReviewsTab: React.FC<DeviceReviewsTabProps> = ({ 
  posts, 
  reviewStats 
}) => {
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredPosts = posts.filter(post => 
    sentimentFilter === 'all' || post.sentiment === sentimentFilter
  );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-success" />;
      case 'negative': return <Frown className="h-4 w-4 text-destructive" />;
      default: return <Meh className="h-4 w-4 text-warning" />;
    }
  };

  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-success/10 text-success border-success/20">Positive</Badge>;
      case 'negative':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Negative</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Neutral</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      'reddit': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'twitter': 'bg-blue-400/10 text-blue-500 border-blue-400/20',
      'facebook': 'bg-blue-600/10 text-blue-700 border-blue-600/20'
    };
    return colors[source.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Sentiment Stats */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review Sentiment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <Smile className="h-6 w-6 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">{reviewStats.positive}</div>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <Meh className="h-6 w-6 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-warning">{reviewStats.neutral}</div>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <Frown className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">{reviewStats.negative}</div>
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mr-2">Filter by sentiment:</span>
        <Button
          variant={sentimentFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSentimentFilter('all')}
        >
          All ({reviewStats.total})
        </Button>
        <Button
          variant={sentimentFilter === 'positive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSentimentFilter('positive')}
        >
          <Smile className="h-4 w-4 mr-1" />
          Positive ({reviewStats.positive})
        </Button>
        <Button
          variant={sentimentFilter === 'neutral' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSentimentFilter('neutral')}
        >
          <Meh className="h-4 w-4 mr-1" />
          Neutral ({reviewStats.neutral})
        </Button>
        <Button
          variant={sentimentFilter === 'negative' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSentimentFilter('negative')}
        >
          <Frown className="h-4 w-4 mr-1" />
          Negative ({reviewStats.negative})
        </Button>
      </div>

      {/* Reviews List */}
      {visiblePosts.length > 0 ? (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <Card key={post.id} className="command-center-widget">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getSourceBadge(post.source)}>
                      {post.source}
                    </Badge>
                    {getSentimentBadge(post.sentiment)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.published_at 
                      ? format(new Date(post.published_at), 'MMM d, yyyy')
                      : 'Unknown date'
                    }
                  </div>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                
                {post.content && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {post.content}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {post.score !== null && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {post.score}
                      </span>
                    )}
                    {post.num_comments !== null && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.num_comments} comments
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length > visibleCount && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setVisibleCount(prev => prev + 10)}
              >
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
            <p className="text-muted-foreground">
              {sentimentFilter === 'all' 
                ? 'No community reviews available for this device yet.'
                : `No ${sentimentFilter} reviews found.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
