import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  MessageSquare,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Device } from '@/hooks/useDeviceAnalytics';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { DeviceIssueCard } from '@/components/DeviceIssueCard';
import { toast } from 'sonner';

interface DeviceDetailsModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed: () => Promise<{ success: boolean; error?: string; data?: any }>;
}

const getSentimentIcon = (sentiment: string | null) => {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'negative':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case 'neutral':
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

const getSentimentColor = (sentiment: string | null) => {
  switch (sentiment) {
    case 'positive':
      return 'text-success';
    case 'negative':
      return 'text-destructive';
    case 'neutral':
    default:
      return 'text-muted-foreground';
  }
};

export const DeviceDetailsModal = ({ 
  device, 
  isOpen, 
  onClose, 
  onRefreshFeed 
}: DeviceDetailsModalProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { posts, loading: postsLoading, error: postsError } = useCommunityPosts(
    device?.name
  );

  const handleRefreshFeed = async () => {
    setRefreshing(true);
    try {
      const result = await onRefreshFeed();
      if (result.success) {
        toast.success(`Community feed refreshed! Processed ${result.data?.inserted || 0} new posts.`);
      } else {
        toast.error(`Failed to refresh feed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to refresh community feed');
    } finally {
      setRefreshing(false);
    }
  };

  if (!device) return null;

  const devicePosts = posts.filter(post => 
    post.device_mentioned === device.name.toLowerCase().split(' ')[0]
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={device.image_url} 
              alt={device.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{device.name}</h2>
              <p className="text-muted-foreground">{device.manufacturer}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detailed device information and community insights
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({device.issues?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="community">
              Community ({devicePosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <Badge variant="outline">{device.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Model</h4>
                    <p className="text-sm">{device.model_number}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{device.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {device.key_features.map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-success">Pros</h4>
                    <ul className="text-sm space-y-1">
                      {device.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-success">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive">Cons</h4>
                    <ul className="text-sm space-y-1">
                      {device.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-destructive">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {device.metrics && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {device.metrics.reliability_score}%
                      </div>
                      <div className="text-sm text-muted-foreground">Reliability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {device.metrics.social_setting_score}%
                      </div>
                      <div className="text-sm text-muted-foreground">Social Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {device.metrics.total_reviews}
                      </div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button asChild className="flex-1">
                    <a href={device.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Official Website
                    </a>
                  </Button>
                  <Button variant="outline">
                    Compare Devices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Common Issues & Solutions
              </h3>
              <Badge variant="outline">
                {device.issues?.length || 0} issues reported
              </Badge>
            </div>
            
            {device.issues && device.issues.length > 0 ? (
              <div className="space-y-4">
                {device.issues
                  .sort((a, b) => b.community_reports - a.community_reports)
                  .map((issue) => (
                    <DeviceIssueCard key={issue.id} issue={issue} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Issues Reported</h3>
                  <p className="text-muted-foreground">
                    This device has no reported issues from the community.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Community Discussion</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshFeed}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Feed
              </Button>
            </div>

            {postsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : postsError ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Posts</h3>
                  <p className="text-muted-foreground mb-4">{postsError}</p>
                  <Button variant="outline" onClick={handleRefreshFeed}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : devicePosts.length > 0 ? (
              <div className="space-y-4">
                {devicePosts.slice(0, 10).map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base leading-tight mb-2">
                            {post.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {post.author_anonymous}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.published_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.num_comments}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.source}</Badge>
                          <div className={`flex items-center gap-1 ${getSentimentColor(post.sentiment)}`}>
                            {getSentimentIcon(post.sentiment)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    {post.content && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.content}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Community Posts</h3>
                  <p className="text-muted-foreground mb-4">
                    No recent community discussions found for this device.
                  </p>
                  <Button variant="outline" onClick={handleRefreshFeed}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Community Feed
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};