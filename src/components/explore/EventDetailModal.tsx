import React from 'react';
import { ExternalLink, Calendar, Lightbulb, BookOpen, Share2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { T1DHistoryEvent } from '@/hooks/useT1DHistory';
import { toast } from 'sonner';

interface EventDetailModalProps {
  event: T1DHistoryEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eraLabels: Record<string, string> = {
  'ancient': 'Ancient Period',
  'pre-insulin': 'Pre-Insulin Era',
  'insulin-discovery': 'Insulin Discovery Era',
  'mid-century': 'Mid-Century Advances',
  'technology': 'Technology Revolution',
  'digital': 'Digital & Modern Era',
};

const categoryColors: Record<string, string> = {
  'discovery': 'bg-primary/10 text-primary dark:bg-primary/20',
  'treatment': 'bg-success/10 text-success dark:bg-success/20',
  'technology': 'bg-accent text-accent-foreground',
  'research': 'bg-warning/10 text-warning dark:bg-warning/20',
  'cultural': 'bg-chart-5/10 text-chart-5 dark:bg-chart-5/20',
  'landmark': 'bg-brand-red/10 text-brand-red',
};

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  if (!event) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/explore?event=${event.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const yearDisplay = event.year < 0 
    ? `${Math.abs(event.year)} BCE` 
    : event.year_end 
      ? `${event.year} - ${event.year_end}`
      : event.year.toString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {yearDisplay}
                </Badge>
                {event.era && (
                  <Badge variant="secondary">
                    {eraLabels[event.era] || event.era}
                  </Badge>
                )}
                <Badge className={categoryColors[event.category] || 'bg-muted'}>
                  {event.category}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold leading-tight">
                {event.title}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Description */}
          <div>
            <p className="text-lg text-muted-foreground mb-4">
              {event.short_description}
            </p>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{event.detailed_description}</p>
            </div>
          </div>

          {/* Image if available */}
          {event.image_url && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={event.image_url} 
                alt={event.image_caption || event.title}
                className="w-full h-auto object-cover"
              />
              {event.image_caption && (
                <p className="p-3 text-sm text-muted-foreground italic bg-muted/50">
                  {event.image_caption}
                </p>
              )}
            </div>
          )}

          {/* Interesting Facts */}
          {event.interesting_facts && event.interesting_facts.length > 0 && (
             <div className="bg-warning/5 dark:bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-warning">
                  Did You Know?
                </h3>
              </div>
              <ul className="space-y-2">
                {event.interesting_facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                     <span className="text-warning mt-0.5">•</span>
                    <span className="text-foreground/80">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Decade Summary */}
          {event.decade_summary && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Life in the {event.decade}
              </h3>
              <p className="text-sm text-muted-foreground">
                {event.decade_summary}
              </p>
            </div>
          )}

          <Separator />

          {/* Sources */}
          {event.sources && event.sources.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Sources & References
              </h3>
              <ul className="space-y-1">
                {event.sources.map((source, index) => (
                  <li key={index}>
                    <a 
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-teal hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source.length > 60 ? source.substring(0, 60) + '...' : source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact Score */}
          {event.impact_score && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Historical Impact:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i < event.impact_score! 
                        ? 'bg-brand-red' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{event.impact_score}/10</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
