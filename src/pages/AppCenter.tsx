import React, { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EntityLogo } from '@/components/ui/entity-logo';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smartphone, 
  Star, 
  Download, 
  Search,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Apple,
  PlayCircle,
  Sparkles,
  Check,
  X,
  Github,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface DiabetesApp {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  platforms: string[] | null;
  download_urls: any;
  features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  avg_rating: number | null;
  review_count: number;
  last_update: string | null;
  developer: string | null;
  is_featured: boolean;
}

interface AppReview {
  id: string;
  content: string;
  rating: number | null;
  source_platform: string | null;
  author: string | null;
  created_at: string;
}

interface AppBuzz {
  id: string;
  content: string;
  source_platform: string;
  source_url: string | null;
  sentiment: string | null;
  upvotes: number | null;
  category: string | null;
  author_anonymous: string | null;
  published_at: string | null;
}

// Open source apps that use GitHub
const openSourceApps = ['xDrip+', 'Nightscout', 'Loop', 'AndroidAPS', 'AAPS'];

// Web-based apps
const webApps = ['Nightscout', 'Tidepool', 'Sugarmate'];

const AppCard: React.FC<{ app: DiabetesApp; onClick: () => void }> = ({ app, onClick }) => {
  const isOpenSource = openSourceApps.some(name => app.name.toLowerCase().includes(name.toLowerCase()));
  const isWebApp = webApps.some(name => app.name.toLowerCase().includes(name.toLowerCase()));
  const hasGithub = app.download_urls?.github;
  
  return (
    <Card 
      className="command-center-widget cursor-pointer hover:shadow-lg transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      aria-label={`View details for ${app.name}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <EntityLogo
            type="company"
            name={app.developer || app.name}
            logoUrl={app.logo_url}
            size="lg"
            className="rounded-xl"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{app.name}</h3>
                  {isOpenSource && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/20">
                      <Github className="h-2.5 w-2.5 mr-0.5" />
                      Open Source
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{app.developer}</p>
              </div>
              {app.is_featured && (
                <Badge className="bg-primary">Featured</Badge>
              )}
            </div>

            {app.avg_rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{app.avg_rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({app.review_count} reviews)
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {app.description}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {app.platforms?.includes('ios') && (
                <Badge variant="outline" className="text-xs">
                  <Apple className="h-3 w-3 mr-1" /> iOS
                </Badge>
              )}
              {app.platforms?.includes('android') && (
                <Badge variant="outline" className="text-xs">
                  <PlayCircle className="h-3 w-3 mr-1" /> Android
                </Badge>
              )}
              {isWebApp && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Globe className="h-3 w-3 mr-1" /> Web App
                </Badge>
              )}
              {hasGithub && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                  <Github className="h-3 w-3 mr-1" /> GitHub
                </Badge>
              )}
              {app.category && (
                <Badge variant="secondary" className="text-xs">{app.category}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AppCenter() {
  usePageMeta('App Center', 'Discover and compare the best diabetes management apps. Real reviews, community insights, and feature breakdowns.');
  const [apps, setApps] = useState<DiabetesApp[]>([]);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [buzz, setBuzz] = useState<AppBuzz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<DiabetesApp | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from('diabetes_apps')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('avg_rating', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppReviews = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_reviews')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      // silently fail; reviews are non-critical
    }
  };

  const fetchAppBuzz = async (appName: string) => {
    try {
      const { data, error } = await supabase
        .from('app_community_buzz')
        .select('*')
        .eq('app_name', appName)
        .order('upvotes', { ascending: false })
        .limit(15);

      if (error) throw error;
      setBuzz(data || []);
    } catch (error) {
      // silently fail; buzz is non-critical
    }
  };

  const handleAppClick = (app: DiabetesApp) => {
    setSelectedApp(app);
    fetchAppReviews(app.id);
    fetchAppBuzz(app.name);
  };

  const categories = ['all', ...Array.from(new Set(apps.map(a => a.category).filter(Boolean)))];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = filteredApps.filter(a => a.is_featured);
  const regularApps = filteredApps.filter(a => !a.is_featured);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              App Center
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover and compare the best apps for managing Type 1 diabetes. 
            Real reviews, community insights, and detailed feature breakdowns.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <>
            {/* Featured Apps */}
            {featuredApps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Featured Apps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredApps.map(app => (
                    <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} />
                  ))}
                </div>
              </div>
            )}

            {/* All Apps */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Apps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularApps.map(app => (
                  <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Apps Found</h3>
              <p className="text-muted-foreground">
                Check back soon as we add more diabetes management apps!
              </p>
            </CardContent>
          </Card>
        )}

        {/* App Detail Modal */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedApp && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <EntityLogo
                      type="company"
                      name={selectedApp.developer || selectedApp.name}
                      logoUrl={selectedApp.logo_url}
                      size="lg"
                      className="w-20 h-20 rounded-xl"
                    />
                    <div>
                      <DialogTitle className="text-2xl">{selectedApp.name}</DialogTitle>
                      <p className="text-muted-foreground">{selectedApp.developer}</p>
                      {selectedApp.avg_rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-lg">{selectedApp.avg_rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({selectedApp.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="buzz">Community Buzz</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-4">
                    <p className="text-muted-foreground">{selectedApp.description}</p>

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        {selectedApp.download_urls?.ios && (
                          <Button asChild className="gap-2">
                            <a href={selectedApp.download_urls.ios} target="_blank" rel="noopener noreferrer">
                              <Apple className="h-4 w-4" />
                              App Store
                              <CheckCircle2 className="h-3 w-3 text-green-300 ml-1" />
                            </a>
                          </Button>
                        )}
                        {selectedApp.download_urls?.android && (
                          <Button asChild variant="outline" className="gap-2">
                            <a href={selectedApp.download_urls.android} target="_blank" rel="noopener noreferrer">
                              <PlayCircle className="h-4 w-4" />
                              Google Play
                              <CheckCircle2 className="h-3 w-3 text-success ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      {/* GitHub / Alternative Downloads */}
                      {selectedApp.download_urls?.github && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Github className="h-4 w-4" />
                            <span className="font-medium">Open Source Download</span>
                          </div>
                          <Button asChild variant="secondary" size="sm" className="gap-2">
                            <a href={selectedApp.download_urls.github} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4" />
                              Download from GitHub
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            This is an open-source app distributed via GitHub releases.
                          </p>
                        </div>
                      )}
                      
                      {/* Web App Link */}
                      {selectedApp.download_urls?.web && (
                        <Button asChild variant="outline" className="gap-2">
                          <a href={selectedApp.download_urls.web} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                            Open Web App
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApp.pros && selectedApp.pros.length > 0 && (
                        <div className="p-4 rounded-lg bg-success/5 dark:bg-success/10">
                          <h4 className="font-semibold text-success mb-3 flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            What Users Like
                          </h4>
                          <ul className="space-y-2">
                            {selectedApp.pros.map((pro, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-success mt-0.5" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedApp.cons && selectedApp.cons.length > 0 && (
                        <div className="p-4 rounded-lg bg-destructive/5 dark:bg-destructive/10">
                          <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4" />
                            Could Be Improved
                          </h4>
                          <ul className="space-y-2">
                            {selectedApp.cons.map((con, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <X className="h-4 w-4 text-destructive mt-0.5" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {selectedApp.features && selectedApp.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.features.map((feature, i) => (
                            <Badge key={i} variant="secondary">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 mt-4">
                    {reviews.length > 0 ? (
                      reviews.map(review => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {review.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">{review.rating}</span>
                                  </div>
                                )}
                                {review.author && (
                                  <span className="text-sm text-muted-foreground">by {review.author}</span>
                                )}
                              </div>
                              {review.source_platform && (
                                <Badge variant="outline" className="text-xs">{review.source_platform}</Badge>
                              )}
                            </div>
                            <p className="text-sm">{review.content}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No reviews yet for this app.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="buzz" className="space-y-4 mt-4">
                    {buzz.length > 0 ? (
                      <>
                        {/* Sentiment Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="p-3 rounded-lg bg-success/5 dark:bg-success/10 text-center">
                            <div className="text-2xl font-bold text-success">
                              {buzz.filter(b => b.sentiment === 'positive').length}
                            </div>
                            <div className="text-xs text-success">Positive</div>
                          </div>
                          <div className="p-3 rounded-lg bg-warning/5 dark:bg-warning/10 text-center">
                            <div className="text-2xl font-bold text-warning">
                              {buzz.filter(b => b.sentiment === 'neutral').length}
                            </div>
                            <div className="text-xs text-warning">Neutral</div>
                          </div>
                          <div className="p-3 rounded-lg bg-destructive/5 dark:bg-destructive/10 text-center">
                            <div className="text-2xl font-bold text-destructive">
                              {buzz.filter(b => b.sentiment === 'negative').length}
                            </div>
                            <div className="text-xs text-destructive">Negative</div>
                          </div>
                        </div>

                        {/* Buzz Posts */}
                        {buzz.map(post => (
                          <Card key={post.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      post.sentiment === 'positive' ? 'bg-success/10 text-success border-success/20' :
                                      post.sentiment === 'negative' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                      'bg-warning/10 text-warning border-warning/20'
                                    }`}
                                  >
                                    {post.sentiment || 'neutral'}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">{post.source_platform}</Badge>
                                </div>
                                {post.upvotes && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    {post.upvotes}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{post.content}</p>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                {post.author_anonymous && <span>{post.author_anonymous}</span>}
                                <div className="flex items-center gap-2">
                                  {post.category && (
                                    <Badge variant="secondary" className="text-[10px]">{post.category.replace('_', ' ')}</Badge>
                                  )}
                                  {(post as any).source_url && (
                                    <a
                                      href={(post as any).source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-1"
                                      aria-label={`View original post on ${post.source_platform}`}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View Post
                                    </a>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No community buzz yet for this app.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
