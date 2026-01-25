import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Share2, Heart, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExperienceSubmission, useUpvoteExperience } from '@/hooks/useExperienceSubmissions';
import { toast } from 'sonner';

interface EntryModalProps {
  submission: ExperienceSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  good: { label: 'Good Experience', emoji: '😊', color: 'bg-green-100 text-green-700' },
  bad: { label: 'Bad Experience', emoji: '😔', color: 'bg-red-100 text-red-700' },
  daily_tasks: { label: 'Daily Task', emoji: '📋', color: 'bg-blue-100 text-blue-700' },
  fears: { label: 'Fear & Worry', emoji: '😰', color: 'bg-purple-100 text-purple-700' },
  embarrassing_lows: { label: 'Embarrassing Low', emoji: '😅', color: 'bg-orange-100 text-orange-700' },
};

export function EntryModal({ submission, open, onOpenChange }: EntryModalProps) {
  const upvoteMutation = useUpvoteExperience();

  if (!submission) return null;

  const categoryInfo = categoryLabels[submission.category] || {
    label: submission.category,
    emoji: '📝',
    color: 'bg-muted text-muted-foreground',
  };

  const handleShare = async () => {
    const shareText = `"${submission.content.slice(0, 100)}..." - Shared on GlycoForge`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'T1D Experience',
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Copied to clipboard!');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  const handleUpvote = () => {
    upvoteMutation.mutate(submission.id);
    toast.success('Thanks for the support!');
  };

  const handleThisHelpedMe = () => {
    toast.success('❤️ Thanks for letting us know this helped!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryInfo.emoji}</span>
            <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
          </div>
          <DialogTitle className="text-xl leading-relaxed">
            {submission.content}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
              </span>
            </div>
            {submission.is_anonymous && (
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpvote}
              disabled={upvoteMutation.isPending}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {submission.upvotes} {submission.upvotes === 1 ? 'Like' : 'Likes'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleThisHelpedMe}
              className="flex-1"
            >
              <Heart className="h-4 w-4 mr-2" />
              This Helped Me
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Supportive Message */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {submission.category === 'fears' ? (
                "You're not alone in this fear. Many in our community share this concern. 💜"
              ) : submission.category === 'bad' ? (
                "We see you. Managing T1D is hard, and your struggles are valid. 💙"
              ) : submission.category === 'embarrassing_lows' ? (
                "We've all been there! Thanks for sharing and helping others feel less alone. 😄"
              ) : submission.category === 'daily_tasks' ? (
                "The invisible work of T1D. Thank you for making it visible. ✨"
              ) : (
                "Thanks for sharing the bright side! Positivity helps us all. 🌟"
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
