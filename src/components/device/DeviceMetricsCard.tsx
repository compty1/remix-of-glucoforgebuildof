import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DeviceMetrics, DeviceIssue } from '@/hooks/useDeviceDetails';
import { Shield, Users, AlertTriangle, MessageSquare } from 'lucide-react';

interface DeviceMetricsCardProps {
  metrics: DeviceMetrics | null;
  issueCount: number;
  reviewCount: number;
}

export const DeviceMetricsCard: React.FC<DeviceMetricsCardProps> = ({
  metrics,
  issueCount,
  reviewCount
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 75) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Reliability Score */}
      <Card className="command-center-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Reliability</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(metrics?.reliability_score || 0)}`}>
            {metrics?.reliability_score || 0}%
          </div>
          <div className="mt-2">
            <Progress 
              value={metrics?.reliability_score || 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Setting Score */}
      <Card className="command-center-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Social Score</span>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(metrics?.social_setting_score || 0)}`}>
            {metrics?.social_setting_score || 0}%
          </div>
          <div className="mt-2">
            <Progress 
              value={metrics?.social_setting_score || 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Known Issues */}
      <Card className="command-center-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium">Known Issues</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {issueCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Community reported
          </p>
        </CardContent>
      </Card>

      {/* Community Reviews */}
      <Card className="command-center-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-highlight" />
            <span className="text-sm font-medium">Reviews</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {reviewCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From social media
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
