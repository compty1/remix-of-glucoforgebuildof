import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrendingIssue {
  id: string;
  device_id: string;
  issue_title: string;
  issue_description: string;
  affected_users_estimate: number | null;
  first_reported: string | null;
  last_reported: string | null;
  status: string | null;
  sources: string[] | null;
  device?: {
    name: string;
    manufacturer: string;
  };
}

interface TrendingDeviceIssuesProps {
  onIssueClick?: (issue: TrendingIssue) => void;
}

export const TrendingDeviceIssues: React.FC<TrendingDeviceIssuesProps> = ({ 
  onIssueClick 
}) => {
  const { data: issues, isLoading } = useQuery({
    queryKey: ['trending-device-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_device_issues')
        .select(`
          id,
          device_id,
          issue_title,
          issue_description,
          affected_users_estimate,
          first_reported,
          last_reported,
          status,
          sources,
          device:devices(name, manufacturer)
        `)
        .order('affected_users_estimate', { ascending: false, nullsFirst: false })
        .limit(8);

      if (error) throw error;
      return data as unknown as TrendingIssue[];
    },
  });

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'investigating':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!issues?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No trending issues at this time
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {issues.map((issue) => (
          <button
            key={issue.id}
            onClick={() => onIssueClick?.(issue)}
            className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {issue.device?.name || 'Unknown Device'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(issue.status)}`}
              >
                {issue.status || 'Open'}
              </Badge>
            </div>
            
            <h4 className="font-medium text-sm line-clamp-2 mb-2">
              {issue.issue_title}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                ~{issue.affected_users_estimate || '?'} affected
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {issue.last_reported 
                  ? formatDistanceToNow(new Date(issue.last_reported), { addSuffix: true })
                  : 'Recently'}
              </span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};