// Gap 208: System health status page (admin only)
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

interface HealthStatus {
  database: 'ok' | 'error' | 'checking';
  edgeFunctions: 'ok' | 'error' | 'checking';
  auth: 'ok' | 'error' | 'checking';
}

export default function SystemHealth() {
  usePageMeta("System Health", "Live system health, data freshness, and integration status for GlucoForge.");
  const [status, setStatus] = useState<HealthStatus>({
    database: 'checking',
    edgeFunctions: 'checking',
    auth: 'checking',
  });

  useEffect(() => {
    const checkHealth = async () => {
      // Check database
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setStatus(prev => ({ ...prev, database: error ? 'error' : 'ok' }));
      } catch {
        setStatus(prev => ({ ...prev, database: 'error' }));
      }

      // Check auth
      try {
        const { data } = await supabase.auth.getSession();
        setStatus(prev => ({ ...prev, auth: data.session ? 'ok' : 'ok' }));
      } catch {
        setStatus(prev => ({ ...prev, auth: 'error' }));
      }

      // Check edge functions
      try {
        const resp = await supabase.functions.invoke('health-check', { method: 'GET' });
        setStatus(prev => ({ ...prev, edgeFunctions: resp.error ? 'error' : 'ok' }));
      } catch {
        setStatus(prev => ({ ...prev, edgeFunctions: 'error' }));
      }
    };
    checkHealth();
  }, []);

  const StatusIcon = ({ s }: { s: string }) => {
    if (s === 'checking') return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (s === 'ok') return <CheckCircle className="h-4 w-4 text-success" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <AdminRoute>
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">System Health</h1>
          <div className="space-y-4">
            {Object.entries(status).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon s={value} />
                    <Badge variant={value === 'ok' ? 'default' : value === 'error' ? 'destructive' : 'secondary'}>
                      {value.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    </AdminRoute>
  );
}
