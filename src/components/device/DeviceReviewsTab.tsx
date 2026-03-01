import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CommunityPost } from '@/hooks/useDeviceDetails';
import { useDeviceReviews } from '@/hooks/useDeviceReviews';
import { useExternalReviews } from '@/hooks/useExternalReviews';
import { UserReviewsList } from './UserReviewsList';
import { ExternalReviewCard } from './ExternalReviewCard';
import { getSourceDisplayName, getSourceBadgeColor, getSourceLogo, isOfficialSource, isSocialSource } from '@/utils/sourceConfig';
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
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeSection, setActiveSection] = useState<'user' | 'community'>('user');
  const [externalSourceFilter, setExternalSourceFilter] = useState<string>('all');
  const [officialVisible, setOfficialVisible] = useState(10); // C26: pagination for official reviews

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
  } = useExternalReviews(deviceId);

  const filteredPosts = posts.filter(post => 
    sentimentFilter === 'all' || post.sentiment === sentimentFilter
  );

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  // Split external reviews into official and social using shared utility (C16, C17)
  const officialExternalReviews = React.useMemo(() => 
    externalReviews.filter(r => isOfficialSource(r.source?.toLowerCase() || '')),
    [externalReviews]
  );

  const socialExternalReviews = React.useMemo(() =>
    externalReviews.filter(r => isSocialSource(r.source?.toLowerCase() || '')),
    [externalReviews]
  );

  // Apply filters to social reviews
  const filteredSocialReviews = React.useMemo(() => {
    let filtered = socialExternalReviews;
    if (externalSourceFilter !== 'all') {
      filtered = filtered.filter(r => r.source === externalSourceFilter);
    }
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(r => r.sentiment === sentimentFilter);
    }
    return filtered;
  }, [socialExternalReviews, externalSourceFilter, sentimentFilter]);

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

  // N24: Compute community buzz stats only from social reviews, not all external
  const socialStats = React.useMemo(() => ({
    positive: socialExternalReviews.filter(r => r.sentiment === 'positive').length + reviewStats.positive,
    neutral: socialExternalReviews.filter(r => r.sentiment === 'neutral').length + reviewStats.neutral,
    negative: socialExternalReviews.filter(r => r.sentiment === 'negative').length + reviewStats.negative,
    total: socialExternalReviews.length + reviewStats.total,
  }), [socialExternalReviews, reviewStats]);

  // Source breakdown for social reviews only
  const socialSourceBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    socialExternalReviews.forEach(r => {
      counts[r.source] = (counts[r.source] || 0) + 1;
    });
    return Object.entries(counts).map(([source, count]) => ({ source, count }));
  }, [socialExternalReviews]);

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as 'user' | 'community')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Consumer Reviews ({userReviewStats.totalReviews + officialExternalReviews.length})
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community Buzz ({posts.length + socialExternalReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6 space-y-6">
          {/* C34: Loading state for Consumer Reviews */}
          {(reviewsLoading || externalLoading) && (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </CardContent>
            </Card>
          )}

          {!reviewsLoading && (
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
          )}

          {/* Official-source external reviews in Consumer Reviews tab — C26: with pagination */}
          {!externalLoading && officialExternalReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Consumer Reviews ({officialExternalReviews.length})
              </h3>
              <div className="grid gap-4" role="list" aria-label="Consumer reviews">
                {officialExternalReviews.slice(0, officialVisible).map((review) => (
                  <ExternalReviewCard key={review.id} review={review} />
                ))}
              </div>
              {officialVisible < officialExternalReviews.length && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setOfficialVisible(prev => prev + 10)}>
                    Load More ({officialExternalReviews.length - officialVisible} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community" className="mt-6 space-y-6">
          {/* Sentiment Stats — N24: only social stats */}
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
                  <div className="text-2xl font-bold text-success">{socialStats.positive}</div>
                  <p className="text-xs text-muted-foreground">Positive</p>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <Meh className="h-6 w-6 text-warning mx-auto mb-2" />
                  <div className="text-2xl font-bold text-warning">{socialStats.neutral}</div>
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <Frown className="h-6 w-6 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold text-destructive">{socialStats.negative}</div>
                  <p className="text-xs text-muted-foreground">Negative</p>
                </div>
              </div>
              
              {/* Source breakdown — social only */}
              {socialSourceBreakdown.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {socialSourceBreakdown.map(({ source, count }) => (
                      <Badge key={source} variant="outline" className={getSourceBadgeColor(source)}>
                        {getSourceDisplayName(source)}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters — N9: flex-wrap */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Sentiment:</span>
            {(['all', 'positive', 'neutral', 'negative'] as const).map(filter => (
              <Button
                key={filter}
                variant={sentimentFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSentimentFilter(filter)}
                aria-label={`Filter by ${filter === 'all' ? 'all' : filter} sentiment`}
                aria-pressed={sentimentFilter === filter}
              >
                {filter === 'all' ? `All` : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
            
            <span className="text-sm text-muted-foreground ml-4 mr-2">Source:</span>
            <Button
              variant={externalSourceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExternalSourceFilter('all')}
              aria-pressed={externalSourceFilter === 'all'}
            >
              All Sources
            </Button>
            {socialSourceBreakdown.map(({ source }) => (
              <Button
                key={source}
                variant={externalSourceFilter === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExternalSourceFilter(source)}
                aria-pressed={externalSourceFilter === source}
              >
                {getSourceDisplayName(source)}
              </Button>
            ))}
          </div>

          {/* Social-only external reviews in Community Buzz tab */}
          {externalLoading ? (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading community buzz...</p>
              </CardContent>
            </Card>
          ) : externalError ? (
            <Card className="command-center-widget">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-destructive">Failed to load community buzz. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredSocialReviews.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Social Buzz ({filteredSocialReviews.length})
              </h3>
              <div className="grid gap-4" role="list" aria-label="Social reviews">
                {filteredSocialReviews.map((review) => (
                  <ExternalReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          ) : null}

          {/* Community Posts List */}
          {visiblePosts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Community Discussions ({filteredPosts.length})
              </h3>
              {visiblePosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/community-solutions/${post.post_id}`}
                  className="block no-underline"
                >
                  <Card className="command-center-widget cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getSourceBadgeColor(post.source)}>
                            {getSourceDisplayName(post.source)}
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
                </Link>
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
          {filteredSocialReviews.length === 0 && visiblePosts.length === 0 && !externalLoading && (
            <Card className="command-center-widget">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {socialExternalReviews.length > 0 || posts.length > 0 
                    ? 'No Reviews Match Your Filters' 
                    : 'No Community Buzz Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {socialExternalReviews.length > 0 || posts.length > 0
                    ? 'Try adjusting your sentiment or source filters to see more results.'
                    : 'No community posts or social reviews are available for this device yet.'}
                </p>
                {(socialExternalReviews.length > 0 || posts.length > 0) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => { setSentimentFilter('all'); setExternalSourceFilter('all'); }}
                  >
                    Reset Filters
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
