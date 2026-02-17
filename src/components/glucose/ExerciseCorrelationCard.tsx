import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, TrendingUp, Clock, Activity } from 'lucide-react';

interface ExerciseData {
  activityLevel: string;
  avgTir: number;
  avgGlucose: number;
  count: number;
  percentOfUsers: number;
}

interface ExerciseCorrelationCardProps {
  data: ExerciseData[];
}

export function ExerciseCorrelationCard({ data }: ExerciseCorrelationCardProps) {
  const sortedData = [...data].sort((a, b) => b.avgTir - a.avgTir);
  const bestLevel = sortedData[0];
  const improvement = bestLevel?.avgTir - sortedData[sortedData.length - 1]?.avgTir;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Exercise & Time in Range
        </CardTitle>
        <CardDescription>
          Correlation between physical activity levels and glucose control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key finding */}
        {improvement > 0 && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                Most active users show +{improvement.toFixed(1)}% higher TIR
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 italic">⚠️ Simulated data — exercise tracking is not yet available in the dataset</p>
          </div>
        )}

        {/* Activity level breakdown */}
        <div className="space-y-3">
          {data.map((level, index) => (
            <div key={level.activityLevel} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{level.activityLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={level.avgTir >= 70 ? 'default' : 'secondary'}>
                    {level.avgTir.toFixed(1)}% TIR
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({level.percentOfUsers}% of users)
                  </span>
                </div>
              </div>
              <Progress value={level.avgTir} className="h-2" />
            </div>
          ))}
        </div>

        {/* Research citation */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-medium mb-1">📚 Research Context</p>
          <p>
            Studies show 30 minutes of daily walking can improve Time in Range by 8-12% 
            (ADA Standards of Care 2024). Post-meal walks within 30 minutes are particularly effective.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExerciseCorrelationCard;
