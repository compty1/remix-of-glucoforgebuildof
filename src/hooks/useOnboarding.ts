import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingState {
  role: string | null;
  showModal: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuthStore();
  const [localState, setLocalState] = useState<OnboardingState>({
    role: null,
    showModal: false,
  });

  const { data: isNewUser = false } = useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      const isNew = !profile;
      if (isNew) {
        setLocalState(prev => ({ ...prev, showModal: true }));
      }
      return isNew;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const completeOnboarding = useCallback(async (role: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          bio: `Role: ${role}`
        });

      if (error) throw error;

      setLocalState({ role, showModal: false });

      // If newly diagnosed, trigger first 100 days program
      if (role === 'newly_diagnosed') {
        await supabase.functions.invoke('daily-briefing', {
          body: { userId: user.id, dayNumber: 1 }
        });
      }
    } catch {
      // Onboarding completion error
    }
  }, [user]);

  const dismissModal = useCallback(() => {
    setLocalState(prev => ({ ...prev, showModal: false }));
  }, []);

  return {
    isNewUser: isNewUser && !localState.role,
    role: localState.role,
    currentDay: 1,
    showModal: localState.showModal,
    completeOnboarding,
    dismissModal,
  };
};
