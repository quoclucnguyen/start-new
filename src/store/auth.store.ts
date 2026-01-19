import { create } from 'zustand';
import type { User, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getInitDataRaw, exchangeTma } from '@/lib/tma';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: AuthError | null;
  tmaLogin: (initDataRaw?: string | null) => Promise<void>;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  const supabase = getSupabaseClient();

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((_, session) => {
    set({
      user: session?.user || null,
      loading: false,
      initialized: true,
      error: null,
    });
  });

  return {
    user: null,
    loading: true,
    initialized: false,
    error: null,

    tmaLogin: async (initDataRaw) => {
      try {
        const raw = initDataRaw ?? getInitDataRaw();
        if (!raw) {
          set({ loading: false, initialized: true });
          return;
        }
        set({ loading: true, error: null });
        const { access_token, refresh_token } = await exchangeTma(raw);
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          set({ error, loading: false });
          throw error;
        }
        set((s) => ({ ...s, initialized: true, loading: false }));
      } catch (error) {
        set({ error: error as AuthError, loading: false, initialized: true });
        throw error;
      }
    },

    checkAuth: async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          set({ user, loading: false, initialized: true, error: null });
          return;
        }
        // Try TMA login if initData is available
        const initDataRaw = getInitDataRaw();
        if (initDataRaw) {
          set({ loading: true });
          const { access_token, refresh_token } = await exchangeTma(initDataRaw);
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          set({ user: data.user, loading: false, initialized: true, error: null });
          return;
        }
        set({ user: null, loading: false, initialized: true, error: null });
      } catch (error) {
        set({ error: error as AuthError, loading: false, initialized: true });
      }
    },

    signOut: async () => {
      set({ loading: true });
      await supabase.auth.signOut();
    },

    clearError: () => set({ error: null }),
  };
});
