/**
 * Domain 5.5: Subscription Tier Hook
 * Checks the user's subscription tier for freemium gating.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const sb = supabase as any;

export type SubscriptionTier = 'free' | 'premium' | 'provider';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  expiresAt: string | null;
  isActive: boolean;
}

export function useSubscriptionTier(): { subscription: SubscriptionInfo; loading: boolean } {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    tier: 'free',
    expiresAt: null,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await sb
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const isActive = !data.expires_at || new Date(data.expires_at) > new Date();
        setSubscription({
          tier: isActive ? data.tier : 'free',
          expiresAt: data.expires_at,
          isActive,
        });
      }
      setLoading(false);
    };

    load();
  }, [user]);

  return { subscription, loading };
}

/**
 * Check if a feature is available for the current tier.
 */
export function isFeatureAvailable(tier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierLevels: Record<SubscriptionTier, number> = { free: 0, premium: 1, provider: 2 };
  return tierLevels[tier] >= tierLevels[requiredTier];
}
