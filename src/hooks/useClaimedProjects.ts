import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export interface ClaimedProject {
  id: string;
  user_id: string;
  project_id: string;
  project_title: string;
  claimed_tasks: string[];
  completed_tasks: string[];
  status: 'claimed' | 'in_progress' | 'submitted' | 'completed' | 'abandoned';
  progress: number;
  notes: string | null;
  claimed_at: string;
  updated_at: string;
}

export function useClaimedProjects() {
  const [claimedProjects, setClaimedProjects] = useState<ClaimedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchClaimedProjects = useCallback(async () => {
    if (!user) {
      setClaimedProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('claimed_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      setClaimedProjects((data || []) as ClaimedProject[]);
    } catch (error) {
      console.error('Error fetching claimed projects:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const claimProject = async (projectId: string, projectTitle: string, tasks?: string[]) => {
    if (!user) {
      toast.error('Please sign in to claim a project');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('claimed_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          project_title: projectTitle,
          claimed_tasks: tasks || [],
          status: 'claimed',
          progress: 0
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.info('You have already claimed this project');
          return null;
        }
        throw error;
      }

      toast.success('Project claimed! Check your dashboard for progress tracking.');
      await fetchClaimedProjects();
      return data;
    } catch (error) {
      console.error('Error claiming project:', error);
      toast.error('Failed to claim project');
      return null;
    }
  };

  const updateProjectStatus = async (
    claimedProjectId: string, 
    status: ClaimedProject['status'],
    progress?: number
  ) => {
    if (!user) return false;

    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (progress !== undefined) {
        updateData.progress = progress;
      }

      const { error } = await supabase
        .from('claimed_projects')
        .update(updateData)
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Project status updated');
      await fetchClaimedProjects();
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return false;
    }
  };

  const completeTask = async (claimedProjectId: string, taskId: string) => {
    if (!user) return false;

    try {
      const project = claimedProjects.find(p => p.id === claimedProjectId);
      if (!project) return false;

      const completedTasks = [...(project.completed_tasks || []), taskId];
      const totalTasks = project.claimed_tasks?.length || 1;
      const progress = Math.round((completedTasks.length / totalTasks) * 100);

      const { error } = await supabase
        .from('claimed_projects')
        .update({ 
          completed_tasks: completedTasks,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Task completed!');
      await fetchClaimedProjects();
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
      return false;
    }
  };

  const abandonProject = async (claimedProjectId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('claimed_projects')
        .delete()
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Project removed from your list');
      await fetchClaimedProjects();
      return true;
    } catch (error) {
      console.error('Error abandoning project:', error);
      toast.error('Failed to remove project');
      return false;
    }
  };

  const isProjectClaimed = (projectId: string) => {
    return claimedProjects.some(p => p.project_id === projectId);
  };

  const getClaimedProject = (projectId: string) => {
    return claimedProjects.find(p => p.project_id === projectId);
  };

  useEffect(() => {
    fetchClaimedProjects();
  }, [fetchClaimedProjects]);

  return {
    claimedProjects,
    loading,
    claimProject,
    updateProjectStatus,
    completeTask,
    abandonProject,
    isProjectClaimed,
    getClaimedProject,
    refetch: fetchClaimedProjects
  };
}
