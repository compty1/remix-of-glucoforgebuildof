import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

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

interface UseDeviceReviewsReturn {
  reviews: DeviceReview[];
  stats: ReviewStats;
  loading: boolean;
  error: string | null;
  userReview: DeviceReview | null;
  submitReview: (review: Omit<DeviceReview, 'id' | 'device_id' | 'user_id' | 'helpful_count' | 'created_at' | 'updated_at' | 'verified_owner'>) => Promise<boolean>;
  updateReview: (reviewId: string, review: Partial<DeviceReview>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  toggleHelpful: (reviewId: string) => Promise<boolean>;
  refresh: () => void;
}

export const useDeviceReviews = (deviceId: string | undefined): UseDeviceReviewsReturn => {
  const [reviews, setReviews] = useState<DeviceReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<DeviceReview | null>(null);
  const { user } = useAuthStore();

  const fetchReviews = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('device_reviews')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch profiles for all reviewers
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
          }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);
        }
      }

      // Check which reviews the current user has voted on
      let userVotes: Set<string> = new Set();
      if (user) {
        const { data: votesData } = await supabase
          .from('review_helpful_votes')
          .select('review_id')
          .eq('user_id', user.id);

        if (votesData) {
          userVotes = new Set(votesData.map(v => v.review_id));
        }
      }

      // Combine data
      const enrichedReviews: DeviceReview[] = (reviewsData || []).map(review => ({
        ...review,
        profile: profilesMap[review.user_id] || null,
        user_has_voted: userVotes.has(review.id)
      }));

      setReviews(enrichedReviews);

      // Find user's review if logged in
      if (user) {
        const userRev = enrichedReviews.find(r => r.user_id === user.id);
        setUserReview(userRev || null);
      }

      // Calculate stats
      if (enrichedReviews.length > 0) {
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        enrichedReviews.forEach(r => {
          sum += r.rating;
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setStats({
          averageRating: sum / enrichedReviews.length,
          totalReviews: enrichedReviews.length,
          ratingDistribution: distribution
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
    } catch (err) {
      console.error('Error fetching device reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [deviceId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (review: Omit<DeviceReview, 'id' | 'device_id' | 'user_id' | 'helpful_count' | 'created_at' | 'updated_at' | 'verified_owner'>): Promise<boolean> => {
    if (!user || !deviceId) {
      toast.error('You must be logged in to submit a review');
      return false;
    }

    try {
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
          ownership_duration: review.ownership_duration
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      await fetchReviews();
      return true;
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('You have already reviewed this device');
      } else {
        toast.error('Failed to submit review');
      }
      console.error('Error submitting review:', err);
      return false;
    }
  };

  const updateReview = async (reviewId: string, review: Partial<DeviceReview>): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update a review');
      return false;
    }

    try {
      const { error } = await supabase
        .from('device_reviews')
        .update({
          rating: review.rating,
          title: review.title,
          content: review.content,
          pros: review.pros,
          cons: review.cons,
          ownership_duration: review.ownership_duration
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Review updated successfully!');
      await fetchReviews();
      return true;
    } catch (err) {
      toast.error('Failed to update review');
      console.error('Error updating review:', err);
      return false;
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete a review');
      return false;
    }

    try {
      const { error } = await supabase
        .from('device_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Review deleted successfully!');
      await fetchReviews();
      return true;
    } catch (err) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', err);
      return false;
    }
  };

  const toggleHelpful = async (reviewId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return false;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (!review) return false;

    try {
      if (review.user_has_voted) {
        // Remove vote
        const { error } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add vote
        const { error } = await supabase
          .from('review_helpful_votes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          });

        if (error) throw error;
      }

      await fetchReviews();
      return true;
    } catch (err) {
      toast.error('Failed to update vote');
      console.error('Error toggling helpful vote:', err);
      return false;
    }
  };

  return {
    reviews,
    stats,
    loading,
    error,
    userReview,
    submitReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    refresh: fetchReviews
  };
};