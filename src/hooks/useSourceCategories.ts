import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getSourceCategory, SOURCE_CATEGORIES, type SourceCategory } from '@/utils/sourceCategories';

interface SourceCount {
  source: string;
  count: number;
  category: SourceCategory;
}

interface CategorizedSources {
  category: SourceCategory;
  label: string;
  color: string;
  sources: SourceCount[];
  totalCount: number;
}

export const useSourceCategories = () => {
  return useQuery({
    queryKey: ['source-categories'],
    queryFn: async () => {
      // Get counts per source
      const { data, error } = await supabase
        .from('community_posts')
        .select('source')
        .neq('post_type', 'reply');

      if (error) throw error;

      // Count occurrences
      const sourceCounts: Record<string, number> = {};
      for (const row of data || []) {
        sourceCounts[row.source] = (sourceCounts[row.source] || 0) + 1;
      }

      // Convert to array with categories
      const sources: SourceCount[] = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          count,
          category: getSourceCategory(source),
        }))
        .sort((a, b) => b.count - a.count);

      // Group by category
      const categorized: CategorizedSources[] = Object.entries(SOURCE_CATEGORIES)
        .map(([key, config]) => {
          const categorySources = sources.filter(s => s.category === key);
          return {
            category: key as SourceCategory,
            label: config.label,
            color: config.color,
            sources: categorySources,
            totalCount: categorySources.reduce((sum, s) => sum + s.count, 0),
          };
        })
        .filter(c => c.sources.length > 0)
        .sort((a, b) => b.totalCount - a.totalCount);

      return {
        categorized,
        allSources: sources,
        totalSources: sources.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
