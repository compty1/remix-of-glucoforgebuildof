import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
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
          <TableHead>Title</TableHead>
          <TableHead>Errors</TableHead>
          <TableHead>Received</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium max-w-xs truncate">
              {row.raw_payload?.title || 'Untitled'}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(row.validation_errors) ? row.validation_errors : []).map((err, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">
                    {err}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(row.received_at), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markReviewed.mutate({ id: row.id, notes: 'Dismissed' })}
                  disabled={markReviewed.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
