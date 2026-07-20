import { Link } from 'react-router-dom';
import { ExternalLink, Bookmark, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataFreshnessBadge } from '@/components/ui/data-freshness-badge';

interface Source {
  title: string;
  url: string;
}

interface DiscoveryCardProps {
  data: {
    id: string;
    title: string;
    snippet: string;
    icon_url: string;
    credibility: 'High' | 'Medium' | 'Low';
    mechanism: string;
    sources: Source[];
    created_at: string;
  };
}

export default function DiscoveryCard({ data }: DiscoveryCardProps) {
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

  return (
    <Card className="group hover:shadow-card transition-smooth gradient-card border-border/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {data.icon_url && (
              <img 
                src={data.icon_url} 
                alt="" 
                className="w-12 h-12 rounded-lg object-cover shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-smooth">
                {data.title}
              </h3>
              <Badge 
                variant={getCredibilityVariant(data.credibility)}
                className={`mt-2 ${getCredibilityColor(data.credibility)}`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {data.credibility} Credibility
              </Badge>
              <div className="mt-2">
                <DataFreshnessBadge lastUpdated={data.created_at} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-smooth">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed mb-4">
          {data.snippet}
        </p>
        
        <div className="bg-accent/50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-accent-foreground">
            <span className="text-muted-foreground">Mechanism:</span> {data.mechanism}
          </p>
        </div>

        {data.sources && data.sources.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {data.sources.slice(0, 2).map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-glow transition-smooth bg-accent/30 px-2 py-1 rounded-md"
                >
                  {source.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-border/50">
        <Link to={`/discover/${data.id}`} className="w-full">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
          >
            View Full Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}