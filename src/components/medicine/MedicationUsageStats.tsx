import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface UsageStatistics {
  total_users_estimated?: number;
  avg_daily_doses?: number;
  most_common_timing?: string;
  typical_duration_of_use?: string;
  discontinuation_rate?: string;
  common_reasons_for_switching?: string[];
  satisfaction_rate?: number;
  adherence_rate?: number;
}

interface CommunityFeedback {
  id: string;
  feedback_type: 'issue' | 'praise' | 'tip';
  title: string;
  content: string;
  votes: number;
  source?: string;
}

interface MedicationUsageStatsProps {
  medicationName: string;
  usageStats?: UsageStatistics;
  communityFeedback?: CommunityFeedback[];
}

export function MedicationUsageStats({ 
  medicationName, 
  usageStats, 
  communityFeedback = [] 
}: MedicationUsageStatsProps) {
  const issues = communityFeedback.filter(f => f.feedback_type === 'issue');
  const praises = communityFeedback.filter(f => f.feedback_type === 'praise');
  const tips = communityFeedback.filter(f => f.feedback_type === 'tip');

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Real-World Usage Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {usageStats.total_users_estimated && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    Est. Users
                  </div>
                  <p className="text-xl font-bold">
                    {(usageStats.total_users_estimated / 1000000).toFixed(1)}M+
                  </p>
                </div>
              )}
              
              {usageStats.avg_daily_doses && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Avg. Daily Doses
                  </div>
                  <p className="text-xl font-bold">{usageStats.avg_daily_doses}</p>
                </div>
              )}
              
              {usageStats.satisfaction_rate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ThumbsUp className="h-4 w-4" />
                    Satisfaction
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={usageStats.satisfaction_rate} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{usageStats.satisfaction_rate}%</span>
                  </div>
                </div>
              )}
              
              {usageStats.adherence_rate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Adherence
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={usageStats.adherence_rate} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{usageStats.adherence_rate}%</span>
                  </div>
                </div>
              )}
            </div>
            
            {usageStats.most_common_timing && (
              <div>
                <p className="text-sm text-muted-foreground">Most Common Timing</p>
                <p className="font-medium">{usageStats.most_common_timing}</p>
              </div>
            )}
            
            {usageStats.common_reasons_for_switching && usageStats.common_reasons_for_switching.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Common Reasons for Switching</p>
                <div className="flex flex-wrap gap-2">
                  {usageStats.common_reasons_for_switching.map((reason, i) => (
                    <Badge key={i} variant="outline">{reason}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Community Issues */}
      {issues.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertCircle className="h-5 w-5" />
              Common Issues Reported ({issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <div key={issue.id} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{issue.content}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {issue.votes}
                  </Badge>
                </div>
                {issue.source && (
                  <p className="text-xs text-muted-foreground mt-2">Source: {issue.source}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Community Praises */}
      {praises.length > 0 && (
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-success">
              <ThumbsUp className="h-5 w-5" />
              What Users Love ({praises.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {praises.slice(0, 5).map((praise) => (
              <div key={praise.id} className="p-3 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{praise.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{praise.content}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {praise.votes}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Community Tips */}
      {tips.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <MessageSquare className="h-5 w-5" />
              Community Tips ({tips.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tips.slice(0, 5).map((tip) => (
              <div key={tip.id} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tip.content}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {tip.votes}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {!usageStats && communityFeedback.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Real-world usage data for {medicationName} is being collected.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MedicationUsageStats;