/**
 * Domain 5.3: Clinic Branding Hook
 * Loads tenant branding from clinic_tenants and applies CSS custom properties.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

export interface ClinicBranding {
  clinicName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  slug: string;
}

export function useClinicBranding(slug: string | undefined): { branding: ClinicBranding | null; loading: boolean } {
  const [branding, setBranding] = useState<ClinicBranding | null>(null);
  const [loading, setLoading] = useState(!!slug);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const { data } = await sb
        .from('clinic_tenants')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setBranding({
          clinicName: data.clinic_name,
          logoUrl: data.logo_url,
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          slug: data.slug,
        });

        // Apply CSS custom properties
        if (data.primary_color) {
          document.documentElement.style.setProperty('--clinic-primary', data.primary_color);
        }
        if (data.secondary_color) {
          document.documentElement.style.setProperty('--clinic-secondary', data.secondary_color);
        }
      }
      setLoading(false);
    };

    load();

    return () => {
      document.documentElement.style.removeProperty('--clinic-primary');
      document.documentElement.style.removeProperty('--clinic-secondary');
    };
  }, [slug]);

  return { branding, loading };
}
