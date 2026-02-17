import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ExternalLink,
  FileText,
  Download,
  Sparkles,
  Quote,
  Calendar,
  BookOpen,
  Users,
  Unlock,
  Lock,
} from 'lucide-react';
import type { NetworkNode } from '@/hooks/useCitationNetwork';

interface PaperDetailsModalProps {
  paper: NetworkNode | null;
  isOpen: boolean;
  onClose: () => void;
}

// Color mapping for research fields
const FIELD_COLORS: Record<string, string> = {
  'Medicine': 'bg-destructive/10 text-destructive border-destructive/20',
  'Biology': 'bg-success/10 text-success border-success/20',
  'Computer Science': 'bg-primary/10 text-primary border-primary/20',
  'Engineering': 'bg-warning/10 text-warning border-warning/20',
  'Chemistry': 'bg-accent text-accent-foreground border-border',
  'Physics': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  'Mathematics': 'bg-brand-red/10 text-brand-red border-brand-red/20',
};

const getFieldColorClass = (field: string): string => {
  return FIELD_COLORS[field] || 'bg-muted text-muted-foreground border-border';
};

export const PaperDetailsModal: React.FC<PaperDetailsModalProps> = ({
  paper,
  isOpen,
  onClose,
}) => {
  if (!paper) return null;

  const totalCitations = paper.citationCount || 0;
  const influentialCitations = paper.influentialCount || 0;
  const influentialPercentage = totalCitations > 0 
    ? Math.round((influentialCitations / totalCitations) * 100) 
    : 0;

  const doiUrl = paper.doi ? `https://doi.org/${paper.doi}` : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-2 flex-wrap">
            {paper.openAccess ? (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <Unlock className="h-3 w-3 mr-1" />
                Open Access
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" />
                Restricted
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {paper.sourceDatabase.replace(/_/g, ' ')}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-heading leading-tight pr-8">
            {paper.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {/* Authors and Publication Info */}
            {(paper.authors?.length || paper.publicationDate || paper.journalName) && (
              <div className="space-y-2">
                {paper.authors && paper.authors.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">
                      {paper.authors.slice(0, 5).join(', ')}
                      {paper.authors.length > 5 && ` +${paper.authors.length - 5} more`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {paper.publicationDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(paper.publicationDate).toLocaleDateString()}
                    </div>
                  )}
                  {paper.journalName && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="line-clamp-1">{paper.journalName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Summary (TLDR) */}
            {paper.tldr && (
              <div className="bg-highlight/5 border border-highlight/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-highlight" />
                  <h3 className="font-medium text-sm text-highlight">AI Summary</h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {paper.tldr}
                </p>
              </div>
            )}

            {/* Citation Metrics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Quote className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Citation Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">{totalCitations}</div>
                  <div className="text-xs text-muted-foreground">Total Citations</div>
                </div>
                <div className="bg-highlight/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-highlight">{influentialCitations}</div>
                  <div className="text-xs text-muted-foreground">Influential</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Influential citation ratio</span>
                  <span>{influentialPercentage}%</span>
                </div>
                <Progress value={influentialPercentage} className="h-2" />
              </div>
            </div>

            {/* Fields of Study */}
            {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Fields of Study</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.fieldsOfStudy.map((field, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={getFieldColorClass(field)}
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Abstract */}
            {paper.abstract && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Abstract</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {paper.abstract}
                </p>
              </div>
            )}

            <Separator />

            {/* External Links */}
            <div className="flex flex-wrap gap-2">
              {doiUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={doiUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on DOI
                  </a>
                </Button>
              )}
              {paper.pdfUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              )}
              {paper.fullTextUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={paper.fullTextUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Full Text
                  </a>
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
