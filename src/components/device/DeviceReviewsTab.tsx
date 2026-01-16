import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommunityPost } from '@/hooks/useDeviceDetails';
import { useDeviceReviews } from '@/hooks/useDeviceReviews';
import { UserReviewsList } from './UserReviewsList';
import { 
  MessageSquare, 
  ThumbsUp, 
  Filter,
  Clock,
  Smile,
  Meh,
  Frown,
  Users,
  Star
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
  deviceId?: string;
}

export const DeviceReviewsTab: React.FC<DeviceReviewsTabProps> = ({ 
  posts, 
  reviewStats,
  deviceId
}) => {
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeSection, setActiveSection] = useState<'user' | 'community'>('user');

  const {
    reviews,
    stats: userReviewStats,
    loading: reviewsLoading,
    userReview,
    submitReview,
    updateReview,
    deleteReview,
    toggleHelpful
  } = useDeviceReviews(deviceId);

  const filteredPosts = posts.filter(post => 
    sentimentFilter === 'all' || post.sentiment === sentimentFilter
  );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

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
      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as 'user' | 'community')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            User Reviews ({userReviewStats.totalReviews})
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community Buzz ({reviewStats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6">
          <UserReviewsList
            reviews={reviews}
            stats={userReviewStats}
            loading={reviewsLoading}
            userReview={userReview}
            onSubmitReview={submitReview}
            onUpdateReview={updateReview}
            onDeleteReview={deleteReview}
            onToggleHelpful={toggleHelpful}
          />
        </TabsContent>

        <TabsContent value="community" className="mt-6 space-y-6">
          {/* Sentiment Stats */}
          <Card className="command-center-widget">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Sentiment Overview
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
            <span className="text-sm text-muted-foreground mr-2">Filter:</span>
            {(['all', 'positive', 'neutral', 'negative'] as const).map(filter => (
              <Button
                key={filter}
                variant={sentimentFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSentimentFilter(filter)}
              >
                {filter === 'all' ? `All (${reviewStats.total})` : 
                 `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${reviewStats[filter as keyof typeof reviewStats]})`}
              </Button>
            ))}
          </div>

          {/* Posts List */}
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
                        {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Unknown'}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                    {post.content && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.score !== null && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {post.score}
                        </span>
                      )}
                      {post.num_comments !== null && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {post.num_comments}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredPosts.length > visibleCount && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setVisibleCount(prev => prev + 10)}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
                <p className="text-muted-foreground">No community posts available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
