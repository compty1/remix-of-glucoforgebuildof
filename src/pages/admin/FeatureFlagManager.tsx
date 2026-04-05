import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';
import { Flag, Plus, Loader2, Trash2 } from 'lucide-react';

const sb = supabase as any;

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  target_roles: string[] | null;
  created_at: string;
}

export default function FeatureFlagManager() {
  usePageMeta('Feature Flags', 'Manage feature flags for the platform.');
  const { user } = useAuthStore();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFlags = async () => {
    const { data } = await sb.from('feature_flags').select('*').order('name');
    setFlags(data || []);
    setLoading(false);
  };

  useEffect(() => { loadFlags(); }, []);

  const toggleFlag = async (flag: FeatureFlag) => {
    const { error } = await sb.from('feature_flags').update({ enabled: !flag.enabled }).eq('id', flag.id);
    if (error) { toast.error('Failed to update'); return; }
    setFlags(f => f.map(fl => fl.id === flag.id ? { ...fl, enabled: !fl.enabled } : fl));
    toast.success(`${flag.name} ${!flag.enabled ? 'enabled' : 'disabled'}`);
  };

  const updateRollout = async (flag: FeatureFlag, pct: number) => {
    await sb.from('feature_flags').update({ rollout_percentage: pct }).eq('id', flag.id);
    setFlags(f => f.map(fl => fl.id === flag.id ? { ...fl, rollout_percentage: pct } : fl));
  };

  const createFlag = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const { error } = await sb.from('feature_flags').insert({
      name: newName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: newDesc || null,
      enabled: false,
      rollout_percentage: 100,
    });
    if (error) {
      toast.error(error.code === '23505' ? 'Flag already exists' : 'Failed to create');
    } else {
      toast.success('Flag created');
      setNewName('');
      setNewDesc('');
      setShowNew(false);
      loadFlags();
    }
    setSaving(false);
  };

  const deleteFlag = async (id: string) => {
    const { error } = await sb.from('feature_flags').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      setFlags(f => f.filter(fl => fl.id !== id));
      toast.success('Flag deleted');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold">Feature Flags</h1>
            <p className="text-muted-foreground">{flags.length} flags configured</p>
          </div>
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4 mr-1" /> New Flag
          </Button>
        </div>

        {showNew && (
          <Card className="mb-6">
            <CardContent className="pt-4 space-y-3">
              <Input placeholder="Flag name (e.g., new_dashboard)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={createFlag} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : flags.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No feature flags</p>
              <p className="text-sm text-muted-foreground">Create your first flag to control features remotely.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {flags.map(flag => (
              <Card key={flag.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium font-mono text-sm">{flag.name}</span>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'ON' : 'OFF'}
                        </Badge>
                        {flag.rollout_percentage < 100 && (
                          <Badge variant="outline">{flag.rollout_percentage}% rollout</Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={flag.rollout_percentage}
                        onChange={(e) => updateRollout(flag, parseInt(e.target.value) || 0)}
                        className="w-20 text-xs"
                      />
                      <Switch checked={flag.enabled} onCheckedChange={() => toggleFlag(flag)} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete flag "{flag.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. Any code checking this flag will default to disabled.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFlag(flag.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
