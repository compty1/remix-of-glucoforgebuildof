import React, { useState } from 'react';
import { ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CommunityPost } from '@/hooks/useCommunitySearch';
import { usePostComments } from '@/hooks/useCommunitySearch';

interface PostCommentsProps {
  postId: string;
  isExpanded: boolean;
}

export const PostComments: React.FC<PostCommentsProps> = ({ postId, isExpanded }) => {
  const { data: comments, isLoading, error } = usePostComments(isExpanded ? postId : null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  if (!isExpanded) return null;

  if (isLoading) {
    return (
      <div className="space-y-3 pt-3 border-t">
        {[1, 2].map((i) => (
          <div key={i} className="pl-4 border-l-2 border-muted">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-3 border-t text-sm text-muted-foreground">
        Failed to load comments
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="pt-3 border-t text-sm text-muted-foreground">
        No comments available
      </div>
    );
  }

  const toggleCommentExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3 pt-3 border-t">
      <span className="text-xs font-medium text-muted-foreground">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </span>
      {comments.map((comment) => {
        const isCommentExpanded = expandedComments.has(comment.id);
        const shouldTruncate = comment.content && comment.content.length > 200;
        const displayContent = isCommentExpanded || !shouldTruncate
          ? comment.content
          : comment.content?.substring(0, 200) + '...';

        return (
          <div key={comment.id} className="pl-4 border-l-2 border-muted space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {comment.score || 0}
              </span>
              {comment.author_anonymous && (
                <span>• {comment.author_anonymous}</span>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {displayContent}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCommentExpanded(comment.id)}
                className="h-6 px-2 text-xs"
              >
                {isCommentExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    More
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};
