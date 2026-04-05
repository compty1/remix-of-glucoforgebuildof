import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('bookmark_type', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookmarks(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, categoryFilter]);

  const addBookmark = async (bookmark: {
    bookmark_type: string;
    resource_id?: string;
    resource_url: string;
    resource_title: string;
    resource_description?: string;
    resource_icon?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to bookmark');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: user.id,
          bookmark_type: bookmark.bookmark_type,
          resource_id: bookmark.resource_id || null,
          resource_url: bookmark.resource_url,
          resource_title: bookmark.resource_title,
          resource_description: bookmark.resource_description || null,
          resource_icon: bookmark.resource_icon || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Already bookmarked');
          return false;
        }
        throw error;
      }

      toast.success('Bookmarked successfully');
      await fetchBookmarks();
      return true;
    } catch {
      toast.error('Failed to bookmark');
      return false;
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Bookmark removed');
      await fetchBookmarks();
      return true;
    } catch {
      toast.error('Failed to remove bookmark');
      return false;
    }
  };

  const removeAllBookmarks = async () => {
    if (!user) return false;

    try {
      let query = supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id);

      if (categoryFilter) {
        query = query.eq('bookmark_type', categoryFilter);
      }

      const { error } = await query;
      if (error) throw error;

      toast.success('All bookmarks removed');
      await fetchBookmarks();
      return true;
    } catch {
      toast.error('Failed to remove bookmarks');
      return false;
    }
  };

  const removeBookmarkByUrl = async (url: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('resource_url', url)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Bookmark removed');
      await fetchBookmarks();
      return true;
    } catch {
      toast.error('Failed to remove bookmark');
      return false;
    }
  };

  const isBookmarked = (url: string) => {
    return bookmarks.some(b => b.resource_url === url);
  };

  const toggleBookmark = async (bookmark: {
    bookmark_type: string;
    resource_id?: string;
    resource_url: string;
    resource_title: string;
    resource_description?: string;
    resource_icon?: string;
  }) => {
    if (isBookmarked(bookmark.resource_url)) {
      return removeBookmarkByUrl(bookmark.resource_url);
    } else {
      return addBookmark(bookmark);
    }
  };

  // Derive available categories from bookmarks
  const categories = useMemo(() => {
    const set = new Set(bookmarks.map(b => b.bookmark_type));
    return Array.from(set).sort();
  }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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
    refetch: fetchBookmarks
  };
}
