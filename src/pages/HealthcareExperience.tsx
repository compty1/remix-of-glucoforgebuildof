import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Pill, 
  Ambulance,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthcareExperiencePost {
  id: string;
  title: string;
  content: string;
  sentiment: string | null;
  category: string | null;
  source_url: string | null;
  source_platform: string | null;
  location_state: string | null;
  upvotes: number;
  created_at: string;
}

interface AIRecommendation {
  id: string;
  category: string;
  recommendation: string;
  analysis_summary: string | null;
  based_on_count: number;
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  insurance: { icon: <ShieldCheck className="h-5 w-5" />, label: 'Insurance' },
  doctors: { icon: <Stethoscope className="h-5 w-5" />, label: 'Doctors' },
  hospitals: { icon: <Building2 className="h-5 w-5" />, label: 'Hospitals' },
  pharmacy: { icon: <Pill className="h-5 w-5" />, label: 'Pharmacy' },
  emergency: { icon: <Ambulance className="h-5 w-5" />, label: 'Emergency' },
  other: { icon: <Stethoscope className="h-5 w-5" />, label: 'Other' }
};

const ExperienceCard: React.FC<{ experience: HealthcareExperiencePost }> = ({ experience }) => {
  const config = categoryConfig[experience.category || 'other'] || categoryConfig.other;
  
  return (
    <Card className="command-center-widget">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </Badge>
            {experience.sentiment && (
              <Badge 
                variant={experience.sentiment === 'positive' ? 'default' : 
                         experience.sentiment === 'negative' ? 'destructive' : 'outline'}
              >
                {experience.sentiment === 'positive' ? (
                  <ThumbsUp className="h-3 w-3 mr-1" />
                ) : experience.sentiment === 'negative' ? (
                  <ThumbsDown className="h-3 w-3 mr-1" />
                ) : null}
                {experience.sentiment}
              </Badge>
            )}
          </div>
          {experience.location_state && (
            <span className="text-xs text-muted-foreground">{experience.location_state}</span>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2">{experience.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{experience.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ThumbsUp className="h-4 w-4 mr-1" />
              {experience.upvotes}
            </Button>
            {experience.source_platform && (
              <Badge variant="outline" className="text-xs">{experience.source_platform}</Badge>
            )}
          </div>
          {experience.source_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={experience.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Source
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function HealthcareExperience() {
  const [experiences, setExperiences] = useState<HealthcareExperiencePost[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSentiment, setActiveSentiment] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expResult, recResult] = await Promise.all([
        supabase
          .from('healthcare_experiences')
          .select('*')
          .eq('is_published', true)
          .order('upvotes', { ascending: false }),
        supabase
          .from('ai_healthcare_recommendations')
          .select('*')
          .order('based_on_count', { ascending: false })
      ]);

      if (expResult.error) throw expResult.error;
      if (recResult.error) throw recResult.error;

      setExperiences(expResult.data || []);
      setRecommendations(recResult.data || []);
    } catch {
      toast.error('Failed to load healthcare experiences');
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiences = experiences.filter(exp => {
    const matchesCategory = activeCategory === 'all' || exp.category === activeCategory;
    const matchesSentiment = activeSentiment === 'all' || exp.sentiment === activeSentiment;
    return matchesCategory && matchesSentiment;
  });

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Healthcare Experience
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Real stories from the T1D community about their healthcare experiences - 
            the good, the bad, and everything in between.
          </p>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map(rec => (
                  <div key={rec.id} className="p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{rec.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Based on {rec.based_on_count} experiences
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{rec.recommendation}</p>
                    {rec.analysis_summary && (
                      <p className="text-xs text-muted-foreground">{rec.analysis_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All Categories
            </Button>
            {Object.entries(categoryConfig).map(([key, { icon, label }]) => (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(key)}
                className="flex items-center gap-1"
              >
                {icon}
                {label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={activeSentiment === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSentiment('all')}
            >
              All
            </Button>
            <Button
              variant={activeSentiment === 'positive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSentiment('positive')}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Positive
            </Button>
            <Button
              variant={activeSentiment === 'negative' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSentiment('negative')}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              Negative
            </Button>
          </div>
        </div>

        {/* Experiences */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredExperiences.length > 0 ? (
          <div className="space-y-4">
            {filteredExperiences.map(exp => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <Card className="command-center-widget">
            <CardContent className="p-12 text-center">
              <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Experiences Found</h3>
              <p className="text-muted-foreground">
                Be the first to share your healthcare experience!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
