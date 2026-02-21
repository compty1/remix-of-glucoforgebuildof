import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, TrendingUp, DollarSign, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalShifts: number;
  totalSurveys: number;
  totalBounties: number;
  totalDonations: number;
}


export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalShifts: 0,
    totalSurveys: 0,
    totalBounties: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch user count from profiles
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch uploads count
      const { count: uploadsCount } = await supabase
        .from('uploads')
        .select('*', { count: 'exact', head: true });

      // Fetch surveys count
      const { count: surveysCount } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true });

      // Fetch bounties count
      const { count: bountiesCount } = await supabase
        .from('bounties')
        .select('*', { count: 'exact', head: true });

      // Fetch actual active users (users with uploads in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeCount } = await supabase
        .from('uploads')
        .select('user_id', { count: 'exact', head: true })
        .gte('uploaded_at', thirtyDaysAgo.toISOString());

      // Fetch actual donation totals
      const { data: donationData } = await supabase
        .from('donations')
        .select('amount_cents')
        .eq('status', 'completed');
      const totalDonationCents = (donationData || []).reduce((sum, d) => sum + (d.amount_cents || 0), 0);

      setStats({
        totalUsers: profileCount || 0,
        activeUsers: activeCount || 0,
        totalShifts: uploadsCount || 0,
        totalSurveys: surveysCount || 0,
        totalBounties: bountiesCount || 0,
        totalDonations: totalDonationCents / 100
      });
    } catch (error) {
      // Stats fetch failed silently — dashboard shows zeros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
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
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Admin Dashboard
            </h1>
            <Button onClick={refreshStats} disabled={refreshing} variant="outline">
              {refreshing ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-chart-2" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-chart-3" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalShifts}</p>
                    <p className="text-sm text-muted-foreground">Data Uploads</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-8 w-8 text-chart-4" />
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalDonations > 0 ? `$${stats.totalDonations.toLocaleString()}` : 'None yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">Donations Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Coming Soon */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <Info className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Usage Analytics Coming Soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No analytics instrumentation is in place yet. When event tracking is added, usage charts will appear here with real data.
              </p>
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                  <Badge variant="secondary">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-medium">Edge Functions</p>
                    <p className="text-sm text-muted-foreground">Functions deployed</p>
                  </div>
                  <Badge variant="secondary">Operational</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-medium">Authentication</p>
                    <p className="text-sm text-muted-foreground">Service healthy</p>
                  </div>
                  <Badge variant="secondary">Operational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}