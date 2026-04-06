import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export interface Bookmark {
  id: string;
  user_id: string;
  bookmark_type: string;
  resource_id: string | null;
  resource_url: string;
  resource_title: string;
  resource_description: string | null;
  resource_icon: string | null;
  created_at: string;
}

export function useBookmarks(categoryFilter?: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const queryKey = ['bookmarks', user?.id, categoryFilter];

  const { data: bookmarks = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async (): Promise<Bookmark[]> => {
      if (!user) return [];

      let query = supabase
        .from('user_bookmarks')
        .select('id, user_id, bookmark_type, resource_id, resource_url, resource_title, resource_description, resource_icon, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (categoryFilter) query = query.eq('bookmark_type', categoryFilter);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Bookmark[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const bookmarkUrlSet = useMemo(() => new Set(bookmarks.map(b => b.resource_url)), [bookmarks]);

  const addMutation = useMutation({
    mutationFn: async (bookmark: { bookmark_type: string; resource_id?: string; resource_url: string; resource_title: string; resource_description?: string; resource_icon?: string; }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_bookmarks').insert({
        user_id: user.id,
        bookmark_type: bookmark.bookmark_type,
        resource_id: bookmark.resource_id || null,
        resource_url: bookmark.resource_url,
        resource_title: bookmark.resource_title,
        resource_description: bookmark.resource_description || null,
        resource_icon: bookmark.resource_icon || null,
      });
      if (error) {
        if (error.code === '23505') { toast.info('Already bookmarked'); return false; }
        throw error;
      }
      return true;
    },
    onSuccess: (added) => {
      if (added) toast.success('Bookmarked successfully');
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
    onError: () => toast.error('Failed to bookmark'),
  });

  const removeMutation = useMutation({
    mutationFn: async (bookmarkId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_bookmarks').delete().eq('id', bookmarkId).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bookmark removed');
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
    onError: () => toast.error('Failed to remove bookmark'),
  });

  const removeByUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_bookmarks').delete().eq('resource_url', url).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bookmark removed');
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
    onError: () => toast.error('Failed to remove bookmark'),
  });

  const removeAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      let query = supabase.from('user_bookmarks').delete().eq('user_id', user.id);
      if (categoryFilter) query = query.eq('bookmark_type', categoryFilter);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('All bookmarks removed');
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    },
    onError: () => toast.error('Failed to remove bookmarks'),
  });

  const addBookmark = async (bookmark: { bookmark_type: string; resource_id?: string; resource_url: string; resource_title: string; resource_description?: string; resource_icon?: string; }) => {
    if (!user) { toast.error('Please sign in to bookmark'); return false; }
    return addMutation.mutateAsync(bookmark).catch(() => false);
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return false;
    try { await removeMutation.mutateAsync(bookmarkId); return true; } catch { return false; }
  };

  const removeAllBookmarks = async () => {
    if (!user) return false;
    try { await removeAllMutation.mutateAsync(); return true; } catch { return false; }
  };

  const removeBookmarkByUrl = async (url: string) => {
    if (!user) return false;
    try { await removeByUrlMutation.mutateAsync(url); return true; } catch { return false; }
  };

  const isBookmarked = useCallback((url: string) => bookmarkUrlSet.has(url), [bookmarkUrlSet]);

  const toggleBookmark = async (bookmark: { bookmark_type: string; resource_id?: string; resource_url: string; resource_title: string; resource_description?: string; resource_icon?: string; }) => {
    if (isBookmarked(bookmark.resource_url)) {
      return removeBookmarkByUrl(bookmark.resource_url);
    }
    return addBookmark(bookmark);
  };

  const categories = useMemo(() => {
    const set = new Set(bookmarks.map(b => b.bookmark_type));
    return Array.from(set).sort();
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    categories,
    addBookmark,
    removeBookmark,
    removeAllBookmarks,
    removeBookmarkByUrl,
    isBookmarked,
    toggleBookmark,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
