import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ArrowUpRight, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface DeviceImprovement {
  id: string;
  device_id: string;
  improvement_title: string;
  description: string | null;
  release_date: string | null;
  version: string | null;
  source_url: string | null;
  device?: {
    name: string;
    manufacturer: string;
  };
}

interface RecentImprovementsProps {
  onImprovementClick?: (improvement: DeviceImprovement) => void;
  limit?: number;
}

export const RecentImprovements: React.FC<RecentImprovementsProps> = ({ 
  onImprovementClick,
  limit = 8
}) => {
  const { data: improvements, isLoading } = useQuery({
    queryKey: ['recent-device-improvements', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_improvements')
        .select(`
          id,
          device_id,
          improvement_title,
          description,
          release_date,
          version,
          source_url,
          device:devices(name, manufacturer)
        `)
        .order('release_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as DeviceImprovement[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recent Improvements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!improvements?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recent Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent improvements recorded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recent Improvements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {improvements.map((improvement) => (
          <button
            key={improvement.id}
            onClick={() => onImprovementClick?.(improvement)}
            className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-primary">
                  {improvement.device?.name || 'Unknown Device'}
                </span>
                {improvement.version && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Tag className="h-3 w-3" />
                    {improvement.version}
                  </Badge>
                )}
              </div>
              {improvement.source_url && (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </div>
            
            <h4 className="font-medium text-sm line-clamp-2 mb-2">
              {improvement.improvement_title}
            </h4>
            
            {improvement.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {improvement.description}
              </p>
            )}
            
            {improvement.release_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(improvement.release_date), 'MMM d, yyyy')}
              </div>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
