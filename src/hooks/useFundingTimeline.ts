import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FundingTimelineData {
  year: number;
  totalFunding: number;
  companyCount: number;
  topCompanies: string[];
}

interface UseFundingTimelineReturn {
  timelineData: FundingTimelineData[];
  loading: boolean;
  error: string | null;
  totalInvestment: number;
  peakYear: number | null;
}

export const useFundingTimeline = (): UseFundingTimelineReturn => {
  const [timelineData, setTimelineData] = useState<FundingTimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('t1d_companies')
          .select('name, founded_year, total_funding_usd')
          .eq('is_active', true)
          .not('founded_year', 'is', null)
          .order('founded_year', { ascending: true });

        if (fetchError) throw fetchError;

        // Group by year
        const yearMap = new Map<number, { 
          totalFunding: number; 
          companies: { name: string; funding: number }[] 
        }>();

        (data || []).forEach((company) => {
          const year = company.founded_year as number;
          const funding = (company.total_funding_usd as number) || 0;
          const name = company.name as string;

          if (!yearMap.has(year)) {
            yearMap.set(year, { totalFunding: 0, companies: [] });
          }

          const yearData = yearMap.get(year)!;
          yearData.totalFunding += funding;
          yearData.companies.push({ name, funding });
        });

        // Convert to array and sort
        const timeline: FundingTimelineData[] = Array.from(yearMap.entries())
          .map(([year, data]) => ({
            year,
            totalFunding: data.totalFunding,
            companyCount: data.companies.length,
            topCompanies: data.companies
              .sort((a, b) => b.funding - a.funding)
              .slice(0, 3)
              .map(c => c.name),
          }))
          .sort((a, b) => a.year - b.year);

        setTimelineData(timeline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  const totalInvestment = timelineData.reduce((sum, d) => sum + d.totalFunding, 0);
  const peakYear = timelineData.length > 0
    ? timelineData.reduce((max, d) => d.totalFunding > max.totalFunding ? d : max).year
    : null;

  return {
    timelineData,
    loading,
    error,
    totalInvestment,
    peakYear,
  };
};
