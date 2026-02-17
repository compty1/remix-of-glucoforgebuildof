import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trophy, Heart, Target, User, Star, ExternalLink, Calendar, Link2 } from 'lucide-react';
import { getPlatformIcon } from '@/components/icons/PlatformIcons';

interface WarriorStory {
  id: string;
  title: string;
  story_content: string;
  person_name: string | null;
  is_anonymous: boolean | null;
  social_handle: string | null;
  platform: string | null;
  contact_info: string | null;
  obstacles: string[] | null;
  triumphs: string[] | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  source_url?: string | null;
  source_type?: string | null;
  original_post_date?: string | null;
  permission_status?: string | null;
}

interface WarriorStoryModalProps {
  story: WarriorStory | null;
  open: boolean;
  onClose: () => void;
}

const getSourceBadgeColor = (sourceType: string | null | undefined) => {
  switch (sourceType) {
    case 'reddit':
      return 'bg-warning/10 text-warning dark:bg-warning/20';
    case 'instagram':
      return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
    case 'facebook':
      return 'bg-primary/10 text-primary dark:bg-primary/20';
    case 'twitter':
      return 'bg-chart-1/10 text-chart-1 dark:bg-chart-1/20';
    case 'youtube':
      return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
    case 'linkedin':
      return 'bg-chart-2/10 text-chart-2 dark:bg-chart-2/20';
    case 'interview':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatSourceType = (sourceType: string | null | undefined) => {
  if (!sourceType) return 'Submission';
  return sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
};

export const WarriorStoryModal: React.FC<WarriorStoryModalProps> = ({ story, open, onClose }) => {
  if (!story) return null;

  const displayName = story.is_anonymous ? 'Anonymous Warrior' : (story.person_name || 'T1D Warrior');
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              {story.is_anonymous ? (
                <User className="h-8 w-8 text-primary" />
              ) : (
                <Trophy className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2 flex-wrap">
                {displayName}
                {story.is_featured && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning dark:bg-warning/20">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {story.platform && story.social_handle && (
                  <p className="text-sm text-muted-foreground">
                    @{story.social_handle} on {story.platform}
                  </p>
                )}
                {story.source_type && (
                  <Badge variant="secondary" className={`${getSourceBadgeColor(story.source_type)} flex items-center gap-1.5`}>
                    {getPlatformIcon(story.source_type)}
                    {formatSourceType(story.source_type)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Source Attribution */}
            {story.source_url && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Original Source</span>
                    {story.original_post_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(story.original_post_date)}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={story.source_url} target="_blank" rel="noopener noreferrer">
                      View Original
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
                {story.permission_status && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Status: {story.permission_status === 'public_repost' ? 'Public post (shared with attribution)' : 
                             story.permission_status === 'permission_granted' ? 'Shared with permission' : 
                             'Original submission'}
                  </p>
                )}
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">{story.title}</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {story.story_content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {story.obstacles && story.obstacles.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <Target className="h-5 w-5 text-orange-500" />
                    Obstacles Overcome
                  </h3>
                  <ul className="space-y-2">
                    {story.obstacles.map((obstacle, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-orange-500 mt-1">•</span>
                        {obstacle}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {story.triumphs && story.triumphs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 font-semibold mb-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    Triumphs & Victories
                  </h3>
                  <ul className="space-y-2">
                    {story.triumphs.map((triumph, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 mt-1">✓</span>
                        {triumph}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* View Original CTA at bottom */}
            {story.source_url && (
              <div className="pt-4">
                <Button asChild className="w-full">
                  <a href={story.source_url} target="_blank" rel="noopener noreferrer">
                    View Original Post on {story.platform || formatSourceType(story.source_type)}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
