import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface RankingPrefs {
  topic_weights: Record<string, number>;
  source_weights: Record<string, number>;
  muted_sources: string[];
}

const EMPTY: RankingPrefs = { topic_weights: {}, source_weights: {}, muted_sources: [] };

export function useRankingPrefs() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['ranking-prefs', user?.id],
    queryFn: async (): Promise<RankingPrefs> => {
      if (!user?.id) return EMPTY;
      const { data } = await supabase
        .from('user_ranking_prefs')
        .select('topic_weights, source_weights, muted_sources')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!data) return EMPTY;
      return {
        topic_weights: (data.topic_weights as Record<string, number>) ?? {},
        source_weights: (data.source_weights as Record<string, number>) ?? {},
        muted_sources: (data.muted_sources as string[]) ?? [],
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const save = useMutation({
    mutationFn: async (prefs: Partial<RankingPrefs>) => {
      if (!user?.id) throw new Error('Sign in to save preferences');
      const merged = { ...(query.data ?? EMPTY), ...prefs };
      const { error } = await supabase
        .from('user_ranking_prefs')
        .upsert({ user_id: user.id, ...merged }, { onConflict: 'user_id' });
      if (error) throw error;
      return merged;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ranking-prefs', user?.id] }),
  });

  const trackInteraction = useCallback(
    async (topic: string | null, source: string | null) => {
      if (!user?.id || (!topic && !source)) return;
      const current = query.data ?? EMPTY;
      const topic_weights = { ...current.topic_weights };
      const source_weights = { ...current.source_weights };
      if (topic) topic_weights[topic] = Math.min(10, (topic_weights[topic] ?? 0) + 1);
      if (source) source_weights[source] = Math.min(10, (source_weights[source] ?? 0) + 1);
      await supabase.from('user_ranking_prefs').upsert(
        { user_id: user.id, topic_weights, source_weights, muted_sources: current.muted_sources },
        { onConflict: 'user_id' },
      );
      qc.setQueryData(['ranking-prefs', user.id], { ...current, topic_weights, source_weights });
    },
    [user?.id, query.data, qc],
  );

  return { prefs: query.data ?? EMPTY, isLoading: query.isLoading, save, trackInteraction };
}

/** Apply user preferences as a score delta. Positive = boost, negative = demote. */
export function rankBoost(prefs: RankingPrefs, topic?: string | null, source?: string | null): number {
  if (source && prefs.muted_sources.includes(source)) return -10_000;
  let boost = 0;
  if (topic && prefs.topic_weights[topic]) boost += prefs.topic_weights[topic] * 15;
  if (source && prefs.source_weights[source]) boost += prefs.source_weights[source] * 10;
  return boost;
}