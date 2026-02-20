import { useState, useEffect } from 'react';
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
  const [companies, setCompanies] = useState<T1DCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('t1d_companies')
        .select('*')
        .eq('is_active', true)
        .order('total_funding_usd', { ascending: false, nullsFirst: false });

      if (filters?.companyType && filters.companyType !== 'all') {
        query = query.eq('company_type', filters.companyType);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      if (filters?.fundingStage) {
        query = query.eq('funding_stage', filters.fundingStage);
      }

      if (filters?.focusArea) {
        query = query.contains('focus_areas', [filters.focusArea]);
      }

      if (filters?.minFunding) {
        query = query.gte('total_funding_usd', filters.minFunding);
      }

      if (filters?.maxFunding) {
        query = query.lte('total_funding_usd', filters.maxFunding);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = (data || []) as unknown as T1DCompany[];

      // Client-side search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(company =>
          company.name.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower) ||
          company.technology_summary?.toLowerCase().includes(searchLower) ||
          company.focus_areas?.some(area => area.toLowerCase().includes(searchLower))
        );
      }

      setCompanies(filteredData);

      // Calculate stats
      const totalFunding = filteredData.reduce((sum, c) => sum + (c.total_funding_usd || 0), 0);
      const byType: Record<string, number> = {};
      const byFocusArea: Record<string, number> = {};
      const byCountry: Record<string, number> = {};

      filteredData.forEach(company => {
        if (company.company_type) {
          byType[company.company_type] = (byType[company.company_type] || 0) + 1;
        }
        company.focus_areas?.forEach(area => {
          byFocusArea[area] = (byFocusArea[area] || 0) + 1;
        });
        if (company.country) {
          byCountry[company.country] = (byCountry[company.country] || 0) + 1;
        }
      });

      setStats({
        totalCompanies: filteredData.length,
        totalFunding,
        avgFunding: filteredData.length > 0 ? totalFunding / filteredData.length : 0,
        byType,
        byFocusArea,
        byCountry
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filters?.search, filters?.companyType, filters?.focusArea, filters?.country, filters?.fundingStage]);

  return { companies, loading, error, stats, refetch: fetchCompanies };
}

export function useCompanyById(id: string | undefined) {
  const [company, setCompany] = useState<T1DCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('t1d_companies')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setCompany(data as unknown as T1DCompany);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  return { company, loading, error };
}

export function useRelatedCompanies(focusAreas: string[] | null, excludeId?: string) {
  const [companies, setCompanies] = useState<T1DCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!focusAreas || focusAreas.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('t1d_companies')
          .select('*')
          .eq('is_active', true)
          .overlaps('focus_areas', focusAreas)
          .neq('id', excludeId || '')
          .order('total_funding_usd', { ascending: false, nullsFirst: false })
          .limit(6);

        if (error) throw error;
        setCompanies((data || []) as unknown as T1DCompany[]);
      } catch (err) {
        // Ignore related companies fetch errors silently
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [focusAreas, excludeId]);

  return { companies, loading };
}
