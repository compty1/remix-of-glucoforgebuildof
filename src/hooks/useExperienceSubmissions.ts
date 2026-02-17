import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export type ExperienceCategory = 'good' | 'bad' | 'daily_tasks' | 'fears' | 'embarrassing_lows';

export interface ExperienceSubmission {
  id: string;
  category: ExperienceCategory;
  content: string;
  user_id: string | null;
  is_anonymous: boolean;
  is_approved: boolean;
  upvotes: number;
  created_at: string;
}

export function useExperienceSubmissions(category?: ExperienceCategory) {
  return useQuery({
    queryKey: ['experience-submissions', category],
    queryFn: async () => {
      let query = supabase
        .from('experience_submissions')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ExperienceSubmission[];
    },
  });
}

export function useExperienceCounts() {
  return useQuery({
    queryKey: ['experience-counts'],
    queryFn: async () => {
      const categories: ExperienceCategory[] = ['good', 'bad', 'daily_tasks', 'fears', 'embarrassing_lows'];
      const counts: Record<ExperienceCategory, number> = {
        good: 0,
        bad: 0,
        daily_tasks: 0,
        fears: 0,
        embarrassing_lows: 0
      };

      const results = await Promise.all(
        categories.map(category =>
          supabase
            .from('experience_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('category', category)
            .eq('is_approved', true)
            .then(({ count, error }) => ({ category, count, error }))
        )
      );

      for (const { category, count, error } of results) {
        if (!error && count !== null) {
          counts[category] = count;
        }
      }

      return counts;
    },
  });
}

export function useSubmitExperience() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      category, 
      content, 
      isAnonymous = true 
    }: { 
      category: ExperienceCategory; 
      content: string; 
      isAnonymous?: boolean;
    }) => {
      if (!user) {
        throw new Error('You must be logged in to submit');
      }

      const { data, error } = await supabase
        .from('experience_submissions')
        .insert({
          category,
          content,
          user_id: user.id,
          is_anonymous: isAnonymous,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['experience-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['experience-counts'] });
      toast.success('Your experience has been shared!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit experience');
    },
  });
}

export function useUpvoteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      // Atomic increment using rpc-style raw update
      const { data: updated, error: updateError } = await supabase.rpc('increment_experience_upvote' as any, { submission_id: submissionId }).single();
      
      // Fallback: if RPC doesn't exist, use read-then-write
      if (updateError) {
        const { data: current } = await supabase
          .from('experience_submissions')
          .select('upvotes')
          .eq('id', submissionId)
          .maybeSingle();

        const { data: fallbackUpdated, error: fallbackError } = await supabase
          .from('experience_submissions')
          .update({ upvotes: (current?.upvotes || 0) + 1 })
          .eq('id', submissionId)
          .select()
          .single();

        if (fallbackError) throw fallbackError;
        return fallbackUpdated;
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience-submissions'] });
    },
  });
}
