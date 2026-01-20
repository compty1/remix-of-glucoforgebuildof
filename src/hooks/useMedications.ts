import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Medication {
  id: string;
  name: string;
  generic_name: string | null;
  brand_names: string[] | null;
  manufacturer: string | null;
  category: string;
  subcategory: string | null;
  description: string | null;
  mechanism_of_action: string | null;
  onset_time: string | null;
  peak_time: string | null;
  duration: string | null;
  typical_dosing: string | null;
  administration_route: string | null;
  fda_approval_date: string | null;
  last_updated_date: string | null;
  avg_price: number | null;
  medicare_price: number | null;
  insurance_coverage_notes: string | null;
  common_side_effects: string[] | null;
  serious_warnings: string[] | null;
  contraindications: string[] | null;
  storage_requirements: string | null;
  key_features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  future_developments: string | null;
  clinical_notes: string | null;
  usage_statistics: Record<string, unknown> | null;
  fda_status: string | null;
  image_url: string | null;
  manufacturer_website: string | null;
  prescribing_info_url: string | null;
  rating_avg: number | null;
  review_count: number | null;
  popularity_rank: number | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export type MedicationCategory = 
  | "all"
  | "Rapid-Acting Insulin"
  | "Long-Acting Insulin"
  | "Intermediate-Acting Insulin"
  | "Inhaled Insulin"
  | "SGLT2 Inhibitor"
  | "Biguanide"
  | "DPP-4 Inhibitor"
  | "GLP-1 Receptor Agonist"
  | "Dual GIP/GLP-1 Agonist"
  | "Sulfonylurea"
  | "Amylin Analog";

export type SortOption = "name" | "rating" | "price" | "popularity";

interface UseMedicationsOptions {
  category?: MedicationCategory;
  search?: string;
  sort?: SortOption;
  featured?: boolean;
}

export const useMedications = (options: UseMedicationsOptions = {}) => {
  const { category = "all", search = "", sort = "popularity", featured } = options;

  return useQuery({
    queryKey: ["medications", category, search, sort, featured],
    queryFn: async () => {
      let query = supabase
        .from("medications")
        .select("*");

      // Apply category filter
      if (category !== "all") {
        query = query.eq("category", category);
      }

      // Apply featured filter
      if (featured !== undefined) {
        query = query.eq("featured", featured);
      }

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,manufacturer.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sort) {
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "rating":
          query = query.order("rating_avg", { ascending: false, nullsFirst: false });
          break;
        case "price":
          query = query.order("avg_price", { ascending: true, nullsFirst: false });
          break;
        case "popularity":
        default:
          query = query.order("popularity_rank", { ascending: true, nullsFirst: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching medications:", error);
        throw error;
      }

      return (data || []) as Medication[];
    },
  });
};

export const useMedicationCategories = () => {
  return useQuery({
    queryKey: ["medication-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("category")
        .order("category");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      // Get unique categories with counts
      const categoryMap = new Map<string, number>();
      data?.forEach((item) => {
        const count = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, count + 1);
      });

      return Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });
};

export const useFeaturedMedications = () => {
  return useMedications({ featured: true, sort: "popularity" });
};
