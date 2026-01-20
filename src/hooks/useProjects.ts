import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  symptoms: string[];
  prevalence_percentage: number | null;
  category: string;
  official_research_summary: string | null;
  community_insights_summary: string | null;
  status: string;
  featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  possible_causes: string[] | null;
  search_volume_monthly: number | null;
  affected_population_estimate: number | null;
  condition_triggers: string[] | null;
  related_conditions: string[] | null;
  management_difficulty: string | null;
  time_to_diagnosis_avg: string | null;
  commonly_misdiagnosed_as: string[] | null;
}

export interface ResearchLink {
  id: string;
  project_id: string;
  research_type: string;
  title: string;
  authors: string | null;
  publication: string | null;
  publication_date: string | null;
  url: string | null;
  doi: string | null;
  key_findings: string | null;
  relevance_score: number;
  created_at: string;
}

export interface CommunitySolution {
  id: string;
  project_id: string;
  solution_title: string;
  solution_description: string;
  source: string | null;
  source_url: string | null;
  upvotes: number;
  effectiveness_rating: number;
  created_at: string;
}

export interface ProjectSubmission {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  personal_experience: string | null;
  suggested_solutions: string | null;
  supporting_links: string[];
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ProjectFilters {
  category: string;
  searchQuery: string;
}

const defaultFilters: ProjectFilters = {
  category: 'all',
  searchQuery: '',
};

export const useProjects = (initialFilters?: Partial<ProjectFilters>) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const { toast } = useToast();

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('diabetic_health_projects')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('view_count', { ascending: false });

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: featuredProjects = [] } = useQuery({
    queryKey: ['projects', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diabetic_health_projects')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Project[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['projects', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diabetic_health_projects')
        .select('category')
        .eq('status', 'published');

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(p => p.category) || [])];
      return uniqueCategories.sort();
    },
  });

  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    projects,
    featuredProjects,
    categories,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    error,
    refetch,
  };
};

export const useProjectDetail = (slug: string) => {
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diabetic_health_projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('diabetic_health_projects')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as Project;
    },
    enabled: !!slug,
  });

  const { data: researchLinks = [], isLoading: researchLoading } = useQuery({
    queryKey: ['project', slug, 'research'],
    queryFn: async () => {
      if (!project?.id) return [];
      
      const { data, error } = await supabase
        .from('project_research_links')
        .select('*')
        .eq('project_id', project.id)
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      return data as ResearchLink[];
    },
    enabled: !!project?.id,
  });

  const { data: communitySolutions = [], isLoading: solutionsLoading } = useQuery({
    queryKey: ['project', slug, 'solutions'],
    queryFn: async () => {
      if (!project?.id) return [];
      
      const { data, error } = await supabase
        .from('project_community_solutions')
        .select('*')
        .eq('project_id', project.id)
        .order('upvotes', { ascending: false });

      if (error) throw error;
      return data as CommunitySolution[];
    },
    enabled: !!project?.id,
  });

  return {
    project,
    researchLinks,
    communitySolutions,
    isLoading: projectLoading || researchLoading || solutionsLoading,
  };
};

export const useProjectSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: mySubmissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['project-submissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectSubmission[];
    },
    enabled: !!user?.id,
  });

  const submitProject = useMutation({
    mutationFn: async (submission: {
      title: string;
      description: string;
      personal_experience?: string;
      suggested_solutions?: string;
      supporting_links?: string[];
    }) => {
      if (!user?.id) throw new Error('Must be logged in to submit');

      const { data, error } = await supabase
        .from('project_submissions')
        .insert({
          user_id: user.id,
          title: submission.title,
          description: submission.description,
          personal_experience: submission.personal_experience || null,
          suggested_solutions: submission.suggested_solutions || null,
          supporting_links: submission.supporting_links || [],
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Project Submitted',
        description: 'Your project has been submitted for review. We\'ll notify you when it\'s reviewed.',
      });
      queryClient.invalidateQueries({ queryKey: ['project-submissions'] });
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    mySubmissions,
    submissionsLoading,
    submitProject,
  };
};
