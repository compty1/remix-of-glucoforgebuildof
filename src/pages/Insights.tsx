import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, TrendingUp, Users, MessageSquare, Calendar, Heart, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { usePageMeta } from '@/hooks/usePageMeta';

interface CommunityPost {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  link: string;
  category: string;
  engagement: number;
}

export default function Insights() {
  usePageMeta("Insights", "AI-powered insights from your glucose, mood, and lifestyle data.");
  const { posts: communityPosts, loading, error } = useCommunityPosts();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Transform Supabase data to CommunityPost format
  const posts: CommunityPost[] = communityPosts.map(post => ({
    id: post.id,
    title: post.title,
    summary: post.content || 'No summary available',
    source: post.source,
    date: new Date(post.published_at).toISOString().split('T')[0],
    link: post.url || `https://www.reddit.com/search/?q=${encodeURIComponent(post.title)}`,
    category: post.device_mentioned ? 'Technology' : (post.sentiment === 'negative' ? 'Mental Health' : (post.topic_tags?.some((t: string) => t.toLowerCase().includes('research')) ? 'Research' : 'Management')),
    engagement: post.score + post.num_comments
  }));

  const categories = ['all', 'Research', 'Management', 'Technology', 'Mental Health'];
  
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Research':
        return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'Management':
        return 'bg-accent/10 text-accent-foreground dark:bg-accent/20';
      case 'Technology':
        return 'bg-success/10 text-success dark:bg-success/20';
      case 'Mental Health':
        return 'bg-highlight/10 text-highlight dark:bg-highlight/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">Community Insights</h1>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Community Insights
          </h1>
          <p className="text-muted-foreground mb-8">
            Real-time highlights from the Type 1 diabetes community, powered by live data from Reddit and other sources.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Community Posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{new Set(posts.map(p => p.source)).size}</p>
                <p className="text-sm text-muted-foreground">Sources</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{posts.reduce((sum, post) => sum + post.engagement, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {posts.length > 0 ? `${Math.round(posts.filter(p => p.engagement > 0).length / posts.length * 100)}%` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Engaged Posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                    {category !== 'all' && (
                      <span className="ml-2 text-xs">
                        ({posts.filter(p => p.category === category).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <p className="text-muted-foreground">{post.summary}</p>
                    </div>
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                      <Badge variant="outline">{post.source}</Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {post.engagement} interactions
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={post.link} target="_blank" rel="noopener noreferrer">
                        Read More
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Community Sources */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Our Community Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Reddit r/diabetes</p>
                    <p className="text-sm text-muted-foreground">Community discussions and experiences</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Diabetes Daily</p>
                    <p className="text-sm text-muted-foreground">News and educational content</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">TuDiabetes</p>
                    <p className="text-sm text-muted-foreground">Peer support and community wisdom</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">MedlinePlus</p>
                    <p className="text-sm text-muted-foreground">Medical information and research</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Join the Conversation</h2>
              <p className="text-muted-foreground mb-6">
                Share your experiences, contribute to research, and help build the world's largest T1D knowledge base.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="/surveys">Participate in Research</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/data-upload">Share Your Data</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}