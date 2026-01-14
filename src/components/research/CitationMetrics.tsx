import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  TrendingUp, 
  Sparkles, 
  BookOpen,
  Unlock,
  BarChart3
} from 'lucide-react';
import type { ResearchInsightsStats } from '@/hooks/useResearchInsights';

interface CitationMetricsProps {
  stats: ResearchInsightsStats;
}

export const CitationMetrics: React.FC<CitationMetricsProps> = ({ stats }) => {
  const tldrPercentage = stats.totalPapers > 0 
    ? (stats.papersWithTLDR / stats.totalPapers * 100) 
    : 0;

  const openAccessPercentage = stats.totalPapers > 0 
    ? (stats.openAccessCount / stats.totalPapers * 100) 
    : 0;

  const influentialRatio = stats.totalCitations > 0
    ? (stats.totalInfluentialCitations / stats.totalCitations * 100)
    : 0;

  const metrics = [
    {
      title: 'Total Papers',
      value: stats.totalPapers.toLocaleString(),
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'With AI Summary',
      value: stats.papersWithTLDR.toLocaleString(),
      icon: Sparkles,
      color: 'text-highlight',
      bgColor: 'bg-highlight/10',
      subtext: `${tldrPercentage.toFixed(1)}% of papers`,
    },
    {
      title: 'Total Citations',
      value: stats.totalCitations.toLocaleString(),
      icon: BookOpen,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'Influential Citations',
      value: stats.totalInfluentialCitations.toLocaleString(),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtext: `${influentialRatio.toFixed(1)}% influential`,
    },
    {
      title: 'Open Access',
      value: stats.openAccessCount.toLocaleString(),
      icon: Unlock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      subtext: `${openAccessPercentage.toFixed(1)}% open`,
    },
    {
      title: 'Avg. Relevance',
      value: stats.averageRelevanceScore.toFixed(1),
      icon: BarChart3,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      subtext: 'Diabetes score',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="command-center-widget">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center mb-3`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
              {metric.subtext && (
                <div className="text-xs text-muted-foreground mt-1">{metric.subtext}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Bars */}
      <Card className="command-center-widget">
        <CardHeader>
          <CardTitle className="text-lg">Coverage Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">AI Summary Coverage</span>
              <span className="font-medium">{tldrPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={tldrPercentage} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Open Access Rate</span>
              <span className="font-medium">{openAccessPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={openAccessPercentage} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Influential Citation Rate</span>
              <span className="font-medium">{influentialRatio.toFixed(1)}%</span>
            </div>
            <Progress value={influentialRatio} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Fields of Study */}
      {stats.topFieldsOfStudy.length > 0 && (
        <Card className="command-center-widget">
          <CardHeader>
            <CardTitle className="text-lg">Trending Research Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topFieldsOfStudy.slice(0, 8).map((field, idx) => {
                const maxCount = stats.topFieldsOfStudy[0]?.count || 1;
                const percentage = (field.count / maxCount) * 100;
                
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{field.field}</span>
                      <span className="text-muted-foreground">{field.count} papers</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
