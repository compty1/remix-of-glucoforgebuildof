import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QuarantineRow {
  id: string;
  raw_payload: any;
  validation_errors: string[];
  received_at: string;
  reviewed: boolean;
  reviewer: string | null;
  review_notes: string | null;
}

export const QuarantineTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const { data: rows, isLoading } = useQuery({
    queryKey: ['quarantine-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_quarantine')
        .select('*')
        .eq('reviewed', false)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as QuarantineRow[];
    },
  });

  const markReviewed = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('post_quarantine')
        .update({ reviewed: true, reviewer: 'admin', review_notes: notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine-posts'] });
      queryClient.invalidateQueries({ queryKey: ['quarantine-count'] });
      toast.success('Post reviewed');
    },
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getConfidenceScore = (payload: any): number | null => {
    return payload?.confidence_score ?? null;
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-4">Loading quarantined posts...</p>;
  }

  if (!rows || rows.length === 0) {
    return <p className="text-muted-foreground py-4 text-center">No quarantined posts pending review.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Errors</TableHead>
          <TableHead>Confidence</TableHead>
          <TableHead>Received</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const isExpanded = expandedRows.has(row.id);
          const confidence = getConfidenceScore(row.raw_payload);
          const sourceUrl = row.raw_payload?.url || row.raw_payload?.source_url;
          const errors = Array.isArray(row.validation_errors) ? row.validation_errors : [];
          const notes = notesMap[row.id] ?? '';

          return (
            <React.Fragment key={row.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleRow(row.id)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {row.raw_payload?.title || 'Untitled'}
                </TableCell>
                <TableCell className="text-sm">
                  {sourceUrl ? (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      {row.raw_payload?.source || 'Link'}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{row.raw_payload?.source || '—'}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {errors.map((err: string, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {err}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {confidence !== null ? (
                    <Badge
                      variant="outline"
                      className={`text-xs ${confidence >= 0.7 ? 'border-success text-success' : confidence >= 0.4 ? 'border-warning text-warning' : 'border-destructive text-destructive'}`}
                    >
                      {(confidence * 100).toFixed(0)}%
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(row.received_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col gap-2 items-end">
                    <Input
                      placeholder="Reviewer notes..."
                      value={notes}
                      onChange={(e) => setNotesMap(prev => ({ ...prev, [row.id]: e.target.value }))}
                      className="h-7 text-xs w-48"
                    />
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReviewed.mutate({ id: row.id, notes: notes || 'Approved' })}
                        disabled={markReviewed.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReviewed.mutate({ id: row.id, notes: notes || 'Dismissed' })}
                        disabled={markReviewed.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              {/* Expanded Raw Payload Preview */}
              {isExpanded && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30">
                    <div className="p-3">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Raw Payload Preview</p>
                      <pre className="text-xs bg-background p-3 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                        {JSON.stringify(row.raw_payload, null, 2)}
                      </pre>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};
