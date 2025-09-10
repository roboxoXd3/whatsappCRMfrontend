import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthCookies, getAuthFromCookies, clearAuthCookies } from '@/lib/utils/cookies';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  company?: string;
  workspace?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  initializeAuth: () => void;
  checkAuthFromCookies: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Store in both localStorage and cookies for maximum persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          setAuthCookies(user, token);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear from both localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          clearAuthCookies();
        }
      },

      checkAuthFromCookies: () => {
        if (typeof window === 'undefined') return;

        const authData = getAuthFromCookies();
        if (authData) {
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Sync with localStorage
          localStorage.setItem('auth_token', authData.token);
        }
      },

      initializeAuth: () => {
        if (typeof window === 'undefined') return;

        set({ isLoading: true });

        // First try to get from Zustand persistence (localStorage)
        const currentState = get();
        if (currentState.token && currentState.user) {
          set({
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          });
          return;
        }

        // If not in Zustand, try cookies
        const authData = getAuthFromCookies();
        if (authData) {
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          });

          // Sync with localStorage
          localStorage.setItem('auth_token', authData.token);
        } else {
          set({
            isLoading: false,
            isHydrated: true,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check cookies as fallback and mark as hydrated
        if (state) {
          state.initializeAuth();
        }
      },
    }
  )
); 