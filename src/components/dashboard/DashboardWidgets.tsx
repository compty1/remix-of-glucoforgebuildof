import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Heart, 
  Upload, 
  BarChart3, 
  Calendar, 
  Bookmark, 
  Zap,
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Beaker,
  ExternalLink,
  Droplets,
  Smartphone,
  Plus,
  ArrowUpRight
} from 'lucide-react';

interface DashboardWidgetsProps {
  widgetId: string;
  isEditing: boolean;
}

interface WidgetProps {
  title: string;
  onRemove?: () => void;
  onSettings?: () => void;
}

// Main component for the responsive dashboard
export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ widgetId, isEditing }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on widget type
        switch (widgetId) {
          case 'glucose-trends':
            setData({
              currentBG: 127,
              trend: 'stable',
              timeInRange: 78,
              estA1C: 6.8,
              cv: 24
            });
            break;
          
          case 'device-status':
            setData({
              cgmConnected: true,
              sensorDaysLeft: 3,
              batteryLevel: 85,
              lastReading: '2 min ago'
            });
            break;
          
          case 'community-insights':
            const { data: posts } = await supabase
              .from('community_posts')
              .select('*')
              .order('published_at', { ascending: false })
              .limit(50);
            
            setData({
              activeMembers: 2847,
              postsToday: posts?.length || 0,
              userContributions: 23
            });
            break;
            
          case 'recent-activity':
            const { data: activityData } = await supabase
              .from('uploads')
              .select('*')
              .order('uploaded_at', { ascending: false })
              .limit(5);
            setData(activityData);
            break;
            
          case 'health-metrics':
          case 'quick-actions':
            setData({ loaded: true });
            break;
            
          default:
            setData({});
        }
      } catch (error) {
        console.error('Error fetching widget data:', error);
        setData({});
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetData();
  }, [widgetId]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const renderWidget = () => {
    switch (widgetId) {
      case 'glucose-trends':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplets className="h-5 w-5 text-success" />
                Glucose Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data?.currentBG} mg/dL</p>
                    <p className="text-sm text-muted-foreground">Current reading</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">In Range</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{data?.timeInRange}%</p>
                    <p className="text-xs text-muted-foreground">Time in Range</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{data?.estA1C}%</p>
                    <p className="text-xs text-muted-foreground">Est. A1C</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{data?.cv}</p>
                    <p className="text-xs text-muted-foreground">CV%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'device-status':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-success" />
                    <span className="text-sm">CGM Connected</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-warning" />
                    <span className="text-sm">Sensor: 3 days left</span>
                  </div>
                  <Badge variant="outline">OK</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'community-insights':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg">
                  <p className="text-lg font-bold text-primary">{data?.activeMembers?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Active community members</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latest posts:</span>
                    <span className="font-medium">{data?.postsToday} today</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your contributions:</span>
                    <span className="font-medium">{data?.userContributions} insights</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  View Community
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'quick-actions':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Log Event
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'recent-activity':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">Data uploaded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Survey completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'health-metrics':
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">78%</p>
                  <p className="text-xs text-muted-foreground">Time in Range</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">6.8%</p>
                  <p className="text-xs text-muted-foreground">Est. A1C</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">24</p>
                  <p className="text-xs text-muted-foreground">CV%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Unknown Widget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Widget '{widgetId}' not found</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={`h-full ${isEditing ? 'editing' : ''}`}>
      {renderWidget()}
    </div>
  );
};

// Export individual widget components for external use
export const LiveCureProgressWidget: React.FC = () => (
  <DashboardWidgets widgetId="glucose-trends" isEditing={false} />
);

export const CommunityFeedWidget: React.FC = () => (
  <DashboardWidgets widgetId="community-insights" isEditing={false} />
);

export const DeviceAlertWidget: React.FC = () => (
  <DashboardWidgets widgetId="device-status" isEditing={false} />
);

export const PersonalStatsWidget: React.FC = () => (
  <DashboardWidgets widgetId="health-metrics" isEditing={false} />
);

export const UpcomingEventsWidget: React.FC = () => (
  <DashboardWidgets widgetId="recent-activity" isEditing={false} />
);

export default DashboardWidgets;
