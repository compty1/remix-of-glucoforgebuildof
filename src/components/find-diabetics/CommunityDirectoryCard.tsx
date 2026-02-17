import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, Globe } from 'lucide-react';
import type { CommunityDirectoryEntry } from '@/hooks/useCommunityDirectory';

const typeLabels: Record<string, string> = {
  jdrf_chapter: 'JDRF Chapter',
  ada_office: 'ADA Office',
  campus_chapter: 'Campus Chapter',
  camp: 'Diabetes Camp',
  online_community: 'Online Community',
  support_group: 'Support Group',
};

const typeColors: Record<string, string> = {
  jdrf_chapter: 'bg-primary/10 text-primary',
  ada_office: 'bg-destructive/10 text-destructive',
  campus_chapter: 'bg-success/10 text-success',
  camp: 'bg-warning/10 text-warning',
  online_community: 'bg-accent text-accent-foreground',
  support_group: 'bg-chart-5/10 text-chart-5',
};

interface Props {
  entry: CommunityDirectoryEntry;
}

export const CommunityDirectoryCard: React.FC<Props> = ({ entry }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{entry.name}</CardTitle>
          <Badge className={`text-xs shrink-0 ${typeColors[entry.organization_type] || 'bg-muted text-muted-foreground'}`}>
            {typeLabels[entry.organization_type] || entry.organization_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {entry.is_national ? (
            <><Globe className="h-3 w-3" /> National</>
          ) : entry.city || entry.state ? (
            <><MapPin className="h-3 w-3" /> {[entry.city, entry.state].filter(Boolean).join(', ')}</>
          ) : entry.region ? (
            <><MapPin className="h-3 w-3" /> {entry.region}</>
          ) : null}
        </div>

        <Button asChild size="sm" variant="outline" className="w-full">
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            Visit <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
