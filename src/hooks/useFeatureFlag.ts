/**
 * Phase 19.4: Feature Flag Hook
 * Simple client-side feature flag system.
 * Can be backed by a DB table or used with static defaults.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

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
};

/**
 * Hook to check if a feature flag is enabled.
 * Falls back to static defaults if the flag table doesn't exist.
 */
export function useFeatureFlag(flagName: string): { enabled: boolean; loading: boolean } {
  const [enabled, setEnabled] = useState(DEFAULT_FLAGS[flagName] ?? false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFlag() {
      try {
        // Attempt to read from admin_settings as a flag store
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', `feature_flag_${flagName}`)
          .eq('category', 'feature_flags')
          .maybeSingle();

        if (!cancelled) {
          if (!error && data?.setting_value !== undefined) {
            setEnabled(Boolean(data.setting_value));
          }
          // Otherwise keep default
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFlag();
    return () => { cancelled = true; };
  }, [flagName]);

  return { enabled, loading };
}

/**
 * Get all feature flags with their current status.
 */
export function getDefaultFlags(): Record<string, boolean> {
  return { ...DEFAULT_FLAGS };
}
