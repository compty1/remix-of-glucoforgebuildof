import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sunrise, TrendingUp, Utensils, Activity, Moon, LineChart,
  Target, Syringe, Bandage, BedDouble, AlertCircle,
  Plane, UtensilsCrossed, Wine, Brain,
  Battery, AlertTriangle, Users, Building2,
  Settings, Calculator, Timer, RefreshCw, LucideIcon
} from 'lucide-react';

interface CommonIssue {
  id: string;
  title: string;
  category: string;
  description: string | null;
  icon: string;
  search_keywords: string[];
  solution_count: number;
}

const iconMap: Record<string, LucideIcon> = {
  Sunrise, TrendingUp, Utensils, Activity, Moon, LineChart,
  Target, Syringe, Bandage, BedDouble, AlertCircle,
  Plane, UtensilsCrossed, Wine, Brain,
  Battery, AlertTriangle, Users, Building2,
  Settings, Calculator, Timer, RefreshCw,
};

const categories = [
  'All',
  'Glucose Patterns',
  'Device Issues',
  'Lifestyle',
  'Emotional',
  'Technical',
];

interface ExploreSectionProps {
  onSelectIssue: (issue: CommonIssue) => void;
}

export function ExploreSection({ onSelectIssue }: ExploreSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['t1d-common-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('t1d_common_issues')
        .select('*')
        .order('solution_count', { ascending: false });

      if (error) throw error;
      return data as CommonIssue[];
    },
  });

  const filteredIssues = selectedCategory === 'All'
    ? issues
    : issues.filter(issue => issue.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Skeleton key={cat} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Explore Common Challenges</h2>
        <p className="text-muted-foreground text-sm">
          Browse solutions from the T1D community for common diabetes challenges
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Issue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIssues.map(issue => {
          const IconComponent = iconMap[issue.icon] || AlertCircle;
          
          return (
            <Card 
              key={issue.id}
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => onSelectIssue(issue)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {issue.solution_count} solutions
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{issue.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm line-clamp-2">
                  {issue.description}
                </CardDescription>
                <Badge variant="outline" className="mt-3 text-xs">
                  {issue.category}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No issues found in this category.
        </div>
      )}
    </div>
  );
}
