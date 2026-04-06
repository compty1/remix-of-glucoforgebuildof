import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'research' | 'medication' | 'device' | 'company' | 'trial' | 'community' | 'article';
  url: string;
}

const DEBOUNCE_MS = 300;

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      const sanitized = sanitizeForIlike(query.trim().toLowerCase());
      const searchTerm = `%${sanitized}%`;

      try {
        const [
          projectsRes,
          researchRes,
          medicationsRes,
          devicesRes,
          companiesRes,
          trialsRes,
          communityRes,
          articlesRes
        ] = await Promise.all([
          supabase
            .from('diabetic_health_projects' as 'diabetic_health_projects')
            .select('id, title, description')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('medical_research_papers')
            .select('id, title, abstract, paper_id')
            .or(`title.ilike.${searchTerm},abstract.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('medications')
            .select('id, name, description, generic_name')
            .or(`name.ilike.${searchTerm},generic_name.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('devices')
            .select('id, name, description, manufacturer')
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},manufacturer.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('t1d_companies')
            .select('id, name, description')
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('clinical_trials_detailed')
            .select('id, title, brief_summary, nct_id')
            .or(`title.ilike.${searchTerm},brief_summary.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('community_posts')
            .select('id, title, content, source, post_id')
            .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('articles')
            .select('id, title, excerpt, slug')
            .eq('is_published', true)
            .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
            .limit(5),
        ]);

        const allResults: SearchResult[] = [];

        interface ProjectRow { id: string; title: string; description: string | null; }
        interface ResearchRow { id: string; title: string; abstract: string | null; }
        interface MedRow { id: string; name: string; description: string | null; generic_name: string | null; }
        interface DeviceRow { id: string; name: string; description: string | null; manufacturer: string | null; }
        interface CompanyRow { id: string; name: string; description: string | null; }
        interface TrialRow { id: string; title: string; brief_summary: string | null; nct_id: string; }
        interface PostRow { id: string; title: string; content: string | null; }
        interface ArticleRow { id: string; title: string; excerpt: string | null; slug: string; }

        if (projectsRes.data) {
          (projectsRes.data as ProjectRow[]).forEach(p => {
            allResults.push({ id: p.id, title: p.title, description: p.description || 'Health project', category: 'project', url: `/projects/${p.id}` });
          });
        }
        if (researchRes.data) {
          (researchRes.data as ResearchRow[]).forEach(r => {
            allResults.push({ id: r.id, title: r.title, description: r.abstract?.slice(0, 150) || 'Research paper', category: 'research', url: '/research-hub' });
          });
        }
        if (medicationsRes.data) {
          (medicationsRes.data as MedRow[]).forEach(m => {
            allResults.push({ id: m.id, title: m.name, description: m.generic_name || m.description?.slice(0, 100) || 'Medication', category: 'medication', url: '/medicines' });
          });
        }
        if (devicesRes.data) {
          (devicesRes.data as DeviceRow[]).forEach(d => {
            allResults.push({ id: d.id, title: d.name, description: d.manufacturer || d.description?.slice(0, 100) || 'Medical device', category: 'device', url: `/devices/${d.id}` });
          });
        }
        if (companiesRes.data) {
          (companiesRes.data as CompanyRow[]).forEach(c => {
            allResults.push({ id: c.id, title: c.name, description: c.description?.slice(0, 100) || 'T1D Company', category: 'company', url: `/companies/${c.id}` });
          });
        }
        if (trialsRes.data) {
          (trialsRes.data as TrialRow[]).forEach(t => {
            allResults.push({ id: t.id, title: t.title, description: t.brief_summary?.slice(0, 100) || t.nct_id || 'Clinical trial', category: 'trial', url: '/trial-matching' });
          });
        }
        if (communityRes.data) {
          (communityRes.data as PostRow[]).forEach(p => {
            allResults.push({ id: p.id, title: p.title, description: p.content?.slice(0, 100) || 'Community discussion', category: 'community', url: '/community-solutions' });
          });
        }
        if (articlesRes.data) {
          (articlesRes.data as ArticleRow[]).forEach(a => {
            allResults.push({ id: a.id, title: a.title, description: a.excerpt?.slice(0, 100) || 'Article', category: 'article', url: `/articles/${a.slug}` });
          });
        }

        setResults(allResults);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  return { results, isLoading, search };
}
