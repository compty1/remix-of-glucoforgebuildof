import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Calendar, 
  Building, 
  User,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react';

interface FundingProject {
  id: string;
  project_number: string | null;
  project_title: string;
  principal_investigator: string | null;
  organization: string | null;
  fiscal_year: number | null;
  funding_amount: number | null;
  project_start_date: string | null;
  project_end_date: string | null;
  abstract: string | null;
  nih_spending_category?: string | null;
}

interface FundingDetailModalProps {
  project: FundingProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundingDetailModal({ project, open, onOpenChange }: FundingDetailModalProps) {
  if (!project) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  const getProjectDuration = () => {
    if (!project.project_start_date || !project.project_end_date) return null;
    try {
      const start = new Date(project.project_start_date);
      const end = new Date(project.project_end_date);
      const years = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
      return `${years} year${years !== 1 ? 's' : ''}`;
    } catch {
      return null;
    }
  };

  const nihReporterUrl = project.project_number 
    ? `https://reporter.nih.gov/search/results?query=${encodeURIComponent(project.project_number)}`
    : `https://reporter.nih.gov/search/results?query=${encodeURIComponent(project.project_title)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight pr-8">{project.project_title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2 flex-wrap">
                {project.project_number && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {project.project_number}
                  </Badge>
                )}
                {project.fiscal_year && (
                  <Badge variant="secondary">FY {project.fiscal_year}</Badge>
                )}
                {project.nih_spending_category && (
                  <Badge variant="outline">{project.nih_spending_category}</Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Funding Amount */}
            {project.funding_amount && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Award Amount</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${(project.funding_amount / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.principal_investigator && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Principal Investigator</span>
                  </div>
                  <p className="font-medium">{project.principal_investigator}</p>
                </div>
              )}

              {project.organization && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Institution</span>
                  </div>
                  <p className="font-medium">{project.organization}</p>
                </div>
              )}

              {(project.project_start_date || project.project_end_date) && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Project Timeline</span>
                  </div>
                  <p className="font-medium">
                    {formatDate(project.project_start_date)} – {formatDate(project.project_end_date)}
                  </p>
                </div>
              )}

              {getProjectDuration() && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Duration</span>
                  </div>
                  <p className="font-medium">{getProjectDuration()}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Full Abstract */}
            {project.abstract && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Full Abstract
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {project.abstract}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* External Links */}
            <div className="space-y-3">
              <h4 className="font-semibold">External Resources</h4>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href={nihReporterUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on NIH RePORTER
                  </a>
                </Button>
                {project.principal_investigator && (
                  <Button variant="outline" asChild>
                    <a 
                      href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(project.principal_investigator)}[author]+diabetes`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      PI Publications
                    </a>
                  </Button>
                )}
                {project.organization && (
                  <Button variant="outline" asChild>
                    <a 
                      href={`https://reporter.nih.gov/search/results?query=${encodeURIComponent(project.organization)}&offset=0&limit=25&sort_field=fiscal_year&sort_order=desc`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      More from {project.organization.split(' ').slice(0, 2).join(' ')}...
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Data Source Attribution */}
            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <p>
                Data sourced from NIH RePORTER (Research Portfolio Online Reporting Tools). 
                For the most up-to-date information, please visit the NIH RePORTER website.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
