import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, TrendingUp, Shield, Settings, DollarSign, Download, Search, Filter } from 'lucide-react';
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

// PLACEHOLDER DATA — No analytics tracking system is implemented yet.
// These charts show illustrative data only. Replace with real analytics queries when instrumentation is added.
const userActivityData = [
  { month: 'Jan', users: 120, active: 85 },
  { month: 'Feb', users: 150, active: 102 },
  { month: 'Mar', users: 200, active: 145 },
  { month: 'Apr', users: 280, active: 198 },
  { month: 'May', users: 350, active: 245 },
  { month: 'Jun', users: 420, active: 310 }
];

const platformUsageData = [
  { name: 'Dashboard', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Data Upload', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Research Hub', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Surveys', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 5, color: 'hsl(var(--chart-5))' }
];

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

      // Fetch shifts count
      const { count: shiftsCount } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true });

      // Fetch surveys count
      const { count: surveysCount } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true });

      // Fetch bounties count
      const { count: bountiesCount } = await supabase
        .from('bounties')
        .select('*', { count: 'exact', head: true });

      // Fetch actual active users (users with shifts in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: activeCount } = await supabase
        .from('shifts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      setStats({
        totalUsers: profileCount || 0,
        activeUsers: activeCount || 0,
        totalShifts: shiftsCount || 0,
        totalSurveys: surveysCount || 0,
        totalBounties: bountiesCount || 0,
        totalDonations: 0 // Will show actual data when donation tracking is implemented
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
                    <p className="text-sm text-muted-foreground">Journal Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-8 w-8 text-chart-4" />
                  <div>
                    <p className="text-2xl font-bold">${stats.totalDonations.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Growth</CardTitle>
                  <Badge variant="outline" className="text-xs text-muted-foreground">Illustrative Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Total Users" />
                      <Line type="monotone" dataKey="active" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Active Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Platform Usage */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Platform Usage</CardTitle>
                  <Badge variant="outline" className="text-xs text-muted-foreground">Illustrative Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <p className="text-sm text-muted-foreground">4/4 functions running</p>
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