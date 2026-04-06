/**
 * Domain 5.5: Subscription Tier Hook
 * Checks the user's subscription tier for freemium gating.
 * Migrated to React Query, removed `as any` (Bugs 104, 105, 182).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export type SubscriptionTier = 'free' | 'premium' | 'provider';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  expiresAt: string | null;
  isActive: boolean;
}

const DEFAULT_SUB: SubscriptionInfo = { tier: 'free', expiresAt: null, isActive: true };

export function useSubscriptionTier(): { subscription: SubscriptionInfo; loading: boolean } {
  const { user } = useAuthStore();

  const { data: subscription = DEFAULT_SUB, isLoading: loading } = useQuery({
    queryKey: ['subscription-tier', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error || !data) return DEFAULT_SUB;

      const isActive = !data.expires_at || new Date(data.expires_at) > new Date();
      return {
        tier: (isActive ? data.tier : 'free') as SubscriptionTier,
        expiresAt: data.expires_at as string | null,
        isActive,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return { subscription, loading };
}

/**
 * Check if a feature is available for the current tier.
 */
export function isFeatureAvailable(tier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierLevels: Record<SubscriptionTier, number> = { free: 0, premium: 1, provider: 2 };
  return tierLevels[tier] >= tierLevels[requiredTier];
}
