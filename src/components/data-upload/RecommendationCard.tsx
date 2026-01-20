import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  ArrowRight, 
  Stethoscope,
  CheckCircle
} from 'lucide-react';

interface RecommendationCardProps {
  recommendations: string[];
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getPriorityIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '💡';
  };

  const isProviderNote = (rec: string) => {
    return rec.toLowerCase().includes('provider') || 
           rec.toLowerCase().includes('doctor') ||
           rec.toLowerCase().includes('healthcare');
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Personalized Recommendations</h3>
            <p className="text-sm text-muted-foreground">Based on your glucose patterns</p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                isProviderNote(rec) 
                  ? 'bg-warning/10 border border-warning/20' 
                  : 'bg-background/50 border border-border'
              }`}
            >
              <span className="text-lg flex-shrink-0">
                {isProviderNote(rec) ? <Stethoscope className="h-5 w-5 text-warning mt-0.5" /> : getPriorityIcon(index)}
              </span>
              <div className="flex-1">
                <p className={`text-sm ${isProviderNote(rec) ? 'text-warning font-medium' : 'text-foreground'}`}>
                  {rec}
                </p>
              </div>
              {index < 3 && !isProviderNote(rec) && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  Priority {index + 1}
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
          <span>These recommendations are AI-generated based on your data patterns. Always verify with your healthcare team.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;