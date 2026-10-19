import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  timezone: string;
  morning_briefing_time: string;
  night_planning_time: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('lifepilot_token');
  const savedUser = localStorage.getItem('lifepilot_user');

  return {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: !!savedToken,
    login: (token, user) => {
      localStorage.setItem('lifepilot_token', token);
      localStorage.setItem('lifepilot_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('lifepilot_token');
      localStorage.removeItem('lifepilot_user');
      set({ token: null, user: null, isAuthenticated: false });
    },
    setUser: (user) => {
      localStorage.setItem('lifepilot_user', JSON.stringify(user));
      set({ user });
    },
  };
});
