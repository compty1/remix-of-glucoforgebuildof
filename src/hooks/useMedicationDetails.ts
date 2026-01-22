import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Medication } from "./useMedications";
import type { Json } from "@/integrations/supabase/types";

export interface ExternalMedicationReview {
  id: string;
  medication_id: string;
  source: string;
  external_id: string | null;
  author_anonymous: string | null;
  title: string | null;
  content: string;
  sentiment: string | null;
  helpful_count: number | null;
  published_at: string | null;
  source_url: string | null;
  subreddit: string | null;
  fetched_at: string | null;
  created_at: string;
}

export interface MedicationReview {
  id: string;
  medication_id: string;
  user_id: string | null;
  rating: number | null;
  title: string | null;
  content: string;
  pros: string[] | null;
  cons: string[] | null;
  effectiveness_rating: number | null;
  side_effects_rating: number | null;
  ease_of_use_rating: number | null;
  duration_of_use: string | null;
  would_recommend: boolean | null;
  verified: boolean | null;
  helpful_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationWithDetails extends Medication {
  userReviews: MedicationReview[];
  externalReviews: ExternalMedicationReview[];
  relatedMedications: Medication[];
}

export const useMedicationDetails = (medicationId: string | undefined) => {
  return useQuery({
    queryKey: ["medication-details", medicationId],
    queryFn: async (): Promise<MedicationWithDetails | null> => {
      if (!medicationId) return null;

      // Fetch medication
      const { data: medication, error: medError } = await supabase
        .from("medications")
        .select("*")
        .eq("id", medicationId)
        .single();

      if (medError) {
        console.error("Error fetching medication:", medError);
        throw medError;
      }

      if (!medication) return null;

      // Fetch user reviews
      const { data: userReviews, error: reviewError } = await supabase
        .from("medication_reviews")
        .select("*")
        .eq("medication_id", medicationId)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Error fetching user reviews:", reviewError);
      }

      // Fetch external reviews from external_medication_reviews
      const { data: externalReviews, error: extError } = await supabase
        .from("external_medication_reviews")
        .select("*")
        .eq("medication_id", medicationId)
        .order("helpful_count", { ascending: false });

      if (extError) {
        console.error("Error fetching external reviews:", extError);
      }

      // Fetch community buzz posts
      const { data: buzzPosts, error: buzzError } = await supabase
        .from("medication_community_buzz")
        .select("*")
        .eq("medication_id", medicationId)
        .order("engagement_score", { ascending: false });

      if (buzzError) {
        console.error("Error fetching community buzz:", buzzError);
      }

      // Combine external reviews and community buzz into a unified format
      const combinedReviews: ExternalMedicationReview[] = [
        ...(externalReviews || []).map(r => r as ExternalMedicationReview),
        ...(buzzPosts || []).map(buzz => ({
          id: buzz.id,
          medication_id: buzz.medication_id,
          source: buzz.source || 'Community',
          external_id: null,
          author_anonymous: buzz.author_handle,
          title: null,
          content: buzz.post_content || '',
          sentiment: buzz.sentiment,
          helpful_count: buzz.engagement_score,
          published_at: buzz.post_date,
          source_url: buzz.post_url,
          subreddit: null,
          fetched_at: null,
          created_at: buzz.created_at
        }))
      ].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));

      // Fetch related medications (same category)
      const { data: related, error: relatedError } = await supabase
        .from("medications")
        .select("*")
        .eq("category", medication.category)
        .neq("id", medicationId)
        .order("popularity_rank", { ascending: true })
        .limit(4);

      if (relatedError) {
        console.error("Error fetching related medications:", relatedError);
      }

      return {
        ...medication,
        usage_statistics: medication.usage_statistics as Record<string, unknown> | null,
        userReviews: (userReviews || []) as MedicationReview[],
        externalReviews: combinedReviews,
        relatedMedications: (related || []) as Medication[],
      } as MedicationWithDetails;
    },
    enabled: !!medicationId,
  });
};

export const useMedicationByName = (name: string | undefined) => {
  return useQuery({
    queryKey: ["medication-by-name", name],
    queryFn: async () => {
      if (!name) return null;

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .ilike("name", name)
        .single();

      if (error) {
        console.error("Error fetching medication by name:", error);
        return null;
      }

      return data as Medication;
    },
    enabled: !!name,
  });
};
