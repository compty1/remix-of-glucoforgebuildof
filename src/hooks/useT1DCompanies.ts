import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface T1DCompany {
  id: string;
  name: string;
  description: string | null;
  company_type: 'startup' | 'public' | 'acquired' | 'subsidiary' | 'non-profit' | null;
  focus_areas: string[] | null;
  total_funding_usd: number | null;
  funding_rounds: number | null;
  last_funding_date: string | null;
  funding_stage: string | null;
  investors: Array<{ name: string; type: string }>;
  founded_year: number | null;
  headquarters: string | null;
  country: string | null;
  employee_count: string | null;
  key_people: Array<{ name: string; role: string; linkedin?: string }>;
  products: Array<{ name: string; status: string; description?: string }>;
  technology_summary: string | null;
  clinical_stage: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  crunchbase_url: string | null;
  twitter_url: string | null;
  parent_company: string | null;
  acquired_by: string | null;
  acquisition_date: string | null;
  data_source: string | null;
  is_active: boolean;
  link_verified: boolean;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyFilters {
  search?: string;
  companyType?: string;
  focusArea?: string;
  country?: string;
  fundingStage?: string;
  minFunding?: number;
  maxFunding?: number;
}

export interface CompanyStats {
  totalCompanies: number;
  totalFunding: number;
  avgFunding: number;
  byType: Record<string, number>;
  byFocusArea: Record<string, number>;
  byCountry: Record<string, number>;
}

export function useT1DCompanies(filters?: CompanyFilters) {
  const { data: rawCompanies = [], isLoading: loading, error: rawError, refetch } = useQuery({
    queryKey: ['t1d-companies', filters?.companyType, filters?.focusArea, filters?.country, filters?.fundingStage, filters?.minFunding, filters?.maxFunding],
    queryFn: async (): Promise<T1DCompany[]> => {
      let query = supabase
        .from('t1d_companies')
        .select('*')
        .eq('is_active', true)
        .order('total_funding_usd', { ascending: false, nullsFirst: false });

      if (filters?.companyType && filters.companyType !== 'all') query = query.eq('company_type', filters.companyType);
      if (filters?.country) query = query.eq('country', filters.country);
      if (filters?.fundingStage) query = query.eq('funding_stage', filters.fundingStage);
      if (filters?.focusArea) query = query.contains('focus_areas', [filters.focusArea]);
      if (filters?.minFunding) query = query.gte('total_funding_usd', filters.minFunding);
      if (filters?.maxFunding) query = query.lte('total_funding_usd', filters.maxFunding);

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return (data || []) as T1DCompany[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const companies = useMemo(() => {
    if (!filters?.search) return rawCompanies;
    const searchLower = filters.search.toLowerCase();
    return rawCompanies.filter(company =>
      company.name.toLowerCase().includes(searchLower) ||
      company.description?.toLowerCase().includes(searchLower) ||
      company.technology_summary?.toLowerCase().includes(searchLower) ||
      company.focus_areas?.some(area => area.toLowerCase().includes(searchLower))
    );
  }, [rawCompanies, filters?.search]);

  const stats = useMemo((): CompanyStats => {
    const totalFunding = companies.reduce((sum, c) => sum + (c.total_funding_usd || 0), 0);
    const byType: Record<string, number> = {};
    const byFocusArea: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    companies.forEach(company => {
      if (company.company_type) byType[company.company_type] = (byType[company.company_type] || 0) + 1;
      company.focus_areas?.forEach(area => { byFocusArea[area] = (byFocusArea[area] || 0) + 1; });
      if (company.country) byCountry[company.country] = (byCountry[company.country] || 0) + 1;
    });

    return {
      totalCompanies: companies.length,
      totalFunding,
      avgFunding: companies.length > 0 ? totalFunding / companies.length : 0,
      byType,
      byFocusArea,
      byCountry,
    };
  }, [companies]);

  return {
    companies,
    loading,
    error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch companies') : null,
    stats,
    refetch,
  };
}

export function useCompanyById(id: string | undefined) {
  const { data: company = null, isLoading: loading, error: rawError } = useQuery({
    queryKey: ['t1d-company', id],
    queryFn: async (): Promise<T1DCompany | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('t1d_companies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as T1DCompany | null;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  return { company, loading, error: rawError ? (rawError instanceof Error ? rawError.message : 'Failed to fetch company') : null };
}

export function useRelatedCompanies(focusAreas: string[] | null, excludeId?: string) {
  const serializedAreas = focusAreas?.join(',') || '';

  const { data: companies = [], isLoading: loading } = useQuery({
    queryKey: ['related-companies', serializedAreas, excludeId],
    queryFn: async (): Promise<T1DCompany[]> => {
      if (!focusAreas || focusAreas.length === 0) return [];

      const { data, error } = await supabase
        .from('t1d_companies')
        .select('*')
        .eq('is_active', true)
        .overlaps('focus_areas', focusAreas)
        .neq('id', excludeId || '')
        .order('total_funding_usd', { ascending: false, nullsFirst: false })
        .limit(6);

      if (error) throw error;
      return (data || []) as T1DCompany[];
    },
    enabled: !!focusAreas && focusAreas.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  return { companies, loading };
}
