/**
 * Phase 19.4: Feature Flag Hook
 * Migrated to React Query with shared cache (Bug 232).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Static defaults – used when DB is unreachable or flag doesn't exist
const DEFAULT_FLAGS: Record<string, boolean> = {
  voice_logging: false,
  offline_mode: false,
  predictive_alerts: false,
  e2ee_journals: false,
  fhir_export: true,
  agp_export: true,
  device_eol_tracker: false,
  nightscout_sync: false,
  local_ai: false,
  bluetooth_pairing: false,
  nfc_scanning: false,
  hormonal_tracker: false,
  digital_companion: false,
  charity_points: false,
  mentor_matching: false,
  retinopathy_mode: false,
};

/**
 * Hook to check if a feature flag is enabled.
 * Uses React Query with shared cache so multiple components checking
 * the same flag won't create duplicate DB queries.
 */
export function useFeatureFlag(flagName: string): { enabled: boolean; loading: boolean } {
  const { data: enabled = DEFAULT_FLAGS[flagName] ?? false, isLoading: loading } = useQuery({
    queryKey: ['feature-flag', flagName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', `feature_flag_${flagName}`)
        .eq('category', 'feature_flags')
        .maybeSingle();

      if (error || !data?.setting_value) {
        return DEFAULT_FLAGS[flagName] ?? false;
      }
      return Boolean(data.setting_value);
    },
    staleTime: 10 * 60 * 1000,
  });

  return { enabled, loading };
}

/**
 * Get all feature flags with their current status.
 */
export function getDefaultFlags(): Record<string, boolean> {
  return { ...DEFAULT_FLAGS };
}
