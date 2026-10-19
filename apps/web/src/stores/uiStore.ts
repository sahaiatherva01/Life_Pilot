import { create } from 'zustand';

interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  orionChatOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setOrionChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => {
  const initialTheme = (localStorage.getItem('lifepilot_theme') as 'dark' | 'light') || 'dark';
  if (initialTheme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }

  return {
    theme: initialTheme,
    sidebarCollapsed: false,
    commandPaletteOpen: false,
    orionChatOpen: false,
    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('lifepilot_theme', nextTheme);
        if (nextTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }
        return { theme: nextTheme };
      });
    },
    setTheme: (theme) => {
      localStorage.setItem('lifepilot_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
      set({ theme });
    },
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    setOrionChatOpen: (open) => set({ orionChatOpen: open }),
  };
});
