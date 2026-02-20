import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommunityPost } from '@/hooks/useDeviceDetails';
import { useDeviceReviews } from '@/hooks/useDeviceReviews';
import { useExternalReviews } from '@/hooks/useExternalReviews';
import { UserReviewsList } from './UserReviewsList';
import { ExternalReviewCard } from './ExternalReviewCard';
import { 
  MessageSquare, 
  ThumbsUp, 
  Filter,
  Clock,
  Smile,
  Meh,
  Frown,
  Users,
  Star,
  ExternalLink,
  Loader2,
  ArrowUpRight
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
  const navigate = useNavigate();
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeSection, setActiveSection] = useState<'user' | 'community'>('user');
  const [externalSourceFilter, setExternalSourceFilter] = useState<string>('all');

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

  const {
    reviews: externalReviews,
    stats: externalStats,
    loading: externalLoading,
    error: externalError,
    filterBySource,
    filterBySentiment
  } = useExternalReviews(deviceId);

  const filteredPosts = posts.filter(post => 
    sentimentFilter === 'all' || post.sentiment === sentimentFilter
  );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  // Filter external reviews based on current filters
  const filteredExternalReviews = React.useMemo(() => {
    let filtered = externalReviews;
    if (externalSourceFilter !== 'all') {
      filtered = filtered.filter(r => r.source === externalSourceFilter);
    }
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(r => r.sentiment === sentimentFilter);
    }
    return filtered;
  }, [externalReviews, externalSourceFilter, sentimentFilter]);

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
      'reddit': 'bg-warning/10 text-warning border-warning/20',
      'twitter': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      'facebook': 'bg-primary/10 text-primary border-primary/20',
      'google': 'bg-success/10 text-success border-success/20',
      'omnipod': 'bg-primary/10 text-primary border-primary/20',
      'dexcom': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      'tandem': 'bg-accent text-accent-foreground border-border',
      'dom-pubs': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
      'shericolberg': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      'type1support': 'bg-success/10 text-success border-success/20',
      'childrenwithdiabetes': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      'embs': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    };
    return colors[source.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
  };

  const getSourceDisplayName = (source: string): string => {
    const sourceMap: Record<string, string> = {
      'omnipod': 'Omnipod',
      'dexcom': 'Dexcom',
      'tandem': 'Tandem',
      'dom-pubs': 'Diabetes Journal',
      'shericolberg': 'Sheri Colberg',
      'type1support': 'Type 1 Support',
      'childrenwithdiabetes': 'Children With Diabetes',
      'embs': 'EMBS',
      'gdi-pc': 'GDI PC',
      'reddit': 'Reddit',
      'google': 'Google',
    };
    return sourceMap[source.toLowerCase()] || source.charAt(0).toUpperCase() + source.slice(1).replace(/-/g, ' ');
  };

  // Combine external stats with community post stats for total
  const combinedStats = {
    positive: reviewStats.positive + externalStats.positive,
    neutral: reviewStats.neutral + externalStats.neutral,
    negative: reviewStats.negative + externalStats.negative,
    total: reviewStats.total + externalStats.total
  };

  // Handle clicking on a community post - navigate to detail page
  const handlePostClick = (post: CommunityPost) => {
    navigate(`/community-solutions/${post.post_id}`);
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
            Community Buzz ({combinedStats.total})
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
                  <div className="text-2xl font-bold text-success">{combinedStats.positive}</div>
                  <p className="text-xs text-muted-foreground">Positive</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <Meh className="h-6 w-6 text-warning mx-auto mb-2" />
                  <div className="text-2xl font-bold text-warning">{combinedStats.neutral}</div>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <Frown className="h-6 w-6 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-destructive">{combinedStats.negative}</div>
                  <p className="text-xs text-muted-foreground">Negative</p>
                </div>
              </div>
              
              {/* Source breakdown */}
              {externalStats.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {externalStats.sources.map(({ source, count }) => (
                      <Badge key={source} variant="outline" className={getSourceBadge(source)}>
                        {source}: {count} reviews
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Sentiment:</span>
            {(['all', 'positive', 'neutral', 'negative'] as const).map(filter => (
              <Button
                key={filter}
                variant={sentimentFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSentimentFilter(filter)}
              >
                {filter === 'all' ? `All` : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
            
            <span className="text-sm text-muted-foreground ml-4 mr-2">Source:</span>
            <Button
              variant={externalSourceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExternalSourceFilter('all')}
            >
              All Sources
            </Button>
            {externalStats.sources.map(({ source }) => (
              <Button
                key={source}
                variant={externalSourceFilter === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExternalSourceFilter(source)}
              >
                {getSourceDisplayName(source)}
              </Button>
            ))}
          </div>

          {/* External Reviews Section */}
          {externalLoading ? (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading external reviews...</p>
              </CardContent>
            </Card>
          ) : externalError ? (
            <Card className="command-center-widget">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-destructive">Failed to load external reviews. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredExternalReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                External Reviews ({filteredExternalReviews.length})
              </h3>
              <div className="grid gap-4" role="list" aria-label="External reviews">
                {filteredExternalReviews.map((review) => (
                  <ExternalReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}

          {/* Community Posts List - Now Clickable */}
          {visiblePosts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Posts ({filteredPosts.length})
              </h3>
              {visiblePosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="command-center-widget cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getSourceBadge(post.source)}>
                          {post.source}
                        </Badge>
                        {getSentimentBadge(post.sentiment)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Unknown'}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
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
                          <MessageSquare className="h-3 w-3" /> {post.num_comments} comments
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
          )}
          
          {/* No content state */}
          {filteredExternalReviews.length === 0 && visiblePosts.length === 0 && !externalLoading && (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {externalReviews.length > 0 || posts.length > 0 
                    ? 'No Reviews Match Your Filters' 
                    : 'No Reviews Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {externalReviews.length > 0 || posts.length > 0
                    ? 'Try adjusting your sentiment or source filters to see more results.'
                    : 'No community posts or reviews are available for this device yet.'}
                </p>
                {(externalReviews.length > 0 || posts.length > 0) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSentimentFilter('all');
                      setExternalSourceFilter('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
