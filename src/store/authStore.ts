import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  initialize: () => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        // Handle token refresh errors gracefully
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing auth state');
          set({ 
            session: null, 
            user: null, 
            loading: false,
            initialized: true 
          });
          return;
        }
        
        // Only synchronous state updates here to prevent deadlock
        set({ 
          session, 
          user: session?.user ?? null, 
          loading: false,
          initialized: true 
        });

        // Defer any additional Supabase calls
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            console.log('User signed in successfully');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        // Clear any invalid session state
        set({ 
          session: null, 
          user: null, 
          loading: false,
          initialized: true 
        });
        return;
      }
      
      set({ 
        session, 
        user: session?.user ?? null, 
        loading: false,
        initialized: true 
      });
    });

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  },
}));