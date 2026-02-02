import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  acronym: string;
  purpose: string;
  mission_statement: string;
  org_type: 'research' | 'advocacy' | 'support' | 'education' | 'hybrid' | 'foundation';
  founded_year: number;
  headquarters: string;
  country: string;
  annual_revenue: number;
  annual_donations: number;
  executive_compensation: {
    ceo_name?: string;
    ceo_salary?: number;
  };
  staff_count: number;
  volunteer_count: number;
  current_projects: Array<{ name: string; description: string }>;
  recent_projects: Array<{ name: string; year: number }>;
  future_plans: string;
  history_summary: string;
  notable_achievements: string[];
  website_url: string;
  donate_url: string;
  logo_url: string;
  charity_navigator_rating: number;
}

interface UseDiabetesOrganizationsResult {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDiabetesOrganizations = (): UseDiabetesOrganizationsResult => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('diabetes_organizations')
        .select('*')
        .order('annual_revenue', { ascending: false });

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Transform JSONB fields to proper types with safer type handling
      const transformedData: Organization[] = (data || []).map(org => ({
        id: org.id,
        name: org.name || '',
        acronym: org.acronym || '',
        purpose: org.purpose || '',
        mission_statement: org.mission_statement || '',
        org_type: (org.org_type as Organization['org_type']) || 'hybrid',
        founded_year: org.founded_year || 0,
        headquarters: org.headquarters || '',
        country: org.country || '',
        annual_revenue: org.annual_revenue || 0,
        annual_donations: org.annual_donations || 0,
        executive_compensation: (org.executive_compensation as Organization['executive_compensation']) || {},
        staff_count: org.staff_count || 0,
        volunteer_count: org.volunteer_count || 0,
        current_projects: (org.current_projects as Organization['current_projects']) || [],
        recent_projects: (org.recent_projects as Organization['recent_projects']) || [],
        future_plans: org.future_plans || '',
        history_summary: org.history_summary || '',
        notable_achievements: (org.notable_achievements as string[]) || [],
        website_url: org.website_url || '',
        donate_url: org.donate_url || '',
        logo_url: org.logo_url || '',
        charity_navigator_rating: org.charity_navigator_rating || 0,
      }));

      setOrganizations(transformedData);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
  };
};
