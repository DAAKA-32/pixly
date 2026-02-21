import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#edfcf2',
          100: '#d3f9e0',
          200: '#aaf0c4',
          300: '#73e2a3',
          400: '#3acd7e',
          500: '#0F9D58',
          600: '#0F9D58',
          700: '#0B7A43',
          800: '#0a6638',
          900: '#08532f',
          950: '#042f1a',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#1A202C',
          950: '#0f1218',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'DM Serif Display', 'Georgia', 'serif'],
      },
      fontSize: {
        // Mockup scale — rem-based tokens for miniature UI illustrations
        'mockup-2xs': ['0.375rem', { lineHeight: '1.5' }],   // ~6px
        'mockup-xs': ['0.4375rem', { lineHeight: '1.5' }],   // ~7px
        'mockup-sm': ['0.5rem', { lineHeight: '1.5' }],      // ~8px
        'mockup-base': ['0.5625rem', { lineHeight: '1.5' }], // ~9px
        'mockup-md': ['0.625rem', { lineHeight: '1.5' }],    // ~10px
        'mockup-lg': ['0.6875rem', { lineHeight: '1.5' }],   // ~11px
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.10)',
        'elevated': '0 8px 30px -4px rgba(0, 0, 0, 0.1), 0 20px 60px -8px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
