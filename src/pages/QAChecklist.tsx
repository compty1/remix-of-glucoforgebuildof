import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { useState } from 'react';

interface QAItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  description?: string;
}

const qaItems: QAItem[] = [
  // Authentication & Routing
  { id: 'auth-1', category: 'Authentication', item: 'User registration works', status: 'pass' },
  { id: 'auth-2', category: 'Authentication', item: 'User login works', status: 'pass' },
  { id: 'auth-3', category: 'Authentication', item: 'User logout works', status: 'pass' },
  { id: 'auth-4', category: 'Authentication', item: 'Session persistence', status: 'pass' },
  { id: 'auth-5', category: 'Authentication', item: 'Profile creation on signup', status: 'pass' },
  { id: 'auth-6', category: 'Authentication', item: 'Password reset flow', status: 'pass' },
  
  // Navigation & Routing
  { id: 'nav-1', category: 'Navigation', item: 'All header links work', status: 'pass' },
  { id: 'nav-2', category: 'Navigation', item: 'All sidebar links work', status: 'pass' },
  { id: 'nav-3', category: 'Navigation', item: 'Protected routes redirect to auth', status: 'pass' },
  { id: 'nav-4', category: 'Navigation', item: 'Admin routes protected properly', status: 'pass' },
  
  // Dashboard & Widgets
  { id: 'dash-1', category: 'Dashboard', item: 'Dashboard loads', status: 'pass' },
  { id: 'dash-2', category: 'Dashboard', item: 'Widgets show real data from uploads', status: 'warning', description: 'Requires user to have uploaded CGM data; shows empty state otherwise' },
  { id: 'dash-3', category: 'Dashboard', item: 'Dashboard customization works', status: 'pass' },
  { id: 'dash-4', category: 'Dashboard', item: 'Device status shows accurate connection state', status: 'warning', description: 'No CGM API integration yet — shows linked/unlinked based on user_preferences' },
  
  // Data Features
  { id: 'data-1', category: 'Data Features', item: 'File upload works', status: 'pass' },
  { id: 'data-2', category: 'Data Features', item: 'Upload progress displays', status: 'warning', description: 'Shows animated pulse bar, not real byte-level progress' },
  { id: 'data-3', category: 'Data Features', item: 'File processing via edge function', status: 'pass' },
  { id: 'data-4', category: 'Data Features', item: 'Upload records saved to database', status: 'pass' },
  { id: 'data-5', category: 'Data Features', item: 'File size enforcement', status: 'pass', description: '10MB file size limit enforced on upload — rejects files above threshold with user-facing error' },
  
  // Settings
  { id: 'set-1', category: 'Settings', item: 'Profile settings save to DB', status: 'pass' },
  { id: 'set-2', category: 'Settings', item: 'Notification preferences save to DB', status: 'pass' },
  { id: 'set-3', category: 'Settings', item: 'Privacy settings save to DB', status: 'pass' },
  { id: 'set-4', category: 'Settings', item: 'Theme switching works', status: 'pass' },
  { id: 'set-5', category: 'Settings', item: '2FA available', status: 'pending', description: 'Coming soon — not yet implemented' },
  { id: 'set-6', category: 'Settings', item: 'Data export functional', status: 'pending', description: 'Coming soon — not yet implemented' },
  { id: 'set-7', category: 'Settings', item: 'Account deletion cascades all data', status: 'warning', description: 'Deletes from: journal_entries, uploads, bookmarks, saved_posts, surveys, community_posts, user_preferences, achievements, streaks. Does NOT yet cascade: notifications, ai_sessions, scenario_simulations, medication_reviews, experience_submissions, bounties, direct_messages.' },
  
  // Interactive Features
  { id: 'feat-1', category: 'Interactive Features', item: 'Scenario lab simulations render', status: 'pass' },
  { id: 'feat-2', category: 'Interactive Features', item: 'Scenario lab uses physiological model', status: 'warning', description: 'Uses deterministic equations (no Math.random()) based on physiological curves, not a full clinical model' },
  { id: 'feat-3', category: 'Interactive Features', item: 'Journal entries save to DB', status: 'pass' },
  
  // Payments
  { id: 'pay-1', category: 'Payments', item: 'Donation modal opens', status: 'pass' },
  { id: 'pay-2', category: 'Payments', item: 'Stripe checkout creates session', status: 'pass' },
  { id: 'pay-3', category: 'Payments', item: 'Shop checkout works', status: 'pass' },
  { id: 'pay-4', category: 'Payments', item: 'Webhook signature verification', status: 'warning', description: 'When STRIPE_WEBHOOK_SECRET is not set, the edge function falls back to parsing the raw payload without signature verification — any caller could fake a webhook event. Set the secret in production.' },
  
  // Content
  { id: 'content-1', category: 'Content', item: 'Community posts display from DB', status: 'pass' },
  { id: 'content-2', category: 'Content', item: 'Device issues display from DB', status: 'pass' },
  { id: 'content-3', category: 'Content', item: 'Trend analysis has data pipeline', status: 'warning', description: 'Table exists and is queried, but no automated ingestion pipeline fills it — data requires manual seeding.' },
  { id: 'content-4', category: 'Content', item: 'Email digest sends on schedule', status: 'warning', description: 'Edge function deployed but no cron trigger is configured — must be manually triggered or scheduled externally.' },
  
  // Admin
  { id: 'admin-1', category: 'Admin', item: 'Admin role detection works', status: 'pass' },
  { id: 'admin-2', category: 'Admin', item: 'Admin routes protected', status: 'pass' },
  { id: 'admin-3', category: 'Admin', item: 'Admin dashboard charts use real data', status: 'warning', description: 'Placeholder charts removed — analytics instrumentation not yet implemented. Stat cards use real database counts.' },
];

export default function QAChecklist() {
  const [items] = useState<QAItem[]>(qaItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];
  
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const statusCounts = {
    pass: items.filter(item => item.status === 'pass').length,
    fail: items.filter(item => item.status === 'fail').length,
    warning: items.filter(item => item.status === 'warning').length,
    pending: items.filter(item => item.status === 'pending').length,
  };

  const totalItems = items.length;
  const completionRate = Math.round((statusCounts.pass / totalItems) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'fail': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-success/10 text-success';
      case 'fail': return 'bg-destructive/10 text-destructive';
      case 'warning': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: { totalItems, completionRate, statusCounts },
      results: items,
      conclusion: statusCounts.fail === 0 ? 'ALL TESTS PASSING' : `${statusCounts.fail} ITEMS NEED ATTENTION`
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glucoforge-qa-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <BackButton fallbackPath="/admin" className="mb-4" />
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              QA Testing Checklist
            </h1>
            <p className="text-muted-foreground">
              Internal testing status — admin access only
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{statusCounts.pass}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{statusCounts.fail}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{statusCounts.warning}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-muted-foreground">{statusCounts.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{completionRate}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Overall Progress
                <Badge variant={statusCounts.fail === 0 ? 'default' : 'destructive'}>
                  {statusCounts.fail === 0 ? 'ALL PASSING' : `${statusCounts.fail} FAILURES`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {statusCounts.pass} of {totalItems} tests passing · {statusCounts.warning} warnings · {statusCounts.pending} pending
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Test Results
                <Button onClick={generateReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.item}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}