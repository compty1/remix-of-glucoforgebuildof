import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export function useConversation(otherUserId: string | null) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['direct-messages', otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return [];
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as DirectMessage[];
    },
    enabled: !!user && !!otherUserId,
    refetchInterval: false,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user || !otherUserId) return;
    const channel = supabase
      .channel(`dm-${user.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new as DirectMessage | undefined;
          if (
            msg &&
            ((msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && msg.receiver_id === user.id))
          ) {
            queryClient.invalidateQueries({ queryKey: ['direct-messages', otherUserId] });
            queryClient.invalidateQueries({ queryKey: ['dm-unread-counts'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, queryClient]);

  return messagesQuery;
}

export function useSendMessage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('direct_messages')
        .insert({ sender_id: user.id, receiver_id: receiverId, content });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', vars.receiverId] });
    },
    onError: (err: any) => {
      toast({ title: 'Error sending message', description: err.message, variant: 'destructive' });
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: (_, otherUserId) => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['dm-unread-counts'] });
    },
  });
}

export function useUnreadCounts() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Realtime subscription for unread count updates (Bug 13)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dm-unread-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dm-unread-counts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['dm-unread-counts'],
    queryFn: async () => {
      if (!user) return {};
      const { data, error } = await supabase
        .from('direct_messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((m: { sender_id: string }) => {
        counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user,
  });
}
