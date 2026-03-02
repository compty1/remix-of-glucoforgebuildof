import { create } from 'zustand';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  _manualSignOut: boolean;
  _latestEventTs: number;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

let _initGuard = false; // Fix 5.14: Prevent double init in Strict Mode

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  _manualSignOut: false,
  _latestEventTs: 0,

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
            // Fix 5.6: Use generic display name fallback to avoid exposing email prefix
            display_name: displayName || 'User'
          }
        }
      });
      return { error };
    } catch {
      return { error: new Error('Sign up failed') };
    }
  },

  signOut: async () => {
    // Fix 5.3: Track manual logout intent
    set({ _manualSignOut: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (e) {
      // Fix 5.2: Log the error instead of silently swallowing
      console.warn('Sign out request failed:', e);
      // Still clear local state even if server request failed
      set({ user: null, session: null });
    }
    // Fix 5.8/5.10: Clear stale session storage
    try {
      sessionStorage.removeItem('gf_was_logged_in');
    } catch { /* Brave/Safari strict mode — ignore */ }
  },

  initialize: () => {
    // Fix 5.14: Prevent duplicate subscriptions in Strict Mode
    if (_initGuard) {
      set({ loading: false, initialized: true });
      return () => {};
    }
    _initGuard = true;

    // Fix 5.8: Clear stale session flag on successful init
    try {
      // Don't clear here — let sign-in set it fresh
    } catch { /* ignore */ }

    let isMounted = true; // Fix 5.9: Prevent state updates after unmount

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        // Handle token refresh errors gracefully
        if (event === 'TOKEN_REFRESHED' && !session) {
          set({ 
            session: null, 
            user: null, 
            loading: false,
            initialized: true 
          });
          return;
        }
        
        const now = Date.now();
        // Only synchronous state updates here to prevent deadlock
        set({ 
          session, 
          user: session?.user ?? null, 
          loading: false,
          initialized: true,
          _latestEventTs: now
        });
      }
    );

    // THEN check for existing session
    const sessionPromiseTs = Date.now();
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return; // Fix 5.9

      // Fix 5.1: Don't overwrite if a newer listener event already fired
      if (get()._latestEventTs > sessionPromiseTs) return;

      if (error) {
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
      isMounted = false; // Fix 5.9
      _initGuard = false;
      subscription.unsubscribe();
    };
  },
}));