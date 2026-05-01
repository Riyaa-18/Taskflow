/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        base: {
          900: '#07070e',
          800: '#0e0e18',
          700: '#161622',
          600: '#1e1e2e',
          500: '#28283c',
          400: '#34344a',
        },
        accent: {
          DEFAULT: '#7c6af7',
          light: '#a394ff',
          dark: '#5a4ed6',
          glow: 'rgba(124, 106, 247, 0.3)',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      boxShadow: {
        glow: '0 0 30px rgba(124, 106, 247, 0.4)',
        'glow-sm': '0 0 15px rgba(124, 106, 247, 0.25)',
        'glow-lg': '0 0 60px rgba(124, 106, 247, 0.3)',
        card: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        float: '0 20px 60px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #7c6af7 0%, #5a4ed6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(26,26,36,0.9) 0%, rgba(14,14,24,0.95) 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(124,106,247,0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124,106,247,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(124,106,247,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
