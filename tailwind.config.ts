import type { Config } from 'tailwindcss';

/**
 * Tailwind palette — extracted verbatim from gum_frontend_portal/public/css/style.css
 * Sky scale = brand primary; indigo accent #6366f1; status emerald/amber/rose.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          DEFAULT: '#6366f1',
          light:   '#818cf8',
          dark:    '#4f46e5',
        },
        success: '#10b981',
        warn:    '#f59e0b',
        danger:  '#f43f5e',
      },
      fontFamily: {
        heading: ['var(--font-sora)',     'system-ui', 'sans-serif'],
        body:    ['var(--font-outfit)',   'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
        sans:    ['var(--font-outfit)',   'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '10px',
        md:   '16px',
        lg:   '24px',
        xl:   '32px',
      },
      boxShadow: {
        glass:    '0 8px 32px rgba(14, 165, 233, 0.08)',
        card:     '0 4px 20px rgba(0, 0, 0, 0.04)',
        cardHover:'0 16px 48px rgba(14, 165, 233, 0.12)',
        btn:      '0 4px 20px rgba(14, 165, 233, 0.3)',
        btnHover: '0 8px 30px rgba(14, 165, 233, 0.4)',
        accent:   '0 4px 20px rgba(99, 102, 241, 0.25)',
      },
      backgroundImage: {
        'brand-grad':   'linear-gradient(135deg, #0ea5e9, #0284c7)',
        'accent-grad':  'linear-gradient(135deg, #6366f1, #818cf8)',
        'hero-grad':    'linear-gradient(135deg, #0ea5e9, #0369a1 50%, #6366f1)',
        'mesh':         'radial-gradient(at 0% 0%, rgba(14,165,233,0.10), transparent 50%), radial-gradient(at 100% 0%, rgba(99,102,241,0.10), transparent 50%), radial-gradient(at 50% 100%, rgba(125,211,252,0.10), transparent 50%)',
      },
      transitionTimingFunction: {
        out:    'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up':  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'orb-drift':{ '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(20px,-30px) scale(1.1)' } },
        'shimmer':  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-up':  'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'orb-drift':'orb-drift 14s ease-in-out infinite',
        'shimmer':  'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
