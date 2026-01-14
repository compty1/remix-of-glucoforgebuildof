import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { DeviceIssue } from '@/hooks/useDeviceAnalytics';

interface DeviceIssueCardProps {
  issue: DeviceIssue;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'High':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'Medium':
      return <Info className="h-4 w-4 text-info" />;
    case 'Low':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'bg-destructive text-destructive-foreground';
    case 'High':
      return 'bg-warning text-warning-foreground';
    case 'Medium':
      return 'bg-info text-info-foreground';
    case 'Low':
      return 'bg-success text-success-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const DeviceIssueCard = ({ issue }: DeviceIssueCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(issue.severity)}
            <CardTitle className="text-lg">{issue.issue_title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(issue.severity)}>
              {issue.severity}
            </Badge>
            <Badge variant="outline">
              {issue.frequency_percentage}% of users
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4">{issue.description}</p>
        
        <div className="space-y-4">
          {issue.solution && (
            <div>
              <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Official Solution
              </h4>
              <p className="text-sm bg-success/10 p-3 rounded-lg border border-success/20">
                {issue.solution}
              </p>
            </div>
          )}
          
          {issue.workaround && (
            <div>
              <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Community Workaround
              </h4>
              <p className="text-sm bg-info/10 p-3 rounded-lg border border-info/20">
                {issue.workaround}
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {issue.community_reports} community reports
            </span>
            <Button variant="outline" size="sm">
              Report This Issue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};