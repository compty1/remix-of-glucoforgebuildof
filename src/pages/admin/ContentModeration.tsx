import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, RefreshCw, CheckCircle, XCircle, AlertTriangle, Link2 } from 'lucide-react';
import { QuarantineTable } from '@/components/admin/QuarantineTable';

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
                  <p className="text-2xl font-bold text-green-600">{statsLoading ? '...' : linkStats?.ok || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dead Links</p>
                  <p className="text-2xl font-bold text-red-600">{statsLoading ? '...' : linkStats?.dead || 0}</p>
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
        <p className="text-xs text-muted-foreground mb-8">
          <Shield className="h-3 w-3 inline mr-1" />
          Reddit search links are structurally validated (not HTTP-verified) since Reddit blocks server-side requests.
        </p>

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
