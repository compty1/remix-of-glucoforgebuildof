import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalReview } from '@/hooks/useExternalReviews';
import { getSourceDisplayName, getSourceBadgeColor, getSourceLogo } from '@/utils/sourceConfig';
import { sanitizeContent } from '@/utils/reviewSanitizer';
import { 
  ExternalLink, 
  ThumbsUp, 
  Clock, 
  Smile, 
  Meh, 
  Frown,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface ExternalReviewCardProps {
  review: ExternalReview;
}

// Validate that URL is a real source, not a placeholder
const isValidSourceUrl = (url: string | null): boolean => {
  if (!url) return false;
  if (url.includes('/example')) return false;
  if (url.includes('placeholder')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

export const ExternalReviewCard: React.FC<ExternalReviewCardProps> = React.memo(({ review }) => {
  const getSentimentIcon = () => {
    switch (review.sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-success" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-destructive" />;
      default:
        return <Meh className="h-4 w-4 text-warning" />;
    }
  };

  const getSentimentBadge = () => {
    switch (review.sentiment) {
      case 'positive':
        return <Badge className="bg-success/10 text-success border-success/20">Positive</Badge>;
      case 'negative':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Negative</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Neutral</Badge>;
    }
  };

  const sourceLabel = review.source === 'reddit' && review.subreddit
    ? review.subreddit
    : getSourceDisplayName(review.source, review.source_url);

  const sourceBadgeColor = getSourceBadgeColor(review.source);
  const sourceLogo = getSourceLogo(review.source, review.source_url);
  const displayContent = sanitizeContent(review.content);
  const hasValidUrl = isValidSourceUrl(review.source_url);
  const isVerifiedSource = hasValidUrl;
  
  const fallbackUrl = !hasValidUrl && review.source === 'reddit'
    ? `https://www.reddit.com/search/?q=${encodeURIComponent(review.title || review.content?.slice(0, 50) || '')}&type=link`
    : null;

  return (
    <Card className="command-center-widget hover:shadow-md transition-shadow" role="article" aria-label={`Consumer review from ${sourceLabel}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={sourceBadgeColor}>
              <span className="flex items-center gap-1.5">
                {sourceLogo && (
                  <img 
                    src={sourceLogo} 
                    alt="" 
                    className="h-3.5 w-3.5 rounded-sm object-contain" 
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {sourceLabel}
              </span>
            </Badge>
            {getSentimentBadge()}
            {isVerifiedSource && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Source Linked
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Clock className="h-3 w-3" />
            {review.published_at 
              ? format(new Date(review.published_at), 'MMM d, yyyy')
              : 'Unknown date'
            }
          </div>
        </div>

        {/* Title */}
        {review.title && (
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            {getSentimentIcon()}
            {review.title}
          </h3>
        )}

        {/* Content — C25: add line-clamp */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-6">
          {displayContent}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {review.author_anonymous || 'Anonymous'}
            </span>
            {review.helpful_count > 0 && (
              <span className="flex items-center gap-1" aria-label={`${review.helpful_count} people found this helpful`}>
                <ThumbsUp className="h-3.5 w-3.5" />
                {review.helpful_count} helpful
              </span>
            )}
          </div>

          {hasValidUrl && review.source_url ? (
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a href={review.source_url} target="_blank" rel="noopener noreferrer"
                aria-label={`View original review on ${sourceLabel}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                View Original
              </a>
            </Button>
          ) : fallbackUrl ? (
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Search Reddit for this discussion">
                <ExternalLink className="h-3 w-3 mr-1" />
                Search Reddit
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
});

ExternalReviewCard.displayName = 'ExternalReviewCard';
