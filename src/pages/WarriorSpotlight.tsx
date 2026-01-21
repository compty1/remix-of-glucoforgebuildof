import React from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Heart, Star } from 'lucide-react';

export default function WarriorSpotlight() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold">Warrior Spotlight</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Celebrating the strength, resilience, and daily victories of Type 1 diabetics.
          </p>
        </div>
        <Card className="command-center-widget">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Stories Coming Soon</h3>
            <p className="text-muted-foreground">
              We're gathering inspiring stories from the T1D community.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
