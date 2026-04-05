import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Eye, 
  Calendar,
  BookmarkPlus,
  ChevronLeft
} from 'lucide-react';
import { ShareButton } from '@/components/shared/ShareButton';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createSafeHTML } from '@/utils/inputSanitizer';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any;
  featured_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  reading_time_mins: number | null;
  views: number;
  published_at: string | null;
  author_id: string | null;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Article not found');
        navigate('/articles');
        return;
      }
      setArticle(data);

      // Increment view count
      if (data) {
        await supabase
          .from('articles')
          .update({ views: data.views + 1 })
          .eq('id', data.id);
      }
    } catch {
      toast.error('Article not found');
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={createSafeHTML(content)} />;
    }
    
    // Handle JSON rich text content
    if (content && typeof content === 'object') {
      // Handle sections array format (from seed-articles)
      if (content.sections && Array.isArray(content.sections)) {
        return (
          <>
            {content.medical_disclaimer && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 italic">{content.medical_disclaimer}</p>
              </div>
            )}
            {content.sections.map((section: { heading?: string; text?: string }, index: number) => (
              <div key={index} className="mb-8">
                {section.heading && (
                  <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
                )}
                {section.text && (
                  <p className="mb-4 leading-relaxed text-muted-foreground">{section.text}</p>
                )}
              </div>
            ))}
          </>
        );
      }
      
      // Handle Editor.js blocks format
      if (content.blocks) {
        return content.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'paragraph':
              return <p key={index} className="mb-4">{block.data?.text}</p>;
            case 'header':
              const Tag = `h${block.data?.level || 2}` as keyof JSX.IntrinsicElements;
              return <Tag key={index} className="font-bold mb-4">{block.data?.text}</Tag>;
            case 'list':
              const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index} className="list-inside mb-4">
                  {block.data?.items?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ListTag>
              );
            case 'image':
              return (
                <figure key={index} className="my-6">
                  <img 
                    src={block.data?.url} 
                    alt={block.data?.caption || ''} 
                    className="rounded-lg w-full"
                  />
                  {block.data?.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4">
                  {block.data?.text}
                  {block.data?.caption && (
                    <cite className="block text-sm text-muted-foreground mt-2">
                      — {block.data.caption}
                    </cite>
                  )}
                </blockquote>
              );
            default:
              return null;
          }
        });
      }
      
      // Fallback for simple text content
      if (content.text) {
        return <p>{content.text}</p>;
      }
    }
    
    return <p className="text-muted-foreground">Content unavailable</p>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate('/articles')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-6 py-8 max-w-4xl">
        <BackButton fallbackPath="/articles" />

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="relative h-64 md:h-96 overflow-hidden rounded-2xl mb-8 mt-4">
            <img 
              src={article.featured_image_url} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.category && (
              <Badge variant="secondary">{article.category}</Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.reading_time_mins || 5} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views} views
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save
            </Button>
            <ShareButton title={article.title} text={article.excerpt || undefined} />
          </div>
        </header>

        <Separator className="my-8" />

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {renderContent(article.content)}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <Button variant="outline" onClick={() => navigate('/articles')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to All Articles
          </Button>
        </div>
      </article>
    </Layout>
  );
}
