import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeForIlike } from '@/utils/searchSanitizer';

export interface DeviceSolution {
  id: string;
  type: 'fix' | 'post' | 'issue';
  title: string;
  description: string;
  category?: string;
  source?: string;
  sourceUrl?: string;
  votes?: number;
  successRate?: number;
  difficulty?: string;
  isVerified?: boolean;
  createdAt: string;
  detailedSteps?: string[];
  warnings?: string[];
  workaround?: string;
  solution?: string;
}

export const useDeviceSolutions = (deviceId: string | undefined, deviceName?: string) => {
  const { data: fixes, isLoading: fixesLoading } = useQuery({
    queryKey: ['device-fixes', deviceId],
    queryFn: async () => {
      if (!deviceId) return [];
      const { data, error } = await supabase
        .from('device_user_fixes')
        .select('*')
        .eq('device_id', deviceId)
        .order('votes', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!deviceId,
  });

  const { data: communityPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['device-community-posts', deviceName],
    queryFn: async () => {
      if (!deviceName) return [];
      
      // Search for posts mentioning the device
      const searchTerms = deviceName.toLowerCase().split(' ').filter(t => t.length > 2);
      
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .or(`device_mentioned.ilike.%${deviceName}%,title.ilike.%${searchTerms[0] || deviceName}%`)
        .eq('is_solution', true)
        .order('score', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!deviceName,
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['device-issues-with-solutions', deviceId],
    queryFn: async () => {
      if (!deviceId) return [];
      const { data, error } = await supabase
        .from('device_issues')
        .select('*')
        .eq('device_id', deviceId)
        .not('solution', 'is', null)
        .order('community_reports', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!deviceId,
  });

  // Normalize all data into a unified format
  const allSolutions: DeviceSolution[] = [
    ...(fixes || []).map(fix => ({
      id: fix.id,
      type: 'fix' as const,
      title: fix.title,
      description: fix.description,
      category: fix.category,
      source: fix.source,
      sourceUrl: fix.source_url,
      votes: fix.votes,
      successRate: fix.success_rate,
      difficulty: fix.difficulty,
      isVerified: fix.is_verified,
      createdAt: fix.created_at || new Date().toISOString(),
      detailedSteps: fix.detailed_steps,
      warnings: fix.warnings,
    })),
    ...(communityPosts || []).map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.title,
      description: post.content || '',
      category: post.topic_tags?.[0],
      source: post.source,
      sourceUrl: post.url,
      votes: post.score,
      createdAt: post.published_at || post.fetched_at,
    })),
    ...(issues || []).map(issue => ({
      id: issue.id,
      type: 'issue' as const,
      title: issue.issue_title,
      description: issue.description || '',
      category: issue.issue_category,
      sourceUrl: issue.source_url,
      votes: issue.community_reports,
      createdAt: issue.created_at,
      solution: issue.solution,
      workaround: issue.workaround,
    })),
  ];

  // Get unique categories
  const categories = [...new Set(allSolutions.map(s => s.category).filter(Boolean))];

  return {
    solutions: allSolutions,
    fixes: fixes || [],
    communityPosts: communityPosts || [],
    issues: issues || [],
    categories,
    isLoading: fixesLoading || postsLoading || issuesLoading,
    totalCount: allSolutions.length,
  };
};
