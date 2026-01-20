import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrialLocation {
  facility?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

interface Trial {
  nct_id: string;
  title: string;
  brief_summary?: string;
  status?: string;
  phase?: string;
  start_date?: string;
  completion_date?: string;
  sponsor?: string;
  enrollment?: number;
  locations?: TrialLocation[];
  recruiting_status?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  eligibility_criteria?: string;
  accepts_healthy_volunteers?: boolean;
  age_requirement_min?: number;
  age_requirement_max?: number;
}

interface UseTrialMatchingOptions {
  zipCode?: string;
  radius?: number;
  phase?: string;
  status?: string;
}

export function useTrialMatching(options: UseTrialMatchingOptions = {}) {
  const { zipCode, radius = 100, phase, status } = options;

  const query = useQuery({
    queryKey: ["clinical-trials", zipCode, radius, phase, status],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("clinical_trials_detailed")
        .select("*")
        .order("start_date", { ascending: false });

      // Filter by phase if specified
      if (phase) {
        queryBuilder = queryBuilder.ilike("phase", `%${phase}%`);
      }

      // Filter by status if specified
      if (status) {
        if (status === "recruiting") {
          queryBuilder = queryBuilder.or("status.ilike.%Recruiting%,recruiting_status.ilike.%Recruiting%");
        } else if (status === "enrolling") {
          queryBuilder = queryBuilder.or("status.ilike.%Enrolling%,recruiting_status.ilike.%Enrolling%");
        } else if (status === "active") {
          queryBuilder = queryBuilder.ilike("status", "%Active%");
        }
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      // Transform the data to ensure proper typing
      const trials: Trial[] = (data || []).map((trial) => ({
        nct_id: trial.nct_id,
        title: trial.title || "",
        brief_summary: trial.brief_summary,
        status: trial.overall_status,
        phase: trial.phase,
        start_date: trial.start_date,
        completion_date: trial.completion_date,
        sponsor: trial.lead_sponsor,
        enrollment: trial.enrollment_count,
        locations: Array.isArray(trial.locations) 
          ? (trial.locations as unknown as TrialLocation[])
          : [],
        recruiting_status: trial.recruiting_status,
        contact_name: trial.contact_name,
        contact_phone: trial.contact_phone,
        contact_email: trial.contact_email,
        eligibility_criteria: trial.eligibility_criteria,
        accepts_healthy_volunteers: trial.accepts_healthy_volunteers,
        age_requirement_min: trial.age_requirement_min,
        age_requirement_max: trial.age_requirement_max,
      }));

      // If zipCode is provided, try to filter by location
      // This is a simplified version - in production you'd want geocoding
      if (zipCode && zipCode.length === 5) {
        // For now, just return all trials with locations
        // A real implementation would calculate distances
        return trials.filter((trial) => trial.locations && trial.locations.length > 0);
      }

      return trials;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    trials: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    totalCount: query.data?.length || 0,
  };
}
