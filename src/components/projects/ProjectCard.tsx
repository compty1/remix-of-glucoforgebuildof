import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, ChevronRight } from 'lucide-react';
import { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Gastrointestinal': 'bg-warning/10 text-warning border-warning/20',
    'Neurological': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
    'Metabolic': 'bg-primary/10 text-primary border-primary/20',
    'Sleep': 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    'Psychological': 'bg-chart-4/10 text-chart-4 border-chart-4/20',
    'Hormonal': 'bg-destructive/10 text-destructive border-destructive/20',
    'Environmental': 'bg-success/10 text-success border-success/20',
    'Dermatological': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
    'General': 'bg-muted text-muted-foreground border-border',
  };
  return colors[category] || colors['General'];
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/projects/${project.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className={getCategoryColor(project.category)}>
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Featured
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>
          
          {project.symptoms && project.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.symptoms.slice(0, 3).map((symptom, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {symptom}
                </Badge>
              ))}
              {project.symptoms.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.symptoms.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {project.prevalence_percentage && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{project.prevalence_percentage}% affected</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{project.view_count}</span>
            </div>
          </div>

          {/* Learn More Indicator */}
          <div className="pt-3 border-t border-border/50">
            <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn More <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;
