import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { T1DCompany } from './useT1DCompanies';

const MAX_COMPANIES = 4;

interface ComparisonCompany extends T1DCompany {
  yearsInOperation?: number;
  productCount?: number;
}

interface UseCompanyComparisonReturn {
  selectedCompanyIds: string[];
  comparisonCompanies: ComparisonCompany[];
  allCompanies: Pick<T1DCompany, 'id' | 'name' | 'logo_url'>[];
  loading: boolean;
  error: string | null;
  addCompany: (id: string) => void;
  removeCompany: (id: string) => void;
  clearAll: () => void;
  canAddMore: boolean;
}

export const useCompanyComparison = (initialIds: string[] = []): UseCompanyComparisonReturn => {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(initialIds);
  const [comparisonCompanies, setComparisonCompanies] = useState<ComparisonCompany[]>([]);
  const [allCompanies, setAllCompanies] = useState<Pick<T1DCompany, 'id' | 'name' | 'logo_url'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all companies for selector
  useEffect(() => {
    const fetchAllCompanies = async () => {
      const { data, error } = await supabase
        .from('t1d_companies')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      setAllCompanies((data || []) as Pick<T1DCompany, 'id' | 'name' | 'logo_url'>[]);
    };

    fetchAllCompanies();
  }, []);

  // Fetch comparison data when selection changes
  const fetchComparisonData = useCallback(async () => {
    if (selectedCompanyIds.length === 0) {
      setComparisonCompanies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('t1d_companies')
        .select('*')
        .in('id', selectedCompanyIds);

      if (fetchError) throw fetchError;

      const currentYear = new Date().getFullYear();
      const enrichedCompanies: ComparisonCompany[] = (data || []).map((company) => {
        const products = company.products as Array<{ name: string; status: string; description?: string }> | null;
        return {
          id: company.id,
          name: company.name,
          description: company.description,
          company_type: company.company_type as T1DCompany['company_type'],
          headquarters: company.headquarters,
          country: company.country,
          founded_year: company.founded_year,
          total_funding_usd: company.total_funding_usd,
          funding_stage: company.funding_stage,
          funding_rounds: company.funding_rounds,
          last_funding_date: company.last_funding_date,
          focus_areas: company.focus_areas,
          clinical_stage: company.clinical_stage,
          employee_count: company.employee_count,
          website_url: company.website_url,
          logo_url: company.logo_url,
          linkedin_url: company.linkedin_url,
          twitter_url: company.twitter_url,
          crunchbase_url: company.crunchbase_url,
          products: products || [],
          key_people: (company.key_people as Array<{ name: string; role: string; linkedin?: string }>) || [],
          investors: (company.investors as Array<{ name: string; type: string }>) || [],
          technology_summary: company.technology_summary,
          acquired_by: company.acquired_by,
          acquisition_date: company.acquisition_date,
          parent_company: company.parent_company,
          is_active: company.is_active ?? true,
          data_source: company.data_source,
          link_verified: company.link_verified ?? false,
          link_verified_at: company.link_verified_at,
          created_at: company.created_at || '',
          updated_at: company.updated_at || '',
          yearsInOperation: company.founded_year 
            ? currentYear - company.founded_year 
            : undefined,
          productCount: products?.length || 0,
        };
      });

      // Sort by selection order
      const sorted = selectedCompanyIds
        .map(id => enrichedCompanies.find(c => c.id === id))
        .filter((c): c is ComparisonCompany => c !== undefined);

      setComparisonCompanies(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyIds]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  const addCompany = useCallback((id: string) => {
    setSelectedCompanyIds(prev => {
      if (prev.includes(id) || prev.length >= MAX_COMPANIES) return prev;
      return [...prev, id];
    });
  }, []);

  const removeCompany = useCallback((id: string) => {
    setSelectedCompanyIds(prev => prev.filter(cId => cId !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedCompanyIds([]);
  }, []);

  const canAddMore = useMemo(() => selectedCompanyIds.length < MAX_COMPANIES, [selectedCompanyIds]);

  return {
    selectedCompanyIds,
    comparisonCompanies,
    allCompanies,
    loading,
    error,
    addCompany,
    removeCompany,
    clearAll,
    canAddMore,
  };
};
