import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MessageSquare, ArrowRight, ThumbsUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function CommunityPulse() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['discover-community-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, post_id, title, content, source, score, num_comments, published_at, is_solution, topic_tags')
        .eq('post_type', 'post')
        .order('score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['discover-community-stats'],
    queryFn: async () => {
      const { count: postCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });
      
      const { count: solutionCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_solution', true);
      
      return {
        posts: postCount || 0,
        solutions: solutionCount || 0
      };
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

  return (
    <Card className="border-warning/30 dark:border-warning/20 bg-warning/5 dark:bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-warning" />
            Community Pulse
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-warning/10 text-warning text-xs">
              {stats?.posts?.toLocaleString()} Posts
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts && posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/community-solutions/${post.post_id}`}
                className="block p-3 rounded-lg bg-background border hover:border-primary/40 transition-colors"
              >
                <h4 className="font-medium text-sm line-clamp-1 mb-1">{post.title}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.score !== null && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {post.score}
                    </span>
                  )}
                  {post.num_comments !== null && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.num_comments}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {post.source}
                  </Badge>
                  {post.is_solution && (
                    <Badge className="bg-success/10 text-success text-xs">
                      Solution
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
            <Link to="/community-solutions">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Browse Community
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No community posts available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
