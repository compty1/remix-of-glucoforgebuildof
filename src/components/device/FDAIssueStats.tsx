import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

interface FDAIssueStatsProps {
  fdaMaudeCount?: number;
  fdaRecallCount?: number;
  issueCategory?: string;
  sourceUrl?: string;
  lastFdaUpdate?: string;
}

export const FDAIssueStats: React.FC<FDAIssueStatsProps> = ({
  fdaMaudeCount = 0,
  fdaRecallCount = 0,
  issueCategory,
  sourceUrl,
  lastFdaUpdate
}) => {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-medium">FDA MAUDE Reports</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Adverse Event Reports */}
        <div className="bg-background rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Adverse Events</span>
          </div>
          <div className="text-xl font-bold">
            {fdaMaudeCount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            reported to FDA
          </p>
        </div>

        {/* Recall Status */}
        <div className="bg-background rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${fdaRecallCount > 0 ? 'text-destructive' : 'text-success'}`} />
            <span className="text-xs text-muted-foreground">Recalls</span>
          </div>
          <div className="text-xl font-bold">
            {fdaRecallCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {fdaRecallCount > 0 ? 'active recalls' : 'no recalls'}
          </p>
        </div>
      </div>

      {/* Category Badge */}
      {issueCategory && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Category:</span>
          <Badge variant="outline" className="text-xs">
            {issueCategory}
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open('https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm', '_blank')}
        >
          <FileText className="h-3 w-3 mr-1" />
          Search FDA MAUDE
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open('https://www.accessdata.fda.gov/scripts/medwatch/index.cfm?action=reporting.home', '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Report to MedWatch
        </Button>
      </div>

      {/* Source Attribution */}
      <p className="text-xs text-muted-foreground italic">
        Data sourced from FDA Manufacturer and User Facility Device Experience (MAUDE) database
      </p>
    </div>
  );
};