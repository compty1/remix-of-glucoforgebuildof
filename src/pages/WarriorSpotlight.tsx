import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Heart, PenLine, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WarriorStoryCard } from '@/components/warrior/WarriorStoryCard';
import { WarriorStoryModal } from '@/components/warrior/WarriorStoryModal';

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
  social_source: string | null;
  status: string | null;
}

export default function WarriorSpotlight() {
  const [selectedStory, setSelectedStory] = useState<WarriorStory | null>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['warrior-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warrior_stories')
        .select('*')
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WarriorStory[];
    },
  });

  const featuredStories = stories?.filter(s => s.featured) || [];
  const regularStories = stories?.filter(s => !s.featured) || [];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Warrior Spotlight</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Celebrating the strength, resilience, and daily victories of Type 1 diabetics.
            Every story here represents a life lived fully, despite the challenges.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="command-center-widget">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stories?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Stories Shared</p>
              </div>
            </CardContent>
          </Card>
          <Card className="command-center-widget">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stories?.reduce((acc, s) => acc + (s.triumphs?.length || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Triumphs Celebrated</p>
              </div>
            </CardContent>
          </Card>
          <Card className="command-center-widget">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stories?.reduce((acc, s) => {
                    const years = s.age && s.diagnosis_age ? s.age - s.diagnosis_age : 0;
                    return acc + years;
                  }, 0) || 0}+
                </p>
                <p className="text-sm text-muted-foreground">Combined Years with T1D</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Your Story CTA */}
        <Card className="command-center-widget mb-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <PenLine className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Share Your Story</h3>
                <p className="text-sm text-muted-foreground">
                  Your journey could inspire someone who needs to hear it
                </p>
              </div>
            </div>
            <Button>
              Submit Your Story
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="space-y-8">
            {/* Featured Stories */}
            {featuredStories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Featured Warriors
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredStories.map(story => (
                    <WarriorStoryCard 
                      key={story.id} 
                      story={story} 
                      onReadMore={setSelectedStory} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Stories */}
            {regularStories.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">More Warrior Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularStories.map(story => (
                    <WarriorStoryCard 
                      key={story.id} 
                      story={story} 
                      onReadMore={setSelectedStory} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Stories Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                We're gathering inspiring stories from the T1D community.
              </p>
              <Button variant="outline">Be the First to Share</Button>
            </CardContent>
          </Card>
        )}

        {/* Story Modal */}
        <WarriorStoryModal 
          story={selectedStory} 
          open={!!selectedStory} 
          onClose={() => setSelectedStory(null)} 
        />
      </div>
    </Layout>
  );
}
