import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Loader2, Users, AlertTriangle, ArrowUpDown, Search } from 'lucide-react';

const sb = supabase as any;

interface PatientSummary {
  patient_id: string;
  display_name: string;
  tir: number;
  time_below_54: number;
  last_upload: string | null;
  consent_status: string;
}

export default function ProviderDashboard() {
  usePageMeta('Provider Dashboard', 'Monitor your patients\' glucose management at a glance.');
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'risk' | 'name' | 'tir'>('risk');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: links } = await sb
        .from('provider_patient_links')
        .select('patient_id, consent_status')
        .eq('provider_id', user.id)
        .eq('consent_status', 'active');

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      // Build patient summaries (mock TIR data since we don't have real glucose for each patient)
      const summaries: PatientSummary[] = links.map((link: any) => ({
        patient_id: link.patient_id,
        display_name: `Patient ${link.patient_id.slice(0, 8)}`,
        tir: Math.round(Math.random() * 40 + 40), // Placeholder
        time_below_54: Math.round(Math.random() * 8),
        last_upload: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        consent_status: link.consent_status,
      }));

      setPatients(summaries);
      setLoading(false);
    };
    load();
  }, [user]);

  const sorted = [...patients]
    .filter(p => !searchQuery || p.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'risk') return b.time_below_54 - a.time_below_54;
      if (sortBy === 'tir') return a.tir - b.tir;
      return a.display_name.localeCompare(b.display_name);
    });

  const getRiskBadge = (below54: number) => {
    if (below54 >= 5) return <Badge variant="destructive">High Risk</Badge>;
    if (below54 >= 2) return <Badge className="bg-warning/10 text-warning">Moderate</Badge>;
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-3xl font-heading font-bold mb-2">Provider Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          {patients.length} patients connected • Sorted by {sortBy === 'risk' ? 'Most At Risk' : sortBy}
        </p>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setSortBy(s => s === 'risk' ? 'tir' : s === 'tir' ? 'name' : 'risk')}>
            <ArrowUpDown className="h-4 w-4 mr-1" /> Sort: {sortBy}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No patients connected</p>
              <p className="text-sm text-muted-foreground">Patients must consent to share their data with you.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sorted.map(p => (
              <Card key={p.patient_id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{p.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last upload: {p.last_upload ? new Date(p.last_upload).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm">TIR: <span className="font-bold">{p.tir}%</span></p>
                        <p className="text-xs text-muted-foreground">Below 54: {p.time_below_54}%</p>
                      </div>
                      {getRiskBadge(p.time_below_54)}
                      {p.time_below_54 >= 5 && <AlertTriangle className="h-5 w-5 text-destructive" />}
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
