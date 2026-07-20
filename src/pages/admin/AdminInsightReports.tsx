import { useState } from 'react';
import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Flag, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

interface Report {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolution_note: string | null;
  created_at: string;
}

const STATUS_TABS: { value: ReportStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'open', label: 'Open', icon: Flag },
  { value: 'reviewing', label: 'Reviewing', icon: Clock },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2 },
  { value: 'dismissed', label: 'Dismissed', icon: XCircle },
];

export default function AdminInsightReports() {
  usePageMeta('Insight Moderation', 'Review and resolve user reports of inaccurate or harmful insights.');
  const [status, setStatus] = useState<ReportStatus>('open');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['insight-reports', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insight_reports')
        .select('id, reporter_id, target_type, target_id, reason, details, status, resolution_note, created_at')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Report[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, next, note }: { id: string; next: ReportStatus; note?: string }) => {
      const { error } = await supabase
        .from('insight_reports')
        .update({
          status: next,
          resolution_note: note ?? null,
          resolved_at: next === 'resolved' || next === 'dismissed' ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report updated');
      qc.invalidateQueries({ queryKey: ['insight-reports'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flag className="h-7 w-7 text-primary" /> Insight Moderation
          </h1>
          <p className="text-muted-foreground mt-1">Review flagged discoveries, cards, and research items.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.value}
                variant={status === t.value ? 'default' : 'outline'}
                onClick={() => setStatus(t.value)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" /> {t.label}
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : !reports || reports.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No {status} reports.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline">{r.target_type.replace('_', ' ')}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{r.target_id.slice(0, 8)}</span>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{r.reason.replace(/_/g, ' ')}</Badge>
                        <span>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge>{r.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {r.details && (
                    <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{r.details}</p>
                  )}
                  {r.resolution_note && (
                    <p className="text-xs text-muted-foreground">Resolution: {r.resolution_note}</p>
                  )}
                  {(r.status === 'open' || r.status === 'reviewing') && (
                    <>
                      <Textarea
                        placeholder="Resolution note (optional)"
                        value={notes[r.id] ?? ''}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                      />
                      <div className="flex flex-wrap gap-2">
                        {r.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, next: 'reviewing' })}>
                            Start reviewing
                          </Button>
                        )}
                        <Button size="sm" onClick={() => update.mutate({ id: r.id, next: 'resolved', note: notes[r.id] })}>
                          Mark resolved
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, next: 'dismissed', note: notes[r.id] })}>
                          Dismiss
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}