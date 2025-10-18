import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: async (token) => {
    await AsyncStorage.setItem('access_token', token);
    set({ token, isAuthenticated: true });
  },
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
