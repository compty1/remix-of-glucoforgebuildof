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

      // Issue 148: Check for duplicate submissions before inserting
      const { data: existing } = await supabase
        .from('experience_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('content', content.trim())
        .maybeSingle();

      if (existing) {
        throw new Error('You have already submitted this exact experience. Try adding a different perspective!');
      }

      const { data, error } = await supabase
        .from('experience_submissions')
        .insert({
          category,
          content: content.trim(),
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
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      if (!user) throw new Error('You must be logged in to vote');

      // Check if already voted
      const { data: existing } = await supabase
        .from('experience_upvote_votes')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Remove vote (toggle off)
        const { error } = await supabase
          .from('experience_upvote_votes')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        // Add vote
        const { error } = await supabase
          .from('experience_upvote_votes')
          .insert({ submission_id: submissionId, user_id: user.id });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience-submissions'] });
    },
  });
}
