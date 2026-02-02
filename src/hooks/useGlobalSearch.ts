import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'research' | 'medication' | 'device' | 'company' | 'trial';
  url: string;
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchTerm = `%${query.toLowerCase()}%`;

    try {
      // Run all searches in parallel
      const [
        projectsRes,
        researchRes,
        medicationsRes,
        devicesRes,
        companiesRes,
        trialsRes
      ] = await Promise.all([
        // Projects - using any to bypass strict typing
        (supabase as any)
          .from('health_projects')
          .select('id, title, description, slug')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        
        // Research Papers
        (supabase as any)
          .from('medical_research_papers')
          .select('id, title, abstract, paper_id')
          .or(`title.ilike.${searchTerm},abstract.ilike.${searchTerm}`)
          .limit(5),
        
        // Medications
        (supabase as any)
          .from('medications')
          .select('id, name, description, generic_name')
          .or(`name.ilike.${searchTerm},generic_name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        
        // Devices
        (supabase as any)
          .from('devices')
          .select('id, name, description, manufacturer')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},manufacturer.ilike.${searchTerm}`)
          .limit(5),
        
        // Companies
        (supabase as any)
          .from('t1d_companies')
          .select('id, name, description')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),
        
        // Clinical Trials
        (supabase as any)
          .from('clinical_trials_detailed')
          .select('id, title, brief_summary, nct_id')
          .or(`title.ilike.${searchTerm},brief_summary.ilike.${searchTerm}`)
          .limit(5),
      ]);

      const allResults: SearchResult[] = [];

      // Process projects
      if (projectsRes.data) {
        (projectsRes.data as any[]).forEach((p: any) => {
          allResults.push({
            id: p.id,
            title: p.title,
            description: p.description || 'Health project',
            category: 'project',
            url: `/projects/${p.slug || p.id}`,
          });
        });
      }

      // Process research
      if (researchRes.data) {
        (researchRes.data as any[]).forEach((r: any) => {
          allResults.push({
            id: r.id,
            title: r.title,
            description: r.abstract?.slice(0, 150) || 'Research paper',
            category: 'research',
            url: `/research-hub`,
          });
        });
      }

      // Process medications
      if (medicationsRes.data) {
        (medicationsRes.data as any[]).forEach((m: any) => {
          allResults.push({
            id: m.id,
            title: m.name,
            description: m.generic_name || m.description?.slice(0, 100) || 'Medication',
            category: 'medication',
            url: `/medicines`,
          });
        });
      }

      // Process devices
      if (devicesRes.data) {
        (devicesRes.data as any[]).forEach((d: any) => {
          allResults.push({
            id: d.id,
            title: d.name,
            description: d.manufacturer || d.description?.slice(0, 100) || 'Medical device',
            category: 'device',
            url: `/devices/${d.id}`,
          });
        });
      }

      // Process companies
      if (companiesRes.data) {
        (companiesRes.data as any[]).forEach((c: any) => {
          allResults.push({
            id: c.id,
            title: c.name,
            description: c.description?.slice(0, 100) || 'T1D Company',
            category: 'company',
            url: `/companies/${c.id}`,
          });
        });
      }

      // Process trials
      if (trialsRes.data) {
        (trialsRes.data as any[]).forEach((t: any) => {
          allResults.push({
            id: t.id,
            title: t.title,
            description: t.brief_summary?.slice(0, 100) || t.nct_id || 'Clinical trial',
            category: 'trial',
            url: `/trials`,
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, search };
}
