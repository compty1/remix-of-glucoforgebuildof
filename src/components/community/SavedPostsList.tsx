import React, { useState } from 'react';
import { Bookmark, StickyNote, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommunityPost } from '@/hooks/useCommunitySearch';
import { SolutionCard } from './SolutionCard';
import { SavePostNotesModal } from './SavePostNotesModal';

interface SavedPostsListProps {
  onAskAI?: (post: CommunityPost) => void;
}

export const SavedPostsList: React.FC<SavedPostsListProps> = ({ onAskAI }) => {
  const { savedPosts, isLoading: isSavedLoading, unsavePost, updateNotes, getPostNotes, isUpdatingNotes } = useSavedPosts();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Fetch full post data for saved posts
  const { data: fullPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['saved-posts-full', savedPosts.map(p => p.community_post_id)],
    queryFn: async () => {
      if (savedPosts.length === 0) return [];
      
      const ids = savedPosts
        .map(p => p.community_post_id)
        .filter(Boolean) as string[];
      
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .in('id', ids);

      if (error) throw error;

      return (data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'neutral' | 'negative' | null,
        topic_tags: post.topic_tags || [],
      })) as CommunityPost[];
    },
    enabled: savedPosts.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isSavedLoading || isPostsLoading;

  // Get the saved post entry to access notes
  const getSavedPostEntry = (postId: string) => {
    return savedPosts.find(p => p.post_id === postId);
  };

  const handleEditNotes = (postId: string) => {
    setEditingPostId(postId);
  };

  const handleSaveNotes = (notes: string | null) => {
    if (editingPostId) {
      updateNotes(editingPostId, notes);
      setEditingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (fullPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Saved Posts</h3>
          <p className="text-muted-foreground">
            Save community posts to reference them later. Click the bookmark icon on any post to save it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const editingPost = editingPostId ? fullPosts.find(p => p.post_id === editingPostId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Posts ({fullPosts.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fullPosts.map((post) => {
          const savedEntry = getSavedPostEntry(post.post_id);
          const notes = savedEntry?.notes;
          
          return (
            <div key={post.id} className="space-y-2">
              <SolutionCard
                post={post}
                onAskAI={onAskAI}
                showSaveButton
              />
              
              {/* Notes Section */}
              <Card className="bg-muted/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StickyNote className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">Your Note</span>
                      </div>
                      {notes ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No note added
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNotes(post.post_id)}
                      className="shrink-0 h-7 text-xs"
                    >
                      {notes ? 'Edit' : 'Add Note'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      <SavePostNotesModal
        isOpen={!!editingPostId}
        onClose={() => setEditingPostId(null)}
        onSave={handleSaveNotes}
        initialNotes={editingPostId ? getPostNotes(editingPostId) : null}
        postTitle={editingPost?.title}
        isSaving={isUpdatingNotes}
      />
    </div>
  );
};
