/**
 * Domain 5.3: Clinic Branding Hook
 * Loads tenant branding from clinic_tenants and applies CSS custom properties.
 * Migrated to React Query (Bug 218).
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClinicBranding {
  clinicName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  slug: string;
}

export function useClinicBranding(slug: string | undefined): { branding: ClinicBranding | null; loading: boolean } {
  const { data: branding = null, isLoading: loading } = useQuery({
    queryKey: ['clinic-branding', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinic_tenants')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();

      if (error || !data) return null;

      return {
        clinicName: data.clinic_name,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        slug: data.slug,
      } as ClinicBranding;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  // Apply/remove CSS custom properties
  useEffect(() => {
    if (branding?.primaryColor) {
      document.documentElement.style.setProperty('--clinic-primary', branding.primaryColor);
    }
    if (branding?.secondaryColor) {
      document.documentElement.style.setProperty('--clinic-secondary', branding.secondaryColor);
    }

    return () => {
      document.documentElement.style.removeProperty('--clinic-primary');
      document.documentElement.style.removeProperty('--clinic-secondary');
    };
  }, [branding]);

  return { branding, loading };
}
