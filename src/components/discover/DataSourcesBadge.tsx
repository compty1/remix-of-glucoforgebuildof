import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const DATA_SOURCES = [
  { name: 'NIH RePORTER', type: 'Funding' },
  { name: 'ClinicalTrials.gov', type: 'Trials' },
  { name: 'PubMed', type: 'Research' },
  { name: 'OpenFDA', type: 'Devices' },
  { name: 'Reddit', type: 'Community' },
  { name: 'USPTO', type: 'Patents' },
  { name: 'CMS Medicare', type: 'Coverage' },
  { name: 'OpenFDA NDC', type: 'Drug Pricing' },
];

export function DataSourcesBadge() {
  const { data: lastRefresh } = useQuery({
    queryKey: ['data-refresh-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_refresh_logs')
        .select('completed_at, status, functions_succeeded, functions_failed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const lastUpdated = lastRefresh?.completed_at
    ? formatDistanceToNow(new Date(lastRefresh.completed_at), { addSuffix: true })
    : null;

  const isHealthy = lastRefresh?.status === 'completed' || lastRefresh?.status === 'partial';

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 mr-2">
        <Database className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Powered by {DATA_SOURCES.length} Real Data Sources:</span>
      </div>
      {DATA_SOURCES.map((source) => (
        <Badge key={source.name} variant="outline" className="text-xs flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          {source.name}
        </Badge>
      ))}
      {lastUpdated && (
        <Badge variant="secondary" className="text-xs flex items-center gap-1 ml-auto">
          {isHealthy ? (
            <Clock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <AlertCircle className="h-3 w-3 text-destructive" />
          )}
          Updated {lastUpdated}
        </Badge>
      )}
    </div>
  );
}
