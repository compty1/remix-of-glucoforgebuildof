import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QualityOfLifeResource {
  id: string;
  category: string;
  name: string;
  description?: string;
  benefits_for_t1d?: string;
  scientific_evidence_level?: string;
  recommended_by_community?: boolean;
  source_url?: string;
  image_url?: string;
  dosage_info?: string;
  precautions?: string;
  cost_range?: string;
  availability?: string;
}

interface SupplementDeficiency {
  id: string;
  nutrient_name: string;
  prevalence_in_t1d?: number;
  symptoms_of_deficiency?: string[];
  recommended_daily_amount?: string;
  food_sources?: string[];
  supplement_form?: string;
  testing_method?: string;
  interaction_with_insulin?: string;
  optimal_timing?: string;
}

export function useQualityOfLifeResources() {
  const resourcesQuery = useQuery({
    queryKey: ["quality-of-life-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_of_life_resources")
        .select("*")
        .order("recommended_by_community", { ascending: false })
        .order("name");

      if (error) throw error;
      return data as QualityOfLifeResource[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const deficienciesQuery = useQuery({
    queryKey: ["t1d-supplement-deficiencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("t1d_supplement_deficiencies")
        .select("*")
        .order("prevalence_in_t1d", { ascending: false });

      if (error) throw error;
      return data as SupplementDeficiency[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    resources: resourcesQuery.data || [],
    deficiencies: deficienciesQuery.data || [],
    isLoading: resourcesQuery.isLoading || deficienciesQuery.isLoading,
    error: resourcesQuery.error || deficienciesQuery.error,
    refetch: () => {
      resourcesQuery.refetch();
      deficienciesQuery.refetch();
    },
  };
}
