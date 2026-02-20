import { useParams, Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Bookmark, TrendingUp, Calendar, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Source {
  title: string;
  url: string;
}

interface DiscoveryItem {
  id: string;
  title: string;
  snippet: string;
  icon_url: string;
  credibility: 'High' | 'Medium' | 'Low';
  mechanism: string;
  sources: Source[];
  created_at: string;
}

export default function DiscoverDetails() {
  usePageMeta('Discovery Details', 'Deep dive into a T1D research discovery — mechanism, credibility, source citations, and community context.');
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [discovery, setDiscovery] = useState<DiscoveryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscovery = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('discovery_cards')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          throw new Error('Failed to load discovery');
        }

        if (!data) {
          throw new Error('Discovery not found');
        }

        setDiscovery({
          ...data,
          credibility: data.credibility as 'High' | 'Medium' | 'Low',
          sources: Array.isArray(data.sources) ? data.sources as unknown as Source[] : []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load discovery');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscovery();
  }, [id]);

  const getCredibilityVariant = (credibility: string) => {
    switch (credibility) {
      case 'High': return 'default';
      case 'Medium': return 'secondary'; 
      case 'Low': return 'destructive';
      default: return 'outline';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'High': return 'credibility-high';
      case 'Medium': return 'credibility-medium';
      case 'Low': return 'credibility-low';
      default: return 'bg-muted';
    }
  };

  const handleBookmark = () => {
    toast({
      title: "Bookmarked",
      description: "Discovery saved to your bookmarks",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Discovery link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/discover">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Discover
              </Button>
            </Link>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !discovery) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/discover">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Discover
              </Button>
            </Link>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Discovery Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The discovery you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/discover">
                <Button>Return to Discover</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Discover
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <article aria-labelledby="discovery-title">
        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-4">
              {discovery.icon_url && (
                <img 
                  src={discovery.icon_url} 
                  alt="" 
                  className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <CardTitle id="discovery-title" className="text-3xl font-bold mb-4 leading-tight">
                  {discovery.title}
                </CardTitle>
                <div className="flex items-center gap-4 mb-4">
                  <Badge 
                    variant={getCredibilityVariant(discovery.credibility)}
                    className={`${getCredibilityColor(discovery.credibility)}`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {discovery.credibility} Credibility
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(discovery.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Summary</h3>
              <p className="text-lg leading-relaxed text-foreground">
                {discovery.snippet}
              </p>
            </div>

            <Separator />

            {/* Mechanism */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Mechanism of Action</h3>
              <div className="bg-accent/50 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">
                  {discovery.mechanism}
                </p>
              </div>
            </div>

            <Separator />

            {/* Sources */}
            {discovery.sources && discovery.sources.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Research Sources ({discovery.sources.length})
                </h3>
                <div className="grid gap-3">
                  {discovery.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/20 transition-smooth group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="font-medium group-hover:text-primary transition-smooth">
                          {source.title}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-smooth" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary/30">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> This information is for educational purposes only and should not be considered medical advice. 
                Always consult with healthcare professionals before making any treatment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
        </article>
      </div>
    </Layout>
  );
}