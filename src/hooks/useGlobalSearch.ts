import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'research' | 'medication' | 'device' | 'company' | 'trial' | 'community' | 'article';
  url: string;
  score?: number;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

// C74: simple relevance scoring across all sources
function scoreResult(query: string, title: string, description: string, category: SearchResult['category']): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  let score = 0;
  if (t === q) score += 1000;
  else if (t.startsWith(q)) score += 500;
  else if (t.includes(q)) score += 200;
  if (d.includes(q)) score += 50;
  // Prefer concrete entities over articles/community noise
  const categoryBoost: Record<SearchResult['category'], number> = {
    device: 40, medication: 40, company: 30, trial: 25,
    research: 15, project: 15, article: 10, community: 5,
  };
  score += categoryBoost[category] ?? 0;
  return score;
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // C93: pass explicit reason so React Query / fetch don't surface a noisy
    // "signal is aborted without reason" runtime error in the preview.
    if (abortRef.current) abortRef.current.abort('superseded-by-newer-search');

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      const sanitized = sanitizeForIlike(query.trim().toLowerCase());
      if (!sanitized) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      const searchTerm = `%${sanitized}%`;
      const rawQuery = query.trim();

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

        if (controller.signal.aborted) return;

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
            const description = p.description || 'Health project';
            allResults.push({ id: p.id, title: p.title, description, category: 'project', url: `/projects/${p.id}`, score: scoreResult(rawQuery, p.title, description, 'project') });
          });
        }
        if (researchRes.data) {
          (researchRes.data as ResearchRow[]).forEach(r => {
            const description = r.abstract?.slice(0, 150) || 'Research paper';
            allResults.push({ id: r.id, title: r.title, description, category: 'research', url: '/research-hub', score: scoreResult(rawQuery, r.title, description, 'research') });
          });
        }
        if (medicationsRes.data) {
          (medicationsRes.data as MedRow[]).forEach(m => {
            const description = m.generic_name || m.description?.slice(0, 100) || 'Medication';
            allResults.push({ id: m.id, title: m.name, description, category: 'medication', url: '/medicines', score: scoreResult(rawQuery, m.name, description, 'medication') });
          });
        }
        if (devicesRes.data) {
          (devicesRes.data as DeviceRow[]).forEach(d => {
            const description = d.manufacturer || d.description?.slice(0, 100) || 'Medical device';
            allResults.push({ id: d.id, title: d.name, description, category: 'device', url: `/devices/${d.id}`, score: scoreResult(rawQuery, d.name, description, 'device') });
          });
        }
        if (companiesRes.data) {
          (companiesRes.data as CompanyRow[]).forEach(c => {
            const description = c.description?.slice(0, 100) || 'T1D Company';
            allResults.push({ id: c.id, title: c.name, description, category: 'company', url: `/companies/${c.id}`, score: scoreResult(rawQuery, c.name, description, 'company') });
          });
        }
        if (trialsRes.data) {
          (trialsRes.data as TrialRow[]).forEach(t => {
            const description = t.brief_summary?.slice(0, 100) || t.nct_id || 'Clinical trial';
            allResults.push({ id: t.id, title: t.title, description, category: 'trial', url: '/trial-matching', score: scoreResult(rawQuery, t.title, description, 'trial') });
          });
        }
        if (communityRes.data) {
          (communityRes.data as PostRow[]).forEach(p => {
            const description = p.content?.slice(0, 100) || 'Community discussion';
            allResults.push({ id: p.id, title: p.title, description, category: 'community', url: '/community-solutions', score: scoreResult(rawQuery, p.title, description, 'community') });
          });
        }
        if (articlesRes.data) {
          (articlesRes.data as ArticleRow[]).forEach(a => {
            const description = a.excerpt?.slice(0, 100) || 'Article';
            allResults.push({ id: a.id, title: a.title, description, category: 'article', url: `/articles/${a.slug}`, score: scoreResult(rawQuery, a.title, description, 'article') });
          });
        }

        // Trigram fuzzy layer: catches typos and word-order variants that ILIKE misses.
        try {
          const { data: fuzzy } = await supabase.rpc('search_similar_content', {
            q: rawQuery,
            max_rows: 15,
            min_sim: 0.2,
          });
          if (fuzzy && Array.isArray(fuzzy)) {
            interface FuzzyRow { source: string; id: string; title: string; snippet: string | null; similarity: number; }
            const seen = new Set(allResults.map(r => `${r.category}:${r.id}`));
            (fuzzy as FuzzyRow[]).forEach(f => {
              const category: SearchResult['category'] =
                f.source === 'research_items' ? 'research' :
                f.source === 'discoveries' ? 'research' : 'article';
              const key = `${category}:${f.id}`;
              if (seen.has(key)) return;
              seen.add(key);
              const description = (f.snippet || '').slice(0, 150);
              allResults.push({
                id: f.id, title: f.title, description, category,
                url: category === 'research' ? '/research-hub' : `/discover/${f.id}`,
                score: Math.round((f.similarity ?? 0) * 300),
              });
            });
          }
        } catch {
          // fuzzy layer is optional
        }

        // C74: sort by relevance score, highest first
        allResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        if (!controller.signal.aborted) setResults(allResults);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  return { results, isLoading, search };
}
