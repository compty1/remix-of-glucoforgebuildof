import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Medication } from "./useMedications";
import { isValidReviewContent } from '@/utils/reviewSanitizer';

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async (): Promise<MedicationWithDetails | null> => {
      if (!medicationId) return null;

      // Fetch medication
      const { data: medication, error: medError } = await supabase
        .from("medications")
        .select("*")
        .eq("id", medicationId)
        .maybeSingle();

      if (medError) throw medError;
      if (!medication) return null;

      // Fetch user reviews, external reviews, buzz posts, and related in parallel
      const [
        { data: userReviews },
        { data: externalReviews },
        { data: buzzPosts },
        { data: related },
      ] = await Promise.all([
        supabase
          .from("medication_reviews")
          .select("*")
          .eq("medication_id", medicationId)
          .order("created_at", { ascending: false }),
        supabase
          .from("external_medication_reviews")
          .select("*")
          .eq("medication_id", medicationId)
          .order("helpful_count", { ascending: false })
          .limit(500), // C22/C44: increased from 50
        supabase
          .from("medication_community_buzz")
          .select("*")
          .eq("medication_id", medicationId)
          .order("engagement_score", { ascending: false })
          .limit(50),
        supabase
          .from("medications")
          .select("*")
          .eq("category", medication.category)
          .neq("id", medicationId)
          .order("popularity_rank", { ascending: true })
          .limit(4),
      ]);

      // C21: Use shared isValidReviewContent instead of local duplicate
      const cleanExternalReviews = (externalReviews || [])
        .filter(r => isValidReviewContent(r.content))
        .map(r => r as ExternalMedicationReview);

      // Combine external reviews and community buzz — normalise engagement_score to 
      // a comparable scale so buzz posts don't dominate the sorted list
      const MAX_HELPFUL_COUNT = 100;
      const combinedReviews: ExternalMedicationReview[] = [
        ...cleanExternalReviews,
        ...(buzzPosts || []).map(buzz => ({
          id: buzz.id,
          medication_id: buzz.medication_id,
          source: buzz.source || 'Community',
          external_id: null,
          author_anonymous: buzz.author_handle,
          title: buzz.post_content ? buzz.post_content.slice(0, 80) + (buzz.post_content.length > 80 ? '…' : '') : null,
          content: buzz.post_content || '',
          sentiment: buzz.sentiment,
          helpful_count: buzz.engagement_score ? Math.min(buzz.engagement_score, MAX_HELPFUL_COUNT) : 0,
          published_at: buzz.post_date,
          source_url: buzz.post_url,
          subreddit: null,
          fetched_at: null,
          created_at: buzz.created_at
        }))
      ].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));

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
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!name) return null;

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .ilike("name", name)
        .maybeSingle();

      if (error) return null;
      return data as Medication;
    },
    enabled: !!name,
  });
};
