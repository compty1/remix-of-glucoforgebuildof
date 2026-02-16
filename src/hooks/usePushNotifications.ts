import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | null;
}

export const usePushNotifications = () => {
  const { user } = useAuthStore();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: null,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      const permission = 'Notification' in window ? Notification.permission : null;
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission,
        isLoading: false,
      }));
    };

    checkSupport();
  }, []);

  // Check subscription status when user changes
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !state.isSupported) {
        setState(prev => ({ ...prev, isSubscribed: false }));
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager?.getSubscription();
        
        if (subscription) {
          // Verify subscription exists in database using raw query
          const { data } = await supabase
            .from('notification_preferences')
            .select('push_enabled')
            .eq('user_id', user.id)
            .single();
          
          setState(prev => ({ ...prev, isSubscribed: data?.push_enabled === true }));
        } else {
          setState(prev => ({ ...prev, isSubscribed: false }));
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setState(prev => ({ ...prev, isSubscribed: false }));
      }
    };

    checkSubscription();
  }, [user, state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user || !state.isSupported) {
      toast.error('Push notifications are not supported');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // Update notification preferences to enable push
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          push_enabled: true,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      toast.success('Notifications enabled');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable push notifications');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user, state.isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Update notification preferences
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          push_enabled: false,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error('Failed to disable push notifications');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user]);

  // Toggle subscription
  const toggle = useCallback(async () => {
    if (state.isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    toggle,
  };
};
