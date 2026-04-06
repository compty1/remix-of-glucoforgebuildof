import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

function claimedProjectsKey(userId: string | undefined) {
  return ['claimed-projects', userId] as const;
}

export function useClaimedProjects() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const qk = claimedProjectsKey(user?.id);

  const { data: claimedProjects = [], isLoading: loading } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claimed_projects')
        .select('*')
        .eq('user_id', user!.id)
        .order('claimed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ClaimedProject[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: qk });
  }, [queryClient, qk]);

  const claimMutation = useMutation({
    mutationFn: async ({ projectId, projectTitle, tasks }: { projectId: string; projectTitle: string; tasks?: string[] }) => {
      if (!user) throw new Error('Please sign in to claim a project');
      const { data, error } = await supabase
        .from('claimed_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          project_title: projectTitle,
          claimed_tasks: tasks || [],
          status: 'claimed',
          progress: 0,
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
      return data;
    },
    onSuccess: (data) => {
      if (data) toast.success('Project claimed! Check your dashboard for progress tracking.');
      invalidate();
    },
    onError: () => toast.error('Failed to claim project'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ claimedProjectId, status, progress }: { claimedProjectId: string; status: ClaimedProject['status']; progress?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (progress !== undefined) updateData.progress = progress;
      const { error } = await supabase
        .from('claimed_projects')
        .update(updateData)
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Project status updated'); invalidate(); },
    onError: () => toast.error('Failed to update project'),
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ claimedProjectId, progress, completedTasks }: { claimedProjectId: string; progress: number; completedTasks?: string[] }) => {
      if (!user) throw new Error('Not authenticated');
      const updateData: Record<string, unknown> = {
        progress,
        updated_at: new Date().toISOString(),
        status: progress === 100 ? 'completed' : 'in_progress',
      };
      if (completedTasks !== undefined) updateData.completed_tasks = completedTasks;
      const { error } = await supabase
        .from('claimed_projects')
        .update(updateData)
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error('Failed to update progress'),
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ claimedProjectId, taskId }: { claimedProjectId: string; taskId: string }) => {
      if (!user) throw new Error('Not authenticated');
      // Fetch fresh data to avoid stale closure (Bug 310)
      const { data: project, error: fetchErr } = await supabase
        .from('claimed_projects')
        .select('*')
        .eq('id', claimedProjectId)
        .eq('user_id', user.id)
        .single();
      if (fetchErr || !project) throw new Error('Project not found');

      const completedTasks = [...((project.completed_tasks as string[]) || []), taskId];
      const totalTasks = (project.claimed_tasks as string[])?.length || 1;
      const progress = Math.round((completedTasks.length / totalTasks) * 100);

      const { error } = await supabase
        .from('claimed_projects')
        .update({
          completed_tasks: completedTasks,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Task completed!'); invalidate(); },
    onError: () => toast.error('Failed to complete task'),
  });

  const abandonMutation = useMutation({
    mutationFn: async (claimedProjectId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('claimed_projects')
        .delete()
        .eq('id', claimedProjectId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Project removed from your list'); invalidate(); },
    onError: () => toast.error('Failed to remove project'),
  });

  const isProjectClaimed = useCallback(
    (projectId: string) => claimedProjects.some(p => p.project_id === projectId),
    [claimedProjects]
  );

  const getClaimedProject = useCallback(
    (projectId: string) => claimedProjects.find(p => p.project_id === projectId),
    [claimedProjects]
  );

  // Adapter functions to preserve old API shape
  const claimProject = async (projectId: string, projectTitle: string, tasks?: string[]) => {
    try { return await claimMutation.mutateAsync({ projectId, projectTitle, tasks }); } catch { return null; }
  };
  const updateProjectStatus = async (claimedProjectId: string, status: ClaimedProject['status'], progress?: number) => {
    try { await updateStatusMutation.mutateAsync({ claimedProjectId, status, progress }); return true; } catch { return false; }
  };
  const updateProgress = async (claimedProjectId: string, progress: number, completedTasks?: string[]) => {
    try { await updateProgressMutation.mutateAsync({ claimedProjectId, progress, completedTasks }); return true; } catch { return false; }
  };
  const completeTask = async (claimedProjectId: string, taskId: string) => {
    try { await completeTaskMutation.mutateAsync({ claimedProjectId, taskId }); return true; } catch { return false; }
  };
  const abandonProject = async (claimedProjectId: string) => {
    try { await abandonMutation.mutateAsync(claimedProjectId); return true; } catch { return false; }
  };

  return {
    claimedProjects,
    loading,
    isLoading: loading,
    claimProject,
    updateProjectStatus,
    updateProgress,
    completeTask,
    abandonProject,
    isProjectClaimed,
    getClaimedProject,
    refetch: invalidate,
  };
}
