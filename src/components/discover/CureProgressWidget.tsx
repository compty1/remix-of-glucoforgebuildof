import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function CureProgressWidget() {
  const { data: therapies, isLoading } = useQuery({
    queryKey: ['discover-cure-therapies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cure_therapies')
        .select('id, name, phase, progress_percentage, category, sponsor, status')
        .eq('is_featured', true)
        .order('progress_percentage', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getPhaseColor = (phase: string | null) => {
    switch (phase?.toLowerCase()) {
      case 'phase 3':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'phase 2':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'phase 1':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-purple-600" />
            Cure Progress
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {therapies && therapies.length > 0 ? (
          <>
            {therapies.map((therapy) => (
              <div 
                key={therapy.id} 
                className="p-3 rounded-lg bg-background border"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{therapy.name}</h4>
                  {therapy.phase && (
                    <Badge variant="secondary" className={`text-xs ${getPhaseColor(therapy.phase)}`}>
                      {therapy.phase}
                    </Badge>
                  )}
                </div>
                {therapy.sponsor && (
                  <p className="text-xs text-muted-foreground mb-2">{therapy.sponsor}</p>
                )}
                {therapy.progress_percentage && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{therapy.progress_percentage}%</span>
                    </div>
                    <Progress value={therapy.progress_percentage} className="h-2" />
                  </div>
                )}
              </div>
            ))}
            <Link to="/cure-progress">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Therapies
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No cure therapies available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
