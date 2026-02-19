import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataFreshnessBadgeProps {
  lastUpdated: string | null | undefined;
  className?: string;
  showLabel?: boolean;
}

/**
 * Displays a freshness indicator for data timestamps (items 2031-2040).
 * - < 24h = fresh (green)
 * - < 7d = stale (yellow)  
 * - > 7d or null = outdated (red)
 */
export function DataFreshnessBadge({ lastUpdated, className, showLabel = true }: DataFreshnessBadgeProps) {
  if (!lastUpdated) {
    return (
      <Badge variant="outline" className={`text-xs gap-1 ${className}`}>
        <AlertTriangle className="h-3 w-3" />
        {showLabel && 'No update info'}
      </Badge>
    );
  }

  const date = new Date(lastUpdated);
  const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

  if (hoursSince < 24) {
    return (
      <Badge variant="secondary" className={`text-xs gap-1 bg-success/10 text-success border-success/20 ${className}`}>
        <CheckCircle className="h-3 w-3" />
        {showLabel && `Updated ${timeAgo}`}
      </Badge>
    );
  }

  if (hoursSince < 168) {
    return (
      <Badge variant="secondary" className={`text-xs gap-1 bg-warning/10 text-warning border-warning/20 ${className}`}>
        <Clock className="h-3 w-3" />
        {showLabel && `Updated ${timeAgo}`}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={`text-xs gap-1 bg-destructive/10 text-destructive border-destructive/20 ${className}`}>
      <AlertTriangle className="h-3 w-3" />
      {showLabel && `Updated ${timeAgo}`}
    </Badge>
  );
}

/**
 * Inline label for static/hardcoded content (items 2016-2030).
 */
export function StaticDataLabel({ source, className }: { source: string; className?: string }) {
  return (
    <span className={`text-xs text-muted-foreground italic ${className}`}>
      Source: {source} — static reference data
    </span>
  );
}
