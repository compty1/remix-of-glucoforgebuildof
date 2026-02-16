import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CommunityDirectoryEntry {
  id: string;
  name: string;
  organization_type: string;
  description: string;
  city: string | null;
  state: string | null;
  region: string | null;
  url: string;
  is_national: boolean;
  created_at: string;
}

export function useCommunityDirectory(stateFilter?: string, typeFilter?: string) {
  return useQuery({
    queryKey: ['community-directory', stateFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('t1d_community_directory')
        .select('*')
        .order('name');

      if (stateFilter) {
        query = query.or(`state.eq.${stateFilter},is_national.eq.true`);
      }
      if (typeFilter) {
        query = query.eq('organization_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CommunityDirectoryEntry[];
    },
  });
}
