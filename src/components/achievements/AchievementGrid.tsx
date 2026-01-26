import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge } from './AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementsByCategory } from '@/data/achievementDefinitions';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementGridProps {
  compact?: boolean;
  showAll?: boolean;
}

export function AchievementGrid({ compact = false, showAll = false }: AchievementGridProps) {
  const { achievements, completedAchievements, totalPoints, getProgress, isLoading } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const allAchievements = Object.values(ACHIEVEMENTS);
  const filteredAchievements = selectedCategory === 'all'
    ? allAchievements
    : getAchievementsByCategory(selectedCategory);

  const completedCount = completedAchievements.length;
  const totalCount = allAchievements.length;

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Achievements
            </CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              {totalPoints} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-2xl font-bold">{completedCount}/{totalCount}</div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {completedAchievements.slice(0, 6).map(a => (
              <AchievementBadge
                key={a.achievement_id}
                icon={ACHIEVEMENTS[a.achievement_id]?.icon || '🏆'}
                name={ACHIEVEMENTS[a.achievement_id]?.name || a.badge_name}
                description={ACHIEVEMENTS[a.achievement_id]?.description || ''}
                isCompleted={true}
                earnedAt={a.earned_at}
                size="sm"
              />
            ))}
            {completedAchievements.length > 6 && (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                +{completedAchievements.length - 6}
              </div>
            )}
          </div>

          {completedAchievements.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Start earning achievements by exploring the platform!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Achievements
          </h2>
          <p className="text-muted-foreground">
            {completedCount} of {totalCount} unlocked
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Points</div>
            <div className="text-2xl font-bold text-primary">{totalPoints}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{completedCount} completed</span>
          <span>{totalCount - completedCount} remaining</span>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="gap-1">
            All
            <Badge variant="secondary" className="h-5 text-xs">{totalCount}</Badge>
          </TabsTrigger>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              <span>{cat.icon}</span>
              {cat.name}
              <Badge variant="secondary" className="h-5 text-xs">
                {getAchievementsByCategory(key).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredAchievements.map(achievement => {
              const progress = getProgress(achievement.id);
              return (
                <AchievementBadge
                  key={achievement.id}
                  icon={achievement.icon}
                  name={achievement.name}
                  description={achievement.description}
                  isCompleted={progress.isCompleted}
                  progress={progress.progress}
                  target={progress.target}
                  showProgress={!progress.isCompleted && progress.progress > 0}
                  size="md"
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
