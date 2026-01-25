import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Star, 
  Quote, 
  Heart, 
  Zap, 
  Moon, 
  Utensils,
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Briefcase,
  Pill
} from 'lucide-react';
import { useQualityOfLifeExperiences, useQualityOfLifeCategories } from '@/hooks/useQualityOfLifeExperiences';

const categoryIcons: Record<string, React.ReactNode> = {
  'Sleep': <Moon className="h-4 w-4" />,
  'Exercise': <Activity className="h-4 w-4" />,
  'Mental Health': <Brain className="h-4 w-4" />,
  'Diet': <Utensils className="h-4 w-4" />,
  'Technology': <Zap className="h-4 w-4" />,
  'Work/Life': <Briefcase className="h-4 w-4" />,
  'Supplements': <Pill className="h-4 w-4" />,
  'Relationships': <Heart className="h-4 w-4" />
};

const categoryColors: Record<string, string> = {
  'Sleep': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Exercise': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Mental Health': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Diet': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Technology': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'Work/Life': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'Supplements': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Relationships': 'bg-red-500/10 text-red-600 border-red-500/20'
};

export default function RealExperiencesSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const { data: experiences, isLoading } = useQualityOfLifeExperiences(selectedCategory);
  const { data: categories } = useQualityOfLifeCategories();

  const displayedExperiences = showAll ? experiences : experiences?.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-8 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Real Experiences from the T1D Community</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-b">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Real Experiences from the T1D Community</h2>
          <Badge variant="secondary">Verified</Badge>
        </div>
        
        <p className="text-muted-foreground mb-6 max-w-3xl">
          These are real strategies and experiences shared by people with Type 1 diabetes 
          that have significantly improved their quality of life. Sourced from Reddit, 
          TuDiabetes, Beyond Type 1, and other trusted T1D communities.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories?.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="gap-1"
            >
              {categoryIcons[cat] || <Star className="h-4 w-4" />}
              {cat}
            </Button>
          ))}
        </div>

        {/* Experiences Grid */}
        {displayedExperiences && displayedExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {displayedExperiences.map((exp) => (
              <Card key={exp.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className={categoryColors[exp.category] || 'bg-muted'}>
                      {categoryIcons[exp.category] || <Star className="h-4 w-4" />}
                      <span className="ml-1">{exp.category}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span className="text-xs">{exp.upvotes}</span>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{exp.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary">
                      <Quote className="h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground italic">
                        {exp.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-success/10 text-success text-xs px-2 py-1 rounded-full">
                        Impact: {exp.impact}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {exp.verified && <Star className="h-3 w-3 text-warning fill-current" />}
                        {exp.source}
                        {exp.source_url && (
                          <a 
                            href={exp.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No experiences found for this category.</p>
            </CardContent>
          </Card>
        )}

        {/* Show More/Less */}
        {experiences && experiences.length > 6 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show All {experiences.length} Experiences <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        )}

        {/* Source Attribution */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">
            Experiences collected and verified from: Reddit r/diabetes_t1d, TuDiabetes, 
            Beyond Type 1, DiabetesSisters, Children with Diabetes, and Facebook T1D communities.
            Always consult your healthcare team before making changes to your management.
          </p>
        </div>
      </div>
    </section>
  );
}
