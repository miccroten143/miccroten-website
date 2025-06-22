import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    avatar?: string;
  } | null;
  sessionTimeout: number;
  isDarkMode: boolean;
  setAuth: (isAuthenticated: boolean, user: { username: string; avatar?: string } | null) => void;
  setSessionTimeout: (timeout: number) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      sessionTimeout: 180,
      isDarkMode: false,
      setAuth: (isAuthenticated, user) => set({ isAuthenticated, user }),
      setSessionTimeout: (timeout) => set({ sessionTimeout: timeout }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      logout: () => set({ isAuthenticated: false, user: null, sessionTimeout: 180 }),
    }),
    {
      name: 'auth-storage',
    }
  )
);