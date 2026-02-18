import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
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
  ArrowUpRight,
  TrendingDown
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
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on widget type
        switch (widgetId) {
          case 'glucose-trends':
            // Try to get latest user glucose analysis
            if (user?.id) {
              const { data: uploads } = await supabase
                .from('uploads')
                .select('detailed_analysis, uploaded_at')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false })
                .limit(1);
              
              if (uploads && uploads.length > 0 && uploads[0].detailed_analysis) {
                const analysis = uploads[0].detailed_analysis as any;
                const metrics = analysis?.metrics || analysis?.rawMetrics || {};
                setData({
                  currentBG: metrics.currentBG || metrics.mean || Math.round(analysis?.avgGlucose || 127),
                  trend: metrics.trend || (metrics.recentSlope > 0 ? 'rising' : metrics.recentSlope < 0 ? 'falling' : 'stable'),
                  timeInRange: Math.round(metrics.timeInRange || analysis?.timeInRange || 78),
                  estA1C: (metrics.gmi || metrics.estimatedA1c || analysis?.estimatedA1C || 6.8).toFixed(1),
                  cv: Math.round(metrics.cv || metrics.coefficientOfVariation || analysis?.cv || 24),
                  hasData: true
                });
              } else {
                // No user data - show prompt to upload
                setData({
                  currentBG: null,
                  hasData: false
                });
              }
            } else {
              // Not logged in - show sample data
              setData({
                currentBG: 127,
                trend: 'stable',
                timeInRange: 78,
                estA1C: 6.8,
                cv: 24,
                hasData: false,
                isDemo: true
              });
            }
            break;
          
          case 'device-status':
            // Get user's device preferences if available
            if (user?.id) {
              const { data: prefs } = await supabase
                .from('user_preferences')
                .select('device_brands, cgm_device_id')
                .eq('user_id', user.id)
                .maybeSingle();
              
              setData({
                cgmConnected: !!prefs?.cgm_device_id,
                cgmModel: prefs?.device_brands?.[0] || 'CGM',
                sensorDaysLeft: 3,
                batteryLevel: 85,
                lastReading: '2 min ago'
              });
            } else {
              setData({
                cgmConnected: true,
                sensorDaysLeft: 3,
                batteryLevel: 85,
                lastReading: '2 min ago'
              });
            }
            break;
          
          case 'community-insights':
            const { data: posts, count } = await supabase
              .from('community_posts')
              .select('*', { count: 'exact' })
              .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
              .limit(50);
            
            // Get user's contribution count if logged in
            let userContributions = 0;
            if (user?.id) {
              const { count: contribCount } = await supabase
                .from('community_comments')
                .select('*', { count: 'exact', head: true })
                .eq('author_anonymous', user.email?.split('@')[0] || 'user');
              userContributions = contribCount || 0;
            }
            
            setData({
              activeMembers: count || 0,
              postsToday: count || 0,
              userContributions
            });
            break;
            
          case 'recent-activity':
            if (user?.id) {
              const { data: activityData } = await supabase
                .from('uploads')
                .select('id, file_name, uploaded_at')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false })
                .limit(5);
              
              const { data: surveys } = await supabase
                .from('survey_responses')
                .select('id, survey_id, completed_at')
                .eq('user_id', user.id)
                .order('completed_at', { ascending: false })
                .limit(3);
              
              setData({
                uploads: activityData || [],
                surveys: surveys || [],
                hasActivity: (activityData?.length || 0) + (surveys?.length || 0) > 0
              });
            } else {
              setData({ uploads: [], surveys: [], hasActivity: false });
            }
            break;
            
          case 'health-metrics':
            // Similar to glucose trends but with more detail
            if (user?.id) {
              const { data: uploads } = await supabase
                .from('uploads')
                .select('detailed_analysis')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false })
                .limit(1);
              
              if (uploads && uploads.length > 0 && uploads[0].detailed_analysis) {
                const analysis = uploads[0].detailed_analysis as any;
                const metrics = analysis?.metrics || {};
                setData({
                  timeInRange: Math.round(metrics.timeInRange || 78),
                  estA1C: (metrics.gmi || 6.8).toFixed(1),
                  cv: Math.round(metrics.cv || 24),
                  hasData: true
                });
              } else {
                setData({ hasData: false });
              }
            } else {
              setData({
                timeInRange: 78,
                estA1C: 6.8,
                cv: 24,
                hasData: false,
                isDemo: true
              });
            }
            break;
            
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
  }, [widgetId, user?.id]);

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
                {data?.isDemo && (
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">Sample Data</Badge>
                )}
                {!data?.hasData && !data?.isDemo ? (
                  <p className="text-sm text-muted-foreground">Upload CGM data to see your glucose trends.</p>
                ) : (
                <>
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
                </>
                )}
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
                    <Wifi className={`h-4 w-4 ${data?.cgmConnected ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">{data?.cgmConnected ? 'CGM Connected' : 'No CGM linked'}</span>
                  </div>
                  {data?.cgmConnected ? <CheckCircle className="h-4 w-4 text-success" /> : <Badge variant="outline" className="text-[10px]">Setup</Badge>}
                </div>
                {data?.cgmConnected && (
                  <p className="text-xs text-muted-foreground">Device status details require CGM integration.</p>
                )}
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
              {data?.isDemo && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground mb-2">Sample Data</Badge>
              )}
              {!data?.hasData && !data?.isDemo ? (
                <p className="text-sm text-muted-foreground">Upload CGM data to see your health metrics.</p>
              ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{data?.timeInRange}%</p>
                  <p className="text-xs text-muted-foreground">Time in Range</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{data?.estA1C}%</p>
                  <p className="text-xs text-muted-foreground">Est. A1C</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{data?.cv}</p>
                  <p className="text-xs text-muted-foreground">CV%</p>
                </div>
              </div>
              )}
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
