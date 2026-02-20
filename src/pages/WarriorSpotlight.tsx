import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Heart, PenLine, Users, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WarriorStoryCard } from '@/components/warrior/WarriorStoryCard';
import { WarriorStoryModal } from '@/components/warrior/WarriorStoryModal';
import { usePageMeta } from '@/hooks/usePageMeta';

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

export default function WarriorSpotlight() {
  const [selectedStory, setSelectedStory] = useState<WarriorStory | null>(null);
  usePageMeta('Warrior Spotlight', 'Celebrate the strength and resilience of Type 1 diabetics. Read inspiring warrior stories from the T1D community on GlucoForge.');

  const { data: stories, isLoading } = useQuery({
    queryKey: ['warrior-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warrior_stories')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WarriorStory[];
    },
  });

  const featuredStories = stories?.filter(s => s.is_featured) || [];
  const regularStories = stories?.filter(s => !s.is_featured) || [];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton fallbackPath="/dashboard" />
        
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
          {/* Issue 178: Data transparency — stories include both community-submitted and seeded content */}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              Community & Demo Stories
            </Badge>
          </div>
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
              <div className="h-12 w-12 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-brand-red" />
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
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{featuredStories.length}</p>
                <p className="text-sm text-muted-foreground">Featured Warriors</p>
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
                  <Badge variant="secondary" className="bg-warning/10 text-warning">
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
