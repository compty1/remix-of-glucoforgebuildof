import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface SavedPost {
  id: string;
  user_id: string;
  post_id: string;
  community_post_id: string | null;
  notes: string | null;
  created_at: string;
}

export const useSavedPosts = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch all saved posts for current user
  const { data: savedPosts = [], isLoading, error } = useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedPost[];
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });

  // Save a post
  const saveMutation = useMutation({
    mutationFn: async ({ postId, communityPostId, notes }: { postId: string; communityPostId: string; notes?: string }) => {
      if (!user) throw new Error('Must be logged in to save posts');

      const { data, error } = await supabase
        .from('user_saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId,
          community_post_id: communityPostId,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      toast.success('Post saved to your collection');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.info('Post already saved');
      } else {
        toast.error('Failed to save post');
      }
    },
  });

  // Unsave a post
  const unsaveMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      toast.success('Post removed from collection');
    },
    onError: () => {
      toast.error('Failed to remove post');
    },
  });

  // Update notes on a saved post
  const updateNotesMutation = useMutation({
    mutationFn: async ({ postId, notes }: { postId: string; notes: string | null }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('user_saved_posts')
        .update({ notes })
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      toast.success('Notes updated');
    },
    onError: () => {
      toast.error('Failed to update notes');
    },
  });

  const savePost = useCallback((postId: string, communityPostId: string, notes?: string) => {
    saveMutation.mutate({ postId, communityPostId, notes });
  }, [saveMutation]);

  const unsavePost = useCallback((postId: string) => {
    unsaveMutation.mutate(postId);
  }, [unsaveMutation]);

  const updateNotes = useCallback((postId: string, notes: string | null) => {
    updateNotesMutation.mutate({ postId, notes });
  }, [updateNotesMutation]);

  const isPostSaved = useCallback((postId: string) => {
    return savedPosts.some(p => p.post_id === postId);
  }, [savedPosts]);

  const getSavedPostIds = useCallback(() => {
    return new Set(savedPosts.map(p => p.post_id));
  }, [savedPosts]);

  const getPostNotes = useCallback((postId: string) => {
    return savedPosts.find(p => p.post_id === postId)?.notes || null;
  }, [savedPosts]);

  return {
    savedPosts,
    isLoading,
    error: error?.message || null,
    savePost,
    unsavePost,
    updateNotes,
    isPostSaved,
    getSavedPostIds,
    getPostNotes,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
    isUpdatingNotes: updateNotesMutation.isPending,
  };
};
