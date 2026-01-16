import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';

interface CommunitySolutionCardProps {
  title: string;
  content: string;
  source: string;
  score?: number;
  numComments?: number;
  sentiment?: string;
}

export function CommunitySolutionCard({
  title,
  content,
  source,
  score = 0,
  numComments = 0,
  sentiment,
}: CommunitySolutionCardProps) {
  const getSourceColor = (source: string) => {
    if (source.includes('diabetes')) return 'bg-blue-500/10 text-blue-600';
    if (source.includes('dexcom')) return 'bg-green-500/10 text-green-600';
    if (source.includes('omnipod')) return 'bg-purple-500/10 text-purple-600';
    return 'bg-muted text-muted-foreground';
  };

  const getSentimentEmoji = (sentiment: string | undefined) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      default: return '😐';
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/50 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className={getSourceColor(source)}>
            {source}
          </Badge>
          {sentiment && (
            <span className="text-sm">{getSentimentEmoji(sentiment)}</span>
          )}
        </div>
        
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {numComments}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
