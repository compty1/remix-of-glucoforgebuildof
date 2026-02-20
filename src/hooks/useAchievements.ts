import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { ACHIEVEMENTS, AchievementDefinition } from '@/data/achievementDefinitions';
import { useToast } from '@/hooks/use-toast';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  badge_name: string;
  badge_icon: string | null;
  description: string | null;
  earned_at: string;
  progress: number;
  target: number;
  is_completed: boolean;
  category: string | null;
}

export function useAchievements() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<AchievementDefinition | null>(null);

  // Fetch user's achievements
  const { data: achievements = [], isLoading, refetch } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  // Get achievement progress
  const getProgress = useCallback((achievementId: string): { progress: number; target: number; isCompleted: boolean } => {
    const userAchievement = achievements.find(a => a.achievement_id === achievementId);
    const definition = ACHIEVEMENTS[achievementId];
    
    if (userAchievement) {
      return {
        progress: userAchievement.progress,
        target: userAchievement.target,
        isCompleted: userAchievement.is_completed,
      };
    }
    
    return {
      progress: 0,
      target: definition?.target || 1,
      isCompleted: false,
    };
  }, [achievements]);

  // Update achievement progress
  const updateProgress = useMutation({
    mutationFn: async ({ achievementId, increment = 1 }: { achievementId: string; increment?: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const definition = ACHIEVEMENTS[achievementId];
      if (!definition) throw new Error('Achievement not found');

      const current = getProgress(achievementId);
      const newProgress = Math.min(current.progress + increment, definition.target);
      const isCompleted = newProgress >= definition.target;

      const { data, error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          badge_name: definition.name,
          badge_icon: definition.icon,
          description: definition.description,
          progress: newProgress,
          target: definition.target,
          is_completed: isCompleted,
          category: definition.category,
          earned_at: isCompleted ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,achievement_id',
        })
        .select()
        .single();

      if (error) throw error;

      // If just completed, show celebration
      if (isCompleted && !current.isCompleted) {
        setRecentlyUnlocked(definition);
        
        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'achievement',
          title: `🎉 Achievement Unlocked: ${definition.name}`,
          message: definition.description,
          icon: definition.icon,
          link: '/profile?tab=achievements',
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
    onError: () => {
      // Achievement update error — no UI notification needed
    },
  });

  // Award achievement directly (for one-time achievements)
  const awardAchievement = useCallback(async (achievementId: string) => {
    const definition = ACHIEVEMENTS[achievementId];
    if (!definition) return;

    const current = getProgress(achievementId);
    if (current.isCompleted) return; // Already earned

    await updateProgress.mutateAsync({ 
      achievementId, 
      increment: definition.target - current.progress 
    });
  }, [getProgress, updateProgress]);

  // Check and award achievements based on triggers
  const checkTrigger = useCallback(async (triggerType: string, count = 1) => {
    const triggerMap: Record<string, string> = {
      'upload_data': 'first_upload',
      'complete_survey': 'research_contributor',
      'post_comment': 'community_champion',
      'share_story': 'warrior_storyteller',
      'read_article': 'knowledge_seeker',
      'follow_therapy': 'cure_tracker',
      'review_device': 'device_expert',
      'review_medication': 'medication_reviewer',
      'bookmark_item': 'bookworm',
      'visit_section': 'explorer',
    };

    const achievementId = triggerMap[triggerType];
    if (achievementId) {
      await updateProgress.mutateAsync({ achievementId, increment: count });
    }
  }, [updateProgress]);

  // Get completed achievements
  const completedAchievements = achievements.filter(a => a.is_completed);
  
  // Get in-progress achievements
  const inProgressAchievements = achievements.filter(a => !a.is_completed && a.progress > 0);

  // Get total points
  const totalPoints = completedAchievements.reduce((sum, a) => {
    const def = ACHIEVEMENTS[a.achievement_id];
    return sum + (def?.points || 0);
  }, 0);

  // Dismiss unlocked modal
  const dismissUnlocked = useCallback(() => {
    setRecentlyUnlocked(null);
  }, []);

  return {
    achievements,
    completedAchievements,
    inProgressAchievements,
    isLoading,
    refetch,
    getProgress,
    updateProgress: updateProgress.mutate,
    awardAchievement,
    checkTrigger,
    totalPoints,
    recentlyUnlocked,
    dismissUnlocked,
  };
}
