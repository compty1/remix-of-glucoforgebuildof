import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Medication } from "./useMedications";

const MAX_MEDICATIONS = 4;

export interface UseMedicationComparisonReturn {
  selectedIds: string[];
  comparisonMedications: Medication[];
  allMedications: Medication[];
  isLoading: boolean;
  error: Error | null;
  addMedication: (id: string) => void;
  removeMedication: (id: string) => void;
  clearAll: () => void;
  canAddMore: boolean;
}

export const useMedicationComparison = (): UseMedicationComparisonReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize from URL
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const parsedIds = ids.split(",").filter(Boolean);
      setSelectedIds(parsedIds.slice(0, MAX_MEDICATIONS));
    }
  }, []);

  // Sync to URL
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ ids: selectedIds.join(",") }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedIds, setSearchParams]);

  // Fetch all medications for selection dropdown
  const { data: allMedications = [], isLoading: loadingAll } = useQuery({
    queryKey: ["all-medications-for-comparison"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data || []) as Medication[];
    },
  });

  // Fetch selected medications for comparison
  const {
    data: comparisonMedications = [],
    isLoading: loadingComparison,
    error,
  } = useQuery({
    queryKey: ["comparison-medications", selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .in("id", selectedIds);

      if (error) throw error;

      // Maintain the order of selection
      const orderedData = selectedIds
        .map((id) => data?.find((med) => med.id === id))
        .filter(Boolean) as Medication[];

      return orderedData;
    },
    enabled: selectedIds.length > 0,
  });

  const addMedication = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_MEDICATIONS) return prev;
      return [...prev, id];
    });
  }, []);

  const removeMedication = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((existingId) => existingId !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    comparisonMedications,
    allMedications,
    isLoading: loadingAll || loadingComparison,
    error: error as Error | null,
    addMedication,
    removeMedication,
    clearAll,
    canAddMore: selectedIds.length < MAX_MEDICATIONS,
  };
};
