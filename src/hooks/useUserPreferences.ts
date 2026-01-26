import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface UserPreferences {
  id: string;
  user_id: string;
  diagnosis_year: number | null;
  therapy_type: string | null;
  primary_challenges: string[] | null;
  device_brands: string[] | null;
  content_interests: string[] | null;
  cgm_device_id: string | null;
  pump_device_id: string | null;
  primary_medication_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesInput {
  diagnosis_year?: number | null;
  therapy_type?: string | null;
  primary_challenges?: string[] | null;
  device_brands?: string[] | null;
  content_interests?: string[] | null;
  cgm_device_id?: string | null;
  pump_device_id?: string | null;
  primary_medication_id?: string | null;
  onboarding_completed?: boolean;
}

export function useUserPreferences() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading, refetch } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user?.id,
  });

  // Update preferences
  const updatePreferences = useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...input,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });

  // Complete onboarding
  const completeOnboarding = useMutation({
    mutationFn: async (input: UpdatePreferencesInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...input,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });

  // Check if user needs onboarding
  const needsOnboarding = !isLoading && user && (!preferences || !preferences.onboarding_completed);

  // Get diagnosis duration
  const getDiagnosisDuration = (): { years: number; label: string } | null => {
    if (!preferences?.diagnosis_year) return null;
    
    const currentYear = new Date().getFullYear();
    const years = currentYear - preferences.diagnosis_year;
    
    if (years < 1) return { years: 0, label: 'Newly diagnosed' };
    if (years === 1) return { years: 1, label: '1 year' };
    if (years < 5) return { years, label: `${years} years` };
    if (years < 10) return { years, label: `${years} years (veteran)` };
    return { years, label: `${years} years (long-term warrior)` };
  };

  // Get personalized greeting
  const getGreeting = (): string => {
    const duration = getDiagnosisDuration();
    const hour = new Date().getHours();
    
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    if (duration) {
      if (duration.years < 1) return `${timeGreeting}, new warrior! 💪`;
      if (duration.years < 5) return `${timeGreeting}, fellow T1D warrior!`;
      return `${timeGreeting}, seasoned warrior! 🏆`;
    }

    return `${timeGreeting}!`;
  };

  return {
    preferences,
    isLoading,
    refetch,
    updatePreferences: updatePreferences.mutateAsync,
    completeOnboarding: completeOnboarding.mutateAsync,
    needsOnboarding,
    getDiagnosisDuration,
    getGreeting,
    isUpdating: updatePreferences.isPending || completeOnboarding.isPending,
  };
}
