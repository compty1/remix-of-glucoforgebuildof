import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Smile,
  Meh,
  Frown,
  Lightbulb,
  AlertTriangle,
  User,
  BookOpen,
  FileText,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { AdultPost } from '@/hooks/useAdultContentSearch';
import { useAdultPostComments } from '@/hooks/useAdultContentSearch';

interface AdultPostCardProps {
  post: AdultPost;
}

const postTypeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  post: { icon: <MessageSquare className="h-3.5 w-3.5" />, label: 'Community Post' },
  guide: { icon: <BookOpen className="h-3.5 w-3.5" />, label: 'Guide' },
  research: { icon: <FlaskConical className="h-3.5 w-3.5" />, label: 'Research' },
  article: { icon: <FileText className="h-3.5 w-3.5" />, label: 'Article' },
};

export const AdultPostCard: React.FC<AdultPostCardProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentLimit, setCommentLimit] = useState(5);

  const { data: commentsResult, isLoading: commentsLoading } = useAdultPostComments(
    showComments ? post.id : null,
    commentLimit
  );

  const comments = commentsResult?.comments || [];
  const totalCommentCount = commentsResult?.totalCount || 0;
  const hasMoreComments = commentsResult?.hasMore || false;

  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const getSentimentIcon = () => {
    switch (post.sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const truncatedContent = post.content.length > 250
    ? post.content.substring(0, 250) + '...'
    : post.content;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
      setIsCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch { toast.error('Failed to copy'); }
  };

  const toggleCommentExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      return newSet;
    });
  };

  const typeConfig = postTypeConfig[post.post_type || 'post'] || postTypeConfig.post;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {getSentimentIcon()}
            {post.confidence_score != null && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  post.confidence_score >= 0.9 ? 'border-green-500 text-green-700' :
                  post.confidence_score >= 0.8 ? 'border-yellow-500 text-yellow-700' :
                  'border-muted-foreground text-muted-foreground'
                }`}
              >
                {post.confidence_score >= 0.9 ? 'High' : post.confidence_score >= 0.8 ? 'Good' : 'Fair'} quality
              </Badge>
            )}
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {typeConfig.icon} {typeConfig.label}
            </Badge>
            {post.source_platform && (
              <Badge variant="secondary" className="text-xs">{post.source_platform}</Badge>
            )}
            {post.is_featured && (
              <Badge className="text-xs bg-primary text-primary-foreground">Featured</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.upvotes || 0}
            </span>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {post.comments_count || 0}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isExpanded ? post.content : truncatedContent}
        </p>

        {post.content.length > 250 && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 px-2">
            {isExpanded ? <><ChevronUp className="h-4 w-4 mr-1" />Less</> : <><ChevronDown className="h-4 w-4 mr-1" />More</>}
          </Button>
        )}

        {/* Tips */}
        {post.tips && post.tips.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm text-green-800 dark:text-green-200">Tips</span>
            </div>
            <ul className="space-y-1">
              {post.tips.map((tip, i) => (
                <li key={i} className="text-xs text-green-700 dark:text-green-300">• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {post.warnings && post.warnings.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-sm text-red-800 dark:text-red-200">Warnings</span>
            </div>
            <ul className="space-y-1">
              {post.warnings.map((w, i) => (
                <li key={i} className="text-xs text-red-700 dark:text-red-300">• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Topic Tags */}
        {post.topic_tags && post.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.topic_tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {commentsLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className="pl-4 border-l-2 border-muted">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments available</p>
            ) : (
              <>
                <span className="text-xs font-medium text-muted-foreground">
                  {totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}
                </span>
                {comments.map((comment) => {
                  const isCommentExpanded = expandedComments.has(comment.id);
                  const shouldTruncate = comment.content && comment.content.length > 200;
                  const displayContent = isCommentExpanded || !shouldTruncate
                    ? comment.content
                    : comment.content.substring(0, 200) + '...';

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
                            <><ChevronUp className="h-3 w-3 mr-1" />Less</>
                          ) : (
                            <><ChevronDown className="h-3 w-3 mr-1" />More</>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
                {hasMoreComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCommentLimit(prev => prev + 10)}
                    className="h-7 px-2 text-xs text-primary"
                  >
                    Load more comments ({totalCommentCount - comments.length} remaining)
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.author_username && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.author_username}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {post.source_url && (
              <a href={post.source_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View Original
                </Button>
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-xs">
              {isCopied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
