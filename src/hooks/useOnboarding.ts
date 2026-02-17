import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingState {
  isNewUser: boolean;
  role: string | null;
  currentDay: number;
  showModal: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuthStore();
  const [state, setState] = useState<OnboardingState>({
    isNewUser: false,
    role: null,
    currentDay: 1,
    showModal: false
  });

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Check if user has a profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no profile exists, this is a new user
      if (!profile) {
        setState(prev => ({
          ...prev,
          isNewUser: true,
          showModal: true
        }));
      }
    } catch (error) {
      console.log('Onboarding check:', error);
    }
  };

  const completeOnboarding = async (role: string) => {
    if (!user) return;

    try {
      // Create or update profile with role
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'User',
          bio: `Role: ${role}`
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        role,
        showModal: false,
        isNewUser: false
      }));

      // If newly diagnosed, trigger first 100 days program
      if (role === 'newly_diagnosed') {
        await startFirst100Days();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const startFirst100Days = async () => {
    try {
      // Call the daily briefing function to get today's tip
      const { data } = await supabase.functions.invoke('daily-briefing', {
        body: { 
          userId: user?.id,
          dayNumber: 1 
        }
      });

      console.log('Started First 100 Days program:', data);
    } catch (error) {
      console.error('Error starting First 100 Days:', error);
    }
  };

  const dismissModal = () => {
    setState(prev => ({ ...prev, showModal: false }));
  };

  return {
    ...state,
    completeOnboarding,
    dismissModal
  };
};