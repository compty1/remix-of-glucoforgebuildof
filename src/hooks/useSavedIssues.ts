import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export interface SavedIssue {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  ai_summary: string | null;
  solutions_found: any[];
  status: 'active' | 'resolved' | 'ongoing';
  created_at: string;
  updated_at: string;
}

export interface CreateIssueData {
  title: string;
  description?: string;
  category?: string;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  category?: string;
  ai_summary?: string;
  solutions_found?: any[];
  status?: 'active' | 'resolved' | 'ongoing';
}

export function useSavedIssues() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['saved-issues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_saved_issues')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as SavedIssue[];
    },
    enabled: !!user,
  });

  const createIssue = useMutation({
    mutationFn: async (data: CreateIssueData) => {
      if (!user) throw new Error('Must be logged in');

      const { data: newIssue, error } = await supabase
        .from('user_saved_issues')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          category: data.category || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newIssue as SavedIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-issues'] });
      toast({
        title: 'Issue Saved',
        description: 'Your issue has been saved for tracking.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save issue',
        variant: 'destructive',
      });
    },
  });

  const updateIssue = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIssueData }) => {
      if (!user) throw new Error('Must be logged in');

      const { data: updatedIssue, error } = await supabase
        .from('user_saved_issues')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updatedIssue as SavedIssue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-issues'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update issue',
        variant: 'destructive',
      });
    },
  });

  const deleteIssue = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_saved_issues')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-issues'] });
      toast({
        title: 'Issue Deleted',
        description: 'The issue has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete issue',
        variant: 'destructive',
      });
    },
  });

  const updateIssueSummary = async (issueId: string, chatContent: string) => {
    // Generate a summary from the chat content
    const summary = chatContent.length > 500 
      ? chatContent.substring(0, 500) + '...' 
      : chatContent;

    await updateIssue.mutateAsync({
      id: issueId,
      data: { ai_summary: summary },
    });
  };

  return {
    issues,
    isLoading,
    createIssue,
    updateIssue,
    deleteIssue,
    updateIssueSummary,
  };
}
