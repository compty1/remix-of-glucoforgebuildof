import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useMemo } from 'react';

export interface DeviceReview {
  id: string;
  device_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  ownership_duration: string | null;
  verified_owner: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  user_has_voted?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

const EMPTY_STATS: ReviewStats = {
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

async function fetchDeviceReviews(
  deviceId: string,
  sortBy: string,
  userId: string | undefined
): Promise<DeviceReview[]> {
  const orderCol = sortBy === 'helpful' ? 'helpful_count' : sortBy === 'highest' || sortBy === 'lowest' ? 'rating' : 'created_at';
  const ascending = sortBy === 'lowest';

  const { data: reviewsData, error } = await supabase
    .from('device_reviews')
    .select('*')
    .eq('device_id', deviceId)
    .order(orderCol, { ascending, nullsFirst: false })
    .limit(100);

  if (error) throw error;

  const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];
  let profilesMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);
    if (profilesData) {
      profilesMap = profilesData.reduce((acc, p) => {
        acc[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        return acc;
      }, {} as typeof profilesMap);
    }
  }

  let userVotes = new Set<string>();
  if (userId) {
    const { data: votesData } = await supabase
      .from('review_helpful_votes')
      .select('review_id')
      .eq('user_id', userId);
    if (votesData) {
      userVotes = new Set(votesData.map(v => v.review_id));
    }
  }

  return (reviewsData || []).map(review => ({
    ...review,
    profile: profilesMap[review.user_id] || null,
    user_has_voted: userVotes.has(review.id),
  }));
}

export const useDeviceReviews = (deviceId: string | undefined, sortBy: 'newest' | 'helpful' | 'highest' | 'lowest' = 'newest') => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = ['devices', 'reviews', deviceId, sortBy];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchDeviceReviews(deviceId!, sortBy, user?.id),
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  });

  const reviews = query.data || [];

  const stats = useMemo<ReviewStats>(() => {
    if (reviews.length === 0) return EMPTY_STATS;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return {
      averageRating: sum / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  }, [reviews]);

  const userReview = useMemo(() => {
    if (!user) return null;
    return reviews.find(r => r.user_id === user.id) || null;
  }, [reviews, user]);

  const submitReview = useMutation({
    mutationFn: async (review: Omit<DeviceReview, 'id' | 'device_id' | 'user_id' | 'helpful_count' | 'created_at' | 'updated_at' | 'verified_owner'>) => {
      if (!user || !deviceId) throw new Error('You must be logged in to submit a review');
      const { error } = await supabase
        .from('device_reviews')
        .insert({
          device_id: deviceId,
          user_id: user.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          pros: review.pros || [],
          cons: review.cons || [],
          ownership_duration: review.ownership_duration,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['devices', 'reviews', deviceId] });
    },
    onError: (err: any) => {
      if (err.code === '23505') {
        toast.error('You have already reviewed this device');
      } else {
        toast.error('Failed to submit review');
      }
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: Partial<DeviceReview> }) => {
      if (!user) throw new Error('You must be logged in to update a review');
      const { error } = await supabase
        .from('device_reviews')
        .update({
          rating: updates.rating,
          title: updates.title,
          content: updates.content,
          pros: updates.pros,
          cons: updates.cons,
          ownership_duration: updates.ownership_duration,
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['devices', 'reviews', deviceId] });
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('You must be logged in to delete a review');
      const { error } = await supabase
        .from('device_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['devices', 'reviews', deviceId] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  const toggleHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('You must be logged in to vote');
      const review = reviews.find(r => r.id === reviewId);
      if (!review) throw new Error('Review not found');

      if (review.user_has_voted) {
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_helpful_votes')
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;
      }
      return { reviewId, wasVoted: review.user_has_voted };
    },
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DeviceReview[]>(queryKey);
      queryClient.setQueryData<DeviceReview[]>(queryKey, old =>
        (old || []).map(r =>
          r.id === reviewId
            ? { ...r, user_has_voted: !r.user_has_voted, helpful_count: r.helpful_count + (r.user_has_voted ? -1 : 1) }
            : r
        )
      );
      return { previous };
    },
    onError: (_err, _reviewId, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
      toast.error('Failed to update vote');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Adapter functions to match old API shape for consumers
  const submitReviewAdapter = async (review: Omit<DeviceReview, 'id' | 'device_id' | 'user_id' | 'helpful_count' | 'created_at' | 'updated_at' | 'verified_owner'>): Promise<boolean> => {
    try {
      await submitReview.mutateAsync(review);
      return true;
    } catch {
      return false;
    }
  };

  const updateReviewAdapter = async (reviewId: string, updates: Partial<DeviceReview>): Promise<boolean> => {
    try {
      await updateReview.mutateAsync({ reviewId, updates });
      return true;
    } catch {
      return false;
    }
  };

  const deleteReviewAdapter = async (reviewId: string): Promise<boolean> => {
    try {
      await deleteReview.mutateAsync(reviewId);
      return true;
    } catch {
      return false;
    }
  };

  const toggleHelpfulAdapter = async (reviewId: string): Promise<boolean> => {
    try {
      await toggleHelpful.mutateAsync(reviewId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    reviews,
    stats,
    loading: query.isLoading,
    error: query.error ? String(query.error) : null,
    userReview,
    submitReview: submitReviewAdapter,
    updateReview: updateReviewAdapter,
    deleteReview: deleteReviewAdapter,
    toggleHelpful: toggleHelpfulAdapter,
    refresh: query.refetch,
  };
};
