import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ThumbsUp, 
  MessageSquare, 
  ExternalLink,
  Bookmark,
  Copy,
  Smile,
  Meh,
  Frown,
  Check,
  User,
  StickyNote,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSinglePost, usePostComments } from '@/hooks/useCommunitySearch';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { SavePostNotesModal } from '@/components/community/SavePostNotesModal';
import { RelatedPosts } from '@/components/community/RelatedPosts';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';

const CommunityPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [commentLimit, setCommentLimit] = useState(10);
  const { data: post, isLoading: postLoading, error: postError } = useSinglePost(postId || null);
  const { data: commentsResult, isLoading: commentsLoading } = usePostComments(postId || null, commentLimit);
  
  const comments = commentsResult?.comments || [];
  const totalComments = commentsResult?.totalCount || 0;
  const hasMoreComments = commentsResult?.hasMore || false;

  const [isCopied, setIsCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const { isPostSaved, savePost, unsavePost, updateNotes, getPostNotes, isSaving, isUnsaving, isUpdatingNotes } = useSavedPosts();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const isSaved = post ? isPostSaved(post.post_id) : false;
  const currentNotes = post ? getPostNotes(post.post_id) : null;

  const getSentimentIcon = () => {
    if (!post) return null;
    switch (post.sentiment) {
      case 'positive':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTimeAgo = () => {
    if (!post?.published_at) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(post.published_at), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getFormattedDate = () => {
    if (!post?.published_at) return null;
    try {
      return format(new Date(post.published_at), 'MMM d, yyyy h:mm a');
    } catch {
      return null;
    }
  };

  const handleCopyContent = async () => {
    if (!post) return;
    const text = `${post.title}\n\n${post.content || ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Content copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy content');
    }
  };

  const handleSaveClick = () => {
    if (!post) return;
    if (!isLoggedIn) {
      toast.info('Please log in to save posts');
      return;
    }
    
    if (isSaved) {
      unsavePost(post.post_id);
    } else {
      setIsEditingNotes(false);
      setShowNotesModal(true);
    }
  };

  const handleEditNotes = () => {
    setIsEditingNotes(true);
    setShowNotesModal(true);
  };

  const handleNotesModalSave = (notes: string | null) => {
    if (!post) return;
    if (isEditingNotes) {
      updateNotes(post.post_id, notes);
    } else {
      savePost(post.post_id, post.id, notes || undefined);
    }
    setShowNotesModal(false);
  };

  const handleAskAI = () => {
    if (!post) return;
    navigate('/t1d-companion', {
      state: {
        initialMessage: `I found this community post about "${post.title}" and would like your help understanding it better:\n\n"${post.content?.substring(0, 300)}${post.content && post.content.length > 300 ? '...' : ''}"`,
        context: {
          title: post.title,
          description: post.content?.substring(0, 200),
          category: post.device_mentioned || post.topic_tags?.[0] || 'General',
        }
      }
    });
  };

  const handleLoadMoreComments = () => {
    setCommentLimit(prev => prev + 10);
  };

  if (postLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-8 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (postError || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/community-solutions')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community Solutions
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Post not found or failed to load.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/community-solutions')}
                className="mt-4"
              >
                Browse Community Solutions
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/community-solutions')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community Solutions
        </Button>

        {/* Main Post Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {getSentimentIcon()}
              <Badge variant="outline" className="text-sm">
                {post.source}
              </Badge>
              {post.post_type === 'reply' && (
                <Badge variant="secondary" className="text-sm">
                  Reply
                </Badge>
              )}
              {post.device_mentioned && (
                <Badge variant="secondary" className="text-sm">
                  {post.device_mentioned}
                </Badge>
              )}
              {post.is_solution && (
                <Badge className="text-sm bg-green-600 hover:bg-green-700">
                  Solution
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Full Content */}
            {post.content && (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Topic Tags */}
            {post.topic_tags && post.topic_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.topic_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {post.score || 0} upvotes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {totalComments || post.num_comments || 0} comments
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {getTimeAgo()}
              </span>
              {post.author_anonymous && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author_anonymous}
                </span>
              )}
            </div>

            {/* Full Date */}
            {getFormattedDate() && (
              <p className="text-xs text-muted-foreground">
                Posted on {getFormattedDate()}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveClick}
                      disabled={isSaving || isUnsaving}
                    >
                      <Bookmark 
                        className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current text-primary' : ''}`} 
                      />
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isLoggedIn === false 
                      ? 'Log in to save posts' 
                      : isSaved 
                        ? 'Remove from saved' 
                        : 'Save to your collection'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isSaved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditNotes}
                  disabled={isUpdatingNotes}
                >
                  <StickyNote 
                    className={`h-4 w-4 mr-2 ${currentNotes ? 'text-primary' : ''}`} 
                  />
                  {currentNotes ? 'Edit Note' : 'Add Note'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleAskAI}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>

              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              {totalComments > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  (Showing {comments.length} of {totalComments})
                </span>
              )}
            </h2>
          </CardHeader>
          <CardContent>
            {commentsLoading && comments.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="pl-4 border-l-2 border-muted">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments available for this post.
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="pl-4 border-l-2 border-muted space-y-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.score || 0}
                      </span>
                      {comment.author_anonymous && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {comment.author_anonymous}
                        </span>
                      )}
                      {comment.published_at && (
                        <span>
                          {formatDistanceToNow(new Date(comment.published_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {/* Load More Comments */}
                {hasMoreComments && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMoreComments}
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More Comments ({comments.length} of {totalComments})
                    </Button>
                  </div>
                )}

                {/* View original when all loaded */}
                {!hasMoreComments && post.url && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      {totalComments > 0 ? `All ${totalComments} comments loaded` : 'All comments loaded'}
                    </p>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View original discussion
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Solutions Section */}
        {post && (
          <RelatedPosts
            currentPostId={post.id}
            topicTags={post.topic_tags}
            deviceMentioned={post.device_mentioned}
          />
        )}

        {/* Notes Modal */}
        {post && (
          <SavePostNotesModal
            isOpen={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            onSave={handleNotesModalSave}
            initialNotes={currentNotes}
            postTitle={post.title}
            isSaving={isSaving || isUpdatingNotes}
          />
        )}
      </div>
    </Layout>
  );
};

export default CommunityPostDetail;
