import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  ExternalLink, 
  Sparkles,
  Award,
  ArrowUpRight
} from 'lucide-react';
import type { ResearchPaperWithTLDR } from '@/hooks/useResearchInsights';

interface InfluentialPapersListProps {
  papers: ResearchPaperWithTLDR[];
  onSelectPaper?: (paper: ResearchPaperWithTLDR) => void;
}

export const InfluentialPapersList: React.FC<InfluentialPapersListProps> = ({ 
  papers,
  onSelectPaper 
}) => {
  const getPaperUrl = (paper: ResearchPaperWithTLDR) => {
    if (paper.pdf_url) return paper.pdf_url;
    if (paper.full_text_url) return paper.full_text_url;
    if (paper.doi) return `https://doi.org/${paper.doi}`;
    return null;
  };

  const getInfluentialRatio = (paper: ResearchPaperWithTLDR) => {
    if (!paper.citation_count || paper.citation_count === 0) return 0;
    return (paper.influential_citation_count || 0) / paper.citation_count * 100;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-warning text-warning-foreground"><Award className="h-3 w-3 mr-1" />Top</Badge>;
    if (index < 3) return <Badge variant="secondary">#{index + 1}</Badge>;
    return null;
  };

  return (
    <Card className="command-center-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-highlight" />
            Most Influential Research
          </CardTitle>
          <Badge variant="outline">{papers.length} papers</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Papers ranked by influential citations - research that actually influenced other work
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {papers.map((paper, idx) => {
              const ratio = getInfluentialRatio(paper);
              const url = getPaperUrl(paper);
              
              return (
                <div 
                  key={paper.id}
                  className="p-4 rounded-lg border border-border hover:border-highlight/50 hover:bg-muted/50 transition-all cursor-pointer group"
                  onClick={() => onSelectPaper?.(paper)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getRankBadge(idx)}
                      {paper.tldr_summary && (
                        <Badge variant="outline" className="text-highlight border-highlight/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          TLDR
                        </Badge>
                      )}
                    </div>
                    {url && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-highlight transition-colors">
                    {paper.title}
                  </h4>
                  
                  {paper.tldr_summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {paper.tldr_summary}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-highlight" />
                      <span className="font-medium text-highlight">
                        {paper.influential_citation_count || 0}
                      </span>
                      <span className="text-muted-foreground">influential</span>
                    </div>
                    <div className="text-muted-foreground">
                      {paper.citation_count || 0} total citations
                    </div>
                    {ratio > 0 && (
                      <Badge 
                        variant="outline" 
                        className={ratio > 20 ? 'text-success border-success/30' : ''}
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {ratio.toFixed(1)}% influential
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
