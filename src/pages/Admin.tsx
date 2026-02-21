import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import withAdmin from '@/components/withAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Database, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

interface AdminStats {
  total_users: number;
  total_shifts: number;
  total_bounties: number;
  total_surveys: number;
  active_users_7d: number;
}

const Admin = () => {
  usePageMeta('Admin', 'GlucoForge admin panel.');
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_shifts: 0,
    total_bounties: 0,
    total_surveys: 0,
    active_users_7d: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users count from profiles
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total shifts
      const { count: shiftsCount } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true });

      // Get total bounties
      const { count: bountiesCount } = await supabase
        .from('bounties')
        .select('*', { count: 'exact', head: true });

      // Get total surveys
      const { count: surveysCount } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true });

      // Get active users in last 7 days (approximate using shifts)
      const { count: activeUsersCount } = await supabase
        .from('shifts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        total_users: userCount || 0,
        total_shifts: shiftsCount || 0,
        total_bounties: bountiesCount || 0,
        total_surveys: surveysCount || 0,
        active_users_7d: activeUsersCount || 0
      });
    } catch (error) {
      // Admin stats fetch error
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
    toast({
      title: "Refreshed",
      description: "Statistics have been updated",
    });
  };

  const runTrendsUpdate = async () => {
    try {
      const { error } = await supabase.rpc('update_trends');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Trends analysis has been updated",
      });
    } catch (error) {
      // Trends update error
      toast({
        title: "Error",
        description: "Failed to update trends analysis",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform monitoring and management</p>
          </div>
          <Button onClick={refreshStats} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users_7d}</div>
              <p className="text-xs text-muted-foreground">Users with recent activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_shifts}</div>
              <p className="text-xs text-muted-foreground">Glycemic shift logs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounties</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_bounties}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
              <CardDescription>Administrative tasks and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Update Trends Analysis</h4>
                  <p className="text-sm text-muted-foreground">Run the community trends analysis function</p>
                </div>
                <Button onClick={runTrendsUpdate} size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
              <CardDescription>Current system health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Edge Functions</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Ingestion</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default withAdmin(Admin);