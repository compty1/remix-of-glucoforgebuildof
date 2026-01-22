import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Star, ChevronRight, User } from 'lucide-react';

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

interface WarriorStoryCardProps {
  story: WarriorStory;
  onReadMore: (story: WarriorStory) => void;
}

export const WarriorStoryCard: React.FC<WarriorStoryCardProps> = ({ story, onReadMore }) => {
  const displayName = story.is_anonymous ? 'Anonymous Warrior' : (story.person_name || 'T1D Warrior');

  // Get excerpt from story content (first 150 chars)
  const excerpt = story.story_content.length > 150 
    ? story.story_content.substring(0, 150) + '...' 
    : story.story_content;

  return (
    <Card className="command-center-widget group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {story.is_anonymous ? (
                <User className="h-6 w-6 text-primary" />
              ) : (
                <Trophy className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
              {story.platform && story.social_handle && (
                <p className="text-xs text-muted-foreground mt-1">
                  @{story.social_handle} on {story.platform}
                </p>
              )}
            </div>
          </div>
          {story.is_featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-foreground">{story.title}</h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {excerpt}
        </p>

        {story.triumphs && story.triumphs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.triumphs.slice(0, 2).map((triumph, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                {triumph.length > 25 ? triumph.substring(0, 25) + '...' : triumph}
              </Badge>
            ))}
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full group-hover:bg-primary/10 transition-colors"
          onClick={() => onReadMore(story)}
        >
          Read Full Story
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
