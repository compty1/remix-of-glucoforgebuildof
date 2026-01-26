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
import { 
  ExternalLink, 
  Calendar, 
  Users, 
  Building2, 
  FileText, 
  Tag,
  Lightbulb,
  Search
} from 'lucide-react';

interface PatentData {
  id: string;
  patent_id: string;
  title: string;
  abstract?: string;
  patent_date?: string;
  assignee?: string;
  inventors?: string[];
  patent_url?: string;
  diabetes_relevance_score?: number;
  classification_codes?: string[];
  claims_count?: number;
  citations_count?: number;
}

interface PatentDetailModalProps {
  patent: PatentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatentDetailModal({ patent, open, onOpenChange }: PatentDetailModalProps) {
  if (!patent) return null;

  const getRelevanceBadgeVariant = (score: number | undefined) => {
    if (!score) return 'secondary';
    if (score >= 90) return 'default';
    if (score >= 75) return 'outline';
    return 'secondary';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight">{patent.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <FileText className="h-4 w-4" />
                {patent.patent_id}
                {patent.patent_date && (
                  <>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    {patent.patent_date}
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Relevance Score */}
          {patent.diabetes_relevance_score && (
            <div className="flex items-center gap-2">
              <Badge variant={getRelevanceBadgeVariant(patent.diabetes_relevance_score)}>
                {patent.diabetes_relevance_score}% Diabetes Relevance
              </Badge>
              {patent.claims_count && (
                <Badge variant="outline">{patent.claims_count} Claims</Badge>
              )}
              {patent.citations_count && (
                <Badge variant="outline">{patent.citations_count} Citations</Badge>
              )}
            </div>
          )}

          {/* Abstract */}
          {patent.abstract && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Abstract
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {patent.abstract}
              </p>
            </div>
          )}

          <Separator />

          {/* Assignee */}
          {patent.assignee && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Assignee / Company
              </h4>
              <p className="text-sm">{patent.assignee}</p>
            </div>
          )}

          {/* Inventors */}
          {patent.inventors && patent.inventors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Inventors ({patent.inventors.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {patent.inventors.map((inventor, idx) => (
                  <a
                    key={idx}
                    href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(inventor)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {inventor}
                    <Search className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Classification Codes */}
          {patent.classification_codes && patent.classification_codes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Classification Codes
              </h4>
              <div className="flex flex-wrap gap-2">
                {patent.classification_codes.map((code, idx) => (
                  <Badge key={idx} variant="outline" className="font-mono text-xs">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {patent.patent_url && (
              <a
                href={patent.patent_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on Google Patents
              </a>
            )}
            {/* USPTO Alternative Link */}
            {patent.patent_id && (
              <a
                href={`https://patft.uspto.gov/netacgi/nph-Parser?patentnumber=${patent.patent_id.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on USPTO
              </a>
            )}
            <a
              href={`https://worldwide.espacenet.com/patent/search?q=${encodeURIComponent(patent.patent_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Search className="h-4 w-4" />
              Espacenet
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
