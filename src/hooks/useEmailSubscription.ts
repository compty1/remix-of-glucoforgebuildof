import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface EmailSubscription {
  id: string;
  user_id: string;
  email: string;
  subscription_type: string;
  is_active: boolean;
  preferences: {
    include_trials?: boolean;
    include_papers?: boolean;
    min_impact?: string;
  };
  last_sent_at?: string;
  created_at: string;
}

interface UseEmailSubscriptionResult {
  subscription: EmailSubscription | null;
  loading: boolean;
  error: string | null;
  subscribe: (email: string, preferences?: EmailSubscription['preferences']) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updatePreferences: (preferences: EmailSubscription['preferences']) => Promise<boolean>;
}

export const useEmailSubscription = (): UseEmailSubscriptionResult => {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<EmailSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('email_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('subscription_type', 'weekly_digest')
        .maybeSingle();

      if (dbError) throw new Error(dbError.message);
      
      // Type assertion for preferences since it comes as Json from DB
      if (data) {
        setSubscription({
          ...data,
          preferences: (data.preferences as EmailSubscription['preferences']) || {}
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const subscribe = useCallback(async (
    email: string, 
    preferences: EmailSubscription['preferences'] = { include_trials: true, include_papers: true, min_impact: 'medium' }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const { data, error: dbError } = await supabase
        .from('email_subscriptions')
        .insert({
          user_id: user.id,
          email,
          subscription_type: 'weekly_digest',
          is_active: true,
          preferences,
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);
      
      setSubscription({
        ...data,
        preferences: (data.preferences as EmailSubscription['preferences']) || {}
      });
      return true;
    } catch (err) {
      console.error('Error subscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      return false;
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      setError(null);
      const { error: dbError } = await supabase
        .from('email_subscriptions')
        .update({ is_active: false })
        .eq('id', subscription.id);

      if (dbError) throw new Error(dbError.message);
      
      setSubscription(prev => prev ? { ...prev, is_active: false } : null);
      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
      return false;
    }
  }, [user, subscription]);

  const updatePreferences = useCallback(async (
    preferences: EmailSubscription['preferences']
  ): Promise<boolean> => {
    if (!user || !subscription) return false;

    try {
      setError(null);
      const { error: dbError } = await supabase
        .from('email_subscriptions')
        .update({ preferences, is_active: true })
        .eq('id', subscription.id);

      if (dbError) throw new Error(dbError.message);
      
      setSubscription(prev => prev ? { ...prev, preferences, is_active: true } : null);
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  }, [user, subscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
};
