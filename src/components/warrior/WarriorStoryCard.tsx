import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, MapPin, Calendar, Heart, Star, ChevronRight, User } from 'lucide-react';

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
  management_approach: string | null;
  advice_to_newly_diagnosed: string | null;
  is_anonymous: boolean | null;
  featured: boolean | null;
  social_source: string | null;
}

interface WarriorStoryCardProps {
  story: WarriorStory;
  onReadMore: (story: WarriorStory) => void;
}

export const WarriorStoryCard: React.FC<WarriorStoryCardProps> = ({ story, onReadMore }) => {
  const displayName = story.is_anonymous ? 'Anonymous Warrior' : story.name;
  const yearsWithT1D = story.age && story.diagnosis_age ? story.age - story.diagnosis_age : null;

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                {story.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {story.location}
                  </span>
                )}
                {yearsWithT1D && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {yearsWithT1D}+ years with T1D
                  </span>
                )}
              </div>
            </div>
          </div>
          {story.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-foreground">{story.story_title}</h3>
        
        {story.story_excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {story.story_excerpt}
          </p>
        )}

        {story.triumphs && story.triumphs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {story.triumphs.slice(0, 3).map((triumph, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                {triumph.length > 30 ? triumph.substring(0, 30) + '...' : triumph}
              </Badge>
            ))}
          </div>
        )}

        {story.management_approach && (
          <p className="text-xs text-muted-foreground italic">
            Uses: {story.management_approach}
          </p>
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
