import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  executive_compensation: { ceo_name?: string; ceo_salary?: number; };
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
  refetch: () => void;
}

const QUERY_KEY = ['diabetes-organizations'];

export const useDiabetesOrganizations = (): UseDiabetesOrganizationsResult => {
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading: loading, error: rawError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from('diabetes_organizations')
        .select('*')
        .order('annual_revenue', { ascending: false });

      if (dbError) throw new Error(dbError.message);

      return (data || []).map(org => ({
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
      })) as Organization[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const error = rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch organizations') : null;
  const refetch = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  return { organizations, loading, error, refetch };
};
