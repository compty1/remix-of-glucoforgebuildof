import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Download, RefreshCw, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

const userAnalyticsData = [
  { month: 'Jan', signups: 45, active: 120, pageviews: 2400 },
  { month: 'Feb', signups: 52, active: 150, pageviews: 2800 },
  { month: 'Mar', signups: 67, active: 200, pageviews: 3200 },
  { month: 'Apr', signups: 89, active: 280, pageviews: 4100 },
  { month: 'May', signups: 94, active: 350, pageviews: 4800 },
  { month: 'Jun', signups: 108, active: 420, pageviews: 5200 }
];

const donationAnalyticsData = [
  { month: 'Jan', amount: 1200, donors: 24 },
  { month: 'Feb', amount: 1800, donors: 32 },
  { month: 'Mar', amount: 2400, donors: 41 },
  { month: 'Apr', amount: 3200, donors: 58 },
  { month: 'May', amount: 2800, donors: 47 },
  { month: 'Jun', amount: 4100, donors: 73 }
];

const featureUsageData = [
  { name: 'Dashboard', value: 35, color: '#8884d8' },
  { name: 'Data Upload', value: 25, color: '#82ca9d' },
  { name: 'Research Hub', value: 20, color: '#ffc658' },
  { name: 'Surveys', value: 15, color: '#ff7300' },
  { name: 'Community', value: 5, color: '#d084d0' }
];

const auditLog = [
  { id: '1', action: 'User Created', user: 'john.doe@example.com', timestamp: new Date(), details: 'New user registration' },
  { id: '2', action: 'Data Export', user: 'admin@glucoforge.com', timestamp: new Date(Date.now() - 3600000), details: 'Exported user analytics' },
  { id: '3', action: 'Settings Changed', user: 'admin@glucoforge.com', timestamp: new Date(Date.now() - 7200000), details: 'Updated feature flags' },
  { id: '4', action: 'Bounty Created', user: 'admin@glucoforge.com', timestamp: new Date(Date.now() - 10800000), details: 'Created new research bounty' }
];

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last_30_days');

  const handleExportData = (type: string) => {
    setLoading(true);
    // Simulate export
    setTimeout(() => {
      setLoading(false);
      const filename = `glucoforge_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      // In real implementation, this would trigger an actual download
      console.log(`Exporting ${filename}`);
    }, 2000);
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Analytics & Reports
            </h1>
            <div className="flex gap-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="last_year">Last year</option>
              </select>
              <Button variant="outline" onClick={handleRefreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">1,247</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-xs text-green-600">+12% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">892</p>
                    <p className="text-sm text-muted-foreground">Monthly Active</p>
                    <p className="text-xs text-green-600">+8% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">$15,420</p>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                    <p className="text-xs text-green-600">+25% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">89.2%</p>
                    <p className="text-sm text-muted-foreground">User Retention</p>
                    <p className="text-xs text-green-600">+3% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="usage">Feature Usage</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Growth</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleExportData('users')}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userAnalyticsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="signups" stroke="#8884d8" strokeWidth={2} name="New Signups" />
                          <Line type="monotone" dataKey="active" stroke="#82ca9d" strokeWidth={2} name="Active Users" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Daily Active Users</span>
                        <span className="text-sm font-bold">342</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Avg Session Duration</span>
                        <span className="text-sm font-bold">8m 32s</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Bounce Rate</span>
                        <span className="text-sm font-bold">23.1%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Pages per Session</span>
                        <span className="text-sm font-bold">4.7</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Donation Analytics</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExportData('donations')}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={donationAnalyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
                        <Bar dataKey="donors" fill="#82ca9d" name="Donors" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={featureUsageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {featureUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>System Audit Log</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExportData('audit')}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{entry.action}</Badge>
                            <span className="text-sm font-medium">{entry.user}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.details}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {entry.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}