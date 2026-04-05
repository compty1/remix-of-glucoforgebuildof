import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export interface ReviewSubmission {
  medication_id: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  effectiveness_rating?: number;
  side_effects_rating?: number;
  ease_of_use_rating?: number;
  duration_of_use?: string;
  would_recommend?: boolean;
}

export const useMedicationReviews = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const submitReview = useMutation({
    mutationFn: async (review: ReviewSubmission) => {
      if (!user) throw new Error("You must be logged in to submit a review");
      const { data, error } = await supabase
        .from("medication_reviews")
        .insert({ ...review, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["medication-details", data.medication_id] });
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const updateReview = useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: Partial<ReviewSubmission> }) => {
      if (!user) throw new Error("You must be logged in to update a review");
      const { data, error } = await supabase
        .from("medication_reviews")
        .update(updates)
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["medication-details", data.medication_id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update review");
    },
  });

  const deleteReview = useMutation({
    mutationFn: async ({ reviewId, medicationId }: { reviewId: string; medicationId: string }) => {
      if (!user) throw new Error("You must be logged in to delete a review");
      const { error } = await supabase
        .from("medication_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);
      if (error) throw error;
      return { reviewId, medicationId };
    },
    onSuccess: ({ medicationId }) => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["medication-details", medicationId] });
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete review");
    },
  });

  const toggleHelpful = useMutation({
    mutationFn: async ({ reviewId, medicationId }: { reviewId: string; medicationId: string }) => {
      if (!user) throw new Error("You must be logged in to vote");

      // Check if user already voted
      const { data: existing } = await supabase
        .from("medication_review_helpful_votes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Un-vote
        const { error } = await supabase
          .from("medication_review_helpful_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Vote
        const { error } = await supabase
          .from("medication_review_helpful_votes")
          .insert({ review_id: reviewId, user_id: user.id });
        if (error) throw error;
      }
      return { reviewId, medicationId };
    },
    onSuccess: ({ medicationId }) => {
      queryClient.invalidateQueries({ queryKey: ["medication-details", medicationId] });
    },
    onError: () => {
      toast.error("Failed to update vote");
    },
  });

  return {
    submitReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    isSubmitting: submitReview.isPending,
    isUpdating: updateReview.isPending,
    isDeleting: deleteReview.isPending,
  };
};
