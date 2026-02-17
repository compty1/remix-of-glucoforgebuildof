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
      if (!user) {
        throw new Error("You must be logged in to submit a review");
      }

      const { data, error } = await supabase
        .from("medication_reviews")
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting review:", error);
        throw error;
      }

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
      if (!user) {
        throw new Error("You must be logged in to update a review");
      }

      const { data, error } = await supabase
        .from("medication_reviews")
        .update(updates)
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating review:", error);
        throw error;
      }

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
      if (!user) {
        throw new Error("You must be logged in to delete a review");
      }

      const { error } = await supabase
        .from("medication_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting review:", error);
        throw error;
      }

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
      // Read current count then increment (race-tolerant for low traffic)
      const { data, error } = await supabase
        .from("medication_reviews")
        .select("helpful_count")
        .eq("id", reviewId)
        .maybeSingle();

      if (error) throw error;

      const newCount = (data?.helpful_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("medication_reviews")
        .update({ helpful_count: newCount })
        .eq("id", reviewId);

      if (updateError) throw updateError;

      return { reviewId, medicationId, newCount };
    },
    onSuccess: ({ medicationId }) => {
      queryClient.invalidateQueries({ queryKey: ["medication-details", medicationId] });
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
