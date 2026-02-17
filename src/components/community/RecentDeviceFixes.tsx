import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ThumbsUp, Clock, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceFix {
  id: string;
  device_id: string;
  title: string;
  description: string;
  detailed_steps: string[] | null;
  category: string | null;
  difficulty: string | null;
  success_rate: number | null;
  votes: number;
  source: string | null;
  is_verified: boolean;
  created_at: string;
  device?: {
    name: string;
    manufacturer: string;
  };
}

interface RecentDeviceFixesProps {
  onFixClick?: (fix: DeviceFix) => void;
}

export const RecentDeviceFixes: React.FC<RecentDeviceFixesProps> = ({ 
  onFixClick 
}) => {
  const { data: fixes, isLoading } = useQuery({
    queryKey: ['recent-device-fixes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('device_user_fixes')
        .select(`
          id,
          device_id,
          title,
          description,
          detailed_steps,
          category,
          difficulty,
          success_rate,
          votes,
          source,
          is_verified,
          created_at,
          device:devices(name, manufacturer)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data as unknown as DeviceFix[];
    },
  });

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'hard':
        return 'bg-highlight/10 text-highlight';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recent Fixes
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

  if (!fixes?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recent Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No community fixes yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recent Fixes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fixes.map((fix) => (
          <button
            key={fix.id}
            onClick={() => onFixClick?.(fix)}
            className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {fix.is_verified ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-xs text-muted-foreground">
                  {fix.device?.name || 'Unknown Device'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getDifficultyColor(fix.difficulty)}`}
              >
                {fix.difficulty || 'Unknown'}
              </Badge>
            </div>
            
            <h4 className="font-medium text-sm line-clamp-2 mb-2">
              {fix.title}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {fix.votes || 0} votes
              </span>
              {fix.success_rate && fix.success_rate > 0 && (
                <span className="text-primary font-medium">
                  {fix.success_rate}% success
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(fix.created_at), { addSuffix: true })}
              </span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};