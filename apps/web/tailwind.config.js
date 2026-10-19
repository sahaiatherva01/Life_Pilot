/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#060709',
          900: '#0A0B0E', // base dark background
          850: '#0F1218',
          800: '#14171F', // card surface
          750: '#1B202B', // hover surface
          700: '#252C3A',
        },
        cyan: {
          400: '#00F2FE', // electric cyan accent
          500: '#00C0FA',
          950: '#002533',
        },
        orion: {
          violet: '#7928CA',
          pulse: '#9E5CF2',
          glow: 'rgba(121, 40, 202, 0.4)',
        },
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
