import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';
import { Shield, Search, Loader2, Clock, Database, User, FileText } from 'lucide-react';

const sb = supabase as any;

interface AuditEntry {
  id: string;
  user_id: string | null;
  table_name: string;
  record_id: string;
  action: string;
  old_value: any;
  new_value: any;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function AuditLog() {
  usePageMeta('Audit Log', 'FDA 21 CFR Part 11 compliant audit trail.');
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = sb.from('audit_trail').select('*').order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (tableFilter !== 'all') query = query.eq('table_name', tableFilter);
      if (actionFilter !== 'all') query = query.eq('action', actionFilter);
      const { data } = await query;
      setEntries(data || []);
      setLoading(false);
    };
    load();
  }, [tableFilter, actionFilter, page]);

  const filtered = entries.filter(e =>
    !searchQuery ||
    e.record_id.includes(searchQuery) ||
    e.table_name.includes(searchQuery) ||
    e.user_id?.includes(searchQuery)
  );

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-primary/10 text-primary';
      case 'UPDATE': return 'bg-warning/10 text-warning';
      case 'DELETE': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-3xl font-heading font-bold mb-2">Audit Trail</h1>
        <p className="text-muted-foreground mb-6">
          Immutable log of all medical record changes. FDA 21 CFR Part 11 compliant.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by record ID, table, or user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Table" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              <SelectItem value="glucose_uploads">Glucose Uploads</SelectItem>
              <SelectItem value="profiles">Profiles</SelectItem>
              <SelectItem value="chat_sessions">Chat Sessions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">INSERT</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No audit entries found</p>
              <p className="text-sm text-muted-foreground">Changes to medical records will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => (
              <Card key={entry.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(entry.action)}>{entry.action}</Badge>
                        <span className="text-sm font-medium">{entry.table_name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{entry.record_id.slice(0, 8)}</span>
                      </div>
                      {entry.reason && (
                        <p className="text-sm text-muted-foreground"><FileText className="h-3 w-3 inline mr-1" />{entry.reason}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span><Clock className="h-3 w-3 inline mr-1" />{new Date(entry.created_at).toLocaleString()}</span>
                        {entry.user_id && <span><User className="h-3 w-3 inline mr-1" />{entry.user_id.slice(0, 8)}</span>}
                        {entry.ip_address && <span>{entry.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Gap 341: Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
            <Button variant="outline" size="sm" disabled={filtered.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
