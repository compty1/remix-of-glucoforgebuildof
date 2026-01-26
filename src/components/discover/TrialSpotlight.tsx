import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export function TrialSpotlight() {
  const { data: trials, isLoading } = useQuery({
    queryKey: ['discover-clinical-trials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_trials_detailed')
        .select('id, nct_id, title, overall_status, phase, sponsor_name, enrollment_count, study_url, location_countries')
        .eq('overall_status', 'Recruiting')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: trialCount } = useQuery({
    queryKey: ['discover-trial-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clinical_trials_detailed')
        .select('*', { count: 'exact', head: true })
        .eq('overall_status', 'Recruiting');
      
      if (error) throw error;
      return count || 0;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FlaskConical className="h-5 w-5 text-green-600" />
            Clinical Trials
          </CardTitle>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {trialCount} Recruiting
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trials && trials.length > 0 ? (
          <>
            {trials.map((trial) => (
              <div 
                key={trial.id} 
                className="p-3 rounded-lg bg-background border"
              >
                <h4 className="font-medium text-sm line-clamp-2 mb-2">{trial.title}</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {trial.phase && (
                    <Badge variant="outline" className="text-xs">
                      {trial.phase}
                    </Badge>
                  )}
                  {trial.sponsor_name && (
                    <span className="text-muted-foreground">{trial.sponsor_name}</span>
                  )}
                  {trial.enrollment_count && (
                    <span className="text-muted-foreground">
                      {trial.enrollment_count} participants
                    </span>
                  )}
                </div>
                {trial.location_countries && trial.location_countries.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {trial.location_countries.slice(0, 3).join(', ')}
                    {trial.location_countries.length > 3 && ` +${trial.location_countries.length - 3}`}
                  </div>
                )}
                {trial.study_url && (
                  <a 
                    href={trial.study_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    ClinicalTrials.gov
                  </a>
                )}
              </div>
            ))}
            <Link to="/trial-matching">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Find Trials Near You
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recruiting trials found
          </p>
        )}
      </CardContent>
    </Card>
  );
}
