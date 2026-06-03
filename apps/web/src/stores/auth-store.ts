'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@eduerp/shared';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          const response = data.data || data;

          const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role as Role,
            status: response.user.status,
            avatar: response.user.avatar,
            phone: response.user.phone,
          };

          // Store tokens in localStorage for the API client interceptor
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Login failed. Please try again.';

          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
          }
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'eduerp-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/** Get the dashboard route based on user role */
export function getDashboardRoute(role: Role | string): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return '/admin';
    case Role.TEACHER:
      return '/teacher';
    case Role.STUDENT:
      return '/student';
    default:
      return '/login';
  }
}
