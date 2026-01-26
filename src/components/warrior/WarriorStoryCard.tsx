import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Star, ChevronRight, User, ExternalLink } from 'lucide-react';

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

interface WarriorStoryCardProps {
  story: WarriorStory;
  onReadMore: (story: WarriorStory) => void;
}

const getSourceBadgeColor = (sourceType: string | null | undefined) => {
  switch (sourceType) {
    case 'reddit':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'instagram':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    case 'facebook':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'twitter':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';
    case 'youtube':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'linkedin':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    case 'interview':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const formatSourceType = (sourceType: string | null | undefined) => {
  if (!sourceType) return 'Submission';
  return sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
};

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
          <div className="flex flex-col gap-1 items-end">
            {story.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {story.source_type && (
              <Badge variant="secondary" className={getSourceBadgeColor(story.source_type)}>
                {formatSourceType(story.source_type)}
              </Badge>
            )}
          </div>
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

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="flex-1 group-hover:bg-primary/10 transition-colors"
            onClick={() => onReadMore(story)}
          >
            Read Full Story
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          {story.source_url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0"
            >
              <a href={story.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
