import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award,
  Download,
  TrendingUp,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface SurveyResponse {
  id: string;
  survey_id: string;
  created_at: string;
  time_spent_seconds: number | null;
  is_complete: boolean;
  survey: {
    title: string;
    research_category: string | null;
    estimated_time_minutes: number | null;
  } | null;
}

interface ContributionStats {
  totalSurveys: number;
  totalTimeMinutes: number;
  categoriesContributed: string[];
  impactScore: number;
}

export const MyContributions = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<ContributionStats>({
    totalSurveys: 0,
    totalTimeMinutes: 0,
    categoriesContributed: [],
    impactScore: 0,
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('survey_responses')
        .select(`
          id,
          survey_id,
          created_at,
          time_spent_seconds,
          is_complete,
          survey:surveys (
            title,
            research_category,
            estimated_time_minutes
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setLoading(false);
        return;
      }

      // Type assertion to handle the nested survey object
      const typedData = (data || []) as unknown as SurveyResponse[];
      setResponses(typedData);

      // Calculate stats
      const categories = new Set<string>();
      let totalTime = 0;

      typedData.forEach((response) => {
        if (response.time_spent_seconds) {
          totalTime += response.time_spent_seconds;
        }
        if (response.survey?.research_category) {
          categories.add(response.survey.research_category);
        }
      });

      setStats({
        totalSurveys: typedData.length,
        totalTimeMinutes: Math.round(totalTime / 60),
        categoriesContributed: Array.from(categories),
        impactScore: Math.min(100, typedData.length * 10 + categories.size * 5),
      });
    } catch {
      // Contributions fetch error
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    // Create exportable data
    const exportData = responses.map((r) => ({
      survey_title: r.survey?.title,
      category: r.survey?.research_category,
      completed_at: r.created_at,
      time_spent_minutes: r.time_spent_seconds ? Math.round(r.time_spent_seconds / 60) : null,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-contributions-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              My Research Contributions
            </CardTitle>
            <CardDescription>
              Track your impact on T1D research through survey participation
            </CardDescription>
          </div>
          {responses.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalSurveys}</div>
            <div className="text-xs text-muted-foreground">Surveys Completed</div>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-secondary-foreground" />
            <div className="text-2xl font-bold">{stats.totalTimeMinutes}</div>
            <div className="text-xs text-muted-foreground">Minutes Contributed</div>
          </div>
          <div className="p-4 rounded-lg bg-accent/50 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
            <div className="text-2xl font-bold">{stats.categoriesContributed.length}</div>
            <div className="text-xs text-muted-foreground">Research Areas</div>
          </div>
          <div className="p-4 rounded-lg bg-muted text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.impactScore}</div>
            <div className="text-xs text-muted-foreground">Impact Score</div>
          </div>
        </div>

        {/* Categories contributed to */}
        {stats.categoriesContributed.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Research Areas Contributed To</h4>
            <div className="flex flex-wrap gap-2">
              {stats.categoriesContributed.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contribution History */}
        <div>
          <h4 className="text-sm font-medium mb-3">Contribution History</h4>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>You haven't contributed to any surveys yet.</p>
              <p className="text-sm">Start participating to track your research impact!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {response.survey?.title || 'Unknown Survey'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(response.created_at), 'MMM d, yyyy')}
                        {response.time_spent_seconds && (
                          <> · {Math.round(response.time_spent_seconds / 60)} min</>
                        )}
                      </p>
                    </div>
                  </div>
                  {response.survey?.research_category && (
                    <Badge variant="outline" className="text-xs">
                      {response.survey.research_category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Impact Message */}
        {responses.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border">
            <p className="text-sm text-center">
              🎉 <strong>Thank you!</strong> Your contributions help researchers better understand 
              Type 1 Diabetes and improve treatments for millions of people worldwide.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
