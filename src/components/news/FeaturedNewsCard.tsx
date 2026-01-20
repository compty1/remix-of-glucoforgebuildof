import { ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/hooks/useT1DNews';

interface FeaturedNewsCardProps {
  article: NewsArticle;
  isMain?: boolean;
}

export const FeaturedNewsCard = ({ article, isMain = false }: FeaturedNewsCardProps) => {
  const formattedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  if (isMain) {
    return (
      <Card className="group relative overflow-hidden rounded-xl border-0 shadow-xl h-[400px] md:h-[500px]">
        {/* Background image */}
        <div className="absolute inset-0">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary text-primary-foreground font-semibold">
              <TrendingUp className="h-3 w-3 mr-1" />
              Featured
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm capitalize">
              {article.category}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 line-clamp-3">
            {article.title}
          </h2>

          {/* Description */}
          <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">
            {article.description}
          </p>

          {/* Meta and action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{article.source_name}</span>
            </div>

            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              asChild
            >
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Read Story
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Secondary featured card
  return (
    <Card className="group relative overflow-hidden rounded-lg border-0 shadow-lg h-[200px]">
      {/* Background image */}
      <div className="absolute inset-0">
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
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative h-full flex flex-col justify-end p-4"
      >
        <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm text-xs w-fit mb-2 capitalize">
          {article.category}
        </Badge>
        <h3 className="text-white font-semibold leading-tight line-clamp-2 group-hover:text-primary-foreground transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-white/70 text-xs mt-2">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </div>
      </a>
    </Card>
  );
};
