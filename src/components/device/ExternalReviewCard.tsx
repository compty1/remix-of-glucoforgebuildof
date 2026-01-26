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
  // Any real URL is valid
  return url.startsWith('http://') || url.startsWith('https://');
};

// Clean content of markdown artifacts
const sanitizeContent = (content: string): string => {
  return content
    // Remove markdown images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links to just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove heading markers
    .replace(/#{1,6}\s/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Get display-friendly source name
const getSourceDisplayName = (source: string, url: string | null): string => {
  // If it's a known source, capitalize it nicely
  const knownSources: Record<string, string> = {
    'reddit': 'Reddit',
    'drugs.com': 'Drugs.com',
    'webmd': 'WebMD',
    'diabetesdaily': 'Diabetes Daily',
    'beyond type 1': 'Beyond Type 1',
    'diatribe': 'DiaTribe',
    'healthline': 'Healthline',
    'integrated diabetes': 'Integrated Diabetes',
    'the diabetes link': 'The Diabetes Link',
    'diabetech': 'Diabetech',
    'cnbc': 'CNBC',
    'a sweet life': 'A Sweet Life',
    'mysugr': 'mySugr',
  };
  
  if (knownSources[source.toLowerCase()]) {
    return knownSources[source.toLowerCase()];
  }
  
  // If source is 'web' or unknown, try to extract from URL
  if ((source === 'web' || !source) && url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
      if (domain && domain.length > 2) {
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {
      // Fallback
    }
  }
  
  return source.charAt(0).toUpperCase() + source.slice(1);
};

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
    const source = review.source.toLowerCase();
    const sourceColors: Record<string, string> = {
      'reddit': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'google': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'amazon': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'trustpilot': 'bg-green-500/10 text-green-600 border-green-500/20',
      'drugs.com': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'webmd': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    };
    return sourceColors[source] || 'bg-muted text-muted-foreground';
  };

  const getSourceLabel = () => {
    if (review.source === 'reddit' && review.subreddit) {
      return review.subreddit;
    }
    return getSourceDisplayName(review.source, review.source_url);
  };
  
  // Sanitize content for display
  const displayContent = sanitizeContent(review.content);

  const hasValidUrl = isValidSourceUrl(review.source_url);
  const isVerifiedSource = hasValidUrl && (
    review.source_url?.includes('reddit.com') || 
    review.source_url?.includes('drugs.com')
  );

  return (
    <Card className="command-center-widget hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getSourceBadge()}>
              {getSourceLabel()}
            </Badge>
            {getSentimentBadge()}
            {isVerifiedSource && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
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

        {/* Content */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {displayContent}
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

          {hasValidUrl && review.source_url && (
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