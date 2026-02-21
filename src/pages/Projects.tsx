import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectSubmissionModal } from '@/components/projects/ProjectSubmissionModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FolderOpen, 
  Plus, 
  FileText, 
  Users, 
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    projects, 
    featuredProjects, 
    categories, 
    filters, 
    updateFilters, 
    isLoading 
  } = useProjects();
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Handle ?submit=true query parameter
  useEffect(() => {
    if (searchParams.get('submit') === 'true') {
      setSubmissionModalOpen(true);
    }
  }, [searchParams]);

  const handleModalClose = (open: boolean) => {
    setSubmissionModalOpen(open);
    if (!open && searchParams.get('submit')) {
      searchParams.delete('submit');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const stats = {
    totalProjects: projects.length,
    totalCategories: categories.length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
              <Badge variant="outline" className="text-primary border-primary/30">
                Research Projects
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Diabetes Issues Without Answers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              Explore comprehensive research on health challenges that diabetics commonly face 
              but doctors often don't have clear solutions for. Each project compiles scientific 
              studies, community-tested solutions, and real experiences.
            </p>
            <Button onClick={() => setSubmissionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit a Project
            </Button>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <Sparkles className="w-full h-full" />
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">Research Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">Community</p>
                <p className="text-xs text-muted-foreground">Driven Solutions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-chart-5/10">
                <TrendingUp className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">Science</p>
                <p className="text-xs text-muted-foreground">Backed Research</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilters({ category: value })}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            All Projects
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {filters.category}
              </Badge>
            )}
          </h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Projects Found</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  {filters.searchQuery || filters.category !== 'all' 
                    ? 'Try adjusting your filters to see more projects.'
                    : 'Be the first to submit a research project!'}
                </p>
                <Button onClick={() => setSubmissionModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit a Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Submission Modal */}
        <ProjectSubmissionModal
          open={submissionModalOpen}
          onOpenChange={handleModalClose}
        />
      </div>
    </Layout>
  );
};

export default Projects;
