import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import { authAPI } from '@/api/auth.api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const data = await authAPI.login(credentials);
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.access);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refresh);
          
          set({
            user: data.user,
            accessToken: data.tokens.access,
            refreshToken: data.tokens.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data || { detail: 'Login xatosi' },
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const data = await authAPI.register(userData);
          
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.access);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refresh);
          
          set({
            user: data.user,
            accessToken: data.tokens.access,
            refreshToken: data.tokens.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data || { detail: 'Ro\'yxatdan o\'tish xatosi' },
          };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        
        try {
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          // Logout xato bo'lsa ham state'ni tozalaymiz
          console.error('Logout error:', error);
        }
        
        // Tozalash
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      checkAuth: () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const { user } = get();
        
        if (token && user) {
          set({ isAuthenticated: true, accessToken: token });
        } else {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;