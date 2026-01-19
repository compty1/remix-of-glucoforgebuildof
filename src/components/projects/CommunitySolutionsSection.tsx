import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ExternalLink, Star, Users } from 'lucide-react';
import { CommunitySolution } from '@/hooks/useProjects';

interface CommunitySolutionsSectionProps {
  solutions: CommunitySolution[];
}

const getEffectivenessLabel = (rating: number) => {
  if (rating >= 4.5) return { label: 'Highly Effective', className: 'bg-green-500/10 text-green-600' };
  if (rating >= 3.5) return { label: 'Effective', className: 'bg-blue-500/10 text-blue-600' };
  if (rating >= 2.5) return { label: 'Moderately Effective', className: 'bg-yellow-500/10 text-yellow-600' };
  if (rating >= 1.5) return { label: 'Mixed Results', className: 'bg-orange-500/10 text-orange-600' };
  return { label: 'Experimental', className: 'bg-gray-500/10 text-gray-600' };
};

export const CommunitySolutionsSection: React.FC<CommunitySolutionsSectionProps> = ({
  solutions,
}) => {
  if (solutions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Community Solutions Yet</h3>
          <p className="text-muted-foreground mt-2">
            Be the first to share a solution that has worked for you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Solutions ({solutions.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {solutions.map((solution) => {
          const effectiveness = getEffectivenessLabel(solution.effectiveness_rating);
          
          return (
            <Card key={solution.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={effectiveness.className}>
                        {effectiveness.label}
                      </Badge>
                      {solution.source && (
                        <Badge variant="secondary" className="text-xs">
                          {solution.source}
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-lg mb-2">{solution.solution_title}</h4>
                    <p className="text-muted-foreground">{solution.solution_description}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{solution.upvotes} upvotes</span>
                      </div>
                      
                      {solution.effectiveness_rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{solution.effectiveness_rating.toFixed(1)}/5 rating</span>
                        </div>
                      )}
                      
                      {solution.source_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={solution.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Original Source
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CommunitySolutionsSection;
