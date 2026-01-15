import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeviceIssue } from '@/hooks/useDeviceDetails';
import { 
  AlertTriangle, 
  Users,
  Lightbulb,
  Wrench,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DeviceIssuesTabProps {
  issues: DeviceIssue[];
  onReportIssue: () => void;
}

export const DeviceIssuesTab: React.FC<DeviceIssuesTabProps> = ({ 
  issues,
  onReportIssue
}) => {
  const getSeverityBadge = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      case 'low':
        return <Badge className="bg-success/10 text-success border-success/20">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with report button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Known Issues</h2>
          <p className="text-muted-foreground text-sm">
            Community-reported problems and solutions
          </p>
        </div>
        <Button onClick={onReportIssue} variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report New Issue
        </Button>
      </div>

      {issues.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {issues.map((issue) => (
            <AccordionItem 
              key={issue.id} 
              value={issue.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-start gap-4 text-left w-full pr-4">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    issue.severity === 'high' || issue.severity === 'critical' 
                      ? 'text-destructive' 
                      : issue.severity === 'medium' 
                        ? 'text-warning' 
                        : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold">{issue.issue_title}</h3>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {issue.community_reports || 0} reports
                      </span>
                      {issue.frequency_percentage && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {issue.frequency_percentage}% frequency
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {/* Description */}
                  {issue.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  )}

                  {/* Official Solution */}
                  {issue.solution && (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-success" />
                        <h4 className="text-sm font-medium text-success">Official Solution</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.solution}</p>
                    </div>
                  )}

                  {/* Community Workaround */}
                  {issue.workaround && (
                    <div className="bg-highlight/5 border border-highlight/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-highlight" />
                        <h4 className="text-sm font-medium text-highlight">Community Workaround</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.workaround}</p>
                    </div>
                  )}

                  {/* No solution available */}
                  {!issue.solution && !issue.workaround && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No solution or workaround available yet. Check back later or contact manufacturer support.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="command-center-widget">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Reported</h3>
            <p className="text-muted-foreground mb-4">
              No known issues have been reported for this device yet.
            </p>
            <Button onClick={onReportIssue} variant="outline">
              Be the first to report an issue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
