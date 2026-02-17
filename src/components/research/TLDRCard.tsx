import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ExternalLink, 
  Quote, 
  TrendingUp,
  BookOpen,
  FileText
} from 'lucide-react';
import type { ResearchPaperWithTLDR } from '@/hooks/useResearchInsights';

interface TLDRCardProps {
  paper: ResearchPaperWithTLDR;
  showFullAbstract?: boolean;
  onViewDetails?: (paper: ResearchPaperWithTLDR) => void;
}

export const TLDRCard: React.FC<TLDRCardProps> = ({ 
  paper, 
  showFullAbstract = false,
  onViewDetails 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInfluentialRatio = () => {
    if (!paper.citation_count || paper.citation_count === 0) return 0;
    return ((paper.influential_citation_count || 0) / paper.citation_count * 100).toFixed(1);
  };

  const getPaperUrl = () => {
    if (paper.pdf_url) return paper.pdf_url;
    if (paper.full_text_url) return paper.full_text_url;
    if (paper.doi) return `https://doi.org/${paper.doi}`;
    return null;
  };

  return (
    <Card className="command-center-widget hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            {paper.tldr_summary && (
              <Badge className="bg-highlight/10 text-highlight border-highlight/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Summary
              </Badge>
            )}
            {paper.open_access && (
              <Badge variant="outline" className="text-success border-success/30">
                Open Access
              </Badge>
            )}
            <Badge variant="outline">{paper.source_database}</Badge>
          </div>
        </div>
        
        <CardTitle className="text-lg font-heading leading-tight line-clamp-2">
          {paper.title}
        </CardTitle>
        
        <div className="text-sm text-muted-foreground mt-1">
          {paper.journal_name && <span>{paper.journal_name} • </span>}
          {formatDate(paper.publication_date)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* TLDR Summary - Highlighted */}
        {paper.tldr_summary && (
          <div className="bg-highlight/5 border border-highlight/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-highlight">
              <Quote className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Generated Summary</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {paper.tldr_summary}
            </p>
          </div>
        )}

        {/* Abstract (collapsible) */}
        {showFullAbstract && paper.abstract && (
          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground mb-1">Abstract</h4>
            <p className="line-clamp-4">{paper.abstract}</p>
          </div>
        )}

        {/* Citation Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Citations:</span>
            <span className="font-medium">{paper.citation_count || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-highlight" />
            <span className="text-muted-foreground">Influential:</span>
            <span className="font-medium text-highlight">
              {paper.influential_citation_count || 0}
              {paper.citation_count && paper.citation_count > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({getInfluentialRatio()}%)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Fields of Study */}
        {paper.fields_of_study && paper.fields_of_study.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {paper.fields_of_study.slice(0, 4).map((field, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {field}
              </Badge>
            ))}
            {paper.fields_of_study.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{paper.fields_of_study.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails(paper)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          {getPaperUrl() && (
            <Button variant="outline" size="sm" asChild>
              <a href={getPaperUrl()!} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
