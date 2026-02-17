import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useClaimedProjects } from '@/hooks/useClaimedProjects';
import { 
  Code2, 
  ExternalLink, 
  CheckCircle,
  Clock,
  Rocket
} from 'lucide-react';

const statusColors: Record<string, string> = {
  'claimed': 'bg-primary/10 text-primary',
  'in_progress': 'bg-warning/10 text-warning',
  'submitted': 'bg-accent text-accent-foreground',
  'completed': 'bg-success/10 text-success',
  'abandoned': 'bg-muted text-muted-foreground'
};

const statusLabels: Record<string, string> = {
  'claimed': 'Claimed',
  'in_progress': 'In Progress',
  'submitted': 'Submitted',
  'completed': 'Completed',
  'abandoned': 'Abandoned'
};

export function ClaimedProjectsWidget() {
  const navigate = useNavigate();
  const { claimedProjects, loading } = useClaimedProjects();

  const activeProjects = claimedProjects.filter(
    p => p.status !== 'completed' && p.status !== 'abandoned'
  );

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (claimedProjects.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No projects claimed yet</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/build-with-us')}
            >
              Browse Projects
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            My Projects
          </CardTitle>
          <Badge variant="secondary">{activeProjects.length} active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeProjects.slice(0, 3).map((project) => (
            <div 
              key={project.id}
              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/build-with-us/${project.project_id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium line-clamp-1">{project.project_title}</h4>
                <Badge variant="secondary" className={`${statusColors[project.status]} text-xs flex-shrink-0`}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                {project.status === 'completed' ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span>
                  {project.completed_tasks?.length || 0}/{project.claimed_tasks?.length || 0} tasks
                </span>
              </div>
            </div>
          ))}
        </div>

        {claimedProjects.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => navigate('/build-with-us')}
          >
            View All Projects ({claimedProjects.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
