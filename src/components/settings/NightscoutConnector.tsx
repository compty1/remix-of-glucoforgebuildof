import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Link2, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const sb = supabase as any;

export default function NightscoutConnector() {
  const { user } = useAuthStore();
  const [url, setUrl] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [existingConnection, setExistingConnection] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await sb
        .from('nightscout_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setExistingConnection(data);
        setUrl(data.nightscout_url);
        setSyncEnabled(data.sync_enabled);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const testConnection = async () => {
    if (!url) return;
    // Gap 239-240: Validate URL format and enforce HTTPS
    let cleanUrl: string;
    try {
      const parsed = new URL(url.replace(/\/+$/, ''));
      if (parsed.protocol !== 'https:') {
        toast.error('Only HTTPS URLs are allowed for security');
        setTestResult('error');
        return;
      }
      cleanUrl = parsed.origin;
    } catch {
      toast.error('Invalid URL format');
      setTestResult('error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch(`${cleanUrl}/api/v1/status.json`, {
        signal: AbortSignal.timeout(10000),
      });
      setTestResult(resp.ok ? 'success' : 'error');
      toast[resp.ok ? 'success' : 'error'](resp.ok ? 'Connection successful!' : `Connection failed: ${resp.status}`);
    } catch {
      setTestResult('error');
      toast.error('Connection failed — check URL');
    } finally {
      setTesting(false);
    }
  };

  const saveConnection = async () => {
    if (!user || !url) return;
    // Gap 237: Hash the API secret instead of storing plain text
    let cleanUrl: string;
    try {
      const parsed = new URL(url.replace(/\/+$/, ''));
      if (parsed.protocol !== 'https:') {
        toast.error('Only HTTPS URLs are allowed');
        return;
      }
      cleanUrl = parsed.origin + parsed.pathname.replace(/\/+$/, '');
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    // Hash the API secret client-side using SHA-1 (matching Nightscout's format)
    let hashedSecret: string | null = null;
    if (apiSecret) {
      const encoder = new TextEncoder();
      const data = encoder.encode(apiSecret);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedSecret = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    setSaving(true);
    const payload = {
      user_id: user.id,
      nightscout_url: cleanUrl,
      api_secret_hash: hashedSecret,
      sync_enabled: syncEnabled,
    };

    const { error } = existingConnection
      ? await sb.from('nightscout_connections').update(payload).eq('id', existingConnection.id)
      : await sb.from('nightscout_connections').insert(payload);

    if (error) {
      toast.error('Failed to save connection');
    } else {
      toast.success('Nightscout connection saved');
      setExistingConnection({ ...existingConnection, ...payload });
    }
    setSaving(false);
  };

  const deleteConnection = async () => {
    if (!existingConnection) return;
    const { error } = await sb.from('nightscout_connections').delete().eq('id', existingConnection.id);
    if (error) {
      toast.error('Failed to remove connection');
    } else {
      setExistingConnection(null);
      setUrl('');
      setApiSecret('');
      setSyncEnabled(false);
      toast.success('Connection removed');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Nightscout Sync
          {existingConnection && (
            <Badge variant={syncEnabled ? 'default' : 'secondary'}>
              {syncEnabled ? 'Active' : 'Paused'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Nightscout instance to automatically sync CGM data.
        </p>
        <div>
          <label className="text-sm font-medium">Nightscout URL</label>
          <Input placeholder="https://your-nightscout.herokuapp.com" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">API Secret (optional)</label>
          <Input type="password" placeholder="Your API secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="mt-1" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-Sync</p>
            <p className="text-xs text-muted-foreground">Sync every 15 minutes</p>
          </div>
          <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing || !url}>
            {testing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : testResult === 'success' ? <CheckCircle className="h-4 w-4 mr-1" /> : testResult === 'error' ? <XCircle className="h-4 w-4 mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Test
          </Button>
          <Button size="sm" onClick={saveConnection} disabled={saving || !url}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save
          </Button>
          {existingConnection && (
            <Button variant="destructive" size="sm" onClick={deleteConnection}>Remove</Button>
          )}
        </div>
        {existingConnection?.last_sync_at && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(existingConnection.last_sync_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
