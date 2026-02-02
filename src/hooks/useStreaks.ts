import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export type StreakType = 'platform_visit' | 'data_upload' | 'tir_70' | 'survey';

const STREAK_LABELS: Record<StreakType, { name: string; icon: string; description: string }> = {
  platform_visit: {
    name: 'Daily Visits',
    icon: '🔥',
    description: 'Consecutive days visiting GlucoForge',
  },
  data_upload: {
    name: 'Data Uploads',
    icon: '📊',
    description: 'Consecutive days uploading glucose data',
  },
  tir_70: {
    name: 'TIR Champion',
    icon: '🎯',
    description: 'Consecutive days with 70%+ Time in Range',
  },
  survey: {
    name: 'Research Hero',
    icon: '🔬',
    description: 'Consecutive days completing surveys',
  },
};

export function useStreaks() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch user's streaks
  const { data: streaks = [], isLoading, refetch } = useQuery({
    queryKey: ['user-streaks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserStreak[];
    },
    enabled: !!user?.id,
  });

  // Update streak
  const updateStreak = useMutation({
    mutationFn: async (streakType: StreakType) => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const existing = streaks.find(s => s.streak_type === streakType);

      let newCurrentStreak = 1;
      let newLongestStreak = 1;

      if (existing) {
        const lastDate = existing.last_activity_date;
        
        if (lastDate === today) {
          // Already updated today
          return existing;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          // Continue streak
          newCurrentStreak = existing.current_streak + 1;
          newLongestStreak = Math.max(newCurrentStreak, existing.longest_streak);
        } else {
          // Streak broken, start new
          newCurrentStreak = 1;
          newLongestStreak = existing.longest_streak;
        }
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .upsert({
          user_id: user.id,
          streak_type: streakType,
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,streak_type',
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserStreak;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-streaks'] });
    },
  });

  // Get streak info with labels
  const getStreakInfo = (streakType: StreakType) => {
    const streak = streaks.find(s => s.streak_type === streakType);
    const labels = STREAK_LABELS[streakType];

    return {
      ...labels,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      lastActivity: streak?.last_activity_date || null,
      isActive: streak?.last_activity_date === new Date().toISOString().split('T')[0],
    };
  };

  // Get all streaks with info
  const getAllStreaks = () => {
    return (Object.keys(STREAK_LABELS) as StreakType[]).map(type => ({
      type,
      ...getStreakInfo(type),
    }));
  };

  // Get total streak days
  const getTotalStreakDays = () => {
    return streaks.reduce((sum, s) => sum + s.current_streak, 0);
  };

  // Record a platform visit (convenience method) - memoized to prevent infinite loops
  const recordVisit = useCallback(async () => {
    try {
      await updateStreak.mutateAsync('platform_visit');
    } catch (error) {
      // Silently fail for visit tracking
      console.log('Visit tracking:', error);
    }
  }, [updateStreak]);

  return {
    streaks,
    isLoading,
    refetch,
    updateStreak: updateStreak.mutateAsync,
    recordVisit,
    getStreakInfo,
    getAllStreaks,
    getTotalStreakDays,
    isUpdating: updateStreak.isPending,
  };
}
