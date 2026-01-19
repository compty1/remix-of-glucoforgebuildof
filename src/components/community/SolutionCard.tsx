import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Bookmark,
  Copy,
  Smile,
  Meh,
  Frown,
  Check,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CommunityPost } from '@/hooks/useCommunitySearch';
import { formatDistanceToNow } from 'date-fns';
import { PostComments } from './PostComments';

interface SolutionCardProps {
  post: CommunityPost;
  onAskAI?: (post: CommunityPost) => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ post, onAskAI }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getSentimentIcon = () => {
    switch (post.sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentBadgeVariant = () => {
    switch (post.sentiment) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTimeAgo = () => {
    if (!post.published_at) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(post.published_at), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleCopyTips = async () => {
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

  const truncatedContent = post.content 
    ? post.content.length > 200 
      ? post.content.substring(0, 200) + '...' 
      : post.content
    : '';

  const shouldShowExpandButton = post.content && post.content.length > 200;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {getSentimentIcon()}
            <Badge variant="outline" className="text-xs">
              {post.source}
            </Badge>
            {post.post_type === 'reply' && (
              <Badge variant="secondary" className="text-xs">
                Reply
              </Badge>
            )}
            {post.device_mentioned && (
              <Badge variant="secondary" className="text-xs">
                {post.device_mentioned}
              </Badge>
            )}
            {post.is_solution && (
              <Badge className="text-xs bg-green-600 hover:bg-green-700">
                Solution
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.score || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.num_comments || 0}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <h3 className="font-semibold text-lg leading-tight">{post.title}</h3>
        
        {post.content && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isExpanded ? post.content : truncatedContent}
          </p>
        )}

        {shouldShowExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show More
              </>
            )}
          </Button>
        )}

        {/* Topic Tags */}
        {post.topic_tags && post.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.topic_tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        )}

        {/* Comments Section - Show toggle if there are comments */}
        {post.num_comments && post.num_comments > 0 && post.post_type !== 'reply' && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="h-8 px-2 text-xs"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              {showComments ? 'Hide' : 'Show'} Comments
              {showComments ? (
                <ChevronUp className="h-3.5 w-3.5 ml-1" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              )}
            </Button>
            <PostComments postId={post.post_id} isExpanded={showComments} />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{getTimeAgo()}</span>
            {post.author_anonymous && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.author_anonymous}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {post.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(post.url!, '_blank', 'noopener,noreferrer')}
                className="h-8 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View Original
              </Button>
            )}
            {onAskAI && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAskAI(post)}
                className="h-8 text-xs"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Ask AI
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyTips}
              className="h-8 text-xs"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Copy className="h-3.5 w-3.5 mr-1" />
              )}
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
