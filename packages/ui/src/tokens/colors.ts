export const colors = {
  dark: {
    bg: '#0A0B0E',
    surface: '#14171F',
    surfaceHover: '#1B202B',
    surfaceSubtle: '#0F1218',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(0, 242, 254, 0.4)',
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
    },
    cyan: {
      DEFAULT: '#00F2FE',
      glow: 'rgba(0, 242, 254, 0.25)',
      dim: '#00A3C4',
    },
    orion: {
      violet: '#7928CA',
      glow: 'rgba(121, 40, 202, 0.35)',
      pulse: '#9E5CF2',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    surfaceSubtle: '#F8FAFC',
    border: 'rgba(15, 23, 42, 0.08)',
    borderActive: 'rgba(0, 163, 196, 0.4)',
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
    },
    cyan: {
      DEFAULT: '#00839E',
      glow: 'rgba(0, 131, 158, 0.2)',
      dim: '#00657A',
    },
    orion: {
      violet: '#6D28D9',
      glow: 'rgba(109, 40, 217, 0.25)',
      pulse: '#7C3AED',
    },
    status: {
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#2563EB',
    },
  },
} as const;

export type ThemeColors = typeof colors.dark;
