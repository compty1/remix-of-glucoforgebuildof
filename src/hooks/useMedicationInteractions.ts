import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MedicationInteraction {
  id: string;
  medication_id?: string;
  interacting_drug_name: string;
  interacting_drug_category?: string;
  severity: string;
  description: string;
  clinical_effects?: string;
  management_recommendation?: string;
  source?: string;
}

export function useMedicationInteractions() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const query = useQuery({
    queryKey: ["medication-interactions", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const { data, error } = await supabase
        .from("medication_interactions")
        .select("*")
        .or(`interacting_drug_name.ilike.%${searchTerm}%,interacting_drug_category.ilike.%${searchTerm}%`)
        .order("severity")
        .limit(50);

      if (error) throw error;
      return data as MedicationInteraction[];
    },
    enabled: searchTerm.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    interactions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    searchInteractions: setSearchTerm,
    searchTerm,
  };
}

export function useMedicationInteractionsForMed(medicationId: string | null) {
  return useQuery({
    queryKey: ["medication-interactions-for-med", medicationId],
    queryFn: async () => {
      if (!medicationId) return [];

      const { data, error } = await supabase
        .from("medication_interactions")
        .select("*")
        .eq("medication_id", medicationId)
        .order("severity");

      if (error) throw error;
      return data as MedicationInteraction[];
    },
    enabled: !!medicationId,
    staleTime: 5 * 60 * 1000,
  });
}
