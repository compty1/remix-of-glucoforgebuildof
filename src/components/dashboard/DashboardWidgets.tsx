import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Heart, 
  Upload, 
  Calendar, 
  Zap,
  Wifi,
  CheckCircle,
  Clock,
  Droplets,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardWidgetsProps {
  widgetId: string;
  isEditing: boolean;
}

interface GlucoseData {
  currentBG: number | null;
  trend?: string;
  timeInRange?: number;
  estA1C?: string;
  cv?: number;
  hasData: boolean;
  isDemo?: boolean;
  lastUpdated?: string;
}

interface DeviceData {
  cgmConnected: boolean;
  cgmModel?: string;
}

interface CommunityData {
  activeMembers: number;
  postsToday: number;
  userContributions: number;
}

interface ActivityItem {
  type: 'upload' | 'survey';
  label: string;
  time: string;
}

interface RecentActivityData {
  items: ActivityItem[];
  hasActivity: boolean;
}

interface HealthMetricsData {
  timeInRange?: number;
  estA1C?: string;
  cv?: number;
  hasData: boolean;
  isDemo?: boolean;
}

const WIDGET_STALE_TIME = 5 * 60 * 1000;

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ widgetId, isEditing }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: glucoseData, isLoading: glucoseLoading } = useQuery({
    queryKey: ['widget-glucose-trends', user?.id],
    queryFn: async (): Promise<GlucoseData> => {
      if (!user?.id) return { currentBG: null, hasData: false, isDemo: true };
      const { data: uploads } = await supabase
        .from('uploads')
        .select('detailed_analysis, uploaded_at')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1);
      if (uploads && uploads.length > 0 && uploads[0].detailed_analysis) {
        const analysis = uploads[0].detailed_analysis as Record<string, unknown>;
        const metrics = (analysis?.metrics || analysis?.rawMetrics || {}) as Record<string, number | undefined>;
        const avgGlucose = analysis?.avgGlucose as number | undefined;
        const tir = analysis?.timeInRange as number | undefined;
        const estA1c = analysis?.estimatedA1C as number | undefined;
        const cvVal = analysis?.cv as number | undefined;
        return {
          currentBG: metrics.currentBG ?? metrics.mean ?? (avgGlucose ? Math.round(avgGlucose) : null),
          trend: metrics.trend ? String(metrics.trend) : undefined,
          timeInRange: metrics.timeInRange != null ? Math.round(metrics.timeInRange) : (tir != null ? Math.round(tir) : undefined),
          estA1C: (metrics.gmi ?? metrics.estimatedA1c ?? estA1c)?.toFixed(1),
          cv: metrics.cv != null ? Math.round(metrics.cv) : (cvVal != null ? Math.round(cvVal) : undefined),
          hasData: true,
          lastUpdated: uploads[0].uploaded_at
        };
      }
      return { currentBG: null, hasData: false };
    },
    enabled: widgetId === 'glucose-trends',
    staleTime: WIDGET_STALE_TIME,
  });

  const { data: deviceData, isLoading: deviceLoading } = useQuery({
    queryKey: ['widget-device-status', user?.id],
    queryFn: async (): Promise<DeviceData> => {
      if (!user?.id) return { cgmConnected: false };
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('device_brands, cgm_device_id')
        .eq('user_id', user.id)
        .maybeSingle();
      return {
        cgmConnected: !!prefs?.cgm_device_id,
        cgmModel: prefs?.device_brands?.[0] || 'CGM',
      };
    },
    enabled: widgetId === 'device-status',
    staleTime: WIDGET_STALE_TIME,
  });

  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['widget-community-insights', user?.id],
    queryFn: async (): Promise<CommunityData> => {
      const { count } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      let userContributions = 0;
      if (user?.id) {
        const { count: contribCount } = await supabase
          .from('community_comments')
          .select('*', { count: 'exact', head: true })
          .eq('author_anonymous', user.email?.split('@')[0] || 'user');
        userContributions = contribCount || 0;
      }
      return { activeMembers: count || 0, postsToday: count || 0, userContributions };
    },
    enabled: widgetId === 'community-insights',
    staleTime: WIDGET_STALE_TIME,
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['widget-recent-activity', user?.id],
    queryFn: async (): Promise<RecentActivityData> => {
      if (!user?.id) return { items: [], hasActivity: false };
      const { data: uploadsData } = await supabase
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
      const allRaw = [
        ...(uploadsData || []).map(u => ({ type: 'upload' as const, label: u.file_name || 'Data uploaded', raw: u.uploaded_at || '' })),
        ...(surveys || []).map(s => ({ type: 'survey' as const, label: 'Survey completed', raw: s.completed_at || '' }))
      ].sort((a, b) => new Date(b.raw).getTime() - new Date(a.raw).getTime());
      const sortedItems: ActivityItem[] = allRaw.map(r => ({
        type: r.type,
        label: r.label,
        time: r.raw ? formatDistanceToNow(new Date(r.raw), { addSuffix: true }) : 'recently'
      }));
      return { items: sortedItems.slice(0, 5), hasActivity: sortedItems.length > 0 };
    },
    enabled: widgetId === 'recent-activity',
    staleTime: WIDGET_STALE_TIME,
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['widget-health-metrics', user?.id],
    queryFn: async (): Promise<HealthMetricsData> => {
      if (!user?.id) return { hasData: false, isDemo: true };
      const { data: uploads } = await supabase
        .from('uploads')
        .select('detailed_analysis')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1);
      if (uploads && uploads.length > 0 && uploads[0].detailed_analysis) {
        const analysis = uploads[0].detailed_analysis as Record<string, unknown>;
        const metrics = (analysis?.metrics || {}) as Record<string, number | undefined>;
        return {
          timeInRange: metrics.timeInRange != null ? Math.round(metrics.timeInRange) : undefined,
          estA1C: metrics.gmi?.toFixed(1),
          cv: metrics.cv != null ? Math.round(metrics.cv) : undefined,
          hasData: true
        };
      }
      return { hasData: false };
    },
    enabled: widgetId === 'health-metrics',
    staleTime: WIDGET_STALE_TIME,
  });

  const loading = widgetId === 'glucose-trends' ? glucoseLoading
    : widgetId === 'device-status' ? deviceLoading
    : widgetId === 'community-insights' ? communityLoading
    : widgetId === 'recent-activity' ? activityLoading
    : widgetId === 'health-metrics' ? healthLoading
    : false;

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
      case 'glucose-trends': {
        const gd = glucoseData ?? null;
        const hasRealData = gd?.hasData && gd?.currentBG != null;
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
                {!hasRealData ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {gd?.isDemo ? 'Sign in and upload CGM data to see your glucose trends.' : 'Upload CGM data to see your glucose trends.'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/data-upload')}>
                      <Upload className="h-4 w-4 mr-2" /> Upload Data
                    </Button>
                  </div>
                ) : (
                <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{gd?.currentBG} mg/dL</p>
                    <p className="text-xs text-muted-foreground">
                      From last upload{gd?.lastUpdated ? ` · ${formatDistanceToNow(new Date(gd.lastUpdated), { addSuffix: true })}` : ''}
                    </p>
                  </div>
                  {gd?.currentBG != null && gd.currentBG >= 70 && gd.currentBG <= 180 && (
                    <Badge className="bg-success text-success-foreground">In Range</Badge>
                  )}
                  {gd?.currentBG != null && gd.currentBG > 180 && (
                    <Badge variant="destructive">High</Badge>
                  )}
                  {gd?.currentBG != null && gd.currentBG < 70 && (
                    <Badge variant="destructive">Low</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{gd?.timeInRange != null ? `${gd.timeInRange}%` : '—'}</p>
                    <p className="text-xs text-muted-foreground">Time in Range</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{gd?.estA1C ? `${gd.estA1C}%` : '—'}</p>
                    <p className="text-xs text-muted-foreground">Est. A1C</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{gd?.cv != null ? gd.cv : '—'}</p>
                    <p className="text-xs text-muted-foreground">CV%</p>
                  </div>
                </div>
                </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'device-status': {
        const dd = deviceData ?? null;
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
                    <Wifi className={`h-4 w-4 ${dd?.cgmConnected ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">{dd?.cgmConnected ? `${dd.cgmModel || 'CGM'} linked` : 'No CGM linked'}</span>
                  </div>
                  {dd?.cgmConnected ? <CheckCircle className="h-4 w-4 text-success" /> : <Badge variant="outline" className="text-[10px]">Setup</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dd?.cgmConnected 
                    ? 'Live device metrics require direct CGM API integration (not yet available).' 
                    : 'Link your CGM in profile settings to track device status.'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'community-insights': {
        const cd = communityData ?? null;
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
                  <p className="text-lg font-bold text-primary">{cd?.activeMembers?.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Posts in last 24h</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your contributions:</span>
                    <span className="font-medium">{cd?.userContributions ?? 0} insights</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/community-solutions')}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  View Community
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

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
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/data-upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/journal')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Log Event
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'recent-activity': {
        const ra = activityData ?? null;
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
                {!ra?.hasActivity ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No recent activity yet. Upload data or complete a survey to get started.</p>
                ) : (
                  ra.items.map((item, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      }

      case 'health-metrics': {
        const hm = healthData ?? null;
        const hasMetrics = hm?.hasData && (hm?.timeInRange != null || hm?.estA1C || hm?.cv != null);
        return (
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasMetrics ? (
                <p className="text-sm text-muted-foreground">Upload CGM data to see your health metrics.</p>
              ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{hm?.timeInRange != null ? `${hm.timeInRange}%` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Time in Range</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{hm?.estA1C ? `${hm.estA1C}%` : '—'}</p>
                  <p className="text-xs text-muted-foreground">Est. A1C</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{hm?.cv != null ? hm.cv : '—'}</p>
                  <p className="text-xs text-muted-foreground">CV%</p>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        );
      }

      default:
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Widget Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Widget '{widgetId}' is not available.</p>
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
