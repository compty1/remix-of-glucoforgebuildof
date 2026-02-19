import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Fix {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  votes: number;
  source: string;
  link: string;
}

export default function Fixes() {
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixes = async () => {
      try {
        // Fetch device issues which contain solutions/workarounds
        const { data: issuesData, error } = await supabase
          .from('device_issues')
          .select('*, devices(*)')
          .not('solution', 'is', null)
          .order('community_reports', { ascending: false })
          .limit(20);

        if (error) throw error;

        const formattedData: Fix[] = (issuesData || []).map(issue => {
          const difficulty = issue.severity === 'Critical' ? 'Hard' : 
                           issue.severity === 'Major' ? 'Medium' : 'Easy';
          
          return {
            id: issue.id,
            title: issue.issue_title,
            description: issue.description,
            category: issue.devices?.category || 'Device',
            difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
            votes: issue.community_reports || 0,
            source: issue.source_url ? 'Community Report' : 'Platform Data',
            link: issue.source_url || ''
          };
        });

        setFixes(formattedData);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchFixes();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success/10 text-success dark:bg-success/20';
      case 'Medium': return 'bg-warning/10 text-warning dark:bg-warning/20';
      case 'Hard': return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Community Fixes & Workarounds
          </h1>
          <p className="text-muted-foreground mb-8">
            Real solutions from the T1D community for common challenges and device issues.
          </p>
          
          {fixes.length === 0 ? (
            <div className="text-center py-16">
              <ThumbsUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Fixes Available Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Community fixes and workarounds for device issues will appear here as they are reported and verified.
              </p>
            </div>
          ) : (
          <div className="space-y-6">
            {fixes.map((fix) => (
              <Card key={fix.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{fix.title}</CardTitle>
                      <p className="text-muted-foreground">{fix.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary">{fix.category}</Badge>
                      <Badge className={getDifficultyColor(fix.difficulty)}>
                        {fix.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{fix.votes}</span>
                      </div>
                      <Badge variant="outline">{fix.source}</Badge>
                    </div>
                    {fix.link ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={fix.link} target="_blank" rel="noopener noreferrer">
                          View Fix
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Solution in description</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}