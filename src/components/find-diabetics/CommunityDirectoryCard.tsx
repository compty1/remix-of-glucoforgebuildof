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
  jdrf_chapter: 'bg-blue-500/10 text-blue-600',
  ada_office: 'bg-red-500/10 text-red-600',
  campus_chapter: 'bg-green-500/10 text-green-600',
  camp: 'bg-amber-500/10 text-amber-600',
  online_community: 'bg-purple-500/10 text-purple-600',
  support_group: 'bg-pink-500/10 text-pink-600',
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
