import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, Link2, BarChart3 } from 'lucide-react';
import { QuarantineTable } from '@/components/admin/QuarantineTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const ContentModeration: React.FC = () => {
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch link health stats
  const { data: linkStats, isLoading: statsLoading } = useQuery({
    queryKey: ['link-health-stats'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('link_status, source_link_verified')
        .eq('post_type', 'post');

      if (error) throw error;

      const total = posts?.length || 0;
      let ok = 0, dead = 0, unchecked = 0;

      for (const p of (posts || [])) {
        const status = (p.link_status as any)?.status;
        if (status === 'ok' || status === 'ok_fallback') ok++;
        else if (status === 'dead') dead++;
        else unchecked++;
      }

      return { total, ok, dead, unchecked };
    },
    staleTime: 60_000,
  });

  // Fetch quarantined posts count
  const { data: quarantineCount } = useQuery({
    queryKey: ['quarantine-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('post_quarantine')
        .select('*', { count: 'exact', head: true })
        .eq('reviewed', false);
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch top validation errors
  const { data: topErrors } = useQuery({
    queryKey: ['top-validation-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_quarantine')
        .select('validation_errors')
        .limit(500);

      if (error) throw error;

      const errorCounts: Record<string, number> = {};
      for (const row of (data || [])) {
        const errors = row.validation_errors as any;
        if (Array.isArray(errors)) {
          for (const err of errors) {
            const key = String(err);
            errorCounts[key] = (errorCounts[key] || 0) + 1;
          }
        }
      }

      return Object.entries(errorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Fetch confidence score distribution
  const { data: confidenceDist } = useQuery({
    queryKey: ['confidence-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('confidence_score')
        .not('confidence_score', 'is', null);

      if (error) throw error;

      let low = 0, medium = 0, high = 0;
      for (const p of (data || [])) {
        const score = p.confidence_score || 0;
        if (score >= 0.7) high++;
        else if (score >= 0.4) medium++;
        else low++;
      }

      return [
        { name: 'Low (0-0.4)', value: low, fill: 'hsl(0, 70%, 55%)' },
        { name: 'Medium (0.4-0.7)', value: medium, fill: 'hsl(45, 70%, 50%)' },
        { name: 'High (0.7-1.0)', value: high, fill: 'hsl(120, 50%, 45%)' },
      ];
    },
  });

  // Fetch quarantine trend (last 30 days)
  const { data: quarantineTrend } = useQuery({
    queryKey: ['quarantine-trend'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('post_quarantine')
        .select('received_at, reviewed, review_notes')
        .gte('received_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const byDay: Record<string, { total: number; approved: number; dismissed: number }> = {};
      for (const row of (data || [])) {
        const day = new Date(row.received_at).toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = { total: 0, approved: 0, dismissed: 0 };
        byDay[day].total++;
        if (row.reviewed) {
          if (row.review_notes?.toLowerCase().includes('approved')) byDay[day].approved++;
          else byDay[day].dismissed++;
        }
      }

      return Object.entries(byDay)
        .map(([date, counts]) => ({ date: date.slice(5), ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  // False positive rate
  const { data: falsePositiveRate } = useQuery({
    queryKey: ['false-positive-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_quarantine')
        .select('reviewed, review_notes')
        .eq('reviewed', true);

      if (error) throw error;

      const total = data?.length || 0;
      const approved = (data || []).filter(r => r.review_notes?.toLowerCase().includes('approved')).length;

      return total > 0 ? Math.round((approved / total) * 100) : 0;
    },
  });

  const handleVerifyLinks = async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-external-links', {
        body: { mode: 'fix' },
      });
      if (error) throw error;
      toast.success(`Verified ${data?.summary?.totalProcessed || 0} links`);
      queryClient.invalidateQueries({ queryKey: ['link-health-stats'] });
    } catch (err) {
      toast.error('Link verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Content Moderation</h1>
        </div>

        {/* Link Health Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Links</p>
                  <p className="text-2xl font-bold">{statsLoading ? '...' : linkStats?.total || 0}</p>
                </div>
                <Link2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified OK</p>
                  <p className="text-2xl font-bold text-success">{statsLoading ? '...' : linkStats?.ok || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dead Links</p>
                  <p className="text-2xl font-bold text-destructive">{statsLoading ? '...' : linkStats?.dead || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unchecked</p>
                  <p className="text-2xl font-bold text-yellow-600">{statsLoading ? '...' : linkStats?.unchecked || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* False Positive Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">False Positive Rate</p>
                  <p className="text-2xl font-bold">{falsePositiveRate ?? '...'}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Quarantined posts later approved</p>
                </div>
                <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          {/* Broken Link Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Broken Link Rate</p>
                  <p className="text-2xl font-bold">
                    {linkStats ? `${linkStats.total > 0 ? Math.round((linkStats.dead / linkStats.total) * 100) : 0}%` : '...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Dead links out of total</p>
                </div>
                <XCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          <Shield className="h-3 w-3 inline mr-1" />
          Reddit search links are structurally validated (not HTTP-verified) since Reddit blocks server-side requests.
        </p>

        {/* Confidence Score Distribution */}
        {confidenceDist && confidenceDist.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                Confidence Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={confidenceDist}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Posts">
                    {confidenceDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quarantine Trend */}
        {quarantineTrend && quarantineTrend.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5" />
                Quarantine Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quarantineTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="total" name="Quarantined" fill="hsl(0, 70%, 55%)" />
                  <Bar dataKey="approved" name="Approved" fill="hsl(120, 50%, 45%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Validation Errors */}
        {topErrors && topErrors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5" />
                Top Validation Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topErrors.map((err, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-md">{err.name}</span>
                    <Badge variant="destructive" className="text-xs ml-2">{err.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <Button onClick={handleVerifyLinks} disabled={isVerifying}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
            {isVerifying ? 'Verifying...' : 'Run Link Verification'}
          </Button>
        </div>

        {/* Quarantine Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Quarantined Posts
              {quarantineCount !== undefined && quarantineCount > 0 && (
                <Badge variant="destructive">{quarantineCount} pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuarantineTable />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContentModeration;
