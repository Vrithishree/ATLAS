/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        crimson: {
          50: '#fff0f0',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff9090',
          400: '#ff5050',
          500: '#dc1c1c',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#1a0404',
        },
        surface: {
          50: '#1a0808',
          100: '#150606',
          200: '#100404',
          300: '#0c0303',
          400: '#080202',
          500: '#050101',
        },
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan-line': 'scan-line 2s linear infinite',
        'counter': 'counter 0.3s ease-out',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220, 28, 28, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(220, 28, 28, 0.8)' },
        },
        'glow': {
          from: { textShadow: '0 0 10px rgba(220, 28, 28, 0.5)' },
          to: { textShadow: '0 0 20px rgba(220, 28, 28, 1), 0 0 40px rgba(220, 28, 28, 0.5)' },
        },
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
