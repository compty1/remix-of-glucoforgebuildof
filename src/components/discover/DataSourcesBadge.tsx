import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle2 } from 'lucide-react';

const DATA_SOURCES = [
  { name: 'NIH RePORTER', type: 'Funding' },
  { name: 'ClinicalTrials.gov', type: 'Trials' },
  { name: 'PubMed', type: 'Research' },
  { name: 'OpenFDA', type: 'Devices' },
  { name: 'Reddit', type: 'Community' },
  { name: 'USPTO', type: 'Patents' },
];

export function DataSourcesBadge() {
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
    </div>
  );
}
