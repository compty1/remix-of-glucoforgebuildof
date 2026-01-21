import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X
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

const AppCard: React.FC<{ app: DiabetesApp; onClick: () => void }> = ({ app, onClick }) => {
  return (
    <Card 
      className="command-center-widget cursor-pointer hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {app.logo_url ? (
            <img 
              src={app.logo_url} 
              alt={app.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{app.name}</h3>
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

            <div className="flex items-center gap-2 mt-3">
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
  const [apps, setApps] = useState<DiabetesApp[]>([]);
  const [reviews, setReviews] = useState<AppReview[]>([]);
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
      console.error('Error fetching apps:', error);
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
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAppClick = (app: DiabetesApp) => {
    setSelectedApp(app);
    fetchAppReviews(app.id);
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
                    {selectedApp.logo_url ? (
                      <img 
                        src={selectedApp.logo_url} 
                        alt={selectedApp.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-10 w-10 text-primary" />
                      </div>
                    )}
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
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-4">
                    <p className="text-muted-foreground">{selectedApp.description}</p>

                    {/* Download Buttons */}
                    <div className="flex gap-3">
                      {selectedApp.download_urls?.ios && (
                        <Button asChild>
                          <a href={selectedApp.download_urls.ios} target="_blank" rel="noopener noreferrer">
                            <Apple className="h-4 w-4 mr-2" />
                            App Store
                          </a>
                        </Button>
                      )}
                      {selectedApp.download_urls?.android && (
                        <Button asChild variant="outline">
                          <a href={selectedApp.download_urls.android} target="_blank" rel="noopener noreferrer">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Google Play
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApp.pros && selectedApp.pros.length > 0 && (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            What Users Like
                          </h4>
                          <ul className="space-y-2">
                            {selectedApp.pros.map((pro, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedApp.cons && selectedApp.cons.length > 0 && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4" />
                            Could Be Improved
                          </h4>
                          <ul className="space-y-2">
                            {selectedApp.cons.map((con, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <X className="h-4 w-4 text-red-600 mt-0.5" />
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
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
