/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          sunken: 'var(--surface-sunken)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        accent: {
          50: '#eef5ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#8fc2fd',
          400: '#569df8',
          500: '#2b7de9',
          600: '#1863d6',
          700: '#144fac',
          800: '#134087',
          900: '#15376d',
        },
        healthy: '#1a9e6f',
        caution: '#c98a12',
        overloaded: '#d64545',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04)',
        raised: '0 2px 6px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'pop': { '0%': { transform: 'scale(0.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        'check-pop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.25)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.18s ease-out',
        'pop': 'pop 0.15s ease-out',
        'check-pop': 'check-pop 0.28s ease-out',
      },
    },
  },
  plugins: [],
};
