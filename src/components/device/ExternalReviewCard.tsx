import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalReview } from '@/hooks/useExternalReviews';
import { 
  ExternalLink, 
  ThumbsUp, 
  Clock, 
  Smile, 
  Meh, 
  Frown,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface ExternalReviewCardProps {
  review: ExternalReview;
}

export const ExternalReviewCard: React.FC<ExternalReviewCardProps> = ({ review }) => {
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

  const getSourceBadge = () => {
    const sourceColors: Record<string, string> = {
      'reddit': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'google': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'amazon': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'trustpilot': 'bg-green-500/10 text-green-600 border-green-500/20'
    };
    return sourceColors[review.source.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="command-center-widget hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getSourceBadge()}>
              {review.source === 'reddit' && review.subreddit ? review.subreddit : review.source}
            </Badge>
            {getSentimentBadge()}
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

        {/* Content */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {review.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {review.author_anonymous || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {review.helpful_count} helpful
            </span>
          </div>

          {review.source_url && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => window.open(review.source_url!, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Original
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};