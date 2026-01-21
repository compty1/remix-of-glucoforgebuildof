import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Laugh, 
  AlertTriangle, 
  BookOpen, 
  ThumbsUp, 
  ExternalLink,
  Droplet,
  Share2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface LowSugarStory {
  id: string;
  title: string;
  content: string;
  illustration_url: string | null;
  source_url: string | null;
  source_platform: string | null;
  author_username: string | null;
  upvotes: number;
  category: string;
  created_at: string;
}

const categoryIcons = {
  funny: <Laugh className="h-5 w-5" />,
  scary: <AlertTriangle className="h-5 w-5" />,
  educational: <BookOpen className="h-5 w-5" />,
  other: <Droplet className="h-5 w-5" />
};

const categoryColors = {
  funny: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  scary: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  educational: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const StoryCard: React.FC<{ story: LowSugarStory; onUpvote: (id: string) => void }> = ({ 
  story, 
  onUpvote 
}) => {
  return (
    <Card className="command-center-widget hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {story.illustration_url && (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <img 
                src={story.illustration_url} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{story.title}</h3>
              <Badge className={categoryColors[story.category]}>
                {categoryIcons[story.category]}
                <span className="ml-1 capitalize">{story.category}</span>
              </Badge>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {story.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUpvote(story.id)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {story.upvotes}
                </Button>
                
                {story.source_url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="text-muted-foreground"
                  >
                    <a href={story.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {story.source_platform || 'Source'}
                    </a>
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {story.author_username && (
                <span className="text-xs text-muted-foreground">
                  by {story.author_username}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LowBloodSugarWorld() {
  const [stories, setStories] = useState<LowSugarStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('low_blood_sugar_stories')
        .select('*')
        .eq('is_published', true)
        .order('upvotes', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (storyId: string) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;

      const { error } = await supabase
        .from('low_blood_sugar_stories')
        .update({ upvotes: story.upvotes + 1 })
        .eq('id', storyId);

      if (error) throw error;

      setStories(stories.map(s => 
        s.id === storyId ? { ...s, upvotes: s.upvotes + 1 } : s
      ));
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const filteredStories = activeCategory === 'all' 
    ? stories 
    : stories.filter(s => s.category === activeCategory);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-pink-500 to-orange-400 p-8 md:p-12 mb-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Droplet className="h-10 w-10" />
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Low Blood Sugar World
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Real stories from Type 1 diabetics about those unforgettable low blood sugar moments. 
              Funny, scary, and everything in between.
            </p>
          </div>
          
          {/* Decorative floating drops */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full blur-lg animate-float-delayed" />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="all">All Stories</TabsTrigger>
            <TabsTrigger value="funny" className="flex items-center gap-1">
              <Laugh className="h-4 w-4" /> Funny
            </TabsTrigger>
            <TabsTrigger value="scary" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Scary
            </TabsTrigger>
            <TabsTrigger value="educational" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Educational
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stories Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="space-y-4">
            {filteredStories.map(story => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Droplet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your low blood sugar story!
              </p>
              <Button>Share Your Story</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </Layout>
  );
}
