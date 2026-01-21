import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Clock, 
  Eye, 
  Search, 
  Calendar,
  ChevronRight,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  is_featured: boolean;
  reading_time_mins: number | null;
  views: number;
  published_at: string | null;
}

const ArticleCard: React.FC<{ article: Article; featured?: boolean }> = ({ article, featured }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`command-center-widget cursor-pointer hover:shadow-lg transition-all ${featured ? 'md:col-span-2' : ''}`}
      onClick={() => navigate(`/articles/${article.slug}`)}
    >
      {article.featured_image_url && (
        <div className={`relative ${featured ? 'h-64' : 'h-48'} overflow-hidden rounded-t-lg`}>
          <img 
            src={article.featured_image_url} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {article.is_featured && (
            <Badge className="absolute top-4 left-4 bg-primary">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {article.category && (
            <Badge variant="secondary">{article.category}</Badge>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.reading_time_mins || 5} min read
          </span>
        </div>

        <h3 className={`font-semibold mb-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {article.title}
        </h3>

        {article.excerpt && (
          <p className={`text-muted-foreground mb-4 ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(article.published_at), 'MMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views} views
            </span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {article.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.is_featured);
  const regularArticles = filteredArticles.filter(a => !a.is_featured);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Articles
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            In-depth articles, guides, and insights about Type 1 diabetes management, 
            research, and living well.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Featured</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map(article => (
                    <ArticleCard key={article.id} article={article} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Check back soon for new content!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
