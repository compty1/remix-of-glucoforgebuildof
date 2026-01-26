import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, TrendingUp, Calendar, Upload, FileText } from 'lucide-react';
import { useStreaks } from '@/hooks/useStreaks';
import { formatDistanceToNow } from 'date-fns';

const STREAK_CONFIG = {
  platform_visit: {
    label: 'Daily Visits',
    icon: Calendar,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  data_upload: {
    label: 'Data Uploads',
    icon: Upload,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  survey: {
    label: 'Survey Streak',
    icon: FileText,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  tir_70: {
    label: 'TIR > 70%',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
};

export function StreaksWidget() {
  const { streaks, isLoading } = useStreaks();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeStreaks = streaks.filter(s => s.current_streak > 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          Your Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeStreaks.length === 0 ? (
          <div className="text-center py-4">
            <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start a streak by visiting daily!
            </p>
          </div>
        ) : (
          activeStreaks.map(streak => {
            const config = STREAK_CONFIG[streak.streak_type as keyof typeof STREAK_CONFIG];
            if (!config) return null;
            
            const Icon = config.icon;
            
            return (
              <div 
                key={streak.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    {streak.last_activity_date && (
                      <p className="text-xs text-muted-foreground">
                        Last: {formatDistanceToNow(new Date(streak.last_activity_date), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${config.color} flex items-center gap-1`}>
                    <Flame className="h-4 w-4" />
                    {streak.current_streak}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Best: {streak.longest_streak}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
