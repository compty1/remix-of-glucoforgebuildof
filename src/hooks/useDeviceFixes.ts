import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DeviceFix {
  id: string;
  device_id: string;
  title: string;
  description: string;
  detailed_steps: string[] | null;
  category: string | null;
  difficulty: string | null;
  success_rate: number | null;
  votes: number;
  source: string | null;
  source_url: string | null;
  warnings: string[] | null;
  is_verified: boolean;
  created_at: string;
}

export function useDeviceFixes(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["device-fixes", deviceId],
    queryFn: async () => {
      if (!deviceId) return [];

      const { data, error } = await supabase
        .from("device_user_fixes")
        .select("*")
        .eq("device_id", deviceId)
        .order("votes", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as DeviceFix[];
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  });
}
