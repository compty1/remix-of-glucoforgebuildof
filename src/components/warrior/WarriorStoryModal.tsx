import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trophy, Heart, Target, User, Star } from 'lucide-react';

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
}

interface WarriorStoryModalProps {
  story: WarriorStory | null;
  open: boolean;
  onClose: () => void;
}

export const WarriorStoryModal: React.FC<WarriorStoryModalProps> = ({ story, open, onClose }) => {
  if (!story) return null;

  const displayName = story.is_anonymous ? 'Anonymous Warrior' : (story.person_name || 'T1D Warrior');

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
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {displayName}
                {story.is_featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </DialogTitle>
              {story.platform && story.social_handle && (
                <p className="text-sm text-muted-foreground mt-1">
                  @{story.social_handle} on {story.platform}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
