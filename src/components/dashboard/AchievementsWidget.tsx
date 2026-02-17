import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, ArrowRight } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useStreaks } from '@/hooks/useStreaks';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS } from '@/data/achievementDefinitions';

export function AchievementsWidget() {
  const navigate = useNavigate();
  const { completedAchievements, inProgressAchievements, totalPoints, isLoading } = useAchievements();
  const { streaks } = useStreaks();

  // Get the current platform visit streak
  const visitStreak = streaks.find(s => s.streak_type === 'platform_visit')?.current_streak || 0;

  // Get top 3 in-progress achievements
  const topInProgress = Object.values(ACHIEVEMENTS)
    .map(def => {
      const userAch = inProgressAchievements.find(a => a.achievement_id === def.id);
      return {
        ...def,
        progress: userAch?.progress || 0,
        isCompleted: completedAchievements.some(a => a.achievement_id === def.id)
      };
    })
    .filter(a => !a.isCompleted && a.progress > 0)
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Achievements
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile?tab=achievements')}
            className="gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{completedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div className="text-center p-3 bg-amber-500/10 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
              <Star className="h-4 w-4" />
              {totalPoints}
            </div>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning flex items-center justify-center gap-1">
              <Flame className="h-4 w-4" />
              {visitStreak}
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Recent Badges */}
        {completedAchievements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recent Badges</p>
            <div className="flex gap-2 flex-wrap">
              {completedAchievements.slice(0, 5).map(ach => (
                <Badge 
                  key={ach.id} 
                  variant="secondary" 
                  className="gap-1 py-1"
                  title={ach.badge_name}
                >
                  <span className="text-lg">{ach.badge_icon}</span>
                  <span className="text-xs">{ach.badge_name}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {topInProgress.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">In Progress</p>
            <div className="space-y-2">
              {topInProgress.map(ach => (
                <div key={ach.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span>{ach.icon}</span>
                      {ach.name}
                    </span>
                    <span className="text-muted-foreground">
                      {ach.progress}/{ach.target}
                    </span>
                  </div>
                  <Progress 
                    value={(ach.progress / ach.target) * 100} 
                    className="h-1.5" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {completedAchievements.length === 0 && topInProgress.length === 0 && (
          <div className="text-center py-4">
            <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start earning badges by exploring the platform!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
