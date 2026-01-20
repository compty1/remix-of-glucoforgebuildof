import { ExternalLink, Calendar, User, Bookmark, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/hooks/useT1DNews';

interface NewsCardProps {
  article: NewsArticle;
}

const categoryColors: Record<string, string> = {
  research: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  technology: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  treatment: 'bg-green-500/10 text-green-600 border-green-500/20',
  lifestyle: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  advocacy: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  general: 'bg-muted text-muted-foreground border-border',
};

export const NewsCard = ({ article }: NewsCardProps) => {
  const formattedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        url: article.url,
      });
    } else {
      await navigator.clipboard.writeText(article.url);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl opacity-50">📰</span>
          </div>
        )}
        
        {/* Source badge overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium">
            {article.source_name || 'News'}
          </Badge>
        </div>
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${categoryColors[article.category]} border text-xs capitalize`}>
            {article.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Date and author */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          {article.author && (
            <span className="flex items-center gap-1 truncate">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {article.description || 'Read the full article for more details.'}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
            asChild
          >
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              Read More
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
