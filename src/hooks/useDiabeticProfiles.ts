import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export interface DiabeticProfile {
  id: string;
  user_id: string;
  display_name: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  diagnosis_year: number | null;
  device_setup: string | null;
  looking_for: string[] | null;
  bio_snippet: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
}

export function useDiabeticProfiles(stateFilter?: string, searchQuery?: string) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const profilesQuery = useQuery({
    queryKey: ['diabetic-profiles', stateFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('diabetic_profiles')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (stateFilter) {
        query = query.eq('state', stateFilter);
      }
      if (searchQuery) {
        query = query.or(`city.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,device_setup.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DiabeticProfile[];
    },
  });

  const myProfileQuery = useQuery({
    queryKey: ['my-diabetic-profile'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('diabetic_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as DiabeticProfile | null;
    },
    enabled: !!user,
  });

  const upsertProfile = useMutation({
    mutationFn: async (profile: Partial<DiabeticProfile>) => {
      if (!user) throw new Error('Must be logged in');
      const payload = { ...profile, user_id: user.id };
      
      if (myProfileQuery.data) {
        const { error } = await supabase
          .from('diabetic_profiles')
          .update(payload)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('diabetic_profiles')
          .insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diabetic-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['my-diabetic-profile'] });
      toast({ title: 'Profile updated!', description: 'Your discoverable profile has been saved.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const sendConnectionRequest = useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message?: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('connection_requests')
        .insert({ from_user_id: user.id, to_user_id: toUserId, message: message || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast({ title: 'Request sent!', description: 'Your connection request has been sent.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const myRequestsQuery = useQuery({
    queryKey: ['connection-requests'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('connection_requests')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
      if (error) throw error;
      return data as ConnectionRequest[];
    },
    enabled: !!user,
  });

  // Fetch profiles for all users involved in connection requests
  const connectedUserIds = (myRequestsQuery.data || []).flatMap(r => [r.from_user_id, r.to_user_id]).filter(id => id !== user?.id);
  const uniqueUserIds = [...new Set(connectedUserIds)];

  const connectedProfilesQuery = useQuery({
    queryKey: ['connected-profiles', uniqueUserIds.sort().join(',')],
    queryFn: async () => {
      if (uniqueUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('diabetic_profiles')
        .select('*')
        .in('user_id', uniqueUserIds);
      if (error) throw error;
      return data as DiabeticProfile[];
    },
    enabled: !!user && uniqueUserIds.length > 0,
  });

  const updateConnectionStatus = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('connection_requests')
        .update({ status })
        .eq('id', requestId)
        .eq('to_user_id', user.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connected-profiles'] });
      toast({
        title: variables.status === 'accepted' ? 'Connection accepted!' : 'Request declined',
        description: variables.status === 'accepted' ? 'You are now connected.' : 'The request has been declined.',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  return {
    profiles: profilesQuery.data || [],
    isLoading: profilesQuery.isLoading,
    myProfile: myProfileQuery.data,
    myProfileLoading: myProfileQuery.isLoading,
    upsertProfile,
    sendConnectionRequest,
    myRequests: myRequestsQuery.data || [],
    connectedProfiles: connectedProfilesQuery.data || [],
    updateConnectionStatus,
  };
}
