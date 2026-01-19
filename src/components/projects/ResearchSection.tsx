import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ExternalLink, FileText, BookOpen, FlaskConical, BarChart3 } from 'lucide-react';
import { ResearchLink } from '@/hooks/useProjects';

interface ResearchSectionProps {
  researchLinks: ResearchLink[];
}

const getResearchTypeIcon = (type: string) => {
  switch (type) {
    case 'study':
      return <FlaskConical className="h-4 w-4" />;
    case 'paper':
      return <FileText className="h-4 w-4" />;
    case 'clinical_trial':
      return <BookOpen className="h-4 w-4" />;
    case 'meta_analysis':
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getResearchTypeLabel = (type: string) => {
  switch (type) {
    case 'study':
      return 'Study';
    case 'paper':
      return 'Paper';
    case 'clinical_trial':
      return 'Clinical Trial';
    case 'meta_analysis':
      return 'Meta Analysis';
    default:
      return type;
  }
};

const getRelevanceBadge = (score: number) => {
  if (score >= 80) return { label: 'Highly Relevant', className: 'bg-green-500/10 text-green-600' };
  if (score >= 60) return { label: 'Relevant', className: 'bg-blue-500/10 text-blue-600' };
  if (score >= 40) return { label: 'Somewhat Relevant', className: 'bg-yellow-500/10 text-yellow-600' };
  return { label: 'Related', className: 'bg-gray-500/10 text-gray-600' };
};

export const ResearchSection: React.FC<ResearchSectionProps> = ({ researchLinks }) => {
  if (researchLinks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Research Links Yet</h3>
          <p className="text-muted-foreground mt-2">
            We're actively collecting research papers and studies related to this topic.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Scientific Research ({researchLinks.length})
        </h3>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {researchLinks.map((research, index) => {
          const relevance = getRelevanceBadge(research.relevance_score);
          
          return (
            <AccordionItem
              key={research.id}
              value={research.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-start gap-3 text-left flex-1">
                  <div className="mt-0.5 text-muted-foreground">
                    {getResearchTypeIcon(research.research_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getResearchTypeLabel(research.research_type)}
                      </Badge>
                      <Badge variant="outline" className={relevance.className}>
                        {relevance.label}
                      </Badge>
                    </div>
                    <h4 className="font-medium line-clamp-2">{research.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {research.authors && <span>{research.authors}</span>}
                      {research.publication && (
                        <span className="ml-2 italic">{research.publication}</span>
                      )}
                      {research.publication_date && (
                        <span className="ml-2">
                          ({new Date(research.publication_date).getFullYear()})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-7 space-y-4">
                  {research.key_findings && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Key Findings</h5>
                      <p className="text-sm text-muted-foreground">
                        {research.key_findings}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {research.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={research.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Full Paper
                        </a>
                      </Button>
                    )}
                    {research.doi && (
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://doi.org/${research.doi}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          DOI: {research.doi}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ResearchSection;
