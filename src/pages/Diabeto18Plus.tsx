import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { 
  Wine, 
  Heart, 
  Pill, 
  MessageSquare,
  ExternalLink,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Shield,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface AdultPost {
  id: string;
  title: string;
  content: string;
  category: string;
  source_url: string | null;
  source_platform: string | null;
  author_username: string | null;
  comments_count: number;
  upvotes: number;
  tips: string[] | null;
  warnings: string[] | null;
  created_at: string;
}

const categoryConfig = {
  drug_effects: {
    icon: <Pill className="h-5 w-5" />,
    label: 'Substances & Blood Sugar',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  intimacy: {
    icon: <Heart className="h-5 w-5" />,
    label: 'Intimacy & CGMs',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  },
  alcohol: {
    icon: <Wine className="h-5 w-5" />,
    label: 'Alcohol Management',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  },
  other: {
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Other Topics',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
};

const AdultPostCard: React.FC<{ post: AdultPost }> = ({ post }) => {
  const config = categoryConfig[post.category as keyof typeof categoryConfig] || categoryConfig.other;

  return (
    <Card className="command-center-widget">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={config.color}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>
              {post.source_platform && (
                <Badge variant="outline">{post.source_platform}</Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{post.content}</p>

        {/* Tips Section */}
        {post.tips && post.tips.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Community Tips</span>
            </div>
            <ul className="space-y-1">
              {post.tips.map((tip, i) => (
                <li key={i} className="text-sm text-green-700 dark:text-green-300">• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings Section */}
        {post.warnings && post.warnings.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">Warnings</span>
            </div>
            <ul className="space-y-1">
              {post.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-red-700 dark:text-red-300">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ThumbsUp className="h-4 w-4 mr-1" />
              {post.upvotes}
            </Button>
            <span className="text-sm text-muted-foreground">
              {post.comments_count} comments
            </span>
          </div>
          {post.source_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={post.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Original
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Diabeto18Plus() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<AdultPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(true);

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem('diabeto_age_verified');
    if (verified === 'true') {
      setAgeVerified(true);
      setShowAgeVerification(false);
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('adult_content_posts')
        .select('*')
        .eq('is_published', true)
        .order('upvotes', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      localStorage.setItem('diabeto_age_verified', 'true');
      setAgeVerified(true);
      setShowAgeVerification(false);
      fetchPosts();
    } else {
      window.location.href = '/dashboard';
    }
  };

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  if (showAgeVerification && !ageVerified) {
    return (
      <Layout>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-red-500" />
                <DialogTitle className="text-xl">Age Verification Required</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                This section contains mature content about adult situations encountered 
                by Type 1 diabetics, including discussions about alcohol, intimacy, 
                and recreational substances.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                By entering, you confirm that you are at least 18 years old and 
                understand that this content is for educational purposes only.
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  ⚠️ This content is not medical advice. Always consult your healthcare 
                  provider before making changes to your diabetes management.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => handleAgeVerification(false)}>
                I'm Under 18 - Exit
              </Button>
              <Button onClick={() => handleAgeVerification(true)}>
                <Lock className="h-4 w-4 mr-2" />
                I'm 18+ - Enter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-8 md:p-12 mb-8 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10" />
              <Badge variant="secondary" className="bg-white/20 text-white">18+</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Diabeto 18+
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Real talk about adult situations and diabetes. Manage your blood sugar 
              during life's more... interesting moments.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="w-full max-w-2xl">
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="drug_effects" className="flex items-center gap-1">
              <Pill className="h-4 w-4" /> Substances
            </TabsTrigger>
            <TabsTrigger value="intimacy" className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> Intimacy
            </TabsTrigger>
            <TabsTrigger value="alcohol" className="flex items-center gap-1">
              <Wine className="h-4 w-4" /> Alcohol
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Disclaimer Banner */}
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Educational Content Disclaimer</p>
              <p>
                Content shared here reflects real community experiences and is not medical advice. 
                Recreational drug use and excessive alcohol consumption carry significant health risks, 
                especially with diabetes. Always prioritize your safety.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {user && (
          <div className="mb-6">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Share Your Experience
            </Button>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <AdultPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your experience!
              </p>
              {user ? (
                <Button>Share Your Story</Button>
              ) : (
                <Button asChild>
                  <a href="/auth">Sign In to Share</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
