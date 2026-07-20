import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ExternalLink, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { DataFreshnessBadge } from '@/components/ui/data-freshness-badge';

export function LiveResearchFeed() {
  const { data: papers, isLoading } = useQuery({
    queryKey: ['discover-research-papers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_items')
        .select('id, title, source, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
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
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Latest Research
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {papers && papers.length > 0 ? (
          <>
            {papers.map((paper) => (
              <div 
                key={paper.id} 
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{paper.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{paper.source || 'Research'}</Badge>
                  <DataFreshnessBadge lastUpdated={paper.created_at} />
                </div>
              </div>
            ))}
            <Link to="/research-hub">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Research
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No research papers available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
