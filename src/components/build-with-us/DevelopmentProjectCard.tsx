import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { DevelopmentProject } from "@/data/developmentProjects";

const categoryColors: Record<DevelopmentProject['category'], string> = {
  'AI Intelligence': 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
  'User Tools': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  'Device/Goals Management': 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
  'Community Support': 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
};

const statusColors: Record<DevelopmentProject['status'], string> = {
  'open': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'in progress': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

interface DevelopmentProjectCardProps {
  project: DevelopmentProject;
}

export function DevelopmentProjectCard({ project }: DevelopmentProjectCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/build-with-us/${project.id}`);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 flex flex-col h-full cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`${categoryColors[project.category]} text-xs font-medium`}
          >
            {project.category}
          </Badge>
          <Badge 
            variant="secondary" 
            className={`${statusColors[project.status]} text-xs font-medium`}
          >
            {project.status}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mt-3 group-hover:text-primary transition-colors line-clamp-2">
          {project.title}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs bg-muted/50 hover:bg-muted"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {project.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-primary/5 mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Project
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
