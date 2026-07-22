/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0A0E17',
          850: '#0E1422',
          800: '#131B2E',
          700: '#1B2640',
        },
        slate: {
          950: '#0B0F19',
          900: '#111827',
          850: '#172033',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          green: '#10B981',
          orange: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Sans', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-critical': 'flashRed 1.5s infinite',
      },
      keyframes: {
        flashRed: {
          '0%, 100%': { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.8)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.4)', borderColor: '#EF4444' },
        },
      },
    },
  },
  plugins: [],
};
