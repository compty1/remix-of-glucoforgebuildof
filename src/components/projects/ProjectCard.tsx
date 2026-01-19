import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, Users, TrendingUp } from 'lucide-react';
import { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Gastrointestinal': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Neurological': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Metabolic': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Sleep': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'Psychological': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    'Hormonal': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Environmental': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Dermatological': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'General': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
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
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;
