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
import { Trophy, MapPin, Calendar, Heart, Target, Lightbulb, User, Quote } from 'lucide-react';

interface WarriorStory {
  id: string;
  name: string;
  age: number | null;
  diagnosis_age: number | null;
  location: string | null;
  story_title: string;
  story_excerpt: string | null;
  full_story: string | null;
  obstacles: string[] | null;
  triumphs: string[] | null;
  diagnosis_story: string | null;
  management_approach: string | null;
  advice_to_newly_diagnosed: string | null;
  is_anonymous: boolean | null;
  featured: boolean | null;
}

interface WarriorStoryModalProps {
  story: WarriorStory | null;
  open: boolean;
  onClose: () => void;
}

export const WarriorStoryModal: React.FC<WarriorStoryModalProps> = ({ story, open, onClose }) => {
  if (!story) return null;

  const displayName = story.is_anonymous ? 'Anonymous Warrior' : story.name;
  const yearsWithT1D = story.age && story.diagnosis_age ? story.age - story.diagnosis_age : null;

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
              <DialogTitle className="text-2xl">{displayName}</DialogTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {story.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {story.location}
                  </span>
                )}
                {yearsWithT1D && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {yearsWithT1D}+ years with T1D
                  </span>
                )}
                {story.diagnosis_age && (
                  <Badge variant="outline">Diagnosed at {story.diagnosis_age}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">{story.story_title}</h2>
              {story.full_story && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {story.full_story.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
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

            {story.management_approach && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Management Approach</h3>
                  <p className="text-sm text-muted-foreground">{story.management_approach}</p>
                </div>
              </>
            )}

            {story.advice_to_newly_diagnosed && (
              <>
                <Separator />
                <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
                  <h3 className="flex items-center gap-2 font-semibold mb-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Advice to Newly Diagnosed
                  </h3>
                  <div className="flex gap-2">
                    <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground italic">
                      {story.advice_to_newly_diagnosed}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
