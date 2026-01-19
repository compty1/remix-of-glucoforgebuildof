import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useProjectDetail } from '@/hooks/useProjects';
import { ResearchSection } from '@/components/projects/ResearchSection';
import { CommunitySolutionsSection } from '@/components/projects/CommunitySolutionsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  Eye, 
  TrendingUp, 
  Share2, 
  Bookmark,
  FileText,
  Users,
  MessageCircle,
  Info
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { project, researchLinks, communitySolutions, isLoading } = useProjectDetail(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/projects">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </Layout>
    );
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">{project.title}</span>
        </nav>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className={getCategoryColor(project.category)}>
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Featured
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Eye className="h-4 w-4" />
              <span>{project.view_count} views</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
          
          <p className="text-lg text-muted-foreground">{project.description}</p>
          
          <div className="flex items-center gap-4 flex-wrap">
            {project.prevalence_percentage && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Affects ~{project.prevalence_percentage}% of T1D patients</span>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        {project.symptoms && project.symptoms.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Related Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="secondary">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Research</span>
              {researchLinks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {researchLinks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="solutions" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Solutions</span>
              {communitySolutions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {communitySolutions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discussion" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Discussion</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {project.official_research_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      What Science Says
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {project.official_research_summary}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {project.community_insights_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      What the Community Says
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {project.community_insights_summary}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{researchLinks.length}</p>
                  <p className="text-sm text-muted-foreground">Research Papers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{communitySolutions.length}</p>
                  <p className="text-sm text-muted-foreground">Community Solutions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{project.symptoms?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Related Symptoms</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{project.view_count}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="research">
            <ResearchSection researchLinks={researchLinks} />
          </TabsContent>

          <TabsContent value="solutions">
            <CommunitySolutionsSection solutions={communitySolutions} />
          </TabsContent>

          <TabsContent value="discussion">
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Join the Discussion</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Explore related discussions in our Community Solutions hub.
                </p>
                <Button asChild>
                  <Link to="/community-solutions">
                    Browse Community Solutions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
