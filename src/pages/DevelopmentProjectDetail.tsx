import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { developmentProjects } from "@/data/developmentProjects";
import { useClaimedProjects } from "@/hooks/useClaimedProjects";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  Lightbulb, 
  Code2,
  Clock,
  Users,
  ExternalLink,
  Rocket,
  ListTodo,
  FileText,
  Zap,
  Check
} from "lucide-react";

const categoryColors: Record<string, string> = {
  'AI Intelligence': 'bg-accent/10 text-accent-foreground border-accent/20',
  'User Tools': 'bg-primary/10 text-primary border-primary/20',
  'Device/Goals Management': 'bg-warning/10 text-warning border-warning/20',
  'Community Support': 'bg-success/10 text-success border-success/20',
};

const statusColors: Record<string, string> = {
  'open': 'bg-success/10 text-success',
  'in progress': 'bg-warning/10 text-warning',
};

const priorityColors: Record<string, string> = {
  'high': 'bg-destructive/10 text-destructive',
  'medium': 'bg-warning/10 text-warning',
  'low': 'bg-muted text-muted-foreground',
};

const taskStatusColors: Record<string, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in_progress': 'bg-primary/10 text-primary',
  'done': 'bg-success/10 text-success',
};

export default function DevelopmentProjectDetail() {
  usePageMeta("Development Project", "Track development progress on T1D research projects and clinical milestones.");
  const { projectId } = useParams<{ projectId: string }>();
  const project = developmentProjects.find(p => p.id === projectId);
  const { user } = useAuthStore();
  const { claimedProjects, claimProject, updateProgress, isLoading } = useClaimedProjects();
  
  const claimedProject = claimedProjects.find(cp => cp.project_id === projectId);
  const isProjectClaimed = !!claimedProject;

  const handleClaimProject = async () => {
    if (!user) {
      toast.error('Please sign in to claim projects');
      return;
    }
    if (!project) return;
    
    await claimProject(project.id, project.title);
  };

  const handleToggleTask = async (taskId: string) => {
    if (!claimedProject) return;
    
    const isCompleted = claimedProject.completed_tasks?.includes(taskId);
    const newCompletedTasks = isCompleted 
      ? claimedProject.completed_tasks?.filter(t => t !== taskId) || []
      : [...(claimedProject.completed_tasks || []), taskId];
    
import { usePageMeta } from '@/hooks/usePageMeta';
    const totalTasks = project?.tasks?.length || 1;
    const newProgress = Math.round((newCompletedTasks.length / totalTasks) * 100);
    
    await updateProgress(claimedProject.id, newProgress, newCompletedTasks);
  };

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The project you're looking for doesn't exist.
              </p>
              <Button asChild>
                <Link to="/build-with-us">Back to Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const completedTasks = claimedProject?.completed_tasks?.length || project.tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-5xl">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/build-with-us" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className={categoryColors[project.category]}>
                {project.category}
              </Badge>
              <Badge variant="secondary" className={statusColors[project.status]}>
                {project.status}
              </Badge>
              {project.estimatedEffort && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {project.estimatedEffort} effort
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {project.fullDescription || project.description}
            </p>

            {project.progress !== undefined && (
              <div className="mt-6 max-w-md">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Purpose */}
                {project.purpose && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-highlight" />
                        Purpose
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{project.purpose}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Goals */}
                {project.goals && project.goals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {project.goals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-primary">{index + 1}</span>
                            </div>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Outcomes */}
                {project.outcomes && project.outcomes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Expected Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {project.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Use Cases */}
                {project.useCases && project.useCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-info" />
                        Use Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {project.useCases.map((useCase, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{useCase}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tasks */}
                {project.tasks && project.tasks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ListTodo className="h-5 w-5" />
                          Tasks
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {completedTasks}/{totalTasks} completed
                        </span>
                      </div>
                      <Progress value={taskProgress} className="h-1.5 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.tasks.map((task) => {
                          const isTaskCompleted = claimedProject?.completed_tasks?.includes(task.id);
                          return (
                            <div 
                              key={task.id} 
                              className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${isTaskCompleted ? 'bg-success/5 border-success/20' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  {isProjectClaimed && (
                                    <Checkbox
                                      checked={isTaskCompleted}
                                      onCheckedChange={() => handleToggleTask(task.id)}
                                      className="mt-1"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`font-medium ${isTaskCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                        {task.title}
                                      </h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${isTaskCompleted ? 'bg-success/10 text-success' : taskStatusColors[task.status]}`}
                                      >
                                        {isTaskCompleted ? 'completed' : task.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {task.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {task.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${priorityColors[task.priority]}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Technical Requirements */}
                {project.technicalRequirements && project.technicalRequirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Tech Stack
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.technicalRequirements.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                {project.resources && project.resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {project.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <span className="text-sm">{resource.title}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className={isProjectClaimed ? "bg-success/5 border-success/20" : "bg-primary/5 border-primary/20"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      {isProjectClaimed ? (
                        <>
                          <Check className="h-8 w-8 mx-auto mb-3 text-success" />
                          <h3 className="font-semibold mb-2">Project Claimed!</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            You're working on this project. Track your progress below.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{claimedProject?.progress || 0}%</span>
                            </div>
                            <Progress value={claimedProject?.progress || 0} className="h-2" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Rocket className="h-8 w-8 mx-auto mb-3 text-primary" />
                          <h3 className="font-semibold mb-2">Ready to Contribute?</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Claim this project or specific tasks to start building.
                          </p>
                          <Button 
                            className="w-full gap-2"
                            onClick={handleClaimProject}
                            disabled={isLoading || !user}
                          >
                            <Zap className="h-4 w-4" />
                            {isLoading ? 'Claiming...' : 'Claim Project'}
                          </Button>
                          {!user && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Sign in to claim projects
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                {(project.startedDate || project.targetCompletionDate) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      {project.startedDate && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Started:</span> {project.startedDate}
                        </p>
                      )}
                      {project.targetCompletionDate && (
                        <p className="text-muted-foreground mt-1">
                          <span className="font-medium">Target:</span> {project.targetCompletionDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
